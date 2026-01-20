import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReminder } from '@/api/jobApplication/jobReminder';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobApplication: {
    jobApplicationId: string;
    [key: string]: any;
  };
}

const ReminderModal: React.FC<ReminderModalProps> = ({ isOpen, onClose, jobApplication }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [type, setType] = useState<'interview' | 'follow-up' | 'deadline'>('interview');
  const [reminderDate, setReminderDate] = useState<Date | null>(null);
  const [remindBefore, setRemindBefore] = useState<'15m' | '30m' | '1h' | '2h' | 'none'>('none');
  const [message, setMessage] = useState<string>('');

  const { mutateAsync: createReminderMutate, isPending: isCreatingReminder } = useMutation({
    mutationFn: createReminder,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['reminders', jobApplication.jobApplicationId] });
      navigate({ to: '/applications' });
      toast.success('Added successfully!');
    }
  });

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    const applicationId = jobApplication.jobApplicationId;

    if (!reminderDate) {
      toast.error('Please select a valid date and time.');
      return;
    }

    const utc8Date = reminderDate.toISOString(); 

    try {
      await createReminderMutate({
        applicationId,
        type,
        reminderDate: utc8Date,
        remindBefore,
        message,
      });
      onClose();
    } catch (err) {
      const errorMessage = (err as any).response?.data?.error || 'Failed to create reminder. Please try again.'; // Type assertion for error
      toast.error(errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Create Reminder</h2>
        <form onSubmit={submitHandler} className="space-y-4">
          <label className="block">
            <span className="text-gray-700">Type:</span>
            <select
              name="type"
              className="w-full border rounded p-2 outline-none mt-1 focus:ring-indigo-500 focus:border-indigo-500"
              value={type}
              onChange={(e) => setType(e.target.value as 'interview' | 'follow-up' | 'deadline')}
            >
              <option value="interview">Interview</option>
              <option value="follow-up">Follow-up</option>
              <option value="deadline">Deadline</option>
            </select>
          </label>
          <label className="flex w-full items-center gap-2 ">
            <span className="text-gray-700">Reminder Date:</span>
            <DatePicker
              selected={reminderDate}
              onChange={(date: Date | null) => setReminderDate(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-50 outline-none text-gray-700 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
              placeholderText="Select date and time"
              required
            />
          </label>
          <label className="block">
            <span className="text-gray-700">Remind Before:</span>
            <select
              name="remindBefore"
              className="w-full border outline-none rounded p-2 mt-1 focus:ring-indigo-500 focus:border-indigo-500"
              value={remindBefore}
              onChange={(e) => setRemindBefore(e.target.value as '15m' | '30m' | '1h' | '2h' | 'none')}
            >
              <option value="none">None</option>
              <option value="15m">15 minutes</option>
              <option value="30m">30 minutes</option>
              <option value="1h">1 hour</option>
              <option value="2h">2 hours</option>
            </select>
          </label>
          <label className="block">
            <span className="text-gray-700">Message:</span>
            <textarea
              name="message"
              className="w-full outline-none border rounded p-2 mt-1 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Optional message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancel
            </button>
            <button
              disabled={isCreatingReminder}
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {isCreatingReminder 
              ? <Loader2 className="animate-spin h-5 w-5" /> 
              : 'Create Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReminderModal;