import React, { useState, useRef } from 'react';
import { Search, FileText, Download, Loader2, CheckCircle2, AlertCircle, ArrowRight, Sparkles, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { performDeepResearch, ResearchStep } from './services/researchService';
import { cn } from './lib/utils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function App() {
  const [topic, setTopic] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [steps, setSteps] = useState<ResearchStep[]>([]);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsResearching(true);
    setReport(null);
    setError(null);
    setSteps([]);

    try {
      const result = await performDeepResearch(topic, (updatedSteps) => {
        setSteps(updatedSteps);
      });
      setReport(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during research.');
    } finally {
      setIsResearching(false);
    }
  };

  const downloadPDF = async () => {
    if (!reportRef.current) return;

    const element = reportRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    // Handle multi-page PDF
    let heightLeft = pdfHeight;
    let position = 0;
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`Research_Report_${topic.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans selection:bg-[#F27D26]/20">
      {/* Header */}
      <header className="border-b border-[#1A1A1A]/10 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1A1A1A] rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight uppercase">Deep Researcher</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-sm font-medium opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1">
              <History className="w-4 h-4" />
              History
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero / Input Section */}
        <section className="mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <h1 className="text-5xl font-light leading-tight mb-6 tracking-tight">
              What would you like to <span className="italic font-serif text-[#F27D26]">deeply</span> research today?
            </h1>
            <p className="text-lg text-[#1A1A1A]/60 mb-8 leading-relaxed">
              Enter a topic, and our AI will scour the web, analyze findings, and synthesize a comprehensive report for you.
            </p>

            <form onSubmit={handleResearch} className="relative group">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-[#1A1A1A]/20 group-focus-within:text-[#F27D26] transition-colors" />
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. The future of solid-state batteries in aviation"
                  className="w-full bg-white border-2 border-[#1A1A1A]/10 rounded-2xl pl-16 pr-36 py-5 text-xl outline-none focus:border-[#1A1A1A] focus:ring-4 focus:ring-[#F27D26]/5 transition-all placeholder:text-[#1A1A1A]/20"
                  disabled={isResearching}
                />
                <div className="absolute right-3 top-3 bottom-3 flex items-center">
                  <button
                    type="submit"
                    disabled={isResearching || !topic.trim()}
                    className="h-full px-6 bg-[#1A1A1A] text-white rounded-xl font-bold flex items-center gap-2 hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-black/10"
                  >
                    {isResearching ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Research <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </section>

        {/* Status / Progress Section */}
        <AnimatePresence>
          {isResearching && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-12"
            >
              <div className="bg-[#1A1A1A] text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#F27D26]/10 blur-3xl -mr-32 -mt-32 rounded-full" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-medium">Research in Progress</h2>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-mono uppercase tracking-[0.2em]">
                      <span className="w-1.5 h-1.5 bg-[#F27D26] rounded-full animate-pulse" />
                      Live Processing
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {steps.map((step) => (
                      <div 
                        key={step.id}
                        className={cn(
                          "p-5 rounded-2xl border transition-all duration-500",
                          step.status === 'running' ? "bg-white/10 border-white/20 scale-[1.02] shadow-xl" : 
                          step.status === 'completed' ? "bg-[#F27D26]/10 border-[#F27D26]/30" : 
                          "bg-white/5 border-white/5 opacity-40"
                        )}
                      >
                        <div className="flex items-center justify-between mb-3">
                          {step.status === 'completed' ? (
                            <div className="w-6 h-6 bg-[#F27D26] rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                          ) : step.status === 'running' ? (
                            <Loader2 className="w-6 h-6 animate-spin text-[#F27D26]" />
                          ) : step.status === 'error' ? (
                            <AlertCircle className="w-6 h-6 text-red-500" />
                          ) : (
                            <div className="w-6 h-6 rounded-full border border-white/20" />
                          )}
                        </div>
                        <p className="font-medium text-sm tracking-tight">{step.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Error State */}
        {error && (
          <div className="mb-12 p-6 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-4 text-red-700">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <div>
              <h3 className="font-bold mb-1">Research Interrupted</h3>
              <p className="text-sm opacity-80">{error}</p>
              <button 
                onClick={() => handleResearch({ preventDefault: () => {} } as any)}
                className="mt-4 text-sm font-bold underline underline-offset-4 hover:text-red-900"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Report Section */}
        <AnimatePresence>
          {report && (
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F27D26]/10 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-[#F27D26]" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">Research Report</h2>
                </div>
                <button
                  onClick={downloadPDF}
                  className="flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] text-white rounded-xl font-bold hover:bg-black transition-all active:scale-95 shadow-xl shadow-black/10"
                >
                  <Download className="w-5 h-5" />
                  Export to PDF
                </button>
              </div>

              <div 
                ref={reportRef}
                className="bg-white border border-[#1A1A1A]/10 rounded-[2rem] p-12 md:p-16 shadow-sm max-w-none"
              >
                <div className="mb-16 pb-12 border-b border-[#1A1A1A]/10">
                  <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#1A1A1A]/40 mb-4">Subject Matter Investigation</p>
                  <h3 className="text-5xl font-serif italic m-0 leading-tight text-[#1A1A1A]">{topic}</h3>
                  <div className="flex items-center gap-4 mt-8">
                    <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[10px] text-white font-bold">AI</div>
                    <div>
                      <p className="text-xs font-bold text-[#1A1A1A]">Deep Researcher AI</p>
                      <p className="text-[10px] text-[#1A1A1A]/40 uppercase tracking-widest">Generated on {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="markdown-content text-[#1A1A1A]/90">
                  <Markdown>{report}</Markdown>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-[#1A1A1A]/10 py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3 opacity-40 grayscale hover:grayscale-0 transition-all">
            <Sparkles className="w-5 h-5 text-[#F27D26]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Powered by Gemini 3.1 Pro</span>
          </div>
          <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">
            <a href="#" className="hover:text-[#F27D26] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#F27D26] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#F27D26] transition-colors">API</a>
          </div>
          <p className="text-[10px] text-[#1A1A1A]/40 font-medium">
            © 2026 DEEP RESEARCHER AI. SYNTHESIZED FROM GLOBAL SOURCES.
          </p>
        </div>
      </footer>
    </div>
  );
}

