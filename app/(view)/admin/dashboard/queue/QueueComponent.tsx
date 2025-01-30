import { Divider, Tag, Badge, Card } from "antd";
import { useEffect, useState } from "react";
import { useQueueViewModel } from "./useQueueViewModel";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Loading from "@/app/components/Loading";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
dayjs.extend(utc);

export default function QueueComponent() {
  const { queueData, queueError } = useQueueViewModel();
  const isLoading = !queueData && !queueError;
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (queueData?.data) {
      const formattedEvents = queueData.data.map((item: any) => ({
        id: item.meeting_id,
        title: `${item.teacher.username} - ${item.student.username}`,
        start: item.dateTime,
        allDay: false,
        backgroundColor: item.absent === true ? "#ff4d4f" : "#52c41a",
        time: dayjs.utc(item.dateTime).format("HH:mm"),
        teacher: item.teacher.username,
        student: item.student.username,
      }));
      setEvents(formattedEvents);
    }
  }, [queueData]);

  const renderEventContent = (eventInfo: any) => {
    const { title, start, time, teacher, student } =
      eventInfo.event.extendedProps;

    return (
      <div
        style={{
          backgroundColor: "#fff",
          padding: "12px",
          borderRadius: "8px",
          boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          width: "100%",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
      >
        <strong style={{ fontSize: "14px", marginBottom: "4px" }}>
          {time}
        </strong>
        <div
          style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}
        >
          {teacher}
        </div>
        <div
          style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}
        >
          {student}
        </div>
        <div style={{ fontSize: "10px", color: "#666" }}>{title}</div>
      </div>
    );
  };

  return (
    <div style={{ padding: "40px 20px", fontFamily: "Arial, sans-serif" }}>
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1
          style={{ fontSize: "28px", fontWeight: "600", marginBottom: "10px" }}
        >
          Jadwal Pertemuan
        </h1>
      </div>
      <Divider style={{ margin: "20px 0" }} />
      <Card
        style={{
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          padding: "20px",
        }}
      >
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          locale={"id"}
          eventContent={renderEventContent}
        />
      </Card>
    </div>
  );
}
