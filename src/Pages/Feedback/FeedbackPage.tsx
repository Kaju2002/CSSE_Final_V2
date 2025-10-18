import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

type AppointmentInfo = {
  id: number;
  doctorName: string;
  doctorPhoto?: string;
  specialty?: string;
  date?: string;
  clinic?: string;
};

const Star: React.FC<{
  filled: boolean;
  index: number;
  label?: string;
  onActivate: (n: number) => void;
}> = ({ filled, index, label, onActivate }) => {
  return (
    <button
      type="button"
      onClick={() => onActivate(index)}
      aria-label={label ?? `${index} star`}
      aria-pressed={filled}
      className={`w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full transition-shadow transform hover:scale-105 active:scale-95 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2a6bb7] ${
        filled ? 'bg-yellow-400 text-white' : 'bg-white text-gray-400 border border-[#eef3fb]'
      }`}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={filled ? 'currentColor' : 'none'}
        stroke={filled ? 'none' : 'currentColor'}
        strokeWidth={1.5}
        className={filled ? 'text-white' : 'text-gray-400'}
        aria-hidden
      >
        <path d="M12 17.3l6.18 3.73-1.64-7.03L21 9.24l-7.19-.62L12 2 10.19 8.62 3 9.24l4.46 4.76L5.82 21z" />
      </svg>
    </button>
  );
};

const formatSuggestedDate = (base?: string) => {
  const d = base ? new Date(base) : new Date();
  d.setDate(d.getDate() + 14);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const FeedbackPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId?: string }>();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState<AppointmentInfo | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!appointmentId) return;
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/appointments/${appointmentId}`);
        if (res.ok) {
          const data = await res.json();
          if (mounted) setAppointment(data);
          return;
        }
      } catch {
        // ignore; fallback below
      }

      if (mounted)
        setAppointment({
          id: Number(appointmentId),
          doctorName: 'Dr. Oliver Bennett',
          specialty: 'General Medicine',
          date: 'Oct 12, 2024 — 10:00 AM'
        });
    })();

    return () => {
      mounted = false;
    };
  }, [appointmentId]);

  const activate = useCallback((n: number) => setRating(n), []);

  const submit = async () => {
    if (!rating) return;
    setSubmitting(true);
    try {
      // replace with real API call
      await new Promise((r) => setTimeout(r, 600));
      setDone(true);
    } catch {
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="rounded-2xl border border-[#e6eef9] bg-white p-6 text-center shadow-md">
          <div className="text-4xl mb-3">🎉</div>
          <h2 className="text-2xl font-semibold mb-2">Thanks for your feedback</h2>
          <p className="text-sm text-gray-600 mb-4">We really appreciate you taking a moment to tell us about your visit.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/appointments/new')}
              className="bg-[#2a6bb7] text-white px-5 py-2 rounded-xl shadow-sm"
            >
              Book suggested follow-up
            </button>
            <button onClick={() => navigate('/dashboard')} className="text-[#2a6bb7] px-5 py-2 rounded-xl border border-transparent hover:underline">
              Back to dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#1b2b4b]">How was your visit?</h1>
          <p className="text-sm text-gray-500">Tell us about your experience with your doctor.</p>
        </div>
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500">Close</button>
      </div>

      <section className="bg-white rounded-2xl border border-[#e6eef9] p-4 mb-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#e8f1ff] to-[#eef7ff] flex items-center justify-center text-2xl">👩‍⚕️</div>
          <div className="flex-1">
            <div className="text-lg font-medium text-[#17325a]">{appointment?.doctorName ?? 'Dr. —'}</div>
            <div className="text-sm text-gray-500">{appointment?.specialty ?? 'General Medicine'}</div>
            <div className="text-xs text-gray-400">{appointment?.date ?? ''}</div>
          </div>
          <div className="text-xs text-gray-400">Visited</div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-[#e6eef9] p-6 shadow-sm mb-6">
        <label className="block text-sm font-medium mb-3">Rate your experience</label>
        <div
          role="radiogroup"
          aria-label="Rate your experience"
          tabIndex={0}
          onKeyDown={(e) => {
            // keyboard navigation: ArrowLeft / ArrowRight / Home / End / Enter
            if (e.key === 'ArrowRight') {
              e.preventDefault();
              setRating((r) => Math.min(5, (r || 0) + 1));
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault();
              setRating((r) => Math.max(1, (r || 1) - 1));
            } else if (e.key === 'Home') {
              e.preventDefault();
              setRating(1);
            } else if (e.key === 'End') {
              e.preventDefault();
              setRating(5);
            }
          }}
          onMouseLeave={() => setHover(null)}
          className="flex items-center gap-3"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="flex-shrink-0" onMouseEnter={() => setHover(n)}>
              <Star
                index={n}
                filled={!!(hover ? n <= hover : rating ? n <= rating : false)}
                onActivate={activate}
                label={`${n} star${n > 1 ? 's' : ''}`}
              />
            </div>
          ))}

          <div className="ml-4 text-sm text-gray-600" aria-live="polite">
            {rating ? (
              <strong className="text-[#17325a]">{['Very poor','Poor','Okay','Good','Excellent'][rating-1]} · {rating}/5</strong>
            ) : (
              <span className="text-gray-400">Tap or use ← → to rate</span>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-[#e6eef9] p-6 shadow-sm mb-6">
        <label className="block text-sm font-medium mb-2">Optional feedback</label>
        <textarea
          aria-label="Optional feedback"
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, 500))}
          placeholder="What went well? What could we improve? (optional)"
          className="w-full min-h-[120px] p-3 rounded-md border border-[#e6eef9] resize-none focus:outline-none focus:ring-2 focus:ring-[#dceefe]"
        />
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-gray-400">Optional</div>
          <div className="text-xs text-gray-400">{comment.length}/500</div>
        </div>
      </section>

      <footer className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={submit}
            disabled={!rating || submitting}
            className="flex-1 sm:flex-none bg-[#2a6bb7] text-white px-5 py-3 rounded-xl shadow-sm disabled:opacity-60"
          >
            {submitting ? 'Sending…' : 'Send feedback'}
          </button>
          <button
            onClick={() => navigate('/appointments/new')}
            className="flex-1 sm:flex-none border border-[#d8eaf8] px-5 py-3 rounded-xl"
          >
            Book follow-up ({formatSuggestedDate(appointment?.date)})
          </button>
        </div>

        <button className="text-sm text-gray-500" onClick={() => navigate('/dashboard')}>
          Skip for now
        </button>
      </footer>
    </main>
  );
};

export default FeedbackPage;
