import express from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import cors from "cors";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import Sentiment from "sentiment";
import nlp from "compromise";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();

/* -----------------------------------------
   ENVIRONMENT SETUP
------------------------------------------ */
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3001";

const GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL ||
  "http://localhost:3000/auth/google/callback";

const FACEBOOK_CALLBACK_URL =
  process.env.FACEBOOK_CALLBACK_URL ||
  "http://localhost:3000/auth/facebook/callback";

const isProd =
  process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

/* -----------------------------------------
   GEMINI CLIENT
------------------------------------------ */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

/* -----------------------------------------
   NLP HELPERS
------------------------------------------ */
const sentiment = new Sentiment();

/**
 * Sentiment analysis with user-friendly explanation.
 */
function getSentimentAnalysis(text) {
  const raw = sentiment.analyze(text);

  let label = "neutral";
  if (raw.score > 1) label = "positive";
  else if (raw.score < -1) label = "negative";

  const explanation = `
Score: ${raw.score} (overall sentiment; positive = more positive words, negative = more negative words)
Comparative: ${raw.comparative.toFixed(
    3
  )} (score divided by text length; helps compare long vs short texts)
This text is classified as ${label}.
`.trim();

  return {
    label,
    score: raw.score,
    comparative: raw.comparative,
    positive: raw.positive,
    negative: raw.negative,
    explanation,
  };
}

/**
 * Extract top unique noun phrases as keywords that actually appear in the text.
 */
