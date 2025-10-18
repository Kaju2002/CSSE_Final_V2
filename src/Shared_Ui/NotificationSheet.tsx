import React, { useState } from 'react';
import { CalendarCheck, FlaskConical, MessageCircle } from 'lucide-react';

// NotificationSheet with enhancements
const NotificationSheet: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'appointment', text: 'Your appointment with Dr. Sarah Chen is confirmed.', time: '2 hours ago', unread: true },
    { id: 2, type: 'lab', text: 'Lab results are available for viewing.', time: 'Yesterday', unread: true },
    { id: 3, type: 'feedback', text: 'Your feedback was received. Thank you!', time: '2 days ago', unread: false },
  ]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };
  const handleClearAll = () => {
    setNotifications([]);
  };

  if (!open) return null;
  return (
    <aside className="fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl border-l border-[#e1eaf5] flex flex-col md:max-w-sm sm:max-w-full sm:w-full">
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#e1eaf5]">
        <h2 className="text-lg font-semibold text-[#1b2b4b]">Notifications</h2>
        <div className="flex gap-2">
          <button
            type="button"
            className="text-xs text-[#2a6bb7] bg-[#eef4ff] px-2 py-1 rounded hover:bg-[#e0eaff]"
            onClick={handleMarkAllRead}
          >
            Mark all as read
          </button>
          <button
            type="button"
            className="text-xs text-[#c0392b] bg-[#f9e9e9] px-2 py-1 rounded hover:bg-[#f5d6d6]"
            onClick={handleClearAll}
          >
            Clear all
          </button>
          <button
            type="button"
            className="text-[#2a6bb7] hover:text-[#1f4f8a] text-xl font-bold ml-2"
            aria-label="Close notifications"
            onClick={onClose}
          >
            ×
          </button>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center text-[#7f8dab] py-8">No notifications.</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
                n.unread ? 'border-[#2a6bb7] bg-[#eef4ff]' : 'border-[#e4e9fb] bg-[#f7f9ff]'
              }`}
            >
              <span className="mt-1">
                {n.type === 'appointment' && <CalendarCheck className="h-5 w-5 text-[#2a6bb7]" />}
                {n.type === 'lab' && <FlaskConical className="h-5 w-5 text-[#4d92ff]" />}
                {n.type === 'feedback' && <MessageCircle className="h-5 w-5 text-[#1f4f8a]" />}
              </span>
              <div className="flex-1">
                <p className="font-semibold flex items-center gap-2">
                  {n.text}
                  {n.unread && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-[#ffb400]" title="Unread" />}
                </p>
                <span className="text-xs text-[#6f7d95]">{n.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default NotificationSheet;
