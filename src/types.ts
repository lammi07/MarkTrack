/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MarkingStage = 1 | 2 | 3 | 4 | 5 | 6;

export type TaskType = 'Homework' | 'Classwork' | 'Test' | 'Worksheet';

export type AlertType = 'overdue' | 'due-soon' | 'stage-stalled';

export interface Class {
  classId: string;
  className: string;
  subject: string;
  spotCheckNotes?: string;
}

export interface StageHistoryItem {
  stage: MarkingStage;
  completedDate: string; // ISO string
  notes?: string;
  photoUrl?: string;
}

export interface MissingStudent {
  studentName: string;
  issue: string;
  actionTaken: string;
  actionDate: string; // ISO string
}

export interface Task {
  taskId: string;
  classId: string;
  taskName: string;
  taskType: TaskType;
  dateAssigned: string; // ISO string
  expectedCollectDate: string; // ISO string
  currentStage: MarkingStage;
  stageHistory: StageHistoryItem[];
  missingStudents: MissingStudent[];
  isInspectionReady: boolean;
}

export interface TermEvent {
  date: string; // ISO string
  description: string;
}

export interface TermSchedule {
  termId: string;
  termName: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  importedEvents: TermEvent[];
  inspectionDates: string[]; // ISO strings
}

export interface Alert {
  alertId: string;
  taskId: string;
  type: AlertType;
  message: string;
  createdAt: string; // ISO string
  isDismissed: boolean;
}

export interface UserProfile {
  name: string;
  subject: string;
}

export interface AppData {
  user?: UserProfile;
  classes: Class[];
  tasks: Task[];
  termSchedules: TermSchedule[];
  alerts: Alert[];
  hasCompletedOnboarding: boolean;
}
