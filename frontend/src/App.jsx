import React, { useState, useEffect } from 'react';
import { 
  FileText, Upload, Settings, ShieldAlert, Sparkles, Check, 
  HelpCircle, ChevronRight, RefreshCw, Eye, Star, Info
} from 'lucide-react';
import Dashboard from './components/Dashboard';

export default function App() {
  const [file, setFile] = useState(null);
  const [jobRole, setJobRole] = useState('software_engineer');
  const [jobDescription, setJobDescription] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Load API Key from localStorage on startup
  useEffect(() => {
    const savedKey = localStorage.getItem('GEMINI_API_KEY');
    if (savedKey) {
      setApiKey(savedKey);
      setIsDemoMode(false); // Disable demo mode if key exists
    }
  }, []);

  const saveApiKey = (key) => {
    setApiKey(key);
    if (key.trim()) {
      localStorage.setItem('GEMINI_API_KEY', key.trim());
      setIsDemoMode(false);
    } else {
      localStorage.removeItem('GEMINI_API_KEY');
      setIsDemoMode(true);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const name = selectedFile.name.toLowerCase();
    if (name.endsWith('.pdf') || name.endsWith('.docx') || name.endsWith('.txt')) {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Unsupported file type. Please upload a PDF, DOCX or TXT file.');
    }
  };

  const triggerAnalyze = async () => {
    if (!file) {
      setError('Please select or upload a resume file first.');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setAnalysis(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_role', jobRole);
    formData.append('job_description', jobDescription);

    try {
      const headers = {};
      if (!isDemoMode && apiKey) {
        headers['X-Gemini-Key'] = apiKey;
      }

      const response = await fetch('http://127.0.0.1:8000/api/analyze', {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      if (!response.ok) {
        const errDetails = await response.json();
        throw new Error(errDetails.detail || 'Failed to complete analysis.');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err.message || 'Connection refused. Ensure the backend FastAPI server is running on port 8000.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setAnalysis(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col relative overflow-hidden">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-600/10 blur-[150px] pointer-events-none" />

      {/* Header Bar */}
      <header className="border-b border-white/5 bg-slate-900/40 backdrop-blur-md px-6 py-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <FileText size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
              ATS Pro Analyzer <span className="bg-violet-600/15 border border-violet-500/30 text-violet-400 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">Beta v1</span>
            </h1>
            <p className="text-[10px] text-slate-400">AI-Powered Resume Optimization</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/5 rounded-xl transition duration-150"
          >
            <Settings size={14} className={showSettings ? 'animate-spin' : ''} />
            <span>Settings</span>
          </button>
        </div>
      </header>

      {/* Main Grid View */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Settings Drawer (Overlay Panel) */}
        {showSettings && (
          <div className="absolute right-6 top-6 w-80 bg-slate-900/95 border border-white/10 rounded-2xl p-5 shadow-2xl z-50 backdrop-blur-lg glow-violet">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">Configuration</h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-xs text-slate-500 hover:text-slate-300 font-bold"
              >
                Close
              </button>
            </div>
            
            <div className="space-y-4">
              {/* API Mode Selector */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Execution Mode</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-white/5">
                  <button
                    onClick={() => setIsDemoMode(true)}
                    className={`text-[10px] font-bold py-1.5 rounded-lg transition duration-150 ${
                      isDemoMode 
                        ? 'bg-cyan-600 text-white shadow-lg' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Demo Mode
                  </button>
                  <button
                    onClick={() => {
                      if (!apiKey.trim()) {
                        setError('Please configure a valid Gemini API key to use Live Mode.');
                      }
                      setIsDemoMode(false);
                    }}
                    className={`text-[10px] font-bold py-1.5 rounded-lg transition duration-150 ${
                      !isDemoMode 
                        ? 'bg-violet-600 text-white shadow-lg' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Live Mode
                  </button>
                </div>
              </div>

              {/* API Key Form */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Gemini API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => saveApiKey(e.target.value)}
                  placeholder="Paste AI API key..."
                  className="w-full bg-slate-950/80 text-xs text-slate-200 placeholder-slate-600 rounded-xl px-3 py-2.5 border border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                />
                <p className="text-[9px] text-slate-500 mt-1.5 leading-normal">
                  Your key is saved locally in your browser's <code className="text-violet-400">localStorage</code> and never shared elsewhere. Get a free key from Google AI Studio.
                </p>
              </div>

              <div className="pt-2 border-t border-white/5 flex gap-2">
                <div className="p-1 rounded bg-cyan-500/10 text-cyan-400 mt-0.5">
                  <Info size={12} />
                </div>
                <p className="text-[9px] text-slate-400 leading-normal">
                  Demo Mode bypasses requests to the Gemini API, using prebuilt high-fidelity assessments so you can view Dashboard modules instantly.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content Workspace */}
        <main className="flex-1 p-6 overflow-y-auto z-10 scrollbar">
          
          {/* LANDING / HERO STATE (No analysis yet) */}
          {!analysis && !isAnalyzing && (
            <div className="max-w-4xl mx-auto py-8 space-y-8">
              
              {/* Title Header */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-1.5 text-xs text-violet-400 font-bold bg-violet-500/10 border border-violet-500/25 px-3 py-1 rounded-full">
                  <Sparkles size={12} className="animate-pulse" />
                  Elevate Your Resume for ATS & Recruiters
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  Optimize Your Resume Against Job Roles
                </h2>
                <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
                  Extract resume text client-side, analyze formatting compliance, find missing keywords, and get customized AI rewrites instantly.
                </p>
              </div>

              {/* Main Configurations & Upload Grid */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                
                {/* Side Configuration Panel */}
                <div className="md:col-span-2 glass-panel p-5 rounded-2xl space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 border-b border-white/5 pb-2">Analysis Target</h3>
                    
                    {/* Job Role Select */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Job Role Template</label>
                      <select
                        value={jobRole}
                        onChange={(e) => setJobRole(e.target.value)}
                        className="w-full bg-slate-950 text-xs text-slate-200 rounded-xl px-3.5 py-2.5 border border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                      >
                        <option value="software_engineer">Software Engineer / Frontend</option>
                        <option value="devops_engineer">DevOps Engineer / SRE</option>
                        <option value="data_analyst">Data Analyst / Data Scientist</option>
                        <option value="custom">Custom Job Description</option>
                      </select>
                    </div>

                    {/* Custom Job Description Textarea */}
                    {jobRole === 'custom' && (
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Job Description / Requirements</label>
                        <textarea
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          placeholder="Paste target job descriptions to analyze match density..."
                          rows={4}
                          className="w-full bg-slate-950 text-xs text-slate-200 placeholder-slate-600 rounded-xl px-3 py-2.5 border border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500/50 resize-none"
                        />
                      </div>
                    )}

                    {/* Execution details */}
                    <div className="p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-1.5 text-[10px]">
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Mode:</span>
                        <span className={`font-semibold ${isDemoMode ? 'text-cyan-400' : 'text-violet-400'}`}>
                          {isDemoMode ? 'Demo Fallback' : 'Live Gemini AI'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Parser:</span>
                        <span className="font-semibold text-slate-300">pypdf / docx2txt (Backend)</span>
                      </div>
                    </div>
                  </div>

                  {/* Settings Tip */}
                  <div className="bg-violet-500/5 border border-violet-500/10 p-3.5 rounded-xl text-[10px] text-slate-400 leading-normal">
                    <span className="font-bold text-violet-400 block mb-0.5">💡 Portfolio Tip</span>
                    Select standard roles to test the UI instantly without credentials, or add an API key in <button onClick={() => setShowSettings(true)} className="text-violet-300 font-bold hover:underline">Settings</button> for real-time analysis!
                  </div>
                </div>

                {/* File Upload Drop Zone */}
                <div className="md:col-span-3 flex flex-col gap-4">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex-1 min-h-[220px] rounded-2xl border-2 border-dashed transition flex flex-col items-center justify-center p-6 text-center cursor-pointer relative overflow-hidden ${
                      isDragOver
                        ? 'border-cyan-400 bg-cyan-500/5'
                        : file
                        ? 'border-emerald-500/40 bg-emerald-500/5'
                        : 'border-white/10 hover:border-violet-500/40 bg-slate-900/20'
                    }`}
                  >
                    <input
                      type="file"
                      id="resume-file-input"
                      onChange={handleFileChange}
                      accept=".pdf,.docx,.txt"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    
                    {file ? (
                      <div className="space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-lg">
                          <Check size={22} />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-emerald-300 truncate max-w-xs mx-auto">{file.name}</h4>
                          <p className="text-[10px] text-slate-400 mt-1">{(file.size / 1024).toFixed(1)} KB • Ready for optimization</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                          }}
                          className="text-[10px] font-bold text-rose-400 hover:text-rose-300 hover:underline"
                        >
                          Remove File
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-950 text-slate-400 flex items-center justify-center mx-auto border border-white/5 shadow-md">
                          <Upload size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-300">Drag & drop your resume</h4>
                          <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                            Supports PDF, DOCX or TXT files.<br />Parsed securely on server.
                          </p>
                        </div>
                        <div className="inline-flex items-center gap-1 text-[10px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-lg">
                          Choose File
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions & Errors */}
                  <div className="space-y-3">
                    {error && (
                      <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl flex items-center gap-2 text-xs text-rose-400">
                        <ShieldAlert size={14} className="shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={triggerAnalyze}
                      disabled={!file}
                      className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 disabled:opacity-50 text-white font-bold text-xs py-3.5 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-violet-500/10"
                    >
                      <Sparkles size={14} />
                      Analyze Resume
                    </button>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ANALYZING STATE */}
          {isAnalyzing && (
            <div className="max-w-md mx-auto py-16 text-center space-y-6">
              <div className="relative w-48 h-48 mx-auto bg-slate-900/40 rounded-2xl border border-white/5 flex flex-col items-center justify-center overflow-hidden">
                <FileText size={48} className="text-violet-500 animate-pulse" />
                
                {/* Scan animated line */}
                <div className="absolute left-0 right-0 h-1 bg-cyan-400/80 shadow-[0_0_15px_#06b6d4] scanning-bar" />
              </div>
              <div className="space-y-2">
                <h3 className="font-extrabold text-sm text-slate-200">Executing Deep Resume Audit...</h3>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-normal">
                  Extracting text structure, cross-referencing keywords, and evaluating layout criteria.
                </p>
              </div>
            </div>
          )}

          {/* COMPLETED DASHBOARD STATE */}
          {analysis && !isAnalyzing && (
            <Dashboard 
              analysis={analysis} 
              apiKey={apiKey} 
              onReset={handleReset} 
            />
          )}

        </main>
      </div>
    </div>
  );
}
