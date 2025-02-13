import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Title from "antd/es/typography/Title";
import { Card, Divider, Skeleton, Grid } from "antd";
import { useCalendarViewModel } from "./useCalendarViewModel";
dayjs.extend(utc);

export default function CalendarTeacherComponent() {
  const {
    events,
    isLoading,
    regionColorMapping,
    showScheduleTeacherAll,
    dataTeacher,
    isLoadingSchedule,
  } = useCalendarViewModel();

  const { useBreakpoint } = Grid;

  const renderEventContent = (eventInfo: any) => {
    const { teacherName, startTime, endTime, region } =
      eventInfo.event.extendedProps;
    const regionColor =
      regionColorMapping[region as keyof typeof regionColorMapping];

    return (
      <div
        style={{
          backgroundColor: regionColor,
          color: "#fff",
          padding: "4px",
          textAlign: "center",
          boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
      >
        <strong
          style={{ fontSize: "14px" }}
        >{`${startTime} - ${endTime}`}</strong>
        <div style={{ fontSize: "14px", fontWeight: "bold" }}>
          {teacherName}
        </div>
      </div>
    );
  };

  const screens = useBreakpoint();

  return (
    <div style={{ padding: screens.xs ? "12px" : "24px" }}>
      <Title level={3}>Kalender Guru</Title>
      <Divider />
      <Card
        style={{
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          padding: "20px",
        }}
      >
        {isLoading || isLoadingSchedule ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            showNonCurrentDates={false}
            events={events}
            contentHeight="auto"
            eventContent={renderEventContent}
            locale={"id"}
          />
        )}
      </Card>
    </div>
  );
}
