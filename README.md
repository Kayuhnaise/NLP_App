
# NLP Application with OAuth Authentication and LLM-Powered Text Analysis

This project is a full-stack Natural Language Processing (NLP) web application built to explore how modern NLP systems—particularly LLM-backed features—can be integrated into production-style workflows with attention to reliability, evaluation, and safe engineering practices. Authenticated users can submit text for analysis, view structured outputs in a dashboard, and store analysis history for review.

The primary goal of this project was to learn end-to-end ML system design, including model integration, backend engineering, authentication, data persistence, and deployment.


---


## Key Features



### User Authentication
- Google OAuth 2.0 and Facebook login
- Cookie-based session management using `cookie-session`
- Sessions stored in signed, HTTP-only cookies
- Cookies configured with:
  - `secure` flag in production
  - `sameSite: "none"` for cross-site OAuth
- `trust proxy` enabled for Vercel deployments
- User profile display (name and avatar)


---


## NLP Capabilities
The application supports multiple NLP tasks to compare local heuristics vs. LLM-based approaches:



### Sentiment Analysis (Local Baseline)
- Local sentiment scoring using the `sentiment` library
- Outputs include score, comparative value, detected positive/negative words
- Used as a baseline to contrast with LLM-based reasoning



### Text Summarization (LLM – Google Gemini)
- Uses Google Gemini to generate concise, paraphrased summaries
- Prompt constraints added to reduce verbosity and hallucination



### Text Classification (LLM – Google Gemini)
- Classifies text into categories:
  - Bug report
  - Question
  - Complaint
  - Praise
  - Feature request
  - Other
- Designed to evaluate consistency across ambiguous inputs



### Keyword & Entity Extraction (Heuristic)
- Custom keyword extraction utilities
- Simple named entity extraction for people, places, and organizations



### Conversational Assistant (LLM – Google Gemini)
- Gemini-powered conversational interface
- Allows free-form interaction with structured prompt boundaries


---


## Dashboard UI
- Tab-based navigation for each NLP feature
- Custom result cards per analysis type
- Chat-style UI for conversational outputs
- Keyword chips, entity columns, sentiment meters
- Expandable analysis history with delete functionality
- Fully responsive design


---


## Storage & Data Handling
- NLP analysis results are currently stored in-memory for demonstration
- Each record includes:
  - `id`
  - `inputText`
  - `operation`
  - `result` (JSON)
  - `createdAt`
- Designed to support evaluation of model behavior over time
- Future work includes migrating analysis storage to Prisma ORM


---


## Technology Stack



### Frontend
- React
- React Router
- Custom dashboard UI and CSS
- Deployed on Vercel



### Backend
- Node.js
- Express
- Passport.js (Google & Facebook strategies)
- Cookie-based session management using `cookie-session`
- Prisma ORM (planned for persistence)
- Serverless deployment on Vercel



### NLP & AI
- sentiment (local sentiment baseline)
- Custom keyword and entity extraction utilities
- Google Gemini (`@google/generative-ai`) for summarization, classification, and chat


---


## Security Considerations
- Explicit CORS allowlist with credential support
- Signed, HTTP-only cookies for session integrity
- Environment-based cookie security configuration
- Graceful error handling for LLM failures



### Planned Hardening
- Per-user authorization checks
- Rate limiting and abuse detection
- Persistent session and analysis storage
- Structured logging and monitoring


---


## Project Structure

```text
root/
├── backend/
│   ├── server.js
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env
└── README.txt
```

---


## Engineering & ML Learnings
- Integrating LLMs into production-style APIs
- Prompt engineering for consistency
- Evaluating outputs through edge cases
- Failure-mode handling
- Separation of concerns
- Heuristic vs. LLM tradeoffs



Fallback behavior handles Gemini API failures gracefully.


---


## Environment Variables


```text
SESSION_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_CALLBACK_URL=
GEMINI_API_KEY=
FRONTEND_URL=
```

```text
REACT_APP_API_BASE_URL=
```

---


## Running Locally


```bash
cd backend
npm install
npm start
```

```text
Runs at: http://localhost:3000
```

```bash
cd frontend
npm install
npm start
```

```text
Runs at: http://localhost:3001
```

---


## Deployment
- Backend deployed as serverless Express on Vercel
- Frontend deployed on Vercel
- Environment variables configured via Vercel dashboard


---


## Future Improvements
- Automated evaluation metrics
- User feedback loops
- Confidence scoring
- Observability at scale

