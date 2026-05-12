/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppData, Class, Task, TermSchedule, Alert } from '../types.ts';

const STORAGE_KEY = 'marktrack_data';

const DEFAULT_DATA: AppData = {
  classes: [],
  tasks: [],
  termSchedules: [],
  alerts: [],
  hasCompletedOnboarding: false,
};

export const getStorageData = (): AppData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : DEFAULT_DATA;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return DEFAULT_DATA;
  }
};

export const saveStorageData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Helper methods for specific entities
export const getClasses = (): Class[] => getStorageData().classes;
export const getTasks = (): Task[] => getStorageData().tasks;
export const getTermSchedules = (): TermSchedule[] => getStorageData().termSchedules;
export const getAlerts = (): Alert[] => getStorageData().alerts;

export const addClass = (newClass: Class) => {
  const data = getStorageData();
  data.classes.push(newClass);
  saveStorageData(data);
};

export const addTask = (newTask: Task) => {
  const data = getStorageData();
  data.tasks.push(newTask);
  saveStorageData(data);
};

export const updateTask = (updatedTask: Task) => {
  const data = getStorageData();
  data.tasks = data.tasks.map(t => t.taskId === updatedTask.taskId ? updatedTask : t);
  saveStorageData(data);
};

export const deleteResource = (type: keyof AppData, id: string) => {
  const data = getStorageData();
  if (type === 'classes') {
    data.classes = data.classes.filter(c => c.classId !== id);
  } else if (type === 'tasks') {
    data.tasks = data.tasks.filter(t => t.taskId !== id);
  } else if (type === 'termSchedules') {
    data.termSchedules = data.termSchedules.filter(s => s.termId !== id);
  } else if (type === 'alerts') {
    data.alerts = data.alerts.filter(a => a.alertId !== id);
  }
  saveStorageData(data);
};
