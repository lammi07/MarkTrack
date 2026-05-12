/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task, Class } from '../types.ts';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight,
  ChevronRight,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  tasks: Task[];
  classes: Class[];
  onTaskClick: (taskId: string) => void;
  onAddTask: () => void;
}

export default function Dashboard({ tasks, classes, onTaskClick, onAddTask }: DashboardProps) {
  // Logic for Task Health Summary
  const now = new Date();
  
  const overdueTasks = tasks.filter(t => {
    if (t.currentStage === 6) return false;
    const expected = new Date(t.expectedCollectDate);
    return expected < now;
  });

  const dueThisWeekTasks = tasks.filter(t => {
    if (t.currentStage === 6) return false;
    const expected = new Date(t.expectedCollectDate);
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
    return expected >= now && expected <= oneWeekFromNow;
  });

  const completedTasks = tasks.filter(t => t.currentStage === 6);
  const pendingTasks = tasks.filter(t => t.currentStage < 6);

  // Today's Action List Logic
  const getActionItems = () => {
    const items = tasks.filter(t => t.currentStage < 6).map(t => {
      const lastUpdate = new Date(t.stageHistory[t.stageHistory.length - 1]?.completedDate || t.dateAssigned);
      const daysAtStage = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
      const expected = new Date(t.expectedCollectDate);
      
      let urgency: 'high' | 'medium' | 'normal' = 'normal';
      let badgeLabel = '';

      if (expected < now) {
        urgency = 'high';
        badgeLabel = 'Overdue';
      } else if (daysAtStage >= 3) {
        urgency = 'medium';
        badgeLabel = 'Stalled';
      } else if (expected.toDateString() === now.toDateString()) {
        urgency = 'normal';
        badgeLabel = 'Due Today';
      }

      return {
        ...t,
        daysAtStage,
        urgency,
        badgeLabel,
        className: classes.find(c => c.classId === t.classId)?.className || 'Unknown'
      };
    });

    // Sort: high > medium > normal
    return items.filter(i => i.badgeLabel !== '').sort((a, b) => {
      const priority = { high: 0, medium: 1, normal: 2 };
      return priority[a.urgency] - priority[b.urgency];
    });
  };

  const actionItems = getActionItems();

  return (
    <div className="space-y-8 pb-20">
      {/* 1. TASK HEALTH SUMMARY */}
      <section>
        <div className="grid grid-cols-2 gap-4">
          <HealthCard 
            label="Overdue" 
            value={overdueTasks.length} 
            color="bg-red-50 text-red-600 border-red-100"
            icon={<AlertCircle size={16} />}
          />
          <HealthCard 
            label="Due This Week" 
            value={dueThisWeekTasks.length} 
            color="bg-amber-50 text-amber-600 border-amber-100"
            icon={<Clock size={16} />}
          />
          <HealthCard 
            label="Completed" 
            value={completedTasks.length} 
            color="bg-emerald-50 text-emerald-600 border-emerald-100"
            icon={<CheckCircle2 size={16} />}
          />
          <HealthCard 
            label="In Pipeline" 
            value={pendingTasks.length} 
            color="bg-blue-50 text-blue-600 border-blue-100"
            icon={<ArrowUpRight size={16} />}
          />
        </div>
      </section>

      {/* 2. TODAY'S ACTION LIST */}
      <section>
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Today's Action List</h2>
          <span className="text-xs text-gray-400 font-medium">{actionItems.length} items</span>
        </div>
        
        <div className="space-y-3">
          {actionItems.length > 0 ? (
            actionItems.map((item, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={item.taskId}
                onClick={() => onTaskClick(item.taskId)}
                className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.urgency === 'high' ? 'bg-red-100 text-red-600' : 
                      item.urgency === 'medium' ? 'bg-amber-100 text-amber-600' : 
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {item.badgeLabel}
                    </span>
                    <h3 className="font-semibold text-gray-800">{item.taskName}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="font-medium text-gray-900">{item.className}</span>
                    <span>Stage {item.currentStage}: {['Assigned', 'Collected', 'Marked', 'Returned', 'Corrections', 'Filed'][item.currentStage-1]}</span>
                    <span>• {item.daysAtStage}d at this stage</span>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-300" />
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[40px] text-gray-400 px-8">
              <div className="w-16 h-16 bg-white rounded-full shadow-sm border border-gray-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-emerald-500 opacity-20" />
              </div>
              <h3 className="text-gray-900 font-bold">All caught up!</h3>
              <p className="text-sm mt-1">No urgent actions or overdue tasks to report today.</p>
              {tasks.length === 0 && (
                <button 
                  onClick={onAddTask}
                  className="mt-6 px-6 py-3 bg-black text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl flex items-center gap-2 mx-auto"
                >
                  <Plus size={14} /> Log your first task
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 3. QUICK ADD BUTTON */}
      <button 
        onClick={onAddTask}
        className="fixed bottom-24 right-6 w-14 h-14 bg-black text-white rounded-2xl shadow-xl flex items-center justify-center active:scale-95 transition-transform z-40"
      >
        <Plus size={28} />
      </button>
    </div>
  );
}

function HealthCard({ label, value, color, icon }: { label: string, value: number, color: string, icon: React.ReactNode }) {
  return (
    <div className={`p-4 rounded-3xl border ${color} flex flex-col justify-between h-28 shadow-sm transition-all hover:shadow-md`}>
      <div className="p-2 w-fit bg-white/50 rounded-xl">
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold leading-none">{value}</div>
        <div className="text-[10px] uppercase tracking-wider font-bold opacity-80 mt-1">{label}</div>
      </div>
    </div>
  );
}
