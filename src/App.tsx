/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { 
  Bell, 
  Trash2, 
  Settings,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { AppData, Class, Task, Alert, MarkingStage, TermSchedule, UserProfile } from './types.ts';
import { getStorageData, saveStorageData } from './lib/storage.ts';
import Dashboard from './components/Dashboard.tsx';
import Navigation, { ViewType } from './components/Navigation.tsx';
import TaskLog from './components/TaskLog.tsx';
import TaskDetail from './components/TaskDetail.tsx';
import TermPlanner from './components/TermPlanner.tsx';
import FileChecklist from './components/FileChecklist.tsx';
import Report from './components/Report.tsx';
import Onboarding from './components/Onboarding.tsx';

export default function App() {
  const [data, setData] = useState<AppData>(getStorageData());
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    saveStorageData(data);
  }, [data]);

  const handleOnboardingComplete = (user: UserProfile, starterClasses: Class[], term: TermSchedule) => {
    setData({
      user,
      classes: starterClasses,
      termSchedules: [term],
      tasks: [],
      alerts: [],
      hasCompletedOnboarding: true
    });
  };

  const handleAddTask = (newTaskBase: Omit<Task, 'taskId'>) => {
    const newTask: Task = {
      ...newTaskBase,
      taskId: `t-${Date.now()}`
    };
    setData(prev => ({
      ...prev,
      tasks: [newTask, ...prev.tasks]
    }));
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.taskId === updatedTask.taskId ? updatedTask : t)
    }));
  };

  const handleUpdateClassNotes = (classId: string, notes: string) => {
    setData(prev => ({
      ...prev,
      classes: prev.classes.map(c => c.classId === classId ? { ...c, spotCheckNotes: notes } : c)
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.taskId !== taskId)
    }));
    setSelectedTaskId(null);
  };


  const handleUpdateSchedule = (updatedSchedule: TermSchedule) => {
    setData(prev => {
      const scheduleExists = prev.termSchedules.some(s => s.termId === updatedSchedule.termId);
      const newSchedules = scheduleExists 
        ? prev.termSchedules.map(s => s.termId === updatedSchedule.termId ? updatedSchedule : s)
        : [...prev.termSchedules, updatedSchedule];
      
      return {
        ...prev,
        termSchedules: newSchedules
      };
    });
  };

  const handleAdvanceStage = (taskId: string) => {
    const task = data.tasks.find(t => t.taskId === taskId);
    if (task && task.currentStage < 6) {
      const nextStage = (task.currentStage + 1) as MarkingStage;
      handleUpdateTask({
        ...task,
        currentStage: nextStage,
        stageHistory: [
          ...task.stageHistory,
          {
            stage: nextStage,
            completedDate: new Date().toISOString(),
            notes: `Advanced to stage ${nextStage}`
          }
        ]
      });
    }
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  // Notification / Badge Logic
  const badges = useMemo(() => {
    const now = new Date();
    
    // Home badge: any overdue tasks
    const hasOverdue = data.tasks.some(t => {
      if (t.currentStage === 6) return false;
      return new Date(t.expectedCollectDate) < now;
    });

    // Tasks badge: any stalled tasks (3+ days at same stage)
    const hasStalled = data.tasks.some(t => {
      if (t.currentStage === 6) return false;
      const lastUpdate = new Date(t.stageHistory[t.stageHistory.length - 1]?.completedDate || t.dateAssigned);
      const daysAtStage = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
      return daysAtStage >= 3;
    });

    // Checklist badge: inspection within 7 days
    const isInspectionClose = data.termSchedules[0]?.inspectionDates.some(date => {
      const d = new Date(date);
      const diff = d.getTime() - now.getTime();
      const days = diff / (1000 * 60 * 60 * 24);
      return days >= 0 && days <= 7;
    });

    return {
      home: hasOverdue,
      tasks: hasStalled,
      checklist: isInspectionClose
    };
  }, [data.tasks, data.termSchedules]);

  const addSampleData = () => {
    const class1: Class = { classId: 'c1', className: '3B', subject: 'English' };
    const class2: Class = { classId: 'c2', className: '5A', subject: 'History' };
    
    // Overdue task
    const task1: Task = {
      taskId: 't1',
      classId: 'c1',
      taskName: 'Grammar Quiz 1',
      taskType: 'Homework',
      dateAssigned: new Date(Date.now() - 86400000 * 5).toISOString(),
      expectedCollectDate: new Date(Date.now() - 86400000 * 2).toISOString(),
      currentStage: 2,
      stageHistory: [
        { stage: 1, completedDate: new Date(Date.now() - 86400000 * 5).toISOString(), notes: 'Assigned.' },
        { stage: 2, completedDate: new Date(Date.now() - 86400000 * 2).toISOString(), notes: 'Collected most papers.' }
      ],
      missingStudents: [{ studentName: 'John Doe', issue: 'Absent during return', actionTaken: 'Emailed parent', actionDate: new Date().toISOString() }],
      isInspectionReady: false
    };

    // Stalled task
    const task2: Task = {
      taskId: 't2',
      classId: 'c2',
      taskName: 'History Essay',
      taskType: 'Homework',
      dateAssigned: new Date(Date.now() - 86400000 * 10).toISOString(),
      expectedCollectDate: new Date().toISOString(),
      currentStage: 3,
      stageHistory: [
        { stage: 1, completedDate: new Date(Date.now() - 86400000 * 10).toISOString() },
        { stage: 2, completedDate: new Date(Date.now() - 86400000 * 7).toISOString() },
        { stage: 3, completedDate: new Date(Date.now() - 86400000 * 6).toISOString() }
      ],
      missingStudents: [],
      isInspectionReady: false
    };

    // Completed task
    const task3: Task = {
      taskId: 't3',
      classId: 'c1',
      taskName: 'Spelling Bee',
      taskType: 'Classwork',
      dateAssigned: new Date(Date.now() - 86400000 * 14).toISOString(),
      expectedCollectDate: new Date(Date.now() - 86400000 * 12).toISOString(),
      currentStage: 6,
      stageHistory: [
        { stage: 1, completedDate: new Date(Date.now() - 86400000 * 14).toISOString() },
        { stage: 6, completedDate: new Date(Date.now() - 86400000 * 1).toISOString() }
      ],
      missingStudents: [],
      isInspectionReady: true
    };

    const newAlert: Alert = {
      alertId: 'a1',
      taskId: 't1',
      type: 'overdue',
      message: 'Grammar Quiz 1 is overdue for marking!',
      createdAt: new Date().toISOString(),
      isDismissed: false
    };

    const term: TermSchedule = {
      termId: 'term1',
      termName: 'Term 2 2026',
      startDate: new Date(Date.now() - 86400000 * 30).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 60).toISOString(),
      importedEvents: [],
      inspectionDates: [new Date(Date.now() + 86400000 * 3).toISOString()]
    };

    setData({
      user: { name: 'Mr. Khalid', subject: 'Languages' },
      classes: [class1, class2],
      tasks: [task1, task2, task3],
      termSchedules: [term],
      alerts: [newAlert],
      hasCompletedOnboarding: true
    });
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to reset MarkTrack? ALL data will be lost.')) {
      const emptyData: AppData = {
        classes: [],
        tasks: [],
        termSchedules: [],
        alerts: [],
        hasCompletedOnboarding: false
      };
      setData(emptyData);
      setSelectedTaskId(null);
      setCurrentView('home');
    }
  };

  const renderContent = () => {
    if (selectedTaskId) {
      const task = data.tasks.find(t => t.taskId === selectedTaskId);
      const clazz = data.classes.find(c => c.classId === task?.classId);
      if (task && clazz) {
        return (
          <TaskDetail 
            task={task} 
            clazz={clazz} 
            onBack={() => setSelectedTaskId(null)} 
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        );
      }
    }

    switch (currentView) {
      case 'home':
        return (
          <Dashboard 
            tasks={data.tasks} 
            classes={data.classes} 
            onTaskClick={handleTaskClick} 
            onAddTask={() => setCurrentView('tasks')}
          />
        );
      case 'tasks':
        return (
          <TaskLog 
            tasks={data.tasks} 
            classes={data.classes} 
            onTaskClick={handleTaskClick} 
            onAddTask={handleAddTask}
            onAdvanceStage={handleAdvanceStage}
          />
        );
      case 'planner':
        return (
          <TermPlanner 
            tasks={data.tasks}
            termSchedule={data.termSchedules[0] || null}
            onUpdateSchedule={handleUpdateSchedule}
            onUpdateTask={handleUpdateTask}
          />
        );
      case 'checklist':
        return (
          <FileChecklist 
            tasks={data.tasks}
            classes={data.classes}
            onUpdateTask={handleUpdateTask}
            onUpdateClassNotes={handleUpdateClassNotes}
            onGenerateReport={(id) => {
              setCurrentView('report');
            }}
          />
        );
      case 'report':
        return (
          <Report 
            tasks={data.tasks}
            classes={data.classes}
            onBack={() => setCurrentView('home')}
          />
        );
      default:
        return null;
    }
  };


  if (!data.hasCompletedOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 font-sans sm:p-4 pb-32">
      <header className="max-w-md mx-auto p-4 mb-2 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center text-white shrink-0">
            <UserIcon size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-gray-900 leading-tight">
              {data.user?.name || 'MarkTrack'}
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {data.user?.subject || 'Teacher Portfolio'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {data.hasCompletedOnboarding && data.tasks.length === 0 && (
             <button 
              onClick={addSampleData}
              className="p-2.5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors text-blue-500"
              title="Demo Data"
            >
              <Bell size={18} />
            </button>
          )}
          <button 
            onClick={clearAllData}
            className="p-2.5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors text-gray-300"
            title="Reset"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        {renderContent()}
      </main>

      <Navigation 
        currentView={currentView} 
        setView={setCurrentView} 
        badges={badges}
      />
    </div>
  );
}

