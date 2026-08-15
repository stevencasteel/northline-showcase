export const appointmentConfig = {
  advanceNoticeHours: 24,
  businessDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  windows: [
    { id: "morning", label: "Morning", start: "08:00", end: "12:00" },
    { id: "afternoon", label: "Afternoon", start: "12:00", end: "16:00" },
    {
      id: "late-afternoon",
      label: "Late afternoon",
      start: "16:00",
      end: "18:00",
    },
  ],
  serviceOptions: [
    "Roof inspection",
    "Repair",
    "Replacement",
    "Custom fabrication",
    "Commercial roofing",
  ],
} as const;

export const appointmentHoursLabel = "Mon–Fri, 8am–6pm";