function extractKeywords(text, max = 10) {
  const doc = nlp(text);
  const candidates = doc.nouns().out("array");
  const textLower = text.toLowerCase();

  const keywordMap = new Map();

  for (let phrase of candidates) {
    if (!phrase) continue;

    let cleaned = phrase
      .replace(/[“”"()]/g, "") // remove quotes/parentheses
      .replace(/[.,!?;:]+$/g, "") // remove trailing punctuation
      .replace(/^[.,!?;:]+/g, "") // remove leading punctuation
      .trim();

    if (!cleaned) continue;

    const normalized = cleaned.toLowerCase();

    // Avoid duplicates
    if (keywordMap.has(normalized)) continue;

    // Ensure phrase appears in the text (ignoring case)
    if (!textLower.includes(normalized)) continue;

    keywordMap.set(normalized, cleaned);
  }

  return Array.from(keywordMap.values()).slice(0, max);
}

/**
 * Simple rule-based text classification with more categories.
 */
async function classifyText(text) {
  const prompt = `
Classify the following text into one of these categories:
- bug report
- complaint
- praise
- question
- feature request
- other

Return ONLY the category and one short sentence explaining why.

Text:
"${text}"
  `;

  const output = await callLLM(prompt);

  if (!output) {
    return { label: "other", reason: "Fallback classifier." };
  }

  const [labelLine, ...reasonLines] = output.split("\n");
  return {
    label: labelLine.trim().toLowerCase(),
    reason: reasonLines.join(" ").trim(),
  };
}

/**
 * Generic helper to call Gemini.
 */
async function callLLM(prompt) {
  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response.text();
    return response;
  } catch (err) {
    console.error("Gemini API error:", err);
    return null; // fallback friendly behavior
  }
}

/**
 * Smart summary using Gemini (paraphrased, 2–4 sentences).
 */
async function getSmartSummary(text) {
  const prompt = `
Summarize the following text in 2–4 clear, simple sentences:

"${text}"
  `;

  const summary = await callLLM(prompt);

  if (!summary) {
    return {
      summary: text.slice(0, 200) + "...",
      note: "Gemini unavailable — using fallback summary.",
    };
  }

  return { summary };
}

/**
 * Chat reply using Gemini.
 */
async function chatWithLLM(text) {
  const prompt = `
You are a friendly AI assistant. Respond conversationally to:
"${text}"
  `;

  const reply = await callLLM(prompt);

  if (!reply) {
    return {
      reply: "Gemini is temporarily unavailable. Try again later!",
    };
  }

  return { reply };
}

/**
 * Central NLP operation router.
 */
async function runNlpOperation(text, operation) {
  switch (operation) {
    case "sentiment":
      return getSentimentAnalysis(text);

    case "summary":
      return await getSmartSummary(text);

    case "keywords": {
      const keywords = extractKeywords(text);
      return { keywords };
    }

    case "entities": {
      const doc = nlp(text);
      return {
        people: doc.people().out("array"),
        places: doc.places().out("array"),
        organizations: doc.organizations().out("array"),
      };
    }

    case "classify":
      return classifyText(text);

    case "chat":
      return await chatWithLLM(text);

    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }
}

/* -----------------------------------------
   MIDDLEWARE (with mobile-friendly CORS)
------------------------------------------ */

// Helpful for debugging origins (especially on mobile)
app.use((req, res, next) => {
  console.log("Origin:", req.headers.origin);
  next();
});

app.use(
  cors({
    origin: [
      FRONTEND_URL,
      "https://nlp-app-frontend.vercel.app",
      "https://www.nlp-app-frontend.vercel.app",
      /\.vercel\.app$/, // allow Vercel preview deployments
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (isProd) {
  // Needed when behind a proxy (like Vercel) so secure cookies work
  app.set("trust proxy", 1);
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProd, // true in production (HTTPS)
      sameSite: isProd ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

/* -----------------------------------------
   PASSPORT SERIALIZATION
------------------------------------------ */
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

/* -----------------------------------------
   GOOGLE STRATEGY
------------------------------------------ */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

/* -----------------------------------------
   FACEBOOK STRATEGY
------------------------------------------ */
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
      callbackURL: FACEBOOK_CALLBACK_URL,
      profileFields: ["id", "displayName", "emails", "photos"],
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

/* -----------------------------------------
   AUTH ROUTES
------------------------------------------ */
// Google login
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${FRONTEND_URL}/login?error=google`,
  }),
  (req, res) => {
    res.redirect(`${FRONTEND_URL}/dashboard`);
  }
);

// Facebook login
app.get("/auth/facebook", passport.authenticate("facebook"));

app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: `${FRONTEND_URL}/login?error=facebook`,
  }),
  (req, res) => {
    res.redirect(`${FRONTEND_URL}/dashboard`);
  }
);

/* -----------------------------------------
   PROFILE & LOGOUT
------------------------------------------ */
app.get("/profile", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const user = req.user;

  res.json({
    id: user.id,
    displayName: user.displayName,
    email: user.emails?.[0]?.value || null,
    photo: user.photos?.[0]?.value || null,
  });
});

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out" });
    });
  });
});

/* -----------------------------------------
   IN-MEMORY ANALYSES STORAGE
------------------------------------------ */
let analyses = [];

/* -----------------------------------------
   ANALYSES API
------------------------------------------ */
// List all analyses
app.get("/api/analyses", (req, res) => {
  res.json(analyses);
});

// Create a new analysis
app.post("/api/analyses", async (req, res) => {
  try {
    const { inputText, operation } = req.body;

    if (!inputText || !operation) {
      return res.status(400).json({
        error: "inputText and operation are required",
      });
    }

    const result = await runNlpOperation(inputText, operation);

    const newAnalysis = {
      id: Date.now(),
      inputText,
      operation,
      result,
      createdAt: new Date().toISOString(),
    };

    analyses.push(newAnalysis);
    res.status(201).json(newAnalysis);
  } catch (err) {
    console.error("Error in /api/analyses:", err);
    res.status(500).json({
      error: "Failed to run NLP operation",
      details: err.message,
    });
  }
});

// Update an analysis
app.put("/api/analyses/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = analyses.findIndex((a) => a.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: "Not found" });
  }

  analyses[idx] = { ...analyses[idx], ...req.body };
  res.json(analyses[idx]);
});

// Delete an analysis
app.delete("/api/analyses/:id", (req, res) => {
  const id = Number(req.params.id);
  analyses = analyses.filter((a) => a.id !== id);
  res.status(204).send();
});

/* -----------------------------------------
   HEALTH CHECK
------------------------------------------ */
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "NLP app backend is running" });
});

/* -----------------------------------------
   LOCAL SERVER (DEV ONLY)
------------------------------------------ */
const PORT = process.env.PORT || 3000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Local server running at http://localhost:${PORT}`);
  });
}

/* -----------------------------------------
   EXPORT FOR VERCEL
------------------------------------------ */
export default app;
