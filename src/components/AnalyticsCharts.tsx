import React from 'react';
import { PracticeSession, HistoryAnalytics } from '../types';
import { TrendingUp, Award, Clock, Percent, AlertCircle, Trash2, Calendar } from 'lucide-react';

interface AnalyticsChartsProps {
  history: PracticeSession[];
  onClearHistory: () => void;
  onSelectSession?: (id: string) => void;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  history,
  onClearHistory
}) => {
  
  // Calculate aggregate stats
  const totalSessions = history.length;
  const averageWpm = totalSessions > 0 
    ? history.reduce((sum, s) => sum + s.netWpm, 0) / totalSessions 
    : 0;
  const peakWpm = totalSessions > 0 
    ? Math.max(...history.map(s => s.netWpm)) 
    : 0;
  const averageAccuracy = totalSessions > 0 
    ? history.reduce((sum, s) => sum + s.accuracy, 0) / totalSessions 
    : 0;
  const totalErrors = history.reduce((sum, s) => sum + s.errorCount, 0);

  // SVG Chart Calculation
  // We'll plot up to the last 10 sessions chronologically
  const chartSessions = [...history]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-10);

  const padding = 40;
  const width = 500;
  const height = 180;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Find max value in speed list to scale axes
  const maxSessionWpm = chartSessions.length > 0 ? Math.max(...chartSessions.map(s => s.netWpm)) : 0;
  const yMax = Math.max(50, Math.ceil(maxSessionWpm / 10) * 10); // scale max y axis appropriately, min 50

  // Coordinate mapper helper
  const getCoordinates = () => {
    if (chartSessions.length < 2) return '';
    return chartSessions.map((session, index) => {
      const x = padding + (index / (chartSessions.length - 1)) * chartWidth;
      const y = padding + chartHeight - (session.netWpm / yMax) * chartHeight;
      return `${x},${y}`;
    }).join(' ');
  };

  const coordinatesPath = getCoordinates();

  return (
    <div className="space-y-8" id="analytics-charts-box">
      {/* Aggregated Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3 shadow-xs">
          <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block uppercase font-medium">Average Net</span>
            <span className="text-xl font-bold text-slate-800">{averageWpm.toFixed(1)} <sub className="text-xs text-slate-400 font-semibold uppercase">WPM</sub></span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3 shadow-xs font-sans">
          <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block uppercase font-medium">Personal Best</span>
            <span className="text-xl font-bold text-slate-800">{peakWpm.toFixed(1)} <sub className="text-xs text-slate-400 font-semibold uppercase">WPM</sub></span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3 shadow-xs">
          <div className="p-3 rounded-lg bg-teal-50 text-teal-600">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block uppercase font-medium">Avg Accuracy</span>
            <span className="text-xl font-bold text-slate-800">{averageAccuracy.toFixed(1)}%</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3 shadow-xs">
          <div className="p-3 rounded-lg bg-slate-50 text-slate-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block uppercase font-medium">Total Drills</span>
            <span className="text-xl font-bold text-slate-800">{totalSessions} <sub className="text-xs text-slate-400 font-normal">taken</sub></span>
          </div>
        </div>

      </div>

      {/* Progress Chart & History Table split panel */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Plot chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">WPM Performance Trajectory</h3>
            <p className="text-xs text-slate-400">Illustrating Net typing speed across your last 10 sessions</p>
          </div>

          <div className="my-4 flex items-center justify-center bg-slate-50/50 rounded-lg p-2 border border-slate-100">
            {chartSessions.length < 2 ? (
              <div className="h-44 flex flex-col items-center justify-center text-slate-400 text-xs px-8 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-300" />
                <p>Complete at least <strong>2 sessions</strong> on different lessons to generate a speed trajectory line-graph automatically.</p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <svg viewBox={`0 0 ${width} ${height}`} className="mx-auto w-full max-w-lg overflow-visible">
                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                    const y = padding + ratio * chartHeight;
                    const val = Math.round(yMax - ratio * yMax);
                    return (
                      <g key={i} className="opacity-45">
                        <line 
                          x1={padding} 
                          y1={y} 
                          x2={width - padding} 
                          y2={y} 
                          stroke="#cbd5e1" 
                          strokeDasharray="3 3" 
                          strokeWidth="1" 
                        />
                        <text x={padding - 8} y={y + 4} fill="#64748b" className="text-[9px] text-right font-medium" textAnchor="end">
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Connecting Line Path */}
                  <polyline
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-[0_2px_4px_rgba(79,70,229,0.3)]"
                    points={coordinatesPath}
                  />

                  {/* Individual Session Plot Circles */}
                  {chartSessions.map((session, index) => {
                    const x = padding + (index / (chartSessions.length - 1)) * chartWidth;
                    const y = padding + chartHeight - (session.netWpm / yMax) * chartHeight;
                    return (
                      <g key={session.id} className="group cursor-pointer">
                        <circle
                          cx={x}
                          cy={y}
                          r="4"
                          className="fill-indigo-600 stroke-white stroke-2 hover:r-6 hover:fill-teal-500 transition-all"
                        />
                        <text x={x} y={y - 10} className="text-[9px] font-bold fill-slate-700 opacity-0 group-hover:opacity-100 transition-opacity" textAnchor="middle">
                          {session.netWpm.toFixed(0)}
                        </text>
                      </g>
                    );
                  })}
                  
                  {/* Horizontal Axis bottom labels */}
                  <text x={width / 2} y={height - 5} fill="#64748b" className="text-[10px] font-semibold uppercase tracking-wider" textAnchor="middle">
                    Practice Sessions Timeline
                  </text>
                </svg>
              </div>
            )}
          </div>

          <div className="flex gap-4 text-[11px] text-slate-500 justify-center">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span> Your Net WPM Speed</span>
            <span className="flex items-center gap-1"><span className="border-t border-dashed border-slate-300 w-4 inline-block"></span> Level Baseline</span>
          </div>
        </div>

        {/* Action Center Log */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Historical Insights</h3>
            <p className="text-xs text-slate-400 mb-4 font-sans">Understanding your errors helps target areas of practice</p>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-48 pr-1 my-2">
            <div className="p-3 rounded-lg bg-orange-50/50 border border-orange-100/80 text-[11px] text-slate-600">
              <p className="font-bold text-orange-950 mb-1">🎯 Typing Accuracy Standard</p>
              Most government Clerk and typist tests tolerate a maximum of <strong>5% errors</strong>. Practicing below 95% accuracy will invalidate a fast WPM score! Ensure you lock errors first, before speeding up your fingers.
            </div>

            <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100 text-[11px] text-slate-600">
              <p className="font-bold text-emerald-950 mb-1">⌨️ Finger Alignment Rules</p>
              Always hover your fingers slightly over the <strong>asdf-jkl; row</strong>. Do not let your wrists touch the bottom table desk surface while typing; active floating wrist placement boosts key strike velocity by over 20%!
            </div>
          </div>

          {totalSessions > 0 && (
            <button
              onClick={onClearHistory}
              className="mt-2 w-full py-2 border border-rose-200 rounded-lg text-rose-600 hover:bg-rose-50 font-bold text-xs flex justify-center items-center gap-1.5 transition-colors"
              id="clear-all-analytics-btn"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset All Practice History
            </button>
          )}
        </div>

      </div>

      {/* Log Book table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Exam Board Dispatch Ledger</h3>
            <p className="text-xs text-slate-400">Complete catalog of historical trial exams and practice drills</p>
          </div>
          <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full font-bold text-slate-600">
            {totalSessions} total entries
          </span>
        </div>

        {totalSessions === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No entries recorded. Complete an exercise to start generating progress reports!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-semibold text-[10px]">
                  <th className="p-3 pl-4">Date / Time</th>
                  <th className="p-3">Lesson Segment</th>
                  <th className="p-3">Difficulty</th>
                  <th className="p-3 text-right">Net Speed</th>
                  <th className="p-3 text-right">Gross Speed</th>
                  <th className="p-3 text-right">Accuracy</th>
                  <th className="p-3">Restrictions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...history]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((session) => {
                    const formattedDate = new Date(session.date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <tr key={session.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 pl-4 whitespace-nowrap text-slate-500 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {formattedDate}
                        </td>
                        <td className="p-3 font-semibold text-slate-800">{session.lessonTitle}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            session.difficulty === 'easy' ? 'bg-sky-50 text-sky-700' :
                            session.difficulty === 'medium' ? 'bg-amber-50 text-amber-700' :
                            session.difficulty === 'hard' ? 'bg-purple-50 text-purple-700' :
                            'bg-rose-50 text-rose-700'
                          }`}>
                            {session.difficulty}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900">{session.netWpm.toFixed(1)} WPM</td>
                        <td className="p-3 text-right text-slate-500">{session.grossWpm.toFixed(1)} WPM</td>
                        <td className="p-3 text-right">
                          <span className={`font-bold ${session.accuracy >= 95.0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {session.accuracy.toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 text-[10px]">
                          {session.backspaceDisabled && 'No Backspace · '}
                          {session.highlightDisabled && 'No Highlight'}
                          {!session.backspaceDisabled && !session.highlightDisabled && 'None (Standard)'}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
