/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Task, 
  Class, 
  MarkingStage, 
  StageHistoryItem, 
  MissingStudent 
} from '../types.ts';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Camera, 
  MessageSquare,
  ChevronRight,
  AlertCircle,
  FileText,
  UserPlus,
  Trash2,
  Calendar,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TaskDetailProps {
  task: Task;
  clazz: Class;
  onBack: () => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function TaskDetail({ task, clazz, onBack, onUpdateTask, onDeleteTask }: TaskDetailProps) {
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isFlagging, setIsFlagging] = useState(false);
  
  // Advance form state
  const [advanceNotes, setAdvanceNotes] = useState('');
  
  // Flagging student state
  const [studentName, setStudentName] = useState('');
  const [issue, setIssue] = useState('');
  const [action, setAction] = useState('');

  const STAGES = [
    { num: 1 as MarkingStage, name: 'Assigned', longName: 'Assigned to Students' },
    { num: 2 as MarkingStage, name: 'Collected', longName: 'Collected Work' },
    { num: 3 as MarkingStage, name: 'Marked', longName: 'Marked (Round 1)' },
    { num: 4 as MarkingStage, name: 'Returned', longName: 'Returned for Correction' },
    { num: 5 as MarkingStage, name: 'Corrections', longName: 'Corrections Marked' },
    { num: 6 as MarkingStage, name: 'Filed', longName: 'Confirmed and Filed' },
  ];

  const handleAdvance = () => {
    if (task.currentStage >= 6) return;
    
    const nextStage = (task.currentStage + 1) as MarkingStage;
    const historyItem: StageHistoryItem = {
      stage: nextStage,
      completedDate: new Date().toISOString(),
      notes: advanceNotes
    };

    const updatedTask: Task = {
      ...task,
      currentStage: nextStage,
      stageHistory: [...task.stageHistory, historyItem],
      isInspectionReady: nextStage === 6
    };

    onUpdateTask(updatedTask);
    setIsAdvancing(false);
    setAdvanceNotes('');
  };

  const handleAddFlag = (e: React.FormEvent) => {
    e.preventDefault();
    const newFlag: MissingStudent = {
      studentName,
      issue,
      actionTaken: action,
      actionDate: new Date().toISOString()
    };

    const updatedTask: Task = {
      ...task,
      missingStudents: [...task.missingStudents, newFlag]
    };

    onUpdateTask(updatedTask);
    setIsFlagging(false);
    setStudentName('');
    setIssue('');
    setAction('');
  };

  return (
    <div className="space-y-8 pb-32">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{task.taskName}</h2>
          <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            {clazz.className} • {clazz.subject} • {task.taskType}
          </div>
        </div>
      </div>

      {/* 1. PIPELINE PROGRESS */}
      <section className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-50">
        <div className="flex items-center gap-2 mb-6">
          <Layers size={18} className="text-gray-400" />
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Marking Pipeline</h3>
        </div>
        
        <div className="flex justify-between items-start relative pb-4">
          {/* Progress Line */}
          <div className="absolute top-[18px] left-[5%] right-[5%] h-0.5 bg-gray-100 z-0" />
          <div 
            className="absolute top-[18px] left-[5%] h-0.5 bg-black z-0 transition-all duration-500" 
            style={{ width: `${(Math.max(0, task.currentStage - 1) / 5) * 90}%` }}
          />

          {STAGES.map((s) => (
            <div key={s.num} className="z-10 flex flex-col items-center gap-2 w-12 text-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                s.num < task.currentStage ? 'bg-black text-white' : 
                s.num === task.currentStage ? 'bg-black text-white ring-4 ring-black/5 scale-110' : 
                'bg-white border-2 border-gray-100 text-gray-300'
              }`}>
                {s.num < task.currentStage ? <CheckCircle2 size={16} /> : <span className="text-xs font-bold">{s.num}</span>}
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-tighter ${
                s.num === task.currentStage ? 'text-black' : 'text-gray-400'
              }`}>
                {s.name}
              </span>
            </div>
          ))}
        </div>

        {task.currentStage < 6 && (
          <button 
            onClick={() => setIsAdvancing(true)}
            className="w-full mt-6 bg-black text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            Advance to {STAGES[task.currentStage].name} <ChevronRight size={18} />
          </button>
        )}
      </section>

      {/* 2. STAGE LOG */}
      <section>
        <div className="flex items-center gap-2 mb-4 px-2">
          <Clock size={18} className="text-gray-400" />
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Activity Timeline</h3>
        </div>
        <div className="space-y-4 ml-4 border-l-2 border-gray-100 pl-8 relative">
          {task.stageHistory.slice().reverse().map((log, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={idx} 
              className="relative"
            >
              <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-white border-2 border-black flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-black rounded-full" />
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-50 shadow-sm">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-sm text-gray-900">{STAGES[log.stage - 1].longName}</h4>
                  <span className="text-[10px] text-gray-400">{new Date(log.completedDate).toLocaleDateString()}</span>
                </div>
                {log.notes && <p className="text-xs text-gray-500 mt-2 italic">"{log.notes}"</p>}
                {log.photoUrl && (
                  <div className="mt-3 w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                    <Camera size={20} className="text-gray-400" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. MISSING STUDENTS */}
      <section>
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-gray-400" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Flagged Students</h3>
          </div>
          <button 
            onClick={() => setIsFlagging(true)}
            className="text-[10px] font-bold text-blue-500 uppercase tracking-widest px-3 py-1 hover:bg-blue-50 rounded-lg"
          >
            + Flag Student
          </button>
        </div>
        <div className="space-y-3">
          {task.missingStudents.map((s, idx) => (
            <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex items-start gap-4">
              <div className="p-2.5 bg-red-50 text-red-500 rounded-xl">
                <AlertCircle size={20} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-sm">{s.studentName}</h4>
                  <span className="text-[10px] text-gray-400">{new Date(s.actionDate).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1"><span className="font-bold">Issue:</span> {s.issue}</p>
                <div className="mt-2 text-[10px] bg-gray-50 px-2 py-1 rounded w-fit text-gray-500 font-medium">
                  {s.actionTaken}
                </div>
              </div>
            </div>
          ))}
          {task.missingStudents.length === 0 && (
            <div className="py-8 text-center border-2 border-dashed border-gray-100 rounded-[32px] text-gray-400 text-xs">
              No students flagged for this task.
            </div>
          )}
        </div>
      </section>

      {/* 4. TASK METADATA & ACTIONS */}
      <section className="bg-gray-100/50 p-6 rounded-[32px] border border-gray-200/50">
        <div className="flex items-center gap-2 mb-4">
          <Info size={16} className="text-gray-400" />
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Task Information</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <MetaItem icon={<Calendar size={14}/>} label="Assigned" value={new Date(task.dateAssigned).toLocaleDateString()} />
          <MetaItem icon={<Clock size={14}/>} label="Expected" value={new Date(task.expectedCollectDate).toLocaleDateString()} />
          <MetaItem icon={<FileText size={14}/>} label="Type" value={task.taskType} />
          <MetaItem icon={<CheckCircle2 size={14}/>} label="Status" value={task.currentStage === 6 ? 'Filed' : 'Active'} />
        </div>
        <div className="flex gap-3">
          <button className="flex-1 bg-white text-black font-bold py-3 pt-3.5 px-4 rounded-xl text-[11px] uppercase tracking-widest border border-gray-200 shadow-sm active:scale-95 transition-all">
            Edit Details
          </button>
          <button 
            onClick={() => { if(confirm('Delete this task?')) { onDeleteTask(task.taskId); onBack(); } }}
            className="p-3 bg-white text-red-500 rounded-xl border border-gray-200 shadow-sm active:scale-95 transition-all"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </section>

      {/* Advance Modal */}
      <AnimatePresence>
        {isAdvancing && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdvancing(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl"
            >
              <h2 className="text-xl font-bold mb-1">Advance Stage</h2>
              <p className="text-xs text-gray-400 mb-6 font-medium uppercase tracking-widest">To: {STAGES[task.currentStage].longName}</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Notes (Optional)</label>
                  <textarea
                    rows={3}
                    value={advanceNotes}
                    onChange={(e) => setAdvanceNotes(e.target.value)}
                    placeholder="Add observations or notes..."
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-black/5 resize-none"
                  />
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl text-gray-400 border-2 border-dashed border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                  <Camera size={20} />
                  <span className="text-xs font-bold uppercase tracking-widest">Attach Evidence Photo</span>
                </div>

                <button
                  onClick={handleAdvance}
                  className="w-full bg-black text-white font-bold py-5 rounded-[24px] shadow-lg active:scale-[0.98] transition-transform mt-4"
                >
                  Confirm Completion
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Flag Student Modal */}
        {isFlagging && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFlagging(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl"
            >
              <h2 className="text-xl font-bold mb-6">Flag a Student</h2>

              <form onSubmit={handleAddFlag} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Student Name</label>
                  <input
                    required
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-black/5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Issue</label>
                  <select
                    required
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-black/5 appearance-none"
                  >
                    <option value="">Select common issue</option>
                    <option value="Lost work">Lost work</option>
                    <option value="Missing correction">Missing correction</option>
                    <option value="Absent during return">Absent during return</option>
                    <option value="Incomplete submission">Incomplete submission</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Action Taken</label>
                  <input
                    required
                    type="text"
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    placeholder="e.g. Called parents"
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-black/5"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-500 text-white font-bold py-5 rounded-[24px] shadow-lg shadow-red-500/20 active:scale-[0.98] transition-transform mt-4"
                >
                  Flag Student
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetaItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-gray-400">{icon}</div>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 leading-none">{label}</div>
        <div className="text-xs font-bold text-gray-700 mt-1">{value}</div>
      </div>
    </div>
  );
}
