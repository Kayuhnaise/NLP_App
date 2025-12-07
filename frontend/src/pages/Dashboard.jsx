import React, { useEffect, useState } from "react";
import "./Dashboard.css";

const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

/* ----------------------------------------
   FEATURE TABS CONFIG
----------------------------------------- */
const FEATURES = [
  { id: "sentiment", label: "Sentiment", icon: "😊" },
  { id: "summary", label: "Summary", icon: "📝" },
  { id: "keywords", label: "Keywords", icon: "🔑" },
  { id: "entities", label: "Entities", icon: "📍" },
  { id: "classify", label: "Classify", icon: "🏷️" },
  { id: "chat", label: "Chat", icon: "💬" },
];

/* ----------------------------------------
   RESULT CARD COMPONENT
----------------------------------------- */
function ResultCard({ operation, result, inputText }) {
  if (!result) return null;

  switch (operation) {
    case "sentiment": {
      const label = result.label || "neutral";
      const comparative = typeof result.comparative === "number"
        ? result.comparative
        : 0;
      // Map comparative (-1 to 1-ish) to 0–100
      const pct = Math.max(0, Math.min(100, Math.round((comparative + 1) * 50)));

      return (
        <div className="result-card result-card-sentiment">
          <div className="result-card-header">
            <span className="result-icon">😊</span>
            <div>
              <h3>Sentiment Analysis</h3>
              <span className={`sentiment-pill sentiment-${label}`}>
                {label.charAt(0).toUpperCase() + label.slice(1)}
              </span>
            </div>
          </div>

          <div className="sentiment-metrics">
            <div className="metric-row">
              <span>Score</span>
              <span>{result.score}</span>
            </div>
            <div className="metric-row">
              <span>Comparative</span>
              <span>{comparative.toFixed(3)}</span>
            </div>
          </div>

          <div className="sentiment-meter">
            <div className="sentiment-meter-bar">
              <div
                className="sentiment-meter-fill"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="sentiment-meter-labels">
              <span>Negative</span>
              <span>Neutral</span>
              <span>Positive</span>
            </div>
          </div>

          {result.explanation && (
            <p className="sentiment-explanation">{result.explanation}</p>
          )}

          {(result.positive?.length || result.negative?.length) && (
            <div className="sentiment-words">
              {result.positive?.length > 0 && (
                <div>
                  <strong>Positive words:</strong>{" "}
                  {result.positive.join(", ")}
                </div>
              )}
              {result.negative?.length > 0 && (
                <div>
                  <strong>Negative words:</strong>{" "}
                  {result.negative.join(", ")}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    case "summary": {
      return (
        <div className="result-card result-card-summary">
          <div className="result-card-header">
            <span className="result-icon">📝</span>
            <h3>Summary</h3>
          </div>
          <p className="summary-text">{result.summary}</p>
          {result.note && <p className="summary-note">{result.note}</p>}
        </div>
      );
    }

    case "keywords": {
      const keywords = result.keywords || [];
      return (
        <div className="result-card result-card-keywords">
          <div className="result-card-header">
            <span className="result-icon">🔑</span>
            <h3>Top Keywords</h3>
          </div>
          {keywords.length === 0 ? (
            <p>No keywords detected.</p>
          ) : (
            <div className="keyword-chips">
              {keywords.map((kw, idx) => (
                <span key={idx} className="keyword-chip">
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>
      );
    }

    case "entities": {
      const people = result.people || [];
      const places = result.places || [];
      const orgs = result.organizations || [];
      const isEmpty =
        people.length === 0 && places.length === 0 && orgs.length === 0;

      return (
        <div className="result-card result-card-entities">
          <div className="result-card-header">
            <span className="result-icon">📍</span>
            <h3>Named Entities</h3>
          </div>
          {isEmpty ? (
            <p>No people, places, or organizations detected.</p>
          ) : (
            <div className="entity-columns">
              {people.length > 0 && (
                <div>
                  <h4>People</h4>
                  <ul>
                    {people.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
              {places.length > 0 && (
                <div>
                  <h4>Places</h4>
                  <ul>
                    {places.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
              {orgs.length > 0 && (
                <div>
                  <h4>Organizations</h4>
                  <ul>
                    {orgs.map((o, idx) => (
                      <li key={idx}>{o}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    case "classify": {
      return (
        <div className="result-card result-card-classify">
          <div className="result-card-header">
            <span className="result-icon">🏷️</span>
            <h3>Classification</h3>
          </div>
          <p className="classify-label">
            <strong>Category:</strong>{" "}
            <span className="classify-pill">
              {result.label
                ? result.label.charAt(0).toUpperCase() + result.label.slice(1)
                : "Unknown"}
            </span>
          </p>
          {result.reason && (
            <p className="classify-reason">
              <strong>Why:</strong> {result.reason}
            </p>
          )}
        </div>
      );
    }

    case "chat": {
      return (
        <div className="result-card result-card-chat">
          <div className="result-card-header">
            <span className="result-icon">💬</span>
            <h3>Chat</h3>
          </div>
          <div className="chat-conversation">
            {inputText && (
              <div className="chat-bubble user">
                <span className="chat-label">You</span>
                <p>{inputText}</p>
              </div>
            )}
            <div className="chat-bubble assistant">
              <span className="chat-label">Assistant</span>
              <p>{result.reply}</p>
            </div>
          </div>
        </div>
      );
    }

    default:
      // Fallback: show JSON nicely if add new ops
      return (
        <div className="result-card">
          <pre className="nlp-result-pre">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      );
  }
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [text, setText] = useState("");
  const [operation, setOperation] = useState("sentiment");
  const [result, setResult] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);

  /* -----------------------------
     LOAD USER FROM BACKEND
  ------------------------------ */
  const loadUser = async () => {
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        credentials: "include",
      });

      if (res.status === 401) {
        console.warn("Not authenticated yet. Retrying...");
        setTimeout(loadUser, 300);
      return;
      }


      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error("Error loading user:", err);
    }
  };

  /* -----------------------------
     LOAD ANALYSES HISTORY
  ------------------------------ */
  const loadAnalyses = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/analyses`, {
        credentials: "include",
      });
      if (!res.ok) {
        console.error("Failed to load analyses");
        return;
      }
      const data = await res.json();
      setAnalyses(data);
    } catch (err) {
      console.error("Error loading analyses:", err);
    }
  };

  useEffect(() => {
  const timer = setTimeout(() => {
    loadUser();
    loadAnalyses();
  }, 300); // give cookies time to settle

  return () => clearTimeout(timer);
}, []);


  /* -----------------------------
     RUN NLP ANALYSIS
  ------------------------------ */
  const runAnalysis = async () => {
    if (!text.trim()) {
      alert("Please enter some text to analyze.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/analyses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ inputText: text, operation }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Analysis failed");
        setLoading(false);
        return;
      }

      // data = { id, inputText, operation, result, createdAt }
      setResult(data.result);
      setAnalyses((prev) => [data, ...prev]);
    } catch (err) {
      console.error("Error running analysis:", err);
      alert("Error running analysis.");
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
     DELETE ANALYSIS FROM HISTORY
  ------------------------------ */
  const deleteAnalysis = async (id) => {
    try {
      await fetch(`${API_BASE}/api/analyses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Error deleting analysis:", err);
    }
  };

  /* -----------------------------
     LOGOUT
  ------------------------------ */
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: "GET",
        credentials: "include",
      });
    } catch (err) {
      console.error("Error logging out:", err);
    } finally {
      window.location.href = "/login";
    }
  };

  const currentFeature = FEATURES.find((f) => f.id === operation);

  /* -----------------------------
     RENDER UI
  ------------------------------ */
  return (
    <div className="page">
      {/* -------- AVATAR HEADER -------- */}
      <div className="dash-header-avatar">
        <h1>NLP Dashboard</h1>

        {user && (
          <div className="user-info">
            <img
              src={user.photo || "https://via.placeholder.com/80"}
              alt="avatar"
              className="avatar-img"
            />
            <span className="user-name">{user.displayName}</span>
          </div>
        )}
      </div>

      {/* LOGOUT BUTTON */}
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>

      {/* TEXT INPUT + OPERATION TABS */}
      <div className="section nlp-input">
        <h2>Analyze Text</h2>

        <div className="how-to-box">
          <h3>How to Use Each Feature</h3>

          <p>
            <strong>Sentiment</strong> – Analyzes whether the text expresses
            positive, negative, or neutral emotion. Best for: opinions,
            feelings, reviews, reactions.
          </p>

          <p>
            <strong>Summary</strong> – Creates a short, paraphrased summary of
            the text using OpenAI. Best for: long paragraphs, articles,
            explanations. Tip: Works best with 3+ sentences.
          </p>

          <p>
            <strong>Keywords</strong> – Pulls out the most important nouns
            (people, things, ideas). Best for: finding topics or themes.
          </p>

          <p>
            <strong>Entities</strong> – Detects and extracts people, places, and
            organizations. Best for: stories, news articles, biographies.
          </p>

          <p>
            <strong>Classify</strong> – Categorizes text into: bug report,
            complaint, feature request, praise, question, or other. Best for:
            customer feedback, support messages, product comments.
          </p>

          <p>
            <strong>Chat</strong> – Sends the text to an AI assistant for a
            conversational reply. Best for: questions, explanations, guidance,
            or general conversation.
          </p>

          <p>
            <em>Tip:</em> All features support paragraphs and longer text, but
            if you ever see an error, try shortening the input or breaking it
            into two chunks.
          </p>
        </div>

        {/* Feature Tabs */}
        <div className="nlp-tabs">
          {FEATURES.map((feat) => (
            <button
              key={feat.id}
              className={
                "nlp-tab" + (operation === feat.id ? " nlp-tab-active" : "")
              }
              onClick={() => setOperation(feat.id)}
            >
              <span className="nlp-tab-icon">{feat.icon}</span>
              <span>{feat.label}</span>
            </button>
          ))}
        </div>

        {currentFeature && (
          <p className="nlp-selected">
            Selected: <strong>{currentFeature.label}</strong>
          </p>
        )}

        <textarea
          className="nlp-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="Paste or type text to analyze (reviews, feedback, emails, etc.)"
        />

        <div className="nlp-toolbar">
          <button onClick={runAnalysis} disabled={loading}>
            {loading ? "Analyzing..." : "Run Analysis"}
          </button>
        </div>
      </div>

      {/* RESULT PANEL */}
      <div className="section nlp-result">
        <h2>Result</h2>
        {result ? (
          <ResultCard
            operation={operation}
            result={result}
            inputText={text}
          />
        ) : (
          <p>No result yet. Run an analysis to see output here.</p>
        )}
      </div>

      {/* HISTORY PANEL */}
      <div className="section nlp-history">
        <h2>History</h2>
        {analyses.length === 0 ? (
          <p>No analyses yet.</p>
        ) : (
          <ul className="analysis-list">
            {analyses.map((a) => (
              <li key={a.id} className="analysis-card">
                <div className="analysis-header">
                  <div>
                    <span className="analysis-op-badge">
                      {a.operation.toUpperCase()}
                    </span>
                    <span className="analysis-time">
                      {new Date(a.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <button
                    className="analysis-delete"
                    onClick={() => deleteAnalysis(a.id)}
                  >
                    Delete
                  </button>
                </div>

                <details className="analysis-details">
                  <summary>Input text</summary>
                  <p className="analysis-input">{a.inputText}</p>
                </details>

                <details className="analysis-details">
                  <summary>Result</summary>
                  <ResultCard
                    operation={a.operation}
                    result={a.result}
                    inputText={a.inputText}
                  />
                </details>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}