import api from '@/lib/axios';
import { Reminder, CreateReminderInput } from '@/types';

// Create a new reminder
export const createReminder = async (entry: CreateReminderInput): Promise<Reminder> => {
  const { data } = await api.post(`/job-application/${entry.applicationId}/reminders`, entry);
  return data;
};

// Fetch reminders for a specific job application
export const getRemindersByApplication = async (applicationId: string): Promise<Reminder[]> => {
  const { data } = await api.get(`/job-application/${applicationId}/reminders`);
  return data;
};

// Cancel a specific reminder
export const cancelReminder = async (applicationId: string, reminderId: string): Promise<Reminder> => {
  const { data } = await api.delete(`/job-application/${applicationId}/reminders/${reminderId}`);
  return data;
};