import { useState, useEffect, useRef } from 'react';
import { PRESET_LESSONS } from './data/presetLessons';
import { Lesson, TypingMetrics, AppSettings, PracticeSession, DifficultyLevel } from './types';
import { ResultSheet } from './components/ResultSheet';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { keyboardSound } from './utils/keyboardAudio';
import { User, Keyboard, Plus, AlertCircle } from 'lucide-react';

const DEFAULT_SETTINGS: AppSettings = {
  timeLimit: 600, // 10 minutes standard for exams
  allowBackspace: true,
  highlightCurrentWord: false, // Disabled to reflect strict exam condition
  textSize: 'md',
  examLayout: true,
  layoutMode: 'scrollable-split',
};

export default function App() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'practice' | 'lessons' | 'analytics'>('practice');

  // Lessons State
  const [lessons, setLessons] = useState<Lesson[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typing_tutor_custom_lessons');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return [...PRESET_LESSONS, ...parsed];
        } catch (e) {
          return PRESET_LESSONS;
        }
      }
    }
    return PRESET_LESSONS;
  });

  const [selectedLesson, setSelectedLesson] = useState<Lesson>(PRESET_LESSONS[6]); // Start on SSC CHSL Mock as default

  // Practice Settings State
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window !== 'undefined') {
      const savedSetting = localStorage.getItem('typing_tutor_settings');
      if (savedSetting) {
        try {
          return JSON.parse(savedSetting);
        } catch (e) {}
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [examHallSound, setExamHallSound] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(18);

  // Live Typing States
  const [typingInput, setTypingInput] = useState<string>('');
  const [isTestRunning, setIsTestRunning] = useState<boolean>(false);
  const [isTestCompleted, setIsTestCompleted] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(settings.timeLimit);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [backspaceCount, setBackspaceCount] = useState<number>(0);
  
  // Historical Session Progress State
  const [history, setHistory] = useState<PracticeSession[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typing_tutor_sessions_log');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return [];
  });

  // Custom Lesson Form Fields
  const [newLessonTitle, setNewLessonTitle] = useState<string>('');
  const [newLessonText, setNewLessonText] = useState<string>('');

  // Refs
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync settings parameters
  useEffect(() => {
    // Override highlight to always false for the strict simulation
    const strictSettings = { ...settings, highlightCurrentWord: false };
    localStorage.setItem('typing_tutor_settings', JSON.stringify(strictSettings));
    if (!isTestRunning && !isTestCompleted) {
      setTimeRemaining(strictSettings.timeLimit);
    }
  }, [settings, isTestRunning, isTestCompleted]);

  // Handle ambient acoustics
  const handleToggleAmbient = (enabled: boolean) => {
    setExamHallSound(enabled);
    keyboardSound.toggleAmbient(enabled);
  };

  // Handle live test timer countdown
  useEffect(() => {
    if (isTestRunning) {
      timerIntervalRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleCompleteTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTestRunning]);

  const handleResetTest = () => {
    setIsTestRunning(false);
    setIsTestCompleted(false);
    setTypingInput('');
    setElapsedTime(0);
    setTimeRemaining(settings.timeLimit);
    setBackspaceCount(0);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Metric Calculation
  const calculateMetrics = (input: string, maxDurationUsed: number): TypingMetrics => {
    const lessonText = selectedLesson.text;
    const typedWords = input.trim() === '' ? [] : input.trim().split(/\s+/);
    const originalWords = lessonText.trim().split(/\s+/);
    
    let correctWordsTyped = 0;
    let fullMistakes = 0;
    let halfMistakes = 0;
    const wrongWords: string[] = [];
    
    for (let i = 0; i < typedWords.length; i++) {
      if (i >= originalWords.length) {
        fullMistakes++; // Extra words
      } else {
        const expected = originalWords[i];
        const typed = typedWords[i];
        if (expected === typed) {
          correctWordsTyped++;
        } else {
          wrongWords.push(expected);
          if (expected.toLowerCase() === typed.toLowerCase()) {
            halfMistakes++;
          } else {
            fullMistakes++;
          }
        }
      }
    }

    const totalWordsTyped = typedWords.length;
    const incorrectWordsTyped = fullMistakes + halfMistakes;
    const totalErrors = fullMistakes + (halfMistakes / 2);
    
    const minutes = maxDurationUsed > 0 ? maxDurationUsed / 60 : 1/60;
    const keystrokeCount = input.length;
    
    const grossKspm = keystrokeCount / minutes;
    const grossWpm = grossKspm / 5;
    const netWpm = Math.max(0, grossWpm - (totalErrors / minutes));
    const netKspm = netWpm * 5;
    
    let errorRate = totalWordsTyped > 0 ? (totalErrors / totalWordsTyped) * 100 : 0;
    let accuracy = Math.max(0, 100 - errorRate);

    // Calculate characters for base compat
    let correctChars = 0;
    const limitChar = Math.min(input.length, lessonText.length);
    for (let i = 0; i < limitChar; i++) {
      if (input[i] === lessonText[i]) correctChars++;
    }

    return {
      grossWpm, netWpm, accuracy, totalCharsTyped: keystrokeCount, correctChars,
      errorCount: totalErrors, backspaceCount, elapsedTime: maxDurationUsed,
      timeRemaining: settings.timeLimit - maxDurationUsed,
      grossKspm, netKspm, errorRate, totalWordsTyped, correctWordsTyped,
      incorrectWordsTyped, fullMistakes, halfMistakes, keystrokeCount,
      typedTextRaw: input, originalTextRaw: lessonText, wrongWords
    };
  };

  const currentMetrics = calculateMetrics(typingInput, elapsedTime || 1);

  // Auto trigger test completion if whole text typed
  useEffect(() => {
    if (isTestRunning && typingInput.length >= selectedLesson.text.length && selectedLesson.text.length > 0) {
      handleCompleteTest();
    }
  }, [typingInput, isTestRunning, selectedLesson]);

  const handleInputKeystroke = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const typedVal = e.target.value;
    if (typedVal.length > selectedLesson.text.length + 50) return;

    if (!isTestRunning && !isTestCompleted && typedVal.length > 0) {
      setIsTestRunning(true);
    }
    setTypingInput(typedVal);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (soundEnabled) {
      keyboardSound.playClack(e.key === ' ' || e.key === 'Enter');
    }

    if (e.key === 'Backspace') {
      if (!settings.allowBackspace) {
        e.preventDefault();
        return;
      }
      setBackspaceCount((prev) => prev + 1);
    }
  };

  const handleCompleteTest = () => {
    setIsTestRunning(false);
    setIsTestCompleted(true);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    const finalTimeUsed = elapsedTime === 0 ? 1 : elapsedTime;
    const finalMetrics = calculateMetrics(typingInput, finalTimeUsed);

    const newSession: PracticeSession = {
      id: 'session_' + Date.now(),
      lessonId: selectedLesson.id,
      lessonTitle: selectedLesson.title,
      difficulty: selectedLesson.difficulty,
      date: new Date().toISOString(),
      backspaceDisabled: !settings.allowBackspace,
      highlightDisabled: true, // always disabled in this strict mode
      timeLimit: settings.timeLimit,
      ...finalMetrics,
    };

    const newHistory = [newSession, ...history];
    setHistory(newHistory);
    localStorage.setItem('typing_tutor_sessions_log', JSON.stringify(newHistory));
  };

  // Add Custom Lesson
  const handleSaveCustomLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim() || !newLessonText.trim()) return;

    const newLesson: Lesson = {
      id: 'custom_' + Date.now(),
      title: newLessonTitle.trim(),
      source: 'User Defined Input',
      text: newLessonText.trim().replace(/\s+/g, ' '), // Normalize spaces mimicking exams
      difficulty: 'exam',
      isCustom: true
    };

    const savedCustom = localStorage.getItem('typing_tutor_custom_lessons');
    let customArr: Lesson[] = [];
    if (savedCustom) {
      try { customArr = JSON.parse(savedCustom); } catch (e) {}
    }

    const updatedCustom = [newLesson, ...customArr];
    localStorage.setItem('typing_tutor_custom_lessons', JSON.stringify(updatedCustom));

    setLessons([...PRESET_LESSONS, ...updatedCustom]);
    setSelectedLesson(newLesson);
    
    setNewLessonTitle('');
    setNewLessonText('');
    setActiveTab('practice');
    handleResetTest();
  };

  const handleClearHistory = () => {
    if (window.confirm("Confirm deletion of your typing performance history logs?")) {
      setHistory([]);
      localStorage.removeItem('typing_tutor_sessions_log');
    }
  };

  const handleDeleteCustomLesson = (id: string) => {
    const savedCustom = localStorage.getItem('typing_tutor_custom_lessons');
    if (savedCustom) {
      try {
        const customArr: Lesson[] = JSON.parse(savedCustom);
        const updated = customArr.filter(l => l.id !== id);
        localStorage.setItem('typing_tutor_custom_lessons', JSON.stringify(updated));
        setLessons([...PRESET_LESSONS, ...updated]);
        if (selectedLesson.id === id) setSelectedLesson(PRESET_LESSONS[0]);
      } catch (e) {}
    }
  };

  // Date formatter for header
  const headerDateStr = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date());

  return (
    <div className="min-h-screen flex flex-col bg-slate-300 font-sans selection:bg-blue-300">
      
      {/* Top Application Utility Bar */}
      <div className="bg-gray-200 border-b-2 border-white shadow-[0_1px_2px_rgba(0,0,0,0.2)] p-1 flex gap-2 text-xs">
        <button onClick={() => setActiveTab('practice')} className={`px-4 py-1.5 border hover:bg-gray-100 shadow-sm transition-colors ${activeTab === 'practice' ? 'font-bold bg-white border-gray-400' : 'bg-gray-200 border-transparent text-gray-700'}`}>SSC Console Mode</button>
        <button onClick={() => setActiveTab('lessons')} className={`px-4 py-1.5 border hover:bg-gray-100 shadow-sm transition-colors ${activeTab === 'lessons' ? 'font-bold bg-white border-gray-400' : 'bg-gray-200 border-transparent text-gray-700'}`}>Manage Paragraphs</button>
        <button onClick={() => setActiveTab('analytics')} className={`px-4 py-1.5 border hover:bg-gray-100 shadow-sm transition-colors ${activeTab === 'analytics' ? 'font-bold bg-white border-gray-400' : 'bg-gray-200 border-transparent text-gray-700'}`}>Result & Analytics</button>
      </div>

      {activeTab === 'practice' && (
        <div className="flex-1 flex flex-col bg-[#4A689D] p-1 sm:p-2">
          
          {/* Authentic Examination Header block */}
          {isTestCompleted ? (
            <div className="bg-white rounded-sm shadow-xl m-2 overflow-hidden max-w-6xl mx-auto w-full border border-gray-400">
              <ResultSheet
                metrics={currentMetrics as any}
                lesson={selectedLesson}
                timeLimit={settings.timeLimit}
                onRetry={handleResetTest}
                onBackToDashboard={() => {
                  setIsTestCompleted(false);
                  handleResetTest();
                }}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full bg-[#4A689D]">
              {/* Header Ribbon 1 */}
              <div className="bg-black text-white px-3 py-1 flex justify-between items-center border-b-2 border-[#ff9800]">
                <div className="text-[#ff9800] font-bold tracking-tight shadow-sm text-sm">Typingfor goverment all type of exaM</div>
              </div>
              
              {/* Header Ribbon 2 */}
              <div className="bg-black text-white px-4 py-1.5 flex justify-between items-center text-xs font-mono shadow-sm">
                <div>{headerDateStr}</div>
                <div className="flex items-center gap-2 font-sans tracking-wide">
                  Time Left : 
                  <div className="bg-white text-black px-3 py-0.5 w-16 text-center font-bold text-sm tracking-wider">
                    {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              </div>

              {/* Central Working Area Wrapper */}
              <div className="flex-1 flex flex-col md:flex-row mt-2 gap-2 overflow-hidden max-h-[calc(100vh-120px)]">
                
                {/* Left Working Area (Split Panes) */}
                <div className="flex-1 flex flex-col gap-2 relative">
                  
                  {/* Blue divider ribbon */}
                  <div className="bg-[#718AF2] text-white text-center text-xs font-bold py-1 shadow-sm border border-blue-900/30 w-full overflow-hidden whitespace-nowrap">
                    Guide to Type
                  </div>

                  {/* Readonly Raw Paragraph Pane */}
                  <div 
                    className="bg-white border-[3px] border-[#c0c0c0] shadow-inner p-3 h-[45%] overflow-y-auto text-justify whitespace-pre-wrap select-none leading-relaxed text-gray-900 custom-scrollbar"
                    style={{ fontSize: `${fontSize}px` }}
                    onCopy={e => e.preventDefault()}
                    onDragStart={e => e.preventDefault()}
                  >
                    {selectedLesson.text}
                  </div>

                  {/* Settings strip between frames */}
                  <div className="flex justify-between items-center text-xs font-bold text-white px-2 mt-1">
                    <div className="flexItems-center gap-2 hover:bg-white/10 px-2 py-1 rounded cursor-pointer transition-colors duration-150">
                      <input 
                        type="checkbox" 
                        id="exam-ambient-cb" 
                        className="cursor-pointer"
                        checked={examHallSound}
                        onChange={(e) => handleToggleAmbient(e.target.checked)}
                      />
                      <label htmlFor="exam-ambient-cb" className="cursor-pointer ml-1 select-none shadow-sm drop-shadow-md">Exam Hall Sound</label>
                    </div>
                    <span className="text-white/80 font-normal drop-shadow-md hidden sm:inline">No highlighting strictly mimics examination environments.</span>
                  </div>

                  {/* Writable Transcription Pane */}
                  <textarea
                    ref={inputRef as any}
                    className="bg-white border-[3px] border-[#c0c0c0] shadow-inner p-3 flex-1 resize-none leading-relaxed focus:outline-none focus:border-blue-700 text-gray-900 custom-scrollbar mt-1"
                    style={{ fontSize: `${fontSize}px` }}
                    value={typingInput}
                    onChange={handleInputKeystroke}
                    onKeyDown={handleKeyDown}
                    disabled={isTestCompleted}
                    onPaste={e => e.preventDefault()}
                    spellCheck={false}
                    autoComplete="off"
                  />
                </div>

                {/* Right Settings Sidebar */}
                <div className="w-full md:w-64 bg-[#f0f0f0] border-[3px] border-[#c0c0c0] p-4 flex flex-col font-sans text-sm gap-5 shrink-0 overflow-y-auto text-gray-800 shadow-xl">
                  
                  {/* Candidate Bio Block */}
                  <div className="flex gap-3 border-b-2 border-gray-300 pb-4">
                    <div className="w-16 h-16 bg-gray-200 border-2 border-gray-400 shadow-sm flex items-end justify-center overflow-hidden shrink-0">
                      <User className="w-12 h-12 text-gray-400 mix-blend-multiply" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="font-extrabold text-base tracking-tight leading-tight">Candidate Profile</div>
                      <div className="text-[10px] uppercase font-bold text-gray-500 mt-2 flex gap-3">
                        <span className="text-blue-800 border-b-[1px] border-blue-800">English</span> 
                        <span className="opacity-60 cursor-not-allowed">Hindi</span>
                      </div>
                    </div>
                  </div>

                  {/* Setup Options List */}
                  <div className="space-y-4">
                    
                    <div className="text-xs font-bold flex justify-between">
                      <span>Selected Language</span>
                      <span className="font-normal text-green-700">English (US)</span>
                    </div>

                    <div className="text-xs font-bold text-gray-700 border-b border-gray-300 pb-3">
                      Average Word Length: {(selectedLesson.text.length / selectedLesson.text.split(/\s+/).length).toFixed(2)}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-extrabold text-gray-700">Passage & Lesson:</label>
                      <select
                        className="border border-gray-400 bg-white p-1 text-xs shadow-inner cursor-pointer"
                        value={selectedLesson.id}
                        onChange={e => {
                          const found = lessons.find(l => l.id === e.target.value);
                          if (found) { setSelectedLesson(found); handleResetTest(); }
                        }}
                      >
                        {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                      </select>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="text-xs font-extrabold text-gray-700">Duration :</label>
                      <select
                        className="border border-gray-400 bg-white p-1 text-xs w-28 shadow-inner cursor-pointer"
                        value={settings.timeLimit}
                        onChange={e => { setSettings({...settings, timeLimit: parseInt(e.target.value)}); handleResetTest(); }}
                        disabled={isTestRunning}
                      >
                        <option value="60">1 Minute</option>
                        <option value="120">2 Minutes</option>
                        <option value="pw5">5 Minutes</option>
                        <option value="600">10 Minutes</option>
                        <option value="900">15 Minutes</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between border-b border-gray-300 pb-3">
                      <label className="text-xs font-extrabold text-gray-700">Allow Backspace :</label>
                      <input
                        type="checkbox"
                        className="cursor-pointer"
                        checked={settings.allowBackspace}
                        onChange={e => setSettings({...settings, allowBackspace: e.target.checked})}
                        disabled={isTestRunning}
                      />
                    </div>

                    {/* Font Adjuster */}
                    <div className="w-full bg-[#f0f0f0]">
                      <p className="text-xs font-extrabold text-gray-700 mb-2">Passage and Font Setting</p>
                      <div className="flex justify-center gap-4 border border-gray-300 p-2 bg-white shadow-inner">
                        <button onClick={() => setFontSize(Math.max(12, fontSize - 2))} className="px-5 py-1 bg-[#e4e7ed] border border-gray-400 text-[#4c5c8a] font-bold shadow-sm hover:bg-gray-300 active:bg-gray-400 transition-colors">A-</button>
                        <button onClick={() => setFontSize(Math.min(32, fontSize + 2))} className="px-5 py-1 bg-[#e4e7ed] border border-gray-400 text-[#4c5c8a] font-bold shadow-sm hover:bg-gray-300 active:bg-gray-400 transition-colors">A+</button>
                      </div>
                    </div>

                    {/* Control Buttons Group */}
                    <div className="pt-2 flex flex-col gap-2.5">
                      {!isTestRunning ? (
                        <button onClick={() => setIsTestRunning(true)} className="w-full bg-[#4665a2] hover:bg-[#344d80] active:translate-y-px text-white py-2 font-bold shadow border border-[#2b3e64] text-sm tracking-wide">
                          Start Typing
                        </button>
                      ) : (
                        <button onClick={handleCompleteTest} className="w-full bg-[#d32f2f] hover:bg-[#b71c1c] active:translate-y-px text-white py-2 font-bold shadow border border-[#7f0000] text-sm tracking-wide">
                          Submit Test
                        </button>
                      )}
                      <button onClick={handleResetTest} className="w-full bg-[#e0e0e0] hover:bg-[#bdbdbd] active:translate-y-px text-gray-800 py-1.5 font-bold shadow border border-[#9e9e9e] text-xs">
                        Reset / Clear
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {/* Auxiliary Pages rendered in standard gray-mode format to match the aesthetic */}
      {activeTab !== 'practice' && (
        <div className="flex-1 bg-gray-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="max-w-5xl w-full bg-white border-2 border-gray-300 shadow-sm p-6 text-gray-800">
            
            {activeTab === 'lessons' && (
              <div className="space-y-6">
                <div className="border-b-2 border-gray-800 pb-2 mb-4">
                  <h2 className="text-xl font-bold font-sans">Passage Management Console</h2>
                  <p className="text-xs text-gray-600">Select or inject custom reading paragraphs into the examination tool.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Custom Insertion */}
                  <div className="bg-gray-100 p-4 border border-gray-300">
                    <h3 className="font-bold border-b border-gray-300 pb-2 mb-3 text-sm flex items-center gap-1.5"><Plus className="w-4 h-4"/> Add Custom Test Passage</h3>
                    <form onSubmit={handleSaveCustomLesson} className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold mb-1">Passage Identifier Title</label>
                        <input required value={newLessonTitle} onChange={e => setNewLessonTitle(e.target.value)} className="w-full border border-gray-400 p-2 text-xs focus:outline-blue-500" placeholder="e.g. Allahabad High Court PA" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">Paragraph Target Text</label>
                        <textarea required value={newLessonText} onChange={e => setNewLessonText(e.target.value)} rows={7} className="w-full border border-gray-400 p-2 text-xs focus:outline-blue-500 font-serif leading-relaxed" placeholder="Paste the strict text required. Spelling and exact spaces matter." />
                      </div>
                      <button type="submit" className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-2 shadow-sm border border-green-900 text-sm">Inject to Library</button>
                    </form>
                  </div>

                  {/* List Board */}
                  <div>
                    <h3 className="font-bold border-b border-gray-300 pb-2 mb-3 text-sm">System Passage Database</h3>
                    <div className="max-h-[400px] overflow-y-auto border border-gray-300 bg-gray-50">
                      {lessons.map(lesson => (
                        <div key={lesson.id} className="p-3 border-b flex justify-between items-center text-sm hover:bg-gray-200">
                          <div>
                            <div className="font-bold text-gray-800">{lesson.title}</div>
                            <div className="text-[10px] text-gray-500 truncate max-w-[200px]">{lesson.text.substring(0, 40)}...</div>
                          </div>
                          <div className="flex gap-2 text-xs">
                            {lesson.isCustom && (
                              <button onClick={() => handleDeleteCustomLesson(lesson.id)} className="text-red-700 underline font-bold px-2 py-1">Delete</button>
                            )}
                            <button onClick={() => { setSelectedLesson(lesson); handleResetTest(); setActiveTab('practice'); }} className="bg-gray-800 text-white font-bold px-3 py-1 shadow-sm">Load</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="border-b-2 border-gray-800 pb-2 mb-4 flex justify-between items-end">
                  <div>
                    <h2 className="text-xl font-bold font-sans">Examination Logs & Results</h2>
                    <p className="text-xs text-gray-600">Strict history reporting. Target &gt;35 WPM / 95% Acc</p>
                  </div>
                  {history.length > 0 && <button onClick={handleClearHistory} className="text-red-700 underline font-bold text-xs p-1 hover:bg-red-50">Clear Ledger</button>}
                </div>
                
                <AnalyticsCharts history={history} onClearHistory={handleClearHistory} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-800 text-gray-300 text-center py-2 text-xs font-mono border-t border-gray-900 mt-auto shrink-0 shadow-inner flex justify-center gap-6 relative z-10">
        <span>&copy; Copyright all to Vishal Kumar</span>
        <span className="opacity-50">|</span>
        <span>Founder Name: Vishal Kuma</span>
      </div>

      {/* Global strict CSS injector to disable generic scrollbars visually to match exam UI */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 14px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-left: 1px solid #ccc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border: 1px solid #aaa;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
}
