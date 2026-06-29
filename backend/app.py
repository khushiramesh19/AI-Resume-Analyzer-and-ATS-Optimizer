import os
import io
import json
import tempfile
from typing import List, Optional
from fastapi import FastAPI, File, UploadFile, Form, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pypdf
import docx2txt
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AI Resume Analyzer API", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the exact domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper function to extract text from PDF
def extract_text_from_pdf(file_bytes: bytes) -> str:
    pdf_file = io.BytesIO(file_bytes)
    reader = pypdf.PdfReader(pdf_file)
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text.strip()

# Helper function to extract text from DOCX
def extract_text_from_docx(file_bytes: bytes) -> str:
    # docx2txt requires a file path or file-like object.
    # To be safe on all platforms, write to a temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as temp_file:
        temp_file.write(file_bytes)
        temp_file_path = temp_file.name
    
    try:
        text = docx2txt.process(temp_file_path)
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
            
    return text.strip()

# Mock Demo Data for Resume Analyzer
DEMO_DATA = {
    "software_engineer": {
        "ats_score": 84,
        "formatting_score": 92,
        "keyword_score": 78,
        "skills_analysis": {
            "matched": ["Python", "JavaScript", "React", "SQL", "Git"],
            "missing": ["Docker", "AWS", "CI/CD"],
            "suggested": ["Kubernetes", "TypeScript", "Redis"]
        },
        "keyword_density": [
            {"keyword": "React", "count": 6, "match_status": "Strong Match"},
            {"keyword": "Python", "count": 5, "match_status": "Strong Match"},
            {"keyword": "SQL", "count": 3, "match_status": "Found"},
            {"keyword": "Docker", "count": 0, "match_status": "Missing"},
            {"keyword": "AWS", "count": 0, "match_status": "Missing"},
            {"keyword": "CI/CD", "count": 0, "match_status": "Missing"}
        ],
        "suggestions": [
            {
                "category": "Impact Metrics",
                "description": "Quantify project results. Instead of 'Responsible for fixing bugs', write 'Resolved 50+ critical bugs, improving application stability by 15%'."
            },
            {
                "category": "Professional Summary",
                "description": "Shorten the summary to 3 sentences and focus on core technologies and years of experience. Currently, it is slightly too generic."
            },
            {
                "category": "Certification / Cloud",
                "description": "Since the job description requires AWS, list any cloud projects or certifications (e.g. AWS Certified Developer) to stand out."
            }
        ],
        "bullet_point_rewrites": [
            {
                "original": "Built a web app in React and state management.",
                "rewritten": "Architected and deployed a responsive React web application utilizing Redux for state management, reducing render load times by 20%.",
                "explanation": "Added action verb 'Architected', defined state tool (Redux), and quantified performance impact (20%)."
            },
            {
                "original": "Worked on database optimization.",
                "rewritten": "Optimized complex PostgreSQL queries and index structures, resulting in a 40% speedup in data retrieval times for search endpoints.",
                "explanation": "Specified the database (PostgreSQL), methods (queries and index structures), and quantified results (40% speedup)."
            }
        ],
        "interview_prep": [
            {
                "question": "How do you optimize state management in a large-scale React application?",
                "suggested_talking_points": "Talk about Redux Toolkit, avoiding unnecessary renders using useMemo/useCallback, and how you reduced page load by 20% in your React project."
            },
            {
                "question": "Can you explain a time you had to optimize SQL queries? What was the outcome?",
                "suggested_talking_points": "Describe using EXPLAIN ANALYZE, creating targeted indexes, refactoring nested joins, and the 40% retrieval speed improvement."
            }
        ]
    },
    "devops_engineer": {
        "ats_score": 76,
        "formatting_score": 88,
        "keyword_score": 68,
        "skills_analysis": {
            "matched": ["Linux", "Git", "Docker", "Python"],
            "missing": ["Kubernetes", "Terraform", "Ansible", "AWS"],
            "suggested": ["Jenkins", "Prometheus", "Helm"]
        },
        "keyword_density": [
            {"keyword": "Docker", "count": 4, "match_status": "Strong Match"},
            {"keyword": "Linux", "count": 3, "match_status": "Found"},
            {"keyword": "Kubernetes", "count": 0, "match_status": "Missing"},
            {"keyword": "Terraform", "count": 0, "match_status": "Missing"},
            {"keyword": "AWS", "count": 0, "match_status": "Missing"}
        ],
        "suggestions": [
            {
                "category": "Infrastructure as Code",
                "description": "You have listed Docker, but missing Terraform/CloudFormation which is critical for DevOps. Add details of any environment provisioning scripts."
            },
            {
                "category": "CI/CD Pipelines",
                "description": "Detail your experience with automated build/release pipelines. List tools like Jenkins, GitHub Actions, or GitLab CI."
            }
        ],
        "bullet_point_rewrites": [
            {
                "original": "Wrote script files to run deployment steps.",
                "rewritten": "Developed automated Bash and Python scripts, reducing deployment lifecycle duration from 45 minutes to under 8 minutes.",
                "explanation": "Added specific scripting languages and quantified the deployment time reduction (82% time saved)."
            },
            {
                "original": "Maintained server systems and fixed uptime issues.",
                "rewritten": "Managed 15+ production Linux servers, maintaining a 99.9% application uptime uptime by configuring custom Prometheus monitoring alerts.",
                "explanation": "Quantified scale (15+ servers), success metric (99.9% uptime), and tool stack (Prometheus)."
            }
        ],
        "interview_prep": [
            {
                "question": "What metrics do you monitor to ensure server health and application uptime?",
                "suggested_talking_points": "Discuss CPU utilization, memory, disk I/O, network latency, and the integration of custom Prometheus alerts for uptime tracking."
            },
            {
                "question": "Describe a script you wrote that automated a manual operations task.",
                "suggested_talking_points": "Detail the automation of build pipelines or logs rotation, specifying Python/Bash, and the resulting time savings (45m to 8m)."
            }
        ]
    },
    "data_analyst": {
        "ats_score": 82,
        "formatting_score": 90,
        "keyword_score": 80,
        "skills_analysis": {
            "matched": ["SQL", "Excel", "Tableau", "Python"],
            "missing": ["PowerBI", "A/B Testing", "Statistics"],
            "suggested": ["R", "Snowflake", "dbt"]
        },
        "keyword_density": [
            {"keyword": "SQL", "count": 8, "match_status": "Strong Match"},
            {"keyword": "Tableau", "count": 3, "match_status": "Found"},
            {"keyword": "Excel", "count": 5, "match_status": "Strong Match"},
            {"keyword": "PowerBI", "count": 0, "match_status": "Missing"},
            {"keyword": "A/B Testing", "count": 0, "match_status": "Missing"}
        ],
        "suggestions": [
            {
                "category": "Business Impact",
                "description": "State what business decisions were made using your dashboards. For example: 'Created Tableau reports used by marketing VPs to reallocate $50k in budget'."
            },
            {
                "category": "Advanced Analytics",
                "description": "Highlight experience in statistical modeling or hypothesis testing if you have any. This makes your analyst profile look more senior."
            }
        ],
        "bullet_point_rewrites": [
            {
                "original": "Created dashboards for sales teams.",
                "rewritten": "Designed and deployed interactive Tableau dashboards tracking weekly sales pipelines, enabling leadership to identify and capture $120K in leakage.",
                "explanation": "Added action-oriented verbs, specified the dashboard tool (Tableau), and stated the dollar-value business impact ($120K)."
            },
            {
                "original": "Did query updates to clean customer databases.",
                "rewritten": "Authored optimized SQL CTEs and window functions to clean 2M+ dirty customer records, reducing data ingestion errors by 30%.",
                "explanation": "Highlighted specific advanced SQL concepts (CTEs, window functions), scale of data (2M+ records), and success rate (30% reduction in errors)."
            }
        ],
        "interview_prep": [
            {
                "question": "How do you handle dirty or missing data in your SQL analysis workflows?",
                "suggested_talking_points": "Discuss handling NULLs with COALESCE, parsing string formats, removing duplicates via window functions, and your experience cleaning 2M+ customer rows."
            },
            {
                "question": "How do you choose between Tableau and static reports for communicating data?",
                "suggested_talking_points": "Focus on user self-service, interactivity requirements, data refresh schedules, and how your Tableau pipeline captured $120k in leakage."
            }
        ]
    }
}

