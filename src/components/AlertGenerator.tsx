/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { Task, Class } from '../types.ts';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  MessageSquare, 
  Clock, 
  AlertCircle,
  Hash,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AlertGeneratorProps {
  tasks: Task[];
  classes: Class[];
  onBack: () => void;
}

export default function AlertGenerator({ tasks, classes, onBack }: AlertGeneratorProps) {
  const [hodName, setHodName] = useState('');
  const [reason, setReason] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const delayedTasks = useMemo(() => 
    tasks.filter(t => t.currentStage < 6),
    [tasks]
  );

  const toggleTaskSelection = (id: string) => {
    setSelectedTaskIds(prev => 
      prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );
  };

  const generatedMessage = useMemo(() => {
    if (!hodName || selectedTaskIds.length === 0 || !reason || !completionDate) return '';
    
    const selectedTasks = tasks.filter(t => selectedTaskIds.includes(t.taskId));
    const taskNames = selectedTasks.map(t => t.taskName).join(', ');
    const classNames = Array.from(new Set(selectedTasks.map(t => classes.find(c => c.classId === t.classId)?.className))).join(' and ');
    const formattedDate = new Date(completionDate).toLocaleDateString(undefined, { dateStyle: 'long' });

    return `Hi ${hodName}, I wanted to give you an early heads up that I am slightly behind on ${taskNames} for ${classNames} due to ${reason}. I expect to complete these by ${formattedDate}. Please let me know if you need further clarification.`;
  }, [hodName, selectedTaskIds, reason, completionDate, tasks, classes]);

  const handleCopy = () => {
    if (!generatedMessage) return;
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-32">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Alert Draft Generator</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Formal HOD Communication</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Form */}
        <div className="space-y-6">
          <section className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
              <Hash size={18} className="text-blue-500" /> Message Inputs
            </h3>
            
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">HOD Name</label>
              <input
                type="text"
                value={hodName}
                onChange={(e) => setHodName(e.target.value)}
                placeholder="e.g. Mrs. Smith"
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500/10"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Reason for Delay</label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. recent heavy marking workload and student absences"
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500/10 resize-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Proposed Completion Link</label>
              <input
                type="date"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500/10"
              />
            </div>
          </section>

          <section className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
             <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Select Tasks</h3>
                <span className="text-[10px] font-bold text-blue-500">{selectedTaskIds.length} Selected</span>
             </div>
             <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar pr-1">
                {delayedTasks.map(task => (
                  <div 
                    key={task.taskId}
                    onClick={() => toggleTaskSelection(task.taskId)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedTaskIds.includes(task.taskId) ? 'bg-blue-50 border-blue-100' : 'bg-gray-50/50 border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-gray-900 leading-tight">{task.taskName}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                        {classes.find(c => c.classId === task.classId)?.className} • Stage {task.currentStage}
                      </div>
                    </div>
                    {selectedTaskIds.includes(task.taskId) && <Check size={16} className="text-blue-500"/>}
                  </div>
                ))}
             </div>
          </section>
        </div>

        {/* Right Column: Output */}
        <div className="space-y-6">
          <section className="sticky top-24">
            <div className="bg-[#1a1a1a] text-white p-8 rounded-[40px] shadow-2xl space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <MessageSquare size={20} className="text-blue-400" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-widest">Draft Message</h3>
                </div>
                {generatedMessage && (
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold uppercase transition-colors"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy Text'}
                  </button>
                )}
              </div>

              {generatedMessage ? (
                <div className="bg-white/5 p-6 rounded-[32px] min-h-[200px] flex items-center relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <AlertCircle size={80} />
                  </div>
                  <p className="text-lg leading-relaxed font-medium italic relative z-10">"{generatedMessage}"</p>
                </div>
              ) : (
                <div className="bg-white/5 p-8 rounded-[32px] min-h-[200px] border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-3 opacity-50">
                  <Clock size={32} />
                  <p className="text-xs font-bold uppercase tracking-widest underline decoration-white/20 underline-offset-4">Waiting for inputs...</p>
                  <p className="text-[10px] leading-relaxed">Select a task and fill in the details above to generate your professional alert draft.</p>
                </div>
              )}

              <div className="pt-6 border-t border-white/10">
                 <div className="flex items-center gap-4 text-white/40">
                   <div className="flex gap-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                     <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                     <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                   </div>
                   <span className="text-[10px] font-bold uppercase tracking-widest">Professional Tone Secured</span>
                 </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
