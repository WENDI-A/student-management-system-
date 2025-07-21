"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { CalendarDays } from "lucide-react";

// Mock data for schedule
const scheduleEvents = [
  { title: "Math", start: "2024-07-22T09:00:00", end: "2024-07-22T10:30:00", color: "#2563eb", instructor: "Mr. Smith" },
  { title: "English", start: "2024-07-23T11:00:00", end: "2024-07-23T12:30:00", color: "#22c55e", instructor: "Ms. Johnson" },
  { title: "Science", start: "2024-07-24T13:00:00", end: "2024-07-24T14:30:00", color: "#f59e42", instructor: "Dr. Lee" },
  { title: "History", start: "2024-07-25T09:00:00", end: "2024-07-25T10:30:00", color: "#a21caf", instructor: "Mrs. Brown" },
];

export default function ParentDashboard() {
  const [isDark, setIsDark] = useState(false);
  return (
    <div className="p-2 sm:p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Calendar */}
      <Card className="rounded-2xl shadow">
        <CardHeader className="flex flex-row items-center gap-2">
          <CalendarDays className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <CardTitle>Your Child’s Schedule</CardTitle>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          <div className="w-full overflow-x-auto">
            <div className="min-w-[320px] md:min-w-0">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin]}
                initialView="timeGridWeek"
                height={400}
                events={scheduleEvents}
                headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay" }}
                eventContent={renderEventContent}
                themeSystem={isDark ? "dark" : "standard"}
                dayMaxEvents={2}
                eventDisplay="block"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl shadow">
        <CardHeader>
          <CardTitle>Welcome to your Parent Dashboard!</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-600 dark:text-gray-300 text-base md:text-lg">Check your child’s class schedule above. Use the sidebar to view assessments and grades.</div>
        </CardContent>
      </Card>
    </div>
  );
}

function renderEventContent(eventInfo: any) {
  return (
    <div className="flex items-center gap-2">
      <span className="block w-2 h-2 rounded-full" style={{ backgroundColor: eventInfo.event.backgroundColor || eventInfo.event.borderColor || "#2563eb" }}></span>
      <span className="font-medium text-xs">{eventInfo.event.title}</span>
      <span className="ml-2 text-xs text-gray-300 dark:text-gray-500">{eventInfo.event.extendedProps?.instructor}</span>
    </div>
  );
} 