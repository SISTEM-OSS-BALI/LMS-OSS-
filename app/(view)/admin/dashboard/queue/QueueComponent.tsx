import { Divider, Tag, Badge, Card, Skeleton, Grid } from "antd";
import { useEffect, useState } from "react";
import { useQueueViewModel } from "./useQueueViewModel";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
dayjs.extend(utc);

const { useBreakpoint } = Grid;

export default function QueueComponent() {
  const { queueData, queueError, isLoadingQueue } = useQueueViewModel();
  const [events, setEvents] = useState([]);
  const screens = useBreakpoint();

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
    const { title, time, teacher, student } = eventInfo.event.extendedProps;

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
        <strong
          style={{
            fontSize: screens.xs ? "12px" : "14px",
            marginBottom: "4px",
          }}
        >
          {time}
        </strong>
        <div
          style={{
            fontSize: screens.xs ? "10px" : "12px",
            fontWeight: "bold",
            marginBottom: "4px",
          }}
        >
          {teacher}
        </div>
        <div
          style={{
            fontSize: screens.xs ? "10px" : "12px",
            fontWeight: "bold",
            marginBottom: "4px",
          }}
        >
          {student}
        </div>
        <div style={{ fontSize: "10px", color: "#666" }}>{title}</div>
      </div>
    );
  };

  return (
    <div
      style={{
        padding: screens.xs ? "20px 12px" : "40px 24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: screens.xs ? "wrap" : "nowrap",
        }}
      >
        <h1
          style={{
            fontSize: screens.xs ? "22px" : "28px",
            fontWeight: "600",
            marginBottom: "10px",
          }}
        >
          Jadwal Pertemuan
        </h1>
      </div>
      <Divider style={{ margin: screens.xs ? "10px 0" : "20px 0" }} />
      <Card
        style={{
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          padding: screens.xs ? "10px" : "20px",
        }}
      >
        {isLoadingQueue ? (
          <Skeleton active paragraph={{ rows: screens.xs ? 3 : 6 }} />
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={screens.xs ? "timeGridDay" : "dayGridMonth"}
            events={events}
            locale={"id"}
            eventContent={renderEventContent}
          />
        )}
      </Card>
    </div>
  );
}
