/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileSearch, 
  Upload, 
  Camera, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Sparkles
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { TermEvent } from '../types.ts';

interface SmartScannerProps {
  onEventsExtracted: (events: TermEvent[]) => void;
  onClose: () => void;
}

export default function SmartScanner({ onEventsExtracted, onClose }: SmartScannerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File is too large (max 10MB)');
      return;
    }

    setFile(selectedFile);
    setError(null);

    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleScan = async () => {
    if (!file) return;

    setIsScanning(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      
      const fileData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              {
                text: "Extract all key academic dates, term markings, assessment periods, and file inspections from this document. Return them as a JSON array of events. Dates should be in ISO format (YYYY-MM-DD)."
              },
              {
                inlineData: {
                  mimeType: file.type,
                  data: fileData
                }
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING, description: "The ISO date of the event (YYYY-MM-DD)" },
                description: { type: Type.STRING, description: "A brief, clear description of the event" }
              },
              required: ["date", "description"]
            }
          }
        }
      });

      const jsonStr = response.text.trim();
      const extractedEvents: TermEvent[] = JSON.parse(jsonStr);
      
      if (extractedEvents.length > 0) {
        onEventsExtracted(extractedEvents);
      } else {
        setError("No clear dates found in the document. Please try a different photo.");
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      setError(err.message || "Failed to scan document. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
      >
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-600">
                <Sparkles size={20} />
                <h2 className="text-xs font-black uppercase tracking-widest">Smart Scanner</h2>
              </div>
              <h1 className="text-2xl font-black text-gray-900">Import Schedule</h1>
            </div>
            <button 
              onClick={onClose}
              className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {!file ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-video border-2 border-dashed border-gray-100 rounded-[32px] bg-gray-50 flex flex-col items-center justify-center space-y-4 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer group"
            >
              <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                <Upload size={32} />
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-900">Tap to upload PDF or Photo</p>
                <p className="text-xs text-gray-400 mt-1">Academic calendar or term plan</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,.pdf"
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-video bg-gray-100 rounded-[32px] overflow-hidden border border-gray-100">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <FileSearch size={48} className="mb-2 opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-widest">{file.name}</p>
                  </div>
                )}
                <button 
                  onClick={() => setFile(null)}
                  className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md text-white rounded-xl hover:bg-black/70 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {error && (
                <div className="p-4 bg-red-50 rounded-2xl flex items-center gap-3 text-red-600">
                  <AlertCircle size={20} className="shrink-0" />
                  <p className="text-xs font-bold leading-tight">{error}</p>
                </div>
              )}

              <button 
                onClick={handleScan}
                disabled={isScanning}
                className="w-full py-5 bg-black text-white font-bold rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
              >
                {isScanning ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    Extracting schedule...
                  </>
                ) : (
                  <>
                    <Calendar size={20} />
                    Start AI Scanning
                  </>
                )}
              </button>
            </div>
          )}

          <div className="pt-2 text-center">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest leading-relaxed">
              Powered by Gemini AI • PDF & Images supported
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
