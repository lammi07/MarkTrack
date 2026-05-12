/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task, Class } from '../types.ts';
import { Printer, Download, ArrowLeft, MessageSquare, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import AlertGenerator from './AlertGenerator.tsx';

interface ReportProps {
  tasks: Task[];
  classes: Class[];
  onBack?: () => void;
}

export default function Report({ tasks, classes, onBack }: ReportProps) {
  const [showGenerator, setShowGenerator] = useState(false);
  const now = new Date().toLocaleDateString(undefined, { dateStyle: 'long' });

  const handlePrint = () => {
    window.print();
  };

  if (showGenerator) {
    return <AlertGenerator tasks={tasks} classes={classes} onBack={() => setShowGenerator(false)} />;
  }

  if (classes.length === 0) {
    return (
      <div className="py-32 text-center border-2 border-dashed border-gray-100 rounded-[40px] px-8 text-gray-400">
        <div className="w-16 h-16 bg-white rounded-3xl shadow-sm border border-gray-50 flex items-center justify-center mx-auto mb-4">
          <FileText size={32} className="opacity-10" />
        </div>
        <h3 className="text-gray-900 font-bold">No data to report</h3>
        <p className="text-xs mt-1">Populate your tasks and classes to generate a comprehensive audit report.</p>
        {onBack && (
          <button 
            onClick={onBack}
            className="mt-6 px-6 py-3 bg-black text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest"
          >
            Go Back
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32">
      {/* Action Bar */}
      <div className="flex justify-between items-center sticky top-[72px] z-30 bg-[#f8f9fa] py-2 no-print">
        <div className="flex gap-2">
          {onBack && (
            <button onClick={onBack} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-400 hover:text-black">
              <ArrowLeft size={20} />
            </button>
          )}
          <button 
            onClick={() => setShowGenerator(true)}
            className="flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 text-xs font-bold uppercase tracking-widest"
          >
            <MessageSquare size={16} /> Alert HOD
          </button>
        </div>
        <div className="flex gap-2 text-white">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-black rounded-2xl shadow-xl text-xs font-bold uppercase tracking-widest active:scale-95 transition-transform"
          >
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div id="printable-report" className="bg-white p-8 sm:p-12 rounded-[40px] shadow-sm border border-gray-100 print:shadow-none print:border-none print:p-0 print:rounded-none">
        <header className="mb-12 border-b-2 border-black pb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter">Marking Audit Report</h1>
              <p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-widest">Inspection Ready Documentation</p>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Generated on</div>
              <div className="font-bold">{now}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8 mt-10">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Teacher / Subject</div>
              <div className="font-bold text-lg">MarkTrack User</div>
              <div className="text-sm text-gray-500">General Education Department</div>
            </div>
            <div>
               <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Status Summary</div>
               <div className="font-bold text-lg">{classes.length} Classes Profiled</div>
               <div className="text-sm text-gray-500">{tasks.filter(t => t.currentStage === 6).length} Tasks Fully Filed</div>
            </div>
          </div>
        </header>

        <div className="space-y-16">
          {classes.map(c => {
            const classTasks = tasks.filter(t => t.classId === c.classId);
            const confirmed = classTasks.filter(t => t.isInspectionReady).length;
            const total = classTasks.filter(t => t.currentStage >= 4).length;
            
            return (
              <section key={c.classId} className="break-inside-avoid">
                <div className="flex justify-between items-end border-b border-gray-100 pb-2 mb-6">
                  <div>
                    <h2 className="text-3xl font-black">{c.className}</h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{c.subject}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">File Readiness</div>
                    <div className="font-black text-xl">{confirmed} / {total || 0} <span className="text-[10px] font-bold text-gray-400">CONFIRMED</span></div>
                  </div>
                </div>

                <div className="space-y-6">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-50">
                        <th className="py-2">Task Name</th>
                        <th className="py-2">Stage</th>
                        <th className="py-2">Last Update</th>
                        <th className="py-2 text-right">Flags</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {classTasks.map(t => (
                        <tr key={t.taskId} className="text-sm">
                          <td className="py-4">
                            <div className="font-bold">{t.taskName}</div>
                            <div className="text-[10px] text-gray-400">{t.taskType}</div>
                          </td>
                          <td className="py-4 font-medium">Stage {t.currentStage}</td>
                          <td className="py-4 text-xs text-gray-500">
                            {new Date(t.stageHistory[t.stageHistory.length-1]?.completedDate || t.dateAssigned).toLocaleDateString()}
                          </td>
                          <td className="py-4 text-right">
                            {t.missingStudents.length > 0 ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500">
                                <AlertTriangle size={12} /> {t.missingStudents.length} FLAG
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-500">CLEAR</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {c.spotCheckNotes && (
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Spot Check Field Notes</div>
                      <p className="text-xs italic text-gray-600 leading-relaxed">"{c.spotCheckNotes}"</p>
                    </div>
                  )}

                  {classTasks.some(t => t.missingStudents.length > 0) && (
                    <div className="space-y-2 mt-4">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-red-400">Flagged Exceptions</div>
                      {classTasks.flatMap(t => t.missingStudents.map((s, idx) => (
                        <div key={idx} className="text-[10px] text-gray-500 grid grid-cols-3 gap-2 py-1 border-b border-gray-50 border-dashed">
                           <span className="font-bold text-gray-700">{s.studentName}</span>
                           <span>{s.issue}</span>
                           <span className="text-right italic">{s.actionTaken}</span>
                        </div>
                      )))}
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        <footer className="mt-24 pt-8 border-t border-gray-100 text-center">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-300">End of Report</div>
          <p className="text-[10px] text-gray-400 mt-2 font-medium italic">Generated by MarkTrack — Digital Marking Workflow Assistant</p>
        </footer>
      </div>
    </div>
  );
}
