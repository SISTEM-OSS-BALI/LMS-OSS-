import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import Loading from "@/app/components/Loading";
import Title from "antd/es/typography/Title";
import { Card, Divider } from "antd";
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

  return (
    <div style={{ padding: "20px" }}>
      {isLoading && isLoadingSchedule ? (
        <Loading />
      ) : (
        <>
          <Title level={3}>Kalender Guru</Title>
          <Divider />
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
              editable={true}
              selectable={true}
              showNonCurrentDates={false}
              events={events}
              contentHeight="auto"
              eventContent={renderEventContent}
              locale={"id"}
            />
            <style jsx global>{`
              .fc .fc-daygrid-event {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }

              .fc .fc-daygrid-day-frame {
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                align-items: stretch;
              }

              .fc .fc-daygrid-day-frame > div {
                flex-grow: 1;
                flex-shrink: 1;
              }
            `}</style>
          </Card>
        </>
      )}
    </div>
  );
}
