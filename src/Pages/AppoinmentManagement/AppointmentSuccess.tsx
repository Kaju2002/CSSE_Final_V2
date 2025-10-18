import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { CalendarClock, MapPin, Stethoscope, UserRound } from "lucide-react";
import Button from "../../ui/Button";
import { useAppointmentBooking } from "../../contexts/AppointmentBookingContext";
import AppointmentWizardHeader from "./AppointmentWizardHeader";

const formatDateLabel = (isoDate: string | undefined): string => {
  if (!isoDate) {
    return "Not selected";
  }

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "Not selected";
  }

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const AppointmentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state: bookingState, resetBooking } = useAppointmentBooking();
  const navigationPayload =
    (location.state as {
      appointmentReference?: string;
      confirmedAt?: string;
    } | null) ?? null;

  const selectedSlot = bookingState.slot;
  const hospital = bookingState.hospital;
  const department = bookingState.department;
  const doctor = bookingState.doctor;
  const reasonForVisit = bookingState.reasonForVisit;
  const additionalNotes = bookingState.additionalNotes;

  const fallbackReference = useMemo(() => {
    if (!hospital || !doctor || !selectedSlot) {
      return "";
    }

    const hospitalCode = hospital.name
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 4)
      .padEnd(4, "X");
    const doctorCode = (doctor.name ?? doctor.id)
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 4)
      .padEnd(4, "X");
    const slotDate = new Date(selectedSlot.date);
    const dateCode = Number.isNaN(slotDate.getTime())
      ? "00000000"
      : slotDate.toISOString().slice(0, 10).replace(/-/g, "");
    const sequence = Math.floor(Math.random() * 900 + 100).toString();
    return `${hospitalCode}-${doctorCode}-${dateCode}-${sequence}`;
  }, [doctor, hospital, selectedSlot]);

  const appointmentReference =
    navigationPayload?.appointmentReference ?? fallbackReference;
  const confirmedAt = navigationPayload?.confirmedAt ?? null;

  const isInvalid =
    !hospital ||
    !department ||
    !doctor ||
    !selectedSlot ||
    !appointmentReference;

  useEffect(() => {
    if (isInvalid) {
      navigate("/appointments", { replace: true });
    }
  }, [isInvalid, navigate]);

  const formattedDate = formatDateLabel(selectedSlot?.date);
  const slotTime = selectedSlot?.timeLabel ?? "--";
  const hospitalLabel = hospital?.name ?? "Hospital not provided";
  const departmentLabel = department?.name ?? "General Consultation";

  const qrValue = useMemo(() => {
    if (!appointmentReference) {
      return "{}";
    }

    const payload = {
      reference: appointmentReference,
      hospitalId: hospital?.id ?? null,
      hospitalName: hospital?.name ?? null,
      hospitalAddress: hospital?.address ?? null,
      hospitalPhone: hospital?.phone ?? null,
      departmentSlug: department?.slug ?? null,
      departmentName: department?.name ?? null,
      doctorId: doctor?.id ?? null,
      doctorName: doctor?.name ?? null,
      doctorTitle: doctor?.title ?? null,
      date: selectedSlot?.date ?? null,
      timeLabel: selectedSlot?.timeLabel ?? null,
      reasonForVisit: reasonForVisit || null,
      confirmedAt,
    };

    return JSON.stringify(payload);
  }, [
    appointmentReference,
    confirmedAt,
    department?.name,
    department?.slug,
    doctor?.id,
    doctor?.name,
    doctor?.title,
    hospital?.address,
    hospital?.id,
    hospital?.name,
    hospital?.phone,
    reasonForVisit,
    selectedSlot?.date,
    selectedSlot?.timeLabel,
  ]);

  // ----------------- Calendar & Reminder helpers (UI-only) -----------------
  const buildStartEndISO = () => {
    const isoDate = bookingState.slot?.date;
    const timeLabel = bookingState.slot?.timeLabel;
    if (!isoDate || !timeLabel) return null;

    const date = new Date(isoDate);
    const m = timeLabel.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!m) return null;
    let hours = Number(m[1]);
    const minutes = Number(m[2]);
    const ampm = m[3].toUpperCase();
    if (ampm === "PM" && hours !== 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;

    const start = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hours,
      minutes,
      0
    );
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    return { start, end };
  };

  const fmtForGoogle = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const openGoogleCalendar = () => {
    const ev = buildStartEndISO();
    if (!ev) {
      alert("Missing appointment date/time");
      return;
    }
    const title = encodeURIComponent(
      `Appointment: ${doctor?.name ?? "Doctor"}`
    );
    const details = encodeURIComponent(
      `Ref: ${appointmentReference}\n${departmentLabel}`
    );
    const location = encodeURIComponent(hospital?.address ?? "");
    const dates = `${fmtForGoogle(ev.start)}/${fmtForGoogle(ev.end)}`;
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}&sf=true&output=xml`;
    window.open(url, "_blank");
  };

  const downloadICS = () => {
    const ev = buildStartEndISO();
    if (!ev) {
      alert("Missing appointment date/time");
      return;
    }
    const uid = appointmentReference || `appt-${Date.now()}`;
    const dtstamp =
      new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const dtstart =
      ev.start.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const dtend = ev.end.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const title = `Appointment with ${doctor?.name ?? "Doctor"}`;
    const description = `Reference: ${appointmentReference}\n${departmentLabel}`;
    const location = hospital?.address ?? "";

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//CSSE_Hospital_V2//EN",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `${uid}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  };

  const setReminderLocal = async (minutesBefore = 60) => {
    const ev = buildStartEndISO();
    if (!ev) {
      alert("Missing appointment date/time");
      return;
    }
    const remindAt = new Date(
      ev.start.getTime() - minutesBefore * 60 * 1000
    ).toISOString();
    const key = "local_reminders";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.push({
      appointmentReference,
      remindAt,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(key, JSON.stringify(existing));

    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const ms = new Date(remindAt).getTime() - Date.now();
        if (ms > 0 && ms < 2147483647) {
          setTimeout(() => {
            new Notification("Appointment reminder", {
              body: `You have an appointment with ${
                doctor?.name ?? "Doctor"
              } at ${selectedSlot?.timeLabel}`,
            });
          }, ms);
        }
      }
    }

    alert(
      `Reminder saved (${minutesBefore} minutes before). For reliable reminders, enable notifications or set up server reminders later.`
    );
  };

  if (isInvalid) {
    return null;
  }

  const handleViewAppointments = () => {
    resetBooking();
    navigate("/appointments");
  };

  const handleMakeAnother = () => {
    resetBooking();
    navigate("/appointments/new");
  };

  return (
    <div className="space-y-8">
      <AppointmentWizardHeader completed />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section className="space-y-6 rounded-3xl border border-[#dce6fb] bg-white p-6 shadow-[0_32px_88px_-60px_rgba(21,52,109,0.55)]">
          <header className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7d8db2]">
              Appointment Details
            </p>
            <h2 className="text-xl font-semibold text-[#132b53]">
              Here is a summary of your visit
            </h2>
          </header>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#edf2ff] bg-[#f8faff] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8a96b5]">
                Reference Number
              </p>
              <p className="mt-1 text-lg font-semibold text-[#1b2b4b]">
                {appointmentReference}
              </p>
            </div>
            <div className="rounded-2xl border border-[#edf2ff] bg-[#f8faff] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8a96b5]">
                Doctor
              </p>
              <p className="mt-1 text-base font-semibold text-[#1b2b4b]">
                {doctor ? doctor.name : "Doctor not available"}
              </p>
              <p className="text-xs text-[#6f7d95]">
                {doctor
                  ? doctor.title
                  : "Select a doctor from the previous step"}
              </p>
            </div>
            <div className="rounded-2xl border border-[#edf2ff] bg-[#f8faff] p-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#8a96b5]">
                <MapPin className="h-4 w-4 text-[#3b54a4]" />
                Hospital
              </p>
              <p className="mt-1 text-base font-semibold text-[#1b2b4b]">
                {hospitalLabel}
              </p>
              <p className="text-xs text-[#6f7d95]">
                {hospital?.address ??
                  "Address details will be shared via email."}
              </p>
            </div>
            <div className="rounded-2xl border border-[#edf2ff] bg-[#f8faff] p-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#8a96b5]">
                <CalendarClock className="h-4 w-4 text-[#3b54a4]" />
                Date &amp; Time
              </p>
              <p className="mt-1 text-base font-semibold text-[#1b2b4b]">
                {formattedDate}
              </p>
              <p className="text-xs text-[#6f7d95]">{slotTime}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-[#edf2ff] bg-[#f8faff] p-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#8a96b5]">
              <Stethoscope className="h-4 w-4 text-[#3b54a4]" />
              Service
            </p>
            <p className="mt-1 text-base font-semibold text-[#1b2b4b]">
              {departmentLabel}
            </p>
            {reasonForVisit ? (
              <p className="text-xs text-[#6f7d95]">Reason: {reasonForVisit}</p>
            ) : null}
          </div>
          {additionalNotes ? (
            <div className="rounded-2xl border border-[#edf2ff] bg-[#f8faff] p-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#8a96b5]">
                <UserRound className="h-4 w-4 text-[#3b54a4]" />
                Additional Notes
              </p>
              <p className="mt-1 text-sm text-[#1b2b4b]">{additionalNotes}</p>
            </div>
          ) : null}
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-[#dce6fb] bg-white p-6 text-center shadow-[0_24px_70px_-52px_rgba(21,52,109,0.45)]">
            <header className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#7d8db2]">
                Check-in QR Code
              </p>
              <h2 className="text-lg font-semibold text-[#132b53]">
                Scan at reception for quick check-in
              </h2>
            </header>
            <div
              className="mx-auto mt-4 w-fit rounded-2xl border border-[#dbe5ff] bg-white p-4 shadow-[0_18px_60px_-48px_rgba(21,52,109,0.38)]"
              style={{ willChange: "transform" }}
            >
              <QRCodeCanvas
                value={qrValue}
                size={180}
                level="M"
                includeMargin
                fgColor="#1f4f8a"
                bgColor="#ffffff"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
            <p className="mt-4 text-xs text-[#6f7d95]">
              Show this code on arrival. The reception team will pull up your
              booking instantly.
            </p>
            <div className="mt-4">
              <span className="rounded-full bg-[#f2f6ff] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#3b54a4]">
                Reference: {appointmentReference}
              </span>
            </div>

            {/* Calendar & Reminder buttons (UI-only) */}
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              <button
                type="button"
                onClick={openGoogleCalendar}
                className="h-10 rounded-md border px-4 text-sm bg-white hover:bg-slate-50"
              >
                Add to Google Calendar
              </button>

              <button
                type="button"
                onClick={downloadICS}
                className="h-10 rounded-md border px-4 text-sm bg-white hover:bg-slate-50"
              >
                Download .ics
              </button>

              <button
                type="button"
                onClick={() => setReminderLocal(60)}
                className="h-10 rounded-md border px-4 text-sm bg-[#f4f8ff] hover:bg-[#eef6ff]"
              >
                Set Reminder (1 hour)
              </button>

              <button
                type="button"
                onClick={() => setReminderLocal(24 * 60)}
                className="h-10 rounded-md border px-4 text-sm bg-[#f4f8ff] hover:bg-[#eef6ff]"
              >
                Set Reminder (1 day)
              </button>
            </div>
          </div>
          <div className="rounded-3xl border border-[#dce6fb] bg-white p-5 text-left text-xs text-[#5c6d92] shadow-[0_32px_88px_-60px_rgba(21,52,109,0.55)]">
            <p>
              Full confirmation details have been sent to your registered email
              and phone number.
            </p>
          </div>
        </aside>
      </div>

      <footer className="flex flex-col gap-3 border-t border-[#e0e8fb] bg-white/90 px-6 py-5 backdrop-blur md:flex-row md:items-center md:justify-between">
        <div className="text-xs text-[#7082a9]">
          Need to make changes? Contact the hospital at{" "}
          {hospital?.phone ?? "(contact info pending)"} with your reference
          number.
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            onClick={handleViewAppointments}
            className="h-11 rounded-xl border border-[#cfd9f1] bg-[#f5f8ff] px-6 text-sm font-semibold !text-[#1f4f8a] shadow-none hover:bg-[#e7f0ff]"
          >
            View My Appointments
          </Button>
          <Button
            type="button"
            onClick={handleMakeAnother}
            className="h-11 rounded-xl bg-[#1f4f8a] px-6 text-sm font-semibold text-white hover:bg-[#1d4476]"
          >
            Make Another Appointment
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default AppointmentSuccess;
