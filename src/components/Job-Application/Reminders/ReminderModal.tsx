import React from 'react';
import { useMutation, QueryClient } from '@tanstack/react-query';
import { createReminder } from '@/api/jobApplication/jobReminder';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobApplication: {
    jobApplicationId: string;
    [key: string]: any;
  };
}

const ReminderModal: React.FC<ReminderModalProps> = ({ isOpen, onClose, jobApplication }) => {
  const queryClient = new QueryClient();
  const navigate = useNavigate();

  const [type, setType] = useState<'interview' | 'follow-up' | 'deadline'>('interview');
  const [reminderDate, setReminderDate] = useState<string>('');
  const [remindBefore, setRemindBefore] = useState<'15m' | '30m' | '1h' | '2h' | 'none'>('none');
  const [message, setMessage] = useState<string>('');

  const { mutateAsync: createReminderMutate, isPending: isCreatingReminder } = useMutation({
    mutationFn: createReminder,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['applications'] })
      toast.success('Added successfully!')
      navigate({ to: '/applications' })
    }
  });

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    const applicationId = jobApplication.jobApplicationId;

    const utc8Date = new Date(reminderDate).toISOString(); 

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
        <h2 className="text-lg font-semibold mb-4">Create Reminder</h2>
        <form
          onSubmit={submitHandler}
        >
          {/* Form fields for reminder creation */}
          <label className="block mb-2">
            Type:
            <select
              name="type"
              className="w-full border rounded p-2"
              value={type}
              onChange={(e) => setType(e.target.value as 'interview' | 'follow-up' | 'deadline')}
            >
              <option value="interview">Interview</option>
              <option value="follow-up">Follow-up</option>
              <option value="deadline">Deadline</option>
            </select>
          </label>
          <label className="block mb-2">
            Reminder Date:
            <input
              type="datetime-local"
              name="reminderDate"
              className="w-full border rounded p-2"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              required
            />
          </label>
          <label className="block mb-2">
            Remind Before:
            <select
              name="remindBefore"
              className="w-full border rounded p-2"
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
          <label className="block mb-4">
            Message:
            <textarea
              name="message"
              className="w-full border rounded p-2"
              placeholder="Optional message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              disabled={isCreatingReminder}
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
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