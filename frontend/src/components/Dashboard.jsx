import React, { useState, useEffect } from 'react';
import { 
  Award, Briefcase, FileText, CheckCircle2, AlertTriangle, 
  XCircle, ArrowRight, MessageSquare, Terminal, Download, Copy,
  Play, Sparkles, BookOpen, RefreshCw, BarChart2, Star
} from 'lucide-react';
import confetti from 'canvas-confetti';
import ChatAssistant from './ChatAssistant';
import ResumeOptimizer from './ResumeOptimizer';

export default function Dashboard({ analysis, apiKey, onReset }) {
  const [activeTab, setActiveTab] = useState('skills');
  const job_role = analysis.job_role || 'software_engineer';
  const job_description = analysis.job_description || '';
  const { 
    ats_score, formatting_score, keyword_score, 
    skills_analysis, keyword_density, suggestions, 
    bullet_point_rewrites, interview_prep, extracted_text, mode, error 
  } = analysis;

  // Visual Score Colors
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 stroke-emerald-500';
    if (score >= 60) return 'text-amber-400 stroke-amber-500';
    return 'text-rose-400 stroke-rose-500';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    if (score >= 60) return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
  };

  // Launch Confetti when score is high
  useEffect(() => {
    if (ats_score >= 80) {
      const duration = 2 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [ats_score]);

  return (
    <div className="space-y-6">
      {/* Fallback Warning */}
      {mode === 'fallback' && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
          <div>
            <h5 className="font-semibold text-xs text-amber-400">Gemini API Key Fallback</h5>
            <p className="text-[11px] text-slate-400 mt-0.5">
              The application fell back to Demo Mode because of an issue: <code className="text-amber-200">{error}</code>.
              Configure a valid Gemini API Key in settings for live analysis.
            </p>
          </div>
        </div>
      )}

      {/* Mode Indicator */}
      {mode === 'demo' && (
        <div className="bg-cyan-500/15 border border-cyan-500/25 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-500/20 text-cyan-400 p-2 rounded-lg">
              <Sparkles size={18} />
            </div>
            <div>
              <h5 className="font-semibold text-xs text-cyan-300">You are in Demo Mode</h5>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Displaying a high-quality mockup analysis. Provide a Gemini API Key in the settings sidebar for real-time analysis on your own files!
              </p>
            </div>
          </div>
          <button 
            onClick={onReset}
            className="bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition"
          >
            Upload Another
          </button>
        </div>
      )}

      {/* Row 1: Dashboard Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* ATS Gauge Chart */}
        <div className="md:col-span-1 glass-card p-5 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
          <h4 className="text-xs font-semibold text-slate-400 mb-3 text-center tracking-wide uppercase">Overall ATS Score</h4>
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-slate-800"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className={`stroke-current transition-all duration-1000 ${getScoreColor(ats_score)}`}
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * ats_score) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-extrabold text-white tracking-tighter">{ats_score}</span>
              <span className="text-xs text-slate-500 block">/100</span>
            </div>
          </div>
          <div className={`mt-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getScoreBg(ats_score)}`}>
            {ats_score >= 80 ? 'Excellent Match' : ats_score >= 60 ? 'Needs Tweaks' : 'Critical Audit'}
          </div>
        </div>

        {/* Formatting Score Card */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Formatting Score</h4>
            <div className="flex items-baseline gap-1 mt-2">
              <span className={`text-4xl font-extrabold tracking-tight ${getScoreColor(formatting_score)}`}>{formatting_score}</span>
              <span className="text-xs text-slate-500">/100</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Assesses structure, font standards, contact details, and logical heading hierarchies.
            </p>
          </div>
          <div className="border-t border-white/5 pt-3 mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Contact Details Found:</span>
              <CheckCircle2 size={12} className="text-emerald-400" />
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Clean Header Layout:</span>
              <CheckCircle2 size={12} className="text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Keyword Score Card */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Keyword Density Score</h4>
            <div className="flex items-baseline gap-1 mt-2">
              <span className={`text-4xl font-extrabold tracking-tight ${getScoreColor(keyword_score)}`}>{keyword_score}</span>
              <span className="text-xs text-slate-500">/100</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Measures matching key phrases and technical skills based on the target requirements.
            </p>
          </div>
          <div className="border-t border-white/5 pt-3 mt-3">
            <div className="flex items-center gap-1.5 text-[10px] text-violet-400 font-semibold bg-violet-500/10 border border-violet-500/20 px-2 py-1 rounded-lg">
              <Star size={10} className="fill-current" />
              <span>{skills_analysis?.matched?.length || 0} Core Matches Detected</span>
            </div>
          </div>
        </div>

        {/* Analysis Overview / Actions */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Target Alignment</h4>
            <div className="mt-2.5">
              <div className="text-xs font-bold text-slate-200 capitalize truncate">{job_role.replace("_", " ")}</div>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-3">
                {job_description || 'Standard industry requirements selected.'}
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button 
              onClick={onReset}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-xl text-xs font-semibold border border-white/5 transition flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={12} /> Re-Analyze
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Details Navigation and content */}
      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-white/5 bg-slate-900/40 p-1">
          {[
            { id: 'skills', label: 'Skills Gap Analysis', icon: BookOpen },
            { id: 'keywords', label: 'Keyword Density', icon: BarChart2 },
            { id: 'rewrites', label: 'AI Bullet Suggestions', icon: Terminal },
            { id: 'suggestions', label: 'Section Audits', icon: Award },
            { id: 'interview', label: 'Interview Prep', icon: Briefcase }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold rounded-xl transition duration-150 ${
                  active 
                    ? 'bg-violet-600/15 text-violet-400 border-b-2 border-violet-500' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="p-6 min-h-[280px]">
          
          {/* TAB 1: SKILLS GAP */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Skills Alignment Matrix</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Venn analysis matching your skill keywords against job qualifications.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Matched Skills */}
                <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 size={14} />
                    <span>Matched Skills ({skills_analysis?.matched?.length || 0})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {skills_analysis?.matched?.length > 0 ? (
                      skills_analysis.matched.map((skill, i) => (
                        <span key={i} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] px-2.5 py-1 rounded-full font-medium">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">No matches detected.</span>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="bg-rose-500/5 border border-rose-500/10 p-4 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                    <XCircle size={14} />
                    <span>Missing Skills ({skills_analysis?.missing?.length || 0})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {skills_analysis?.missing?.length > 0 ? (
                      skills_analysis.missing.map((skill, i) => (
                        <span key={i} className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] px-2.5 py-1 rounded-full font-medium">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">No critical missing skills.</span>
                    )}
                  </div>
                </div>

                {/* Suggested Skills */}
                <div className="bg-violet-500/5 border border-violet-500/10 p-4 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-violet-400 font-bold text-xs">
                    <Sparkles size={14} />
                    <span>Recommended Skills ({skills_analysis?.suggested?.length || 0})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {skills_analysis?.suggested?.length > 0 ? (
                      skills_analysis.suggested.map((skill, i) => (
                        <span key={i} className="bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[10px] px-2.5 py-1 rounded-full font-medium">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">No recommendations.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KEYWORDS & DENSITY */}
          {activeTab === 'keywords' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Keyword Density Checker</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Detailed table verifying specific technology mentions and raw counts in your resume text.</p>
              </div>

              <div className="border border-white/5 rounded-xl overflow-hidden bg-slate-900/20">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900/60 border-b border-white/5 text-slate-400 font-semibold">
                      <th className="p-3.5">Keyword</th>
                      <th className="p-3.5">Mentions</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {keyword_density && keyword_density.length > 0 ? (
                      keyword_density.map((kd, i) => (
                        <tr key={i} className="hover:bg-white/5 transition">
                          <td className="p-3.5 font-semibold text-slate-200">{kd.keyword}</td>
                          <td className="p-3.5 font-mono text-slate-400">{kd.count}</td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                              kd.match_status === 'Strong Match' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : kd.match_status === 'Found'
                                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {kd.match_status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="p-6 text-center text-[11px] text-slate-500 italic">No keyword density data available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: RESUME BULLETS REWRITE */}
          {activeTab === 'rewrites' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">AI Bullet Suggestions & Metrics Enhancer</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Rewrite recommendation comparison to convert passive descriptions into high-impact, quantified bullets.</p>
              </div>

              <div className="space-y-4">
                {bullet_point_rewrites && bullet_point_rewrites.length > 0 ? (
                  bullet_point_rewrites.map((rewrite, i) => (
                    <div key={i} className="border border-white/5 rounded-xl bg-slate-900/35 overflow-hidden">
                      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">
                        
                        {/* Original */}
                        <div className="p-4 bg-rose-500/5">
                          <span className="text-[9px] font-bold text-rose-400 uppercase bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/25">Original Bullet</span>
                          <p className="text-xs text-slate-400 mt-3 italic leading-relaxed">"{rewrite.original}"</p>
                        </div>

                        {/* Rewritten */}
                        <div className="p-4 bg-emerald-500/5">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">AI-Optimized Rewrite</span>
                            <span className="text-[10px] text-violet-400 font-semibold flex items-center gap-1"><Sparkles size={10} /> +ATS friendly</span>
                          </div>
                          <p className="text-xs text-slate-200 mt-3 font-semibold leading-relaxed">"{rewrite.rewritten}"</p>
                        </div>
                      </div>
                      
                      {/* Rationale */}
                      <div className="p-3 border-t border-white/5 bg-slate-900/40 text-[10px] text-slate-400 flex items-center gap-2">
                        <span className="font-bold text-violet-400 uppercase shrink-0">Rationale:</span>
                        <span>{rewrite.explanation}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-500 italic">No bullet suggestions needed or available.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SECTION AUDITS */}
          {activeTab === 'suggestions' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">ATS Compliance & Structure Audit</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Critical edits identified to optimize header, section ordering, or experience descriptions.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestions && suggestions.length > 0 ? (
                  suggestions.map((sug, i) => (
                    <div key={i} className="p-4 rounded-xl border border-white/5 bg-slate-900/40 space-y-2 flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400 mt-0.5 shrink-0">
                        <Award size={14} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 block">{sug.category}</span>
                        <p className="text-xs text-slate-300 leading-relaxed mt-1">{sug.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-500 italic">No structured suggestions available.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: INTERVIEW PREP */}
          {activeTab === 'interview' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">AI Tailored Interview Questions</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Behavioral and technical check questions generated directly from your resume's weaknesses and target job skills.</p>
              </div>

              <div className="space-y-4">
                {interview_prep && interview_prep.length > 0 ? (
                  interview_prep.map((prep, i) => (
                    <div key={i} className="border border-white/5 rounded-xl bg-slate-900/35 overflow-hidden">
                      <div className="p-4 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-violet-600/20 text-violet-400 text-[10px] font-bold flex items-center justify-center border border-violet-500/35 shrink-0">Q{i+1}</span>
                          <h5 className="font-semibold text-xs text-slate-200 leading-relaxed">{prep.question}</h5>
                        </div>
                      </div>
                      <div className="p-4 bg-slate-950/20">
                        <span className="text-[9px] font-bold text-cyan-400 uppercase bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/25">Suggested Talking Points</span>
                        <p className="text-xs text-slate-400 mt-2.5 leading-relaxed font-sans">{prep.suggested_talking_points}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-500 italic">No interview prep questions available.</p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Row 3: Advanced Widgets (Chat and Resume Optimizer) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
            <MessageSquare size={16} className="text-violet-400" />
            <span>Interactive Resume AI Chat Coach</span>
          </h3>
          <ChatAssistant 
            resumeText={extracted_text} 
            jobDescription={job_description || job_role} 
            apiKey={apiKey} 
          />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
            <FileText size={16} className="text-cyan-400" />
            <span>Resume Builder & ATS Optimizer</span>
          </h3>
          <ResumeOptimizer 
            resumeText={extracted_text} 
            jobDescription={job_description || job_role} 
            apiKey={apiKey} 
          />
        </div>
      </div>
    </div>
  );
}