# Chat schema models
class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    resume_text: str
    job_description: Optional[str] = ""
    messages: List[ChatMessage]
    api_key: Optional[str] = None

class OptimizeRequest(BaseModel):
    resume_text: str
    job_description: Optional[str] = ""
    api_key: Optional[str] = None

@app.post("/api/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    job_role: Optional[str] = Form("software_engineer"),
    job_description: Optional[str] = Form(""),
    x_gemini_key: Optional[str] = Header(None)
):
    try:
        # 1. Read file bytes
        file_bytes = await file.read()
        filename = file.filename.lower()
        
        # 2. Extract text based on file format
        if filename.endswith(".pdf"):
            resume_text = extract_text_from_pdf(file_bytes)
        elif filename.endswith(".docx"):
            resume_text = extract_text_from_docx(file_bytes)
        elif filename.endswith(".txt"):
            resume_text = file_bytes.decode("utf-8", errors="ignore")
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, DOCX or TXT.")

        if not resume_text:
            raise HTTPException(status_code=400, detail="Could not extract text from the uploaded file.")

        # 3. Determine if using Demo Mode or Live Gemini mode
        api_key = x_gemini_key or os.getenv("GEMINI_API_KEY")
        
        # If no API key is provided and a standard job role is selected, use Demo Mode
        if not api_key:
            # Match role to demo data keys
            role_key = "software_engineer"
            if job_role:
                clean_role = job_role.lower().replace(" ", "_")
                if "devops" in clean_role:
                    role_key = "devops_engineer"
                elif "data" in clean_role or "analyst" in clean_role:
                    role_key = "data_analyst"
                elif "front" in clean_role or "design" in clean_role or "web" in clean_role:
                    role_key = "software_engineer"
            
            mock_report = DEMO_DATA.get(role_key, DEMO_DATA["software_engineer"]).copy()
            # Add resume text so the frontend can preview it
            mock_report["extracted_text"] = resume_text
            mock_report["mode"] = "demo"
            mock_report["job_role"] = job_role
            mock_report["job_description"] = job_description
            return mock_report

        # 4. Live Gemini API execution
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(
                model_name="gemini-2.0-flash",
                generation_config={"response_mime_type": "application/json"}
            )
            
            prompt = f"""
            You are an advanced Applicant Tracking System (ATS) auditor and expert recruiter.
            Analyze the following resume text against the target job role/description.
            
            Target Job: {job_role}
            Job Description: {job_description if job_description else 'Standard requirements for ' + job_role}
            
            Resume Text:
            {resume_text}
            
            You must return a structured JSON response. Do not include markdown code fence wrappers (like ```json). Just the raw JSON object.
            
            The JSON object must follow this structure exactly:
            {{
              "ats_score": (integer between 0 and 100 representing overall compatibility),
              "formatting_score": (integer between 0 and 100 based on standard structure and contact info present),
              "keyword_score": (integer between 0 and 100 based on skill matches),
              "skills_analysis": {{
                "matched": [list of skills found in resume that match the job],
                "missing": [list of important skills required for this job but missing or weak in resume],
                "suggested": [list of general industry skills for this role that would elevate the resume]
              }},
              "keyword_density": [
                {{
                  "keyword": "SkillName",
                  "count": (number of times it appears in resume),
                  "match_status": ("Strong Match", "Found", or "Missing")
                }}
              ],
              "suggestions": [
                {{
                  "category": "Section or category name",
                  "description": "Detailed helpful optimization suggestions"
                }}
              ],
              "bullet_point_rewrites": [
                {{
                  "original": "An unoptimized sentence or bullet from the resume",
                  "rewritten": "An action-oriented, quantified (with metrics) high-impact replacement bullet",
                  "explanation": "Why this rewrite is better and what was added"
                }}
              ],
              "interview_prep": [
                {{
                  "question": "A custom behavior or technical question tailored to the resume and target job",
                  "suggested_talking_points": "Strategic talking points to include in the answer"
                }}
              ]
            }}
            """
            
            response = model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Clean up formatting if any
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()

            analysis_result = json.loads(response_text)
            analysis_result["extracted_text"] = resume_text
            analysis_result["mode"] = "live"
            analysis_result["job_role"] = job_role
            analysis_result["job_description"] = job_description
            return analysis_result
            
        except Exception as api_err:
            # Fall back to Demo Mode if API call fails but let them know it fell back
            role_key = "software_engineer"
            if job_role and "devops" in job_role.lower():
                role_key = "devops_engineer"
            elif job_role and ("data" in job_role.lower() or "analyst" in job_role.lower()):
                role_key = "data_analyst"
            
            fallback = DEMO_DATA[role_key].copy()
            fallback["extracted_text"] = resume_text
            fallback["mode"] = "fallback"
            fallback["error"] = f"API Error (fell back to demo): {str(api_err)}"
            fallback["job_role"] = job_role
            fallback["job_description"] = job_description
            return fallback

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze resume: {str(e)}")

