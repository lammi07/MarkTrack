/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { 
  Task, 
  TermSchedule, 
  TermEvent 
} from '../types.ts';
import { 
  Calendar as CalendarIcon, 
  LayoutList, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Upload,
  FileText,
  Clock,
  CheckCircle2,
  CalendarDays,
  Sparkles,
  X,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SmartScanner from './SmartScanner.tsx';

interface TermPlannerProps {
  tasks: Task[];
  termSchedule: TermSchedule | null;
  onUpdateSchedule: (schedule: TermSchedule) => void;
  onUpdateTask: (task: Task) => void;
}

export default function TermPlanner({ tasks, termSchedule, onUpdateSchedule, onUpdateTask }: TermPlannerProps) {
  const [viewType, setViewType] = useState<'calendar' | 'timeline'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isSettingUp, setIsSettingUp] = useState(!termSchedule);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Term Setup State
  const [termName, setTermName] = useState(termSchedule?.termName || '');
  const [startDate, setStartDate] = useState(termSchedule?.startDate || '');
  const [endDate, setEndDate] = useState(termSchedule?.endDate || '');
  const [inspectionDate, setInspectionDate] = useState('');
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [extractedEvents, setExtractedEvents] = useState<TermEvent[] | null>(null);

  // Calendar Helpers
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const days = [];
    const numDays = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);

    // Padding for start of month
    for (let i = 0; i < firstDay; i++) {
       days.push(null);
    }

    // Days of the month
    for (let i = 1; i <= numDays; i++) {
      const date = new Date(year, month, i);
      const dateStr = date.toISOString().split('T')[0];
      
      const assigned = tasks.filter(t => t.dateAssigned.startsWith(dateStr));
      const due = tasks.filter(t => t.expectedCollectDate.startsWith(dateStr));
      const inspections = termSchedule?.inspectionDates.filter(d => d.startsWith(dateStr)) || [];
      
      const workload = assigned.length + due.length;

      days.push({
        date: dateStr,
        dayNum: i,
        assigned,
        due,
        inspections,
        isHeavy: workload > 3
      });
    }

    return days;
  }, [currentMonth, tasks, termSchedule]);

  const handleSaveSchedule = () => {
    if (!termName || !startDate || !endDate) return;
    onUpdateSchedule({
      termId: termSchedule?.termId || `term-${Date.now()}`,
      termName,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      importedEvents: termSchedule?.importedEvents || [],
      inspectionDates: termSchedule?.inspectionDates || []
    });
    setIsSettingUp(false);
  };

  const addInspectionDate = () => {
    if (!inspectionDate || !termSchedule) return;
    onUpdateSchedule({
      ...termSchedule,
      inspectionDates: [...termSchedule.inspectionDates, new Date(inspectionDate).toISOString()]
    });
    setInspectionDate('');
  };

  const removeInspectionDate = (date: string) => {
    if (!termSchedule) return;
    onUpdateSchedule({
      ...termSchedule,
      inspectionDates: termSchedule.inspectionDates.filter(d => d !== date)
    });
  };

  const handleApproveExtracted = () => {
    if (!termSchedule || !extractedEvents) return;
    onUpdateSchedule({
      ...termSchedule,
      importedEvents: [...termSchedule.importedEvents, ...extractedEvents]
    });
    setExtractedEvents(null);
  };

  const handleBackwardPlan = (inspDate: string) => {
    const pendingTasks = tasks.filter(t => t.currentStage < 6);
    const insp = new Date(inspDate);
    
    // Simple backward logic: spread tasks back 1-2 weeks from inspection
    pendingTasks.forEach((task, idx) => {
      const suggestedDate = new Date(insp);
      suggestedDate.setDate(insp.getDate() - (idx + 1) * 7); // Spread weekly
      
      if (confirm(`Suggesting completion of "${task.taskName}" by ${suggestedDate.toLocaleDateString()}. Update dates?`)) {
        onUpdateTask({
          ...task,
          expectedCollectDate: suggestedDate.toISOString()
        });
      }
    });
  };

  if (isSettingUp) {
    return (
      <div className="space-y-6">
        <header className="flex justify-between items-center px-2">
          <h2 className="text-xl font-bold">Term Setup</h2>
          {termSchedule && (
            <button onClick={() => setIsSettingUp(false)} className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cancel</button>
          )}
        </header>

        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Term Name</label>
            <input
              type="text"
              value={termName}
              onChange={(e) => setTermName(e.target.value)}
              placeholder="e.g. Term 2 2026"
              className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Start Date</label>
              <input
                type="date"
                value={startDate.split('T')[0]}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">End Date</label>
              <input
                type="date"
                value={endDate.split('T')[0]}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm"
              />
            </div>
          </div>

          <div className="p-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl text-center relative group">
            <Upload size={24} className="mx-auto mb-2 text-gray-300" />
            <p className="text-xs text-gray-400 font-medium">Upload Inspection Schedule (PDF/JPG)</p>
            {attachedFileName && <p className="text-[10px] text-emerald-500 font-bold mt-2">✓ {attachedFileName}</p>}
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => setAttachedFileName(e.target.files?.[0]?.name || null)}
            />
          </div>

          <button
            onClick={handleSaveSchedule}
            className="w-full bg-black text-white font-bold py-5 rounded-[24px] shadow-lg active:scale-[0.98] transition-transform"
          >
            Save Term Configuration
          </button>
        </div>

        {termSchedule && (
          <section className="bg-white p-6 rounded-[40px] shadow-sm border border-gray-100 space-y-4">
             <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Manage Inspection Dates</h3>
             <div className="flex gap-2">
                <input
                  type="date"
                  value={inspectionDate}
                  onChange={(e) => setInspectionDate(e.target.value)}
                  className="flex-1 bg-gray-50 border-none rounded-2xl p-4 text-sm"
                />
                <button 
                  onClick={addInspectionDate}
                  className="bg-black text-white p-4 rounded-2xl"
                >
                  <Plus size={20} />
                </button>
             </div>
             <div className="space-y-2">
                {termSchedule.inspectionDates.map(date => (
                  <div key={date} className="flex justify-between items-center bg-red-50 p-4 rounded-2xl border border-red-100">
                    <span className="text-sm font-bold text-red-600">{new Date(date).toLocaleDateString()}</span>
                    <button onClick={() => removeInspectionDate(date)} className="text-red-300"><ChevronRight size={16} /></button>
                  </div>
                ))}
             </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32">
      {/* 1. PLANNER HEADER & TOGGLE */}
      <header className="flex justify-between items-center sticky top-[72px] z-30 bg-[#f8f9fa] py-2">
        <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
          <button 
            onClick={() => setViewType('calendar')}
            className={`p-2 px-4 rounded-xl flex items-center gap-2 transition-all ${
              viewType === 'calendar' ? 'bg-black text-white' : 'text-gray-400'
            }`}
          >
            <CalendarIcon size={16} /> <span className="text-[10px] font-bold uppercase tracking-widest">Calendar</span>
          </button>
          <button 
            onClick={() => setViewType('timeline')}
            className={`p-2 px-4 rounded-xl flex items-center gap-2 transition-all ${
              viewType === 'timeline' ? 'bg-black text-white' : 'text-gray-400'
            }`}
          >
            <LayoutList size={16} /> <span className="text-[10px] font-bold uppercase tracking-widest">Timeline</span>
          </button>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-2 p-3 px-5 bg-blue-50 text-blue-600 rounded-2xl shadow-sm border border-blue-100 hover:bg-blue-100 transition-colors"
          >
            <Sparkles size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">AI Scan</span>
          </button>
          <button 
            onClick={() => setIsSettingUp(true)}
            className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-400"
          >
            <CalendarDays size={20} />
          </button>
        </div>
      </header>

      {viewType === 'calendar' ? (
        <>
          {/* 2. CALENDAR VIEW */}
          <section className="bg-white p-6 rounded-[40px] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6 px-1">
              <h3 className="font-bold text-lg">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                <div key={day} className="text-center text-[10px] font-bold text-gray-300 py-2">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => (
                <div 
                  key={idx} 
                  onClick={() => day && setSelectedDate(day.date)}
                  className={`aspect-square rounded-xl relative flex flex-col items-center justify-center cursor-pointer transition-all ${
                    !day ? '' : 
                    day.inspections.length > 0 ? 'bg-red-50 text-red-600 border border-red-100' :
                    day.isHeavy ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                    'bg-gray-50/50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {day && (
                    <>
                      <span className="text-xs font-bold">{day.dayNum}</span>
                      <div className="flex gap-0.5 mt-1">
                        {day.assigned.map((_, i) => <div key={i} className="w-1 h-1 rounded-full bg-blue-500" />)}
                        {day.due.map((_, i) => <div key={i} className="w-1 h-1 rounded-full bg-orange-500" />)}
                      </div>
                      {day.inspections.length > 0 && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 rounded-t-xl" />
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 3. WORKLOAD WARNING */}
          {calendarDays.some(d => d?.isHeavy) && (
            <div className="bg-amber-50 p-5 rounded-[32px] border border-amber-100 flex items-start gap-4">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 className="font-bold text-amber-900 text-sm">Heavy Workload Weeks</h4>
                <p className="text-xs text-amber-700 mt-1">You have days with more than 3 tasks due or assigned. Consider spreading them out.</p>
              </div>
            </div>
          )}

          {/* 4. BACKWARD PLANNING HELPER */}
          {termSchedule && termSchedule.inspectionDates.length > 0 && (
            <section className="space-y-4">
               <div className="flex items-center gap-2 px-2">
                 <Clock size={18} className="text-gray-400" />
                 <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Backward Planning Helper</h3>
               </div>
               <div className="space-y-3">
                 {termSchedule.inspectionDates.map(date => (
                   <div key={date} className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between">
                     <div>
                       <div className="text-[10px] font-bold uppercase tracking-widest text-red-500">Inspection on</div>
                       <div className="font-bold text-gray-900">{new Date(date).toLocaleDateString()}</div>
                     </div>
                     <button 
                       onClick={() => handleBackwardPlan(date)}
                       className="bg-black text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl"
                     >
                       Generate Plan
                     </button>
                   </div>
                 ))}
               </div>
            </section>
          )}
        </>
      ) : (
        /* 5. TIMELINE VIEW */
        <section className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 overflow-x-auto">
          <div className="flex items-center gap-2 mb-6">
            <LayoutList size={18} className="text-gray-400" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Term Timeline</h3>
          </div>
          <div className="min-w-[600px] space-y-6">
            {tasks.length > 0 ? tasks.map(task => {
              const start = new Date(task.dateAssigned);
              const end = new Date(task.expectedCollectDate);
              const termStart = new Date(termSchedule?.startDate || '');
              const termEnd = new Date(termSchedule?.endDate || '');
              
              const totalDays = (termEnd.getTime() - termStart.getTime()) / (1000 * 3600 * 24);
              const taskStartPos = ((start.getTime() - termStart.getTime()) / (1000 * 3600 * 24)) / totalDays * 100;
              const taskWidth = ((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) / totalDays * 100;

              return (
                <div key={task.taskId} className="relative h-12 flex items-center">
                  <div className="absolute left-0 text-[10px] font-bold text-gray-400 w-24 truncate">{task.taskName}</div>
                  <div className="ml-24 flex-1 h-2 bg-gray-50 rounded-full relative">
                    <div 
                      className={`absolute h-full rounded-full transition-all flex items-center ${
                        task.currentStage === 6 ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}
                      style={{ left: `${taskStartPos}%`, width: `${Math.max(taskWidth, 2)}%` }}
                    >
                       <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-bold uppercase text-gray-400">
                         {new Date(task.expectedCollectDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                       </div>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="py-20 text-center flex flex-col items-center justify-center space-y-3 opacity-20">
                <LayoutList size={40} />
                <p className="text-xs font-bold uppercase tracking-widest">No tasks logged for timeline</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Selected Date Detail Modal */}
      <AnimatePresence>
        {selectedDate && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDate(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl max-h-[70vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">{new Date(selectedDate).toLocaleDateString(undefined, { dateStyle: 'full' })}</h3>
                <button onClick={() => setSelectedDate(null)} className="p-2 hover:bg-gray-100 rounded-full"><Clock size={20}/></button>
              </div>

              <div className="space-y-4">
                {tasks.filter(t => t.dateAssigned.startsWith(selectedDate) || t.expectedCollectDate.startsWith(selectedDate)).map(t => (
                  <div key={t.taskId} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-sm">{t.taskName}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                        {t.dateAssigned.startsWith(selectedDate) ? 'Assigned' : 'Due for collection'}
                      </div>
                    </div>
                    {t.currentStage === 6 ? <CheckCircle2 className="text-emerald-500" size={18}/> : <Clock className="text-blue-500" size={18}/>}
                  </div>
                ))}
                
                {/* Also show term events on this day */}
                {termSchedule?.importedEvents.filter(e => e.date.startsWith(selectedDate)).map((e, idx) => (
                  <div key={`event-${idx}`} className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-sm text-blue-900">{e.description}</div>
                      <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">
                        Term Event
                      </div>
                    </div>
                    <Sparkles className="text-blue-500" size={18}/>
                  </div>
                ))}

                {tasks.filter(t => t.dateAssigned.startsWith(selectedDate) || t.expectedCollectDate.startsWith(selectedDate)).length === 0 && 
                 termSchedule?.importedEvents.filter(e => e.date.startsWith(selectedDate)).length === 0 && (
                  <div className="py-12 text-center text-gray-400 text-sm">No tasks or events scheduled for this day.</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Scanner Result Review Modal */}
      <AnimatePresence>
        {extractedEvents && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
             >
                <div className="p-8 border-b border-gray-50 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-gray-900 leading-tight">Review Extraction</h2>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">AI found {extractedEvents.length} events</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setExtractedEvents(null)}
                    className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-4 no-scrollbar">
                  <p className="text-xs text-gray-400 font-medium px-2">Verify and edit these events before adding them to your term schedule.</p>
                  {extractedEvents.map((event, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
                      <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center text-gray-900 shrink-0 border border-gray-100">
                        <span className="text-[10px] font-black uppercase text-gray-400">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-base font-black leading-none">{new Date(event.date).getDate()}</span>
                      </div>
                      <div className="flex-1">
                        <input 
                          type="text" 
                          value={event.description}
                          onChange={(e) => {
                            const next = [...extractedEvents];
                            next[i].description = e.target.value;
                            setExtractedEvents(next);
                          }}
                          className="w-full bg-transparent border-none p-0 font-bold text-gray-900 focus:ring-0 text-sm"
                        />
                        <div className="flex items-center gap-2 mt-1">
                          <input 
                            type="date"
                            value={event.date.split('T')[0]} // Handle ISO strings
                            onChange={(e) => {
                              const next = [...extractedEvents];
                              next[i].date = e.target.value;
                              setExtractedEvents(next);
                            }}
                            className="bg-transparent border-none p-0 text-[10px] text-gray-400 font-bold uppercase tracking-widest focus:ring-0"
                          />
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          const next = [...extractedEvents];
                          next.splice(i, 1);
                          setExtractedEvents(next.length > 0 ? next : null);
                        }}
                        className="p-2 text-red-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="p-8 border-t border-gray-50 bg-gray-50/50 shrink-0">
                  <button 
                    onClick={handleApproveExtracted}
                    className="w-full py-5 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-600/10 flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
                  >
                    <CheckCircle2 size={20} /> Add to Calendar
                  </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isScannerOpen && (
          <SmartScanner 
            onEventsExtracted={(events) => {
              setExtractedEvents(events);
              setIsScannerOpen(false);
            }}
            onClose={() => setIsScannerOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
