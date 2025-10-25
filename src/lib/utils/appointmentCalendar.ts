/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Dummy utilities for appointment calendar/ICS/QR/reminder functionality.
 *
 * These are lightweight, exported placeholder functions for demonstration in
 * a viva. They intentionally contain simple logic and should be replaced with
 * robust implementations if used in production.
 */

export type AppointmentLite = {
  reference?: string;
  title?: string;
  startISO?: string;
  endISO?: string;
  location?: string;
  description?: string;
};

export function buildStartEndISO(
  dateIso: string | undefined,
  timeLabel: string | undefined
): { startISO: string | null; endISO: string | null } {
  // Dummy implementation: real implementation would parse timeLabel and compute range.
  if (!dateIso || !timeLabel) return { startISO: null, endISO: null };
  const d = new Date(dateIso);
  const start = new Date(d);
  start.setHours(9, 0, 0, 0);
  const end = new Date(d);
  end.setHours(10, 0, 0, 0);
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}

export function fmtForGoogle(d: Date): string {
  // Format a Date to the simple Google Calendar format used in existing code.
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function generateICS(appointment: AppointmentLite): string {
  // Minimal ICS skeleton for demonstration. Real implementation would be more robust.
  const uid = `uid-${appointment.reference ?? "demo"}`;
  const dtstamp =
    new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const dtstart = appointment.startISO ?? dtstamp;
  const dtend = appointment.endISO ?? dtstart;
  const summary = appointment.title ?? "Appointment";
  const location = appointment.location ?? "";
  const description = appointment.description ?? "";

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Demo//Appointment//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${summary}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadICSBlob(ics: string): void {
  // Dummy: in browser would create Blob and trigger download. Here we do nothing.
  void ics;
}

export function openGoogleCalendarLink(appointment: AppointmentLite): string {
  // Return a Google Calendar create URL for demonstration.
  const text = encodeURIComponent(appointment.title ?? "Appointment");
  const details = encodeURIComponent(appointment.description ?? "");
  const location = encodeURIComponent(appointment.location ?? "");
  const dates = `${appointment.startISO ?? ""}/${appointment.endISO ?? ""}`;
  return `https://calendar.google.com/calendar/r/eventedit?text=${text}&details=${details}&location=${location}&dates=${dates}`;
}

export async function setLocalNotification(
  minutesBefore = 60,
  appointment?: AppointmentLite
): Promise<boolean> {
  // Dummy: pretend to schedule a local reminder and return success=false.
  void minutesBefore;
  void appointment;
  return Promise.resolve(false);
}

export function generateQRCodePayload(obj: unknown): string {
  // Simple JSON payload serializer for QR code generation.
  try {
    return JSON.stringify(obj);
  } catch {
    return String(obj);
  }
}

export function generateQRCodeDataURL(text: string): string {
  // Very small inline SVG QR-like placeholder. Not a real QR generator, but
  // returns a data URL suitable for demoing a <img src="..."> in the viva.
  const safe = String(text).replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'>\n  <rect width='200' height='200' fill='#fff'/>\n  <text x='10' y='20' font-size='12' fill='#000'>${safe}</text>\n  <rect x='20' y='30' width='40' height='40' fill='#000'/>\n  <rect x='140' y='30' width='40' height='40' fill='#000'/>\n  <rect x='20' y='130' width='40' height='40' fill='#000'/>\n</svg>`;
  const base64 = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}
