import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Star as StarIcon } from 'lucide-react';

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
      className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-transparent rounded-full transition-all duration-150 transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2a6bb7]`}
      style={{ boxShadow: filled ? '0 2px 8px 0 #facc15aa' : 'none' }}
    >
      <StarIcon
        size={36}
        strokeWidth={1.5}
        fill={filled ? '#facc15' : 'none'}
        className={filled ? 'text-yellow-400' : 'text-gray-300'}
        aria-hidden
      />
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
  <main className="max-w-2xl mx-auto p-3 sm:p-6">
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2 sm:gap-0">
        <div>
          <h1 className="text-2xl font-semibold text-[#1b2b4b]">How was your visit?</h1>
          <p className="text-sm text-gray-500">Tell us about your experience with your doctor.</p>
        </div>
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500">Close</button>
      </div>

      <section className="bg-white rounded-2xl border border-[#e6eef9] p-4 mb-6 shadow-sm">
        <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3 xs:gap-4">
          <div className="w-14 h-14 xs:w-16 xs:h-16 rounded-full bg-gradient-to-br from-[#e8f1ff] to-[#eef7ff] flex items-center justify-center text-2xl">👩‍⚕️</div>
          <div className="flex-1">
            <div className="text-base xs:text-lg font-medium text-[#17325a]">{appointment?.doctorName ?? 'Dr. —'}</div>
            <div className="text-xs xs:text-sm text-gray-500">{appointment?.specialty ?? 'General Medicine'}</div>
            <div className="text-xs text-gray-400">{appointment?.date ?? ''}</div>
          </div>
          <div className="text-xs text-gray-400 hidden xs:block">Visited</div>
        </div>
      </section>

  <section className="bg-white rounded-2xl border border-[#e6eef9] p-4 sm:p-6 shadow-sm mb-6">
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
          className="flex flex-wrap items-center gap-2 sm:gap-3"
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

  <section className="bg-white rounded-2xl border border-[#e6eef9] p-4 sm:p-6 shadow-sm mb-6">
        <label className="block text-sm font-medium mb-2">Optional feedback</label>
        <textarea
          aria-label="Optional feedback"
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, 500))}
          placeholder="What went well? What could we improve? (optional)"
          className="w-full min-h-[100px] p-2 sm:p-3 rounded-md border border-[#e6eef9] resize-none focus:outline-none focus:ring-2 focus:ring-[#dceefe] text-sm"
        />
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-gray-400">Optional</div>
          <div className="text-xs text-gray-400">{comment.length}/500</div>
        </div>
      </section>

      <footer className="flex flex-col sm:flex-row gap-3 items-center justify-between mt-2">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={submit}
            disabled={!rating || submitting}
            className="flex-1 sm:flex-none bg-[#2a6bb7] text-white px-4 py-3 rounded-xl shadow-sm disabled:opacity-60 text-sm"
          >
            {submitting ? 'Sending…' : 'Send feedback'}
          </button>
          <button
            onClick={() => navigate('/appointments/new')}
            className="flex-1 sm:flex-none border border-[#d8eaf8] px-4 py-3 rounded-xl text-sm"
          >
            Book follow-up ({formatSuggestedDate(appointment?.date)})
          </button>
        </div>

        <button className="text-sm text-gray-500 mt-2 sm:mt-0" onClick={() => navigate('/dashboard')}>
          Skip for now
        </button>
      </footer>
    </main>
  );
};

export default FeedbackPage;