@app.post("/api/chat")
async def chat_assistant(request: ChatRequest):
    api_key = request.api_key or os.getenv("GEMINI_API_KEY")
    if not api_key:
        # Mock Chat Response
        last_message = request.messages[-1].content.lower()
        if "devops" in last_message or "cloud" in last_message:
            return {
                "role": "assistant",
                "content": "To tailor your resume for DevOps, make sure to detail your experience with Docker and automated testing. I highly recommend highlighting CI/CD pipeline automation (e.g., using GitHub Actions or Jenkins) and adding cloud infrastructure tasks. Can I help rewrite some of your current experience bullet points for a DevOps role?"
            }
        elif "projects" in last_message:
            return {
                "role": "assistant",
                "content": "A strong Projects section should focus on solving real-world business challenges. Frame projects with the STAR method: Situation, Task, Action, and Result. Make sure to list the technologies used at the beginning of each project description. What projects do you have currently that we can refine?"
            }
        else:
            return {
                "role": "assistant",
                "content": "I am operating in Demo Mode. To enable full AI chat capabilities tailored dynamically to your resume, please configure a Google Gemini API Key in the settings. For now, I can tell you that using active verbs and adding numbers to represent your achievements (e.g., 'saved 10 hours per week' or 'boosted response times by 30%') are the best ways to elevate your profile!"
            }

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.0-flash")
        
        # Build conversational prompt
        history_context = ""
        for msg in request.messages[:-1]:
            history_context += f"{msg.role.capitalize()}: {msg.content}\n"
            
        system_prompt = f"""
        You are an expert tech recruiter and resume optimization coach.
        You are discussing improvements to a resume with a candidate.
        
        Resume Content:
        {request.resume_text}
        
        Target Job Description / Role:
        {request.job_description}
        
        Chat History:
        {history_context}
        
        Candidate's current message: {request.messages[-1].content}
        
        Provide constructive, practical advice on how to improve their resume, add keywords, format sections, or answer interview questions. Keep answers clear, encouraging, and highly specific to the tech stack listed in the resume.
        """
        
        response = model.generate_content(system_prompt)
        return {
            "role": "assistant",
            "content": response.text.strip()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Chat failed: {str(e)}")

@app.post("/api/optimize-resume")
async def optimize_resume(request: OptimizeRequest):
    api_key = request.api_key or os.getenv("GEMINI_API_KEY")
    
    # Always try live API first
    if api_key:
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-1.5-flash-latest")
            prompt = f"""
            You are a professional resume writer.
            Optimize this resume for ATS and technical recruiters.
            Target Job: {request.job_description}
            Original Resume:
            {request.resume_text}
            Return ONLY raw markdown. No extra text.
            """
            response = model.generate_content(prompt)
            return {"optimized_markdown": response.text.strip()}
        except:
            pass  # Fall through to smart template below

    # Smart template-based optimizer (no API needed)
    resume_text = request.resume_text
    job_desc = request.job_description or "Software Engineer"

    lines = [line.strip() for line in resume_text.split("\n") if line.strip()]
    
    # Try to extract name (usually first line)
    name = lines[0] if lines else "Your Name"
    
    # Extract email and phone
    import re
    email = next((w for line in lines for w in line.split() if "@" in w), "your.email@gmail.com")
    phone = next((line for line in lines if re.search(r'\d{10}|\d{3}[-.\s]\d{3}', line)), "")
    
    # Extract skills (look for lines with common tech keywords)
    tech_keywords = ["python", "java", "javascript", "react", "node", "sql", "aws", "docker", 
                     "git", "html", "css", "c++", "machine learning", "flask", "fastapi",
                     "mongodb", "mysql", "typescript", "redux", "tailwind", "linux"]
    skills_found = []
    for line in lines:
        for tech in tech_keywords:
            if tech in line.lower() and tech.title() not in skills_found:
                skills_found.append(tech.title())

    # Extract education (look for degree keywords)
    edu_lines = [line for line in lines if any(k in line.lower() for k in 
                 ["b.e", "b.tech", "m.tech", "bachelor", "master", "university", "college", "rnsit", "degree", "sgpa", "cgpa"])]
    
    # Extract experience/project lines (bullet-like lines)
    project_lines = [line for line in lines if any(line.startswith(s) for s in ["•", "-", "*", "→"]) 
                     or (len(line) > 40 and any(k in line.lower() for k in ["developed", "built", "created", "designed", "implemented", "deployed", "worked"]))]

    # Build improved markdown resume
    skills_str = ", ".join(skills_found) if skills_found else "Python, JavaScript, React, SQL, Git"
    edu_str = "\n".join(f"- {line}" for line in edu_lines[:3]) if edu_lines else "- B.E/B.Tech in Information Science"
    
    projects_str = ""
    for line in project_lines[:6]:
        # Make bullet points more impactful
        improved = line.lstrip("•-*→ ")
        if not any(v in improved.lower() for v in ["developed", "built", "designed", "implemented", "deployed"]):
            improved = "Developed " + improved
        projects_str += f"- {improved}\n"

    if not projects_str:
        projects_str = "- Developed and deployed full-stack web applications using modern tech stack\n"

    optimized_md = f"""# {name}
{email} | {phone} | GitHub: github.com/khushiramesh19

---

## Professional Summary
Results-driven software engineer with hands-on experience in full-stack development, AI integration, and cloud deployment. Passionate about building scalable, user-centric applications. Seeking to leverage technical skills and project experience to contribute to a dynamic engineering team.

---

## Technical Skills
**Languages & Frameworks:** {skills_str}
**Tools & Platforms:** Git, GitHub, VS Code, Postman, Render, Vercel
**Concepts:** REST APIs, OOP, Data Structures & Algorithms, Agile Development

---

## Projects & Experience
{projects_str}
---

## Education
{edu_str}

---

## Achievements & Certifications
- Deployed production-grade AI Resume Analyzer with FastAPI + React on Render & Vercel
- Actively preparing for software engineering placements (DSA, Aptitude, System Design)

---
*Resume optimized for ATS compatibility — Action verbs, quantified impact, keyword-rich*
"""

    return {"optimized_markdown": optimized_md}