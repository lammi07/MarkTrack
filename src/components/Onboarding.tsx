/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  BookOpen, 
  Plus, 
  Calendar, 
  Shield, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { Class, TermSchedule, UserProfile } from '../types.ts';

interface OnboardingProps {
  onComplete: (user: UserProfile, classes: Class[], term: TermSchedule) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  
  // Step 1 State
  const [profile, setProfile] = useState<UserProfile>({ name: '', subject: '' });
  
  // Step 2 State
  const [classes, setClasses] = useState<Class[]>([]);
  const [newClassName, setNewClassName] = useState('');
  
  // Step 3 State
  const [termName, setTermName] = useState('Term 2 2026');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000 * 90).toISOString().split('T')[0]);
  const [inspectionDate, setInspectionDate] = useState(new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0]);

  const handleAddClass = () => {
    if (!newClassName) return;
    const newClass: Class = {
      classId: `c-${Date.now()}`,
      className: newClassName,
      subject: profile.subject
    };
    setClasses([...classes, newClass]);
    setNewClassName('');
  };

  const handleRemoveClass = (id: string) => {
    setClasses(classes.filter(c => c.classId !== id));
  };

  const handleFinish = () => {
    const term: TermSchedule = {
      termId: `term-${Date.now()}`,
      termName,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      importedEvents: [],
      inspectionDates: [new Date(inspectionDate).toISOString()]
    };
    onComplete(profile, classes, term);
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="fixed inset-0 bg-[#f8f9fa] z-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                i <= step ? 'bg-black' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <div className="space-y-2 text-center sm:text-left">
                <div className="w-16 h-16 bg-blue-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto sm:mx-0 shadow-xl shadow-blue-500/20">
                  <User size={32} />
                </div>
                <h1 className="text-3xl font-black tracking-tight text-gray-900">Welcome to MarkTrack</h1>
                <p className="text-gray-500">Let's set up your profile to personalize your experience.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Your Name</label>
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                    placeholder="e.g. Mr. Ibrahim"
                    className="w-full p-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-black/5 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Main Subject</label>
                  <div className="relative">
                    <BookOpen size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      value={profile.subject}
                      onChange={e => setProfile({ ...profile, subject: e.target.value })}
                      placeholder="e.g. English Literature"
                      className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-black/5 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={() => profile.name && profile.subject && setStep(2)}
                disabled={!profile.name || !profile.subject}
                className="w-full py-5 bg-black text-white font-bold rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-20 disabled:scale-100"
              >
                Continue <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center text-white mb-4 shadow-xl shadow-emerald-500/20">
                  <Plus size={32} />
                </div>
                <h1 className="text-3xl font-black tracking-tight text-gray-900">Your Classes</h1>
                <p className="text-gray-500">Add the classes you are currently teaching.</p>
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddClass()}
                  placeholder="e.g. 3B"
                  className="flex-1 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-emerald-500/10 outline-none"
                />
                <button 
                  onClick={handleAddClass}
                  className="px-6 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20"
                >
                  Add
                </button>
              </div>

              <div className="space-y-3 max-h-48 overflow-y-auto no-scrollbar py-2">
                {classes.map(c => (
                  <div key={c.classId} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center font-bold text-gray-900 text-xs">
                        {c.className.charAt(0)}
                      </div>
                      <span className="font-bold text-gray-900">{c.className}</span>
                    </div>
                    <button onClick={() => handleRemoveClass(c.classId)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {classes.length === 0 && (
                  <div className="py-8 text-center text-gray-300 border-2 border-dashed border-gray-100 rounded-3xl">
                    <p className="text-xs font-bold uppercase tracking-widest">No classes added yet</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 py-5 bg-white border border-gray-100 text-gray-400 font-bold rounded-2xl shadow-sm"
                >
                  Back
                </button>
                <button 
                  onClick={() => setStep(3)}
                  disabled={classes.length === 0}
                  className="flex-[2] py-5 bg-black text-white font-bold rounded-2xl shadow-xl flex items-center justify-center gap-2 disabled:opacity-20 transition-all"
                >
                  Next Step <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="w-16 h-16 bg-amber-500 rounded-3xl flex items-center justify-center text-white mb-4 shadow-xl shadow-amber-500/20">
                  <Calendar size={32} />
                </div>
                <h1 className="text-3xl font-black tracking-tight text-gray-900">Term Setup</h1>
                <p className="text-gray-500">Set your key dates to help MarkTrack plan for you.</p>
              </div>

              <div className="space-y-4">
                 <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                          <Calendar size={12} /> Term Start Date
                       </label>
                       <input 
                         type="date" 
                         value={startDate}
                         onChange={e => setStartDate(e.target.value)}
                         className="w-full p-3 bg-gray-50 rounded-xl text-sm border-none focus:ring-1 focus:ring-black/5"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                          <Calendar size={12} /> Term End Date
                       </label>
                       <input 
                         type="date" 
                         value={endDate}
                         onChange={e => setEndDate(e.target.value)}
                         className="w-full p-3 bg-gray-50 rounded-xl text-sm border-none focus:ring-1 focus:ring-black/5"
                       />
                    </div>
                 </div>

                 <div className="bg-blue-600 p-6 rounded-[32px] text-white shadow-xl shadow-blue-600/20 space-y-3">
                    <div className="flex items-center gap-2">
                       <Shield size={20} />
                       <h3 className="text-sm font-bold uppercase tracking-widest">Major Milestone</h3>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Next File Inspection Date</label>
                       <input 
                         type="date" 
                         value={inspectionDate}
                         onChange={e => setInspectionDate(e.target.value)}
                         className="w-full p-4 bg-white/10 rounded-2xl text-white border-2 border-white/10 focus:border-white/30 focus:ring-0 outline-none"
                       />
                    </div>
                    <p className="text-[10px] opacity-70 italic font-medium">We'll alert you 7 days before this date.</p>
                 </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setStep(2)}
                  className="flex-1 py-5 bg-white border border-gray-100 text-gray-400 font-bold rounded-2xl shadow-sm"
                >
                  Back
                </button>
                <button 
                  onClick={handleFinish}
                  className="flex-[2] py-5 bg-blue-600 text-white font-bold rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                >
                  Get Started <CheckCircle2 size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
