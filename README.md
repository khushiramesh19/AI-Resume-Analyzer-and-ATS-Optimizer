# AI Resume Analyzer & ATS Optimizer

An AI-powered full-stack web application designed to help job seekers audit and optimize their resumes for Applicant Tracking Systems (ATS) and recruiters. It extracts text from uploaded resumes (PDF, DOCX, TXT), evaluates formatting and keyword matching against specific job descriptions, suggests critical improvements, offers side-by-side bullet point rewrites, and features an interactive AI chat coach.

##  Key Features

* **Multi-Format Parser**: Directly parses `.pdf`, `.docx`, and `.txt` files client-side.
* **ATS Scorecard Dashboard**: Radial gauges show ATS compatibility, formatting compliance, and keyword matching.
* **Skills Gap Matrix**: Visualizes matched skills, missing required skills, and recommended skills in a clean pill badge layout.
* **Before/After AI Rewrites**: Displays passive resume sentences side-by-side with metrics-driven, high-impact suggestions.
* **Context-Aware Interview Prep**: Generates personalized behavioral and technical interview questions based on the candidate's experience gaps.
* **Interactive AI Chat Coach**: Chatbox contextually preloaded with the resume text for resume-building advice.
* **Downloader & Copy Center**: Formats and exports the optimized resume as a clean Markdown (`.md`) file.
* **Demo Mode**: Run the dashboard instantly with preloaded resumes and analysis mock data (perfect for showcase purposes).

##  Tech Stack

* **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Canvas Confetti, Recharts
* **Backend**: FastAPI, Uvicorn, PyPDF, docx2txt, python-dotenv

---

## Getting Started

Follow these steps to run the application locally.

### Prerequisites

* Python 3.10+ & `pip`
* Node.js 18+ & `npm`

### 1. Backend Setup

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the FastAPI server:
   ```bash
   uvicorn app:app --reload
   ```
   The API will run at `http://127.0.0.1:8000`. You can inspect the Swagger documentation at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to the local address displayed (typically `http://localhost:5173/`).

---

## 🔒 Security & Privacy

Your resume data is processed locally on your server. If you utilize a Gemini API Key, it is sent securely to the Google Generative Language API and is never cached or stored on any third-party databases. In the UI, keys are stored safely within your browser's local sandbox (`localStorage`).
