import React, { useState, useMemo } from 'react';
import { TypingMetrics, Lesson } from '../types';
import { RefreshCw, ArrowLeft, ArrowRight, Home } from 'lucide-react';

interface ResultSheetProps {
  metrics: TypingMetrics;
  lesson: Lesson;
  timeLimit: number;
  backspaceDisabled: boolean;
  highlightDisabled: boolean;
  onRetry: () => void;
  onBackToDashboard: () => void;
}

export const ResultSheet: React.FC<ResultSheetProps> = ({
  metrics,
  lesson,
  timeLimit,
  onRetry,
  onBackToDashboard,
}) => {
  const [viewMode, setViewMode] = useState<'result' | 'representation' | 'practice'>('result');

  const formattedTestDuration = `${Math.floor(metrics.elapsedTime / 60)}:${(metrics.elapsedTime % 60).toString().padStart(2, '0')}`;
  const formattedDuration = `${Math.floor(timeLimit / 60)} Minutes`;

  // Find most frequent wrong word
  const wrongWordAnalysis = useMemo(() => {
    let counts: Record<string, number> = {};
    metrics.wrongWords.forEach(w => {
      counts[w] = (counts[w] || 0) + 1;
    });
    let max = 0;
    let mostWrong = '';
    for (let word in counts) {
      if (counts[word] > max) {
        max = counts[word];
        mostWrong = word;
      }
    }
    return { mostWrong, count: max, uniqueCount: Object.keys(counts).length };
  }, [metrics.wrongWords]);

  // Generate comparison rendering
  const renderErrorRepresentation = () => {
    const originalWords = metrics.originalTextRaw.trim().split(/\s+/);
    const typedWords = metrics.typedTextRaw.trim() === '' ? [] : metrics.typedTextRaw.trim().split(/\s+/);
    
    let result = [];
    let maxLen = Math.max(originalWords.length, typedWords.length);
    
    for (let i = 0; i < maxLen; i++) {
      if (i >= originalWords.length) {
        // Extra typed
        result.push(<span key={i} className="text-red-600 line-through mr-1">{typedWords[i]}</span>);
      } else if (i >= typedWords.length) {
        // Skipped
        result.push(<span key={i} className="text-red-500 font-bold mr-1">[{originalWords[i]}]</span>);
      } else if (originalWords[i] === typedWords[i]) {
        // Correct
        result.push(<span key={i} className="text-gray-800 mr-1">{typedWords[i]}</span>);
      } else if (originalWords[i].toLowerCase() === typedWords[i].toLowerCase()) {
        // Half mistake
        result.push(<span key={i} className="text-blue-600 mr-1">{typedWords[i]}</span>);
      } else {
        // Full mistake
        result.push(<span key={i} className="text-red-600 mr-1">{typedWords[i]}</span>);
      }
    }
    return result;
  };

  return (
    <div className="bg-slate-300 min-h-full p-4 flex flex-col font-sans select-none">
      
      <div className="max-w-[900px] w-full mx-auto bg-[#f0f0f0] border border-gray-400 shadow-2xl flex flex-col h-[85vh] overflow-hidden rounded-t">
        
        {/* Title Bar like Windows */}
        <div className="bg-white px-3 py-1.5 border-b border-gray-300 flex justify-between items-center text-xs shadow-sm">
          <div className="flex items-center gap-2 font-bold text-gray-800">
             <div className="w-4 h-4 bg-blue-800 rounded-sm text-[8px] text-white flex items-center justify-center font-bold">TS</div>
             TypingSathi - Result
          </div>
          <button onClick={onBackToDashboard} className="hover:bg-red-500 hover:text-white px-2 py-0.5 rounded text-gray-600 transition-colors">✕</button>
        </div>

        {/* Tabs */}
        <div className="bg-[#f0f0f0] px-2 pt-2 border-b-2 border-white flex gap-1">
          <button onClick={() => setViewMode('result')} className={`px-4 py-1 text-sm border border-b-0 rounded-t border-gray-400 ${viewMode === 'result' ? 'bg-[#f0f0f0] font-bold z-10 -mb-[2px] shadow-sm' : 'bg-gray-200 text-gray-600'}`}>Result</button>
          <button onClick={() => setViewMode('representation')} className={`px-4 py-1 text-sm border border-b-0 rounded-t border-gray-400 ${viewMode !== 'result' ? 'bg-[#f0f0f0] font-bold z-10 -mb-[2px] shadow-sm' : 'bg-gray-200 text-gray-600'}`}>Analysis</button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-[#f0f0f0] border-t-2 border-gray-300 p-4">
          
          <div className="font-bold text-xs underline mb-2 text-gray-800">Standard Mode</div>
          
          {/* Blue Header Table Title */}
          <div className="bg-[#3b5998] text-white text-center py-1.5 font-bold text-sm shadow-sm">
            Result details below (TypingSathi)
          </div>

          {/* Table Data Block 1 */}
          <div className="bg-[#f8f8f8] border-x border-b border-gray-400 p-4 grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-800">
            <div className="flex justify-between"><span>Exercises</span><span className="font-bold">:{' '} {lesson.title.substring(0, 20) || 'Exercise 01'}</span></div>
            <div className="flex justify-between"><span>Test Duration</span><span className="font-bold">:{' '} {formattedTestDuration} Minutes</span></div>
            <div className="flex justify-between"><span>Duration</span><span className="font-bold">:{' '} {formattedDuration}</span></div>
            <div className="flex justify-between"><span>Total Words Type</span><span className="font-bold">:{' '} {metrics.totalWordsTyped}</span></div>
            <div className="flex justify-between"><span>Correct Words Typed</span><span className="font-bold">:{' '} {metrics.correctWordsTyped}</span></div>
            <div className="flex justify-between"><span>Incorrect Words Typed</span><span className="font-bold">:{' '} {metrics.incorrectWordsTyped}</span></div>
          </div>

          <div className="w-full h-[2px] bg-gray-500 my-0"></div>

          {/* Table Data Block 2 */}
          <div className="bg-[#f8f8f8] border-x border-b border-gray-400 p-4 grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-800">
            <div className="flex justify-between"><span>Accuracy</span><span className="font-bold">:{' '} {metrics.accuracy.toFixed(2)}%</span></div>
            <div className="flex justify-between"><span>Backspace Count</span><span className="font-bold">:{' '} {metrics.backspaceCount} Times</span></div>
            
            <div className="flex justify-between"><span>Net Speed (WPM and KSPM)</span><span className="font-bold">:{' '} {Math.round(metrics.netWpm)} | {Math.round(metrics.netKspm)}</span></div>
            <div className="flex justify-between"><span>Gross Speed (WPM and KSPM)</span><span className="font-bold">:{' '} {Math.round(metrics.grossWpm)} | {Math.round(metrics.grossKspm)}</span></div>
            
            <div className="flex justify-between"><span>Full Mistakes</span><span className="font-bold text-red-600">:{' '} {metrics.fullMistakes}</span></div>
            <div className="flex justify-between"><span>Half Mistakes</span><span className="font-bold text-blue-600">:{' '} {metrics.halfMistakes}</span></div>
            
            <div className="flex justify-between"><span>Total Error</span><span className="font-bold">:{' '} {metrics.errorCount}</span></div>
            <div className="flex justify-between"><span>Keystroke Count</span><span className="font-bold">:{' '} {metrics.keystrokeCount}</span></div>
            
            <div className="flex justify-between"><span>Error Rate</span><span className="font-bold">:{' '} {metrics.errorRate.toFixed(2)}%</span></div>
          </div>

          <div className="w-full h-[2px] bg-gray-600 mt-2 mb-4"></div>

          {/* Buttons and Legend Box */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="text-xs font-bold leading-relaxed bg-[#f8f8f8] border border-gray-300 p-2 shadow-sm">
              Note : <span className="text-red-500 underline decoration-red-200">Full mistakes – Red colour</span>,{' '}
              <span className="text-blue-500 underline decoration-blue-200">Half mistakes – Blue colour</span>
              <br />
              <span className="text-red-500 border border-red-500 px-1 mt-1 inline-block bg-red-50">[Skipped Word] – Red colour</span>
            </div>

            <div className="flex gap-2 shrink-0">
              <button 
                onClick={() => setViewMode('practice')}
                className="px-4 py-2 border border-gray-500 bg-[#f8f8f8] hover:bg-white shadow text-sm font-bold text-gray-800 transition-colors"
              >
                Practice Wrong Words
              </button>
              <button 
                onClick={() => setViewMode('representation')}
                className="px-4 py-2 border border-gray-500 bg-[#f8f8f8] hover:bg-white shadow text-sm font-bold text-gray-800 transition-colors"
              >
                Error Representation
              </button>
            </div>
          </div>

          {/* Conditional View Area */}
          <div className="bg-white border border-gray-400 shadow-inner p-4 min-h-[150px] text-justify whitespace-pre-wrap leading-relaxed text-sm overflow-y-auto">
            {viewMode === 'result' && (
              <div className="text-gray-500 italic text-center py-8">
                Select "Error Representation" or "Practice Wrong Words" to analyze mistakes.
              </div>
            )}
            
            {viewMode === 'representation' && (
              <div>
                <div className="mb-4">
                  {renderErrorRepresentation()}
                </div>

                {wrongWordAnalysis.count > 0 && (
                  <div className="mt-6 border-t border-blue-200 pt-4 bg-blue-50/50 p-4 rounded text-sm">
                    <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                       Tutor's Insight & Lesson
                    </h3>
                    <p className="text-gray-800 mb-2">
                      You made <strong>{wrongWordAnalysis.uniqueCount}</strong> unique mistakes. 
                      Your most frequently mistyped word was <span className="font-mono bg-red-100 text-red-700 px-2 font-bold select-all">"{wrongWordAnalysis.mostWrong}"</span> 
                      ({wrongWordAnalysis.count} times).
                    </p>
                    <div className="bg-white p-3 border border-blue-200 shadow-sm text-gray-700">
                      <strong>💡 Improvement Lesson:</strong> When typing words with tricky letter combinations like "{wrongWordAnalysis.mostWrong}", 
                      it's common to misfire keys. Do not rush through it. Slowly type the word 5 times out loud, feeling which finger presses which key. 
                      Muscle memory is built through accuracy first, speed second. Use the "Practice Wrong Words" tab to drill this specifically.
                    </div>
                  </div>
                )}
              </div>
            )}

            {viewMode === 'practice' && (
              <div>
                {metrics.wrongWords.length === 0 ? (
                  <div className="text-green-700 font-bold text-center py-8">
                    Perfect! You have no wrong words to practice.
                  </div>
                ) : (
                  <div>
                    <h3 className="font-bold text-gray-800 mb-3 border-b pb-1">Drill Your Mistakes</h3>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(metrics.wrongWords)).map((word, idx) => (
                        <div key={idx} className="bg-red-50 border border-red-200 text-red-800 px-3 py-1 rounded-full font-mono text-xs select-all cursor-text hover:bg-red-100">
                          {word}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-4 italic">
                      Copy these words into a custom lesson to practice them until they become natural.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          
        </div>
        
        {/* Footer Actions */}
        <div className="bg-[#e4e4e4] px-4 py-3 border-t border-gray-400 flex justify-between">
            <button onClick={onBackToDashboard} className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-500 bg-white hover:bg-gray-100 shadow-sm text-sm font-bold text-gray-700 transition">
              <Home className="w-4 h-4"/> Home
            </button>
            <button onClick={onRetry} className="flex items-center gap-1.5 px-4 py-1.5 border border-[#1d4ed8] bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-sm text-sm font-bold transition">
              <RefreshCw className="w-4 h-4"/> Retake Exam
            </button>
        </div>

      </div>
    </div>
  );
};

