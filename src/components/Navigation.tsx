/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Home, ClipboardList, Calendar, CheckSquare, BarChart3 } from 'lucide-react';

export type ViewType = 'home' | 'tasks' | 'planner' | 'checklist' | 'report';

interface NavigationProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  badges?: Partial<Record<ViewType, boolean>>;
}

export default function Navigation({ currentView, setView, badges = {} }: NavigationProps) {
  const items: { id: ViewType; icon: React.ReactNode; label: string }[] = [
    { id: 'home', icon: <Home size={22} />, label: 'Home' },
    { id: 'tasks', icon: <ClipboardList size={22} />, label: 'Tasks' },
    { id: 'planner', icon: <Calendar size={22} />, label: 'Planner' },
    { id: 'checklist', icon: <CheckSquare size={22} />, label: 'Checklist' },
    { id: 'report', icon: <BarChart3 size={22} />, label: 'Report' },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white px-3 py-2 rounded-full shadow-2xl flex items-center gap-1 z-50 w-[90%] max-w-md">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setView(item.id)}
          className={`flex-1 flex flex-col items-center py-2 rounded-full transition-all relative ${
            currentView === item.id 
              ? 'bg-white text-[#1a1a1a]' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          {item.icon}
          <span className="text-[10px] font-bold mt-0.5">{item.label}</span>
          {badges[item.id] && (
            <span className="absolute top-2 right-4 w-2 h-2 bg-red-500 rounded-full border-2 border-[#1a1a1a]" />
          )}
        </button>
      ))}
    </nav>
  );
}
