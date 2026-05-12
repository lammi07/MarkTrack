/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Task, 
  Class, 
  TaskType, 
  MarkingStage 
} from '../types.ts';
import { 
  Plus, 
  ChevronRight, 
  Search,
  Check,
  X,
  History,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TaskLogProps {
  tasks: Task[];
  classes: Class[];
  onTaskClick: (taskId: string) => void;
  onAddTask: (task: Omit<Task, 'taskId'>) => void;
  onAdvanceStage: (taskId: string) => void;
}

export default function TaskLog({ tasks, classes, onTaskClick, onAddTask, onAdvanceStage }: TaskLogProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskClass, setNewTaskClass] = useState('');
  const [newTaskType, setNewTaskType] = useState<TaskType>('Homework');
  const [newAssignedDate, setNewAssignedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newExpectedDate, setNewExpectedDate] = useState(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);

  const STAGES = ['Assigned', 'Collected', 'Marked', 'Returned', 'Corrections', 'Filed'];

  const filteredTasks = tasks.filter(t => {
    const classMatch = selectedClassId === 'all' || t.classId === selectedClassId;
    const searchMatch = t.taskName.toLowerCase().includes(searchQuery.toLowerCase());
    return classMatch && searchMatch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName || !newTaskClass) return;

    onAddTask({
      classId: newTaskClass,
      taskName: newTaskName,
      taskType: newTaskType,
      dateAssigned: new Date(newAssignedDate).toISOString(),
      expectedCollectDate: new Date(newExpectedDate).toISOString(),
      currentStage: 1,
      stageHistory: [{ stage: 1, completedDate: new Date().toISOString(), notes: 'Created task' }],
      missingStudents: [],
      isInspectionReady: false
    });

    setIsAddingTask(false);
    // Reset form
    setNewTaskName('');
    setNewTaskClass('');
  };

  const getStatusColor = (task: Task) => {
    if (task.currentStage === 6) return 'bg-emerald-500';
    const now = new Date();
    const expected = new Date(task.expectedCollectDate);
    if (expected < now) return 'bg-red-500';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (expected <= tomorrow) return 'bg-amber-500';
    return 'bg-blue-400';
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header & Filter */}
      <div className="sticky top-[72px] z-20 bg-[#f8f9fa] pt-2">
        <div className="flex overflow-x-auto gap-2 pb-3 no-scrollbar">
          <button
            onClick={() => setSelectedClassId('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedClassId === 'all' ? 'bg-black text-white' : 'bg-white text-gray-400 border border-gray-100 shadow-sm'
            }`}
          >
            All Classes
          </button>
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

        <div className="relative mt-2">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-11 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black/5"
          />
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <motion.div
                key={task.taskId}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-50 flex flex-col group cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div onClick={() => onTaskClick(task.taskId)}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(task)}`} />
                        <h3 className="font-bold text-gray-900 leading-tight">{task.taskName}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          {classes.find(c => c.classId === task.classId)?.className} • {task.taskType}
                        </span>
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-400 flex items-center gap-1">
                      <History size={10} />
                      {new Date(task.stageHistory[task.stageHistory.length - 1]?.completedDate || task.dateAssigned).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Progress Bar (6 Stages) */}
                  <div className="mb-4">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">
                         {STAGES[task.currentStage - 1]}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400">{Math.round((task.currentStage / 6) * 100)}%</span>
                    </div>
                    <div className="flex gap-1 h-1.5 w-full">
                      {[1, 2, 3, 4, 5, 6].map((s) => (
                        <div 
                          key={s}
                          className={`flex-1 rounded-full transition-all duration-300 ${
                            s < task.currentStage ? 'bg-black' : 
                            s === task.currentStage ? 'bg-black ring-4 ring-black/5' : 
                            'bg-gray-100'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                   <button 
                    onClick={() => onTaskClick(task.taskId)}
                    className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors flex items-center gap-1"
                   >
                     View Details <ChevronRight size={12} />
                   </button>
                   {task.currentStage < 6 && (
                     <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onAdvanceStage(task.taskId);
                      }}
                      className="bg-black text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2"
                     >
                       Next Stage <Check size={12} />
                     </button>
                   )}
                </div>
              </motion.div>
            ))
          ) : (
             <div className="py-24 text-center border-2 border-dashed border-gray-100 rounded-[40px] px-8">
                <div className="w-16 h-16 bg-white rounded-3xl shadow-sm border border-gray-50 flex items-center justify-center mx-auto mb-4 text-gray-300">
                  <Plus size={32} className="opacity-20" />
                </div>
                <h3 className="text-gray-900 font-bold">No tasks yet</h3>
                <p className="text-gray-400 text-xs mt-1">Tap the plus button below to log your first marking task.</p>
             </div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Add Button */}
      <button 
        onClick={() => setIsAddingTask(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-black text-white rounded-2xl shadow-xl flex items-center justify-center active:scale-95 transition-transform z-40"
      >
        <Plus size={28} />
      </button>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isAddingTask && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingTask(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl overflow-y-auto max-h-[80vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Plus size={20} /> New Task
                </h2>
                <button onClick={() => setIsAddingTask(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Task Name</label>
                  <input
                    required
                    type="text"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    placeholder="e.g. Grammar Exercise 5"
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-black/5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Class</label>
                    <select
                      required
                      value={newTaskClass}
                      onChange={(e) => setNewTaskClass(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-black/5 appearance-none"
                    >
                      <option value="">Select class</option>
                      {classes.map(c => (
                        <option key={c.classId} value={c.classId}>{c.className}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Type</label>
                    <select
                      required
                      value={newTaskType}
                      onChange={(e) => setNewTaskType(e.target.value as TaskType)}
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-black/5 appearance-none"
                    >
                      <option value="Homework">Homework</option>
                      <option value="Classwork">Classwork</option>
                      <option value="Test">Test</option>
                      <option value="Worksheet">Worksheet</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Date Assigned</label>
                    <input
                      required
                      type="date"
                      value={newAssignedDate}
                      onChange={(e) => setNewAssignedDate(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-black/5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Collect By</label>
                    <input
                      required
                      type="date"
                      value={newExpectedDate}
                      onChange={(e) => setNewExpectedDate(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-black/5"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-black text-white font-bold py-5 rounded-[24px] shadow-lg shadow-black/10 active:scale-[0.98] transition-transform mt-4"
                >
                  Add Task to Pipeline
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
