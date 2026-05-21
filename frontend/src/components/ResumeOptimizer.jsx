import React, { useState, useEffect } from 'react';
import { Download, Copy, Check, FileText, Sparkles, Loader } from 'lucide-react';

export default function ResumeOptimizer({ resumeText, jobDescription, apiKey }) {
  const [optimizedResume, setOptimizedResume] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState('');

  const generateOptimization = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/optimize-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_text: resumeText,
          job_description: jobDescription,
          api_key: apiKey
        })
      });

      if (!response.ok) {
        throw new Error('Failed to optimize resume');
      }

      const data = await response.json();
      setOptimizedResume(data.optimized_markdown);
    } catch (err) {
      setError(err.message || 'Error occurred. Make sure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (resumeText) {
      generateOptimization();
    }
  }, [resumeText, jobDescription]);

  const handleCopy = () => {
    navigator.clipboard.writeText(optimizedResume);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([optimizedResume], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = "ATS_Optimized_Resume.md";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-slate-900/40 rounded-xl border border-white/5 overflow-hidden flex flex-col h-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-slate-900/60 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-600/20 text-cyan-400">
            <FileText size={18} />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-200">ATS Optimized Resume</h4>
            <p className="text-[11px] text-slate-400">Copy or download as Markdown (.md) file</p>
          </div>
        </div>

        <div className="flex gap-2">
          {optimizedResume && (
            <>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-white/5 font-medium transition duration-150"
              >
                {isCopied ? (
                  <>
                    <Check size={12} className="text-emerald-400" /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={12} /> Copy Markdown
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 text-[11px] bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg font-medium transition duration-150"
              >
                <Download size={12} /> Download .md
              </button>
            </>
          )}
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 p-5 overflow-y-auto bg-slate-950/45 text-xs font-mono text-slate-300 leading-relaxed scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
            <Loader size={24} className="animate-spin text-cyan-400" />
            <p className="font-sans">AI is rewriting and restructuring your resume...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-red-400 font-sans text-center px-4">
            <p className="text-sm font-semibold">Failed to Generate Resume</p>
            <p className="text-xs text-slate-400 max-w-sm">{error}</p>
            <button 
              onClick={generateOptimization}
              className="mt-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg text-[11px] transition"
            >
              Retry Generation
            </button>
          </div>
        ) : (
          <div className="whitespace-pre-wrap select-text">
            {optimizedResume}
          </div>
        )}
      </div>
    </div>
  );
}
