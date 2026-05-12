/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { 
  Task, 
  Class 
} from '../types.ts';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Circle,
  AlertCircle,
  FileText,
  Save,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface FileChecklistProps {
  tasks: Task[];
  classes: Class[];
  onUpdateTask: (task: Task) => void;
  onUpdateClassNotes: (classId: string, notes: string) => void;
  onGenerateReport: (classId: string) => void;
}

export default function FileChecklist({ 
  tasks, 
  classes, 
  onUpdateTask, 
  onUpdateClassNotes,
  onGenerateReport 
}: FileChecklistProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.classId || '');
  
  const selectedClass = useMemo(() => 
    classes.find(c => c.classId === selectedClassId), 
    [classes, selectedClassId]
  );

  const eligibleTasks = useMemo(() => 
    tasks.filter(t => t.classId === selectedClassId && t.currentStage >= 4),
    [tasks, selectedClassId]
  );

  const confirmedCount = eligibleTasks.filter(t => t.isInspectionReady).length;
  const totalCount = eligibleTasks.length;
  const isReady = totalCount > 0 && confirmedCount === totalCount;

  const handleToggleReady = (task: Task) => {
    onUpdateTask({
      ...task,
      isInspectionReady: !task.isInspectionReady
    });
  };

  const [localNotes, setLocalNotes] = useState(selectedClass?.spotCheckNotes || '');

  // Sync local notes when class changes
  useMemo(() => {
    setLocalNotes(selectedClass?.spotCheckNotes || '');
  }, [selectedClassId, classes]);

  return (
    <div className="space-y-8 pb-32">
      {/* Class Selector */}
      <div className="sticky top-[72px] z-20 bg-[#f8f9fa] pt-2">
        <div className="flex overflow-x-auto gap-2 pb-3 no-scrollbar">
          {classes.map(c => (
            <button
              key={c.classId}
              onClick={() => setSelectedClassId(c.classId)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedClassId === c.classId ? 'bg-black text-white' : 'bg-white text-gray-400 border border-gray-100 shadow-sm'
              }`}
            >
              {c.className}
            </button>
          ))}
        </div>
      </div>

      {selectedClass ? (
        <>
          {/* Readiness Score */}
          <section className={`p-6 rounded-[40px] border transition-colors ${
            isReady ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-gray-100 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Inspection Readiness</h3>
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-black ${isReady ? 'text-emerald-600' : 'text-gray-900'}`}>
                    {confirmedCount}
                  </span>
                  <span className="text-gray-400 font-bold">of {totalCount} tasks confirmed</span>
                </div>
              </div>
              <div className={`p-4 rounded-3xl ${isReady ? 'bg-emerald-500 text-white' : 'bg-gray-50 text-gray-300'}`}>
                {isReady ? <ShieldCheck size={32} /> : <ShieldAlert size={32} />}
              </div>
            </div>
            {!isReady && totalCount > 0 && (
              <div className="mt-4 bg-gray-50 rounded-2xl p-3 flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                <AlertCircle size={14} className="text-amber-500" />
                {totalCount - confirmedCount} tasks still pending physical check
              </div>
            )}
          </section>

          {/* Checklist */}
          <section className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-2">Task Verification (Stage 4+)</h3>
            <div className="space-y-3">
              {eligibleTasks.map(task => (
                <div 
                  key={task.taskId} 
                  onClick={() => handleToggleReady(task)}
                  className={`p-4 rounded-[28px] border transition-all cursor-pointer flex items-center justify-between ${
                    task.isInspectionReady ? 'bg-white border-emerald-100 shadow-sm' : 'bg-white border-gray-50 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`transition-colors ${task.isInspectionReady ? 'text-emerald-500' : 'text-gray-200'}`}>
                      {task.isInspectionReady ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-gray-900">{task.taskName}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          Stage {task.currentStage}
                        </span>
                        {task.missingStudents.length > 0 && (
                          <span className="flex items-center gap-1 text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                            <AlertCircle size={10} /> {task.missingStudents.length} Flagged
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                    {task.isInspectionReady ? 'Confirmed' : 'Pending'}
                  </div>
                </div>
              ))}
              {eligibleTasks.length === 0 && (
                <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-[40px] text-gray-400 px-6">
                  <p className="text-sm">No tasks in this class have reached the return stage yet.</p>
                  <p className="text-[10px] mt-2 uppercase font-bold tracking-widest">Only tasks at Stage 4 or beyond appear here.</p>
                </div>
              )}
            </div>
          </section>

          {/* Spot Check Notes */}
          <section className="bg-white p-6 rounded-[40px] border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-gray-400" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Spot Check Notes</h3>
              </div>
              <button 
                onClick={() => onUpdateClassNotes(selectedClassId, localNotes)}
                className="text-[10px] font-bold text-blue-500 uppercase tracking-widest flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded"
              >
                <Save size={12} /> Save Notes
              </button>
            </div>
            <textarea
              rows={4}
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              placeholder="e.g. Ahmad's file missing Grammar Ex 5..."
              className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-black/5 resize-none placeholder:text-gray-300"
            />
          </section>

          {/* Report Button */}
          <button 
            onClick={() => onGenerateReport(selectedClassId)}
            className="w-full bg-black text-white font-bold py-5 rounded-[24px] shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
          >
            <FileText size={20} /> Generate Inspection Report <ArrowRight size={18} />
          </button>
        </>
      ) : (
        <div className="py-32 text-center border-2 border-dashed border-gray-100 rounded-[40px] px-8 text-gray-400">
          <div className="w-16 h-16 bg-white rounded-3xl shadow-sm border border-gray-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="opacity-10" />
          </div>
          <h3 className="text-gray-900 font-bold">No classes yet</h3>
          <p className="text-xs mt-1">Complete onboarding or add classes in settings to generate your checklist.</p>
        </div>
      )}
    </div>
  );
}
