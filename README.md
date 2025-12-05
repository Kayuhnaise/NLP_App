NLP Application with OAuth Login, Google Gemini NLP Features, and Vercel Deployment


This project is a full-stack Natural Language Processing (NLP) application that allows users to authenticate using Google (and optionally Facebook), analyze text with multiple NLP operations, store analysis history, and interact with a modern UI. The backend is powered by Node.js, Express, Passport for OAuth, and Google Gemini for LLM-based features. The frontend is built with React and deployed alongside the backend on Vercel.

______________________________________________________________________________________

Features


User Authentication

-Google OAuth 2.0 login

-Facebook Login

-Secure session management using express-session

-User profile display with avatar and name


NLP Operations

The application supports the following text analysis tools:


Sentiment Analysis

  -Local sentiment calculation with score, comparative value, detected positive/negative words, and a sentiment meter.
  
Summary (LLM Powered with Gemini)

   -Uses Google Gemini to generate concise, paraphrased summaries.
   
Keywords Extraction

   -Identifies important terms in the input text.
   
Named Entities

  -Extracts simple entities such as people, places, and organizations.
  
Classification (LLM Powered with Gemini)

  -Classifies text into bug report, question, complaint, praise, feature request, or other.
  
Chat / Assistant Response

  -Allows free interaction with a Gemini-powered conversational assistant.
  

Dashboard UI

-Tabs for each NLP feature

-Rich, custom-styled result cards for each analysis type

-Chat bubbles for assistant interactions

-Keyword chips, entity columns, sentiment meters

-Fully responsive design

-Input text history with ability to expand/collapse past analyses

-Delete entries from history


Storage

-Stores analyses in a database model (via Prisma)

-Each entry includes text, operation type, result object, timestamp, and user


Deployment

-Backend deployed to Vercel as a serverless Node.js application

-Frontend React app deployed on Vercel and configured to call backend API routes

-Environment variables securely configured in Vercel dashboard

-Gemini API integration fully supported in Vercel’s serverless environment

______________________________________________________________________________________

Technology Stack


Frontend

-React

-React Router

-Custom dashboard UI and CSS

-Deployed on Vercel


Backend

-Node.js

-Express

-Passport.js (Google and Facebook strategies)

-Sessions with express-session


Prisma ORM

-Google Gemini (@google/generative-ai)

-Deployed on Vercel as a serverless app


NLP Libraries

-sentiment (local sentiment scoring)

-Custom keyword and entity extraction utilities

-Gemini for LLM-powered features (summary, chat, classification)

______________________________________________________________________________________

Project Structure

```
root/
│
├── backend/
│   ├── server.js
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── .env (not committed)
│
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── Dashboard.jsx
│   │   ├── Dashboard.css
│   │   └── components/
│   ├── public/
│   ├── package.json
│   └── .env
│
└── README.md
```
______________________________________________________________________________________

Environment Variables


Backend (.env on Vercel and locally)


SESSION_SECRET=your_session_secret

GOOGLE_CLIENT_ID=your_google_client_id

GOOGLE_CLIENT_SECRET=your_google_client_secret

GOOGLE_CALLBACK_URL=https://nlp-app-backend.vercel.app/auth/google/callback


FACEBOOK_APP_ID=your_facebook_client_id

FACEBOOK_APP_SECRET=your_facebook_client_secret

FACEBOOK_CALLBACK_URL=https://nlp-app-backend.vercel.app/auth/facebook/callback


GEMINI_API_KEY=your_google_ai_studio_key

FRONTEND_URL=https://nlp-app-frontend.vercel.app


Frontend (.env)

REACT_APP_API_BASE_URL=https://nlp-app-backend.vercel.app

______________________________________________________________________________________

Running the Project Locally


1. Install dependencies
   
  Backend:
  
    cd backend
    
    npm install
    
  Frontend:
  
    cd frontend
    
    npm install
    

2. Start the backend
   
    npm start
   
  The backend will run on:
  
    http://localhost:3000
    

3. Start the frontend
   
    npm start
   
   The frontend will run on:
   
    http://localhost:3001
   

4. Login and analyze text
   
  Navigate to the frontend
  
  Log in with Google
  
  Enter text and select an NLP operation
  
  View results and history in the dashboard
  
______________________________________________________________________________________

Deployment on Vercel

  - Push the full project to GitHub.
  - 
  - Go to Vercel and import the repository.
  - 
  - Configure backend environment variables in Vercel → Settings → Environment Variables.
  - 
  - Ensure the backend exports the Express app and does not call app.listen in Vercel environments.
  - 
  - Deploy frontend and backend as separate Vercel projects or as a monorepo if desired.
  - 
  - Update the frontend .env to use the deployed API base URL.
  - 
______________________________________________________________________________________

Gemini Integration Notes


The backend uses:
```
  import { GoogleGenerativeAI } from "@google/generative-ai";
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  const geminiModel = genAI.getGenerativeModel({
  
    model: "gemini-flash-latest"
    
  });
```  


This supports:

  -generateContent for summaries
  
  -classification prompts
  
  -conversational prompts
  

Fallback behavior is implemented in case the API fails or rate limits are hit.

______________________________________________________________________________________

Authentication Notes


  Google OAuth and Facebook OAuth are the authentication methods.
  
  User profiles and their metadata are stored in the database. 
  
  Sessions persist via cookies.
  
______________________________________________________________________________________

History Storage


Each analysis is stored in the database with:

  -id
  
  -userId
  
  -inputText
  
  -operation
  
  -result (JSON)
  
  -createdAt
  

The history panel in the dashboard allows:

  -Expanding details
  
  -Viewing past results with the same card layouts
  
  -Deleting entries
  
