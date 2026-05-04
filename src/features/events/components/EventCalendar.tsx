import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

type CalendarEvent = { id: string; title: string; date: string };

type Props = {
  events: CalendarEvent[];
};

export default function EventCalendar({ events }: Props) {
  return (
    <div className="p-3">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        height="70vh"
      />
    </div>
  );
}
