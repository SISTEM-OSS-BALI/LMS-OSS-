import {
  Divider,
  Card,
  Skeleton,
  Grid,
  Typography,
  Modal,
  Descriptions,
} from "antd";
import { useEffect, useState } from "react";
import { useQueueViewModel } from "./useQueueViewModel";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import FullCalendar from "@fullcalendar/react";
import { EventClickArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { UserOutlined, BookOutlined } from "@ant-design/icons";
const { Title, Text } = Typography;

interface QueueEvent {
  id: string;
  title: string;
  start: string;
  allDay: boolean;
  backgroundColor: string;
  timeStart: string;
  timeEnd: string;
  teacher: string;
  teacher_count: number;
  student: string;
  student_count: number;
  name_program: string;
}

dayjs.extend(utc);

const { useBreakpoint } = Grid;

export default function QueueComponent() {
  const { queueData, queueError, isLoadingQueue } = useQueueViewModel();
  const [events, setEvents] = useState<QueueEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<QueueEvent | null>(null);
  const screens = useBreakpoint();

  useEffect(() => {
    if (queueData?.data) {
      const formattedEvents = queueData.data.map((item: any) => ({
        id: item.meeting_id,
        title: `${item.teacher.username} - ${item.student.username}`,
        start: dayjs.utc(item.dateTime).format("YYYY-MM-DD HH:mm"),
        allDay: false,
        backgroundColor: item.is_started === true ? "#ff4d4f" : "#52c41a",
        timeStart: dayjs.utc(item.startTime).format("HH:mm"),
        timeEnd: dayjs.utc(item.endTime).format("HH:mm"),
        teacher: item.teacher.username,
        teacher_count: item.teacher.count_program,
        student: item.student.username,
        student_count: item.student.count_program,
        name_program: item.name_program,
      }));
      setEvents(formattedEvents);
    }
  }, [queueData]);

  const renderEventContent = (eventInfo: any) => {
    const { timeStart, timeEnd, teacher, student } =
      eventInfo.event.extendedProps;

    return (
      <div
        style={{
          position: "relative",
          background: "#fff",
          borderRadius: "10px",
          padding: "10px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          minHeight: "60px",
          width: "100%",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-10px",
            left: "10px",
            background: "#1677ff",
            color: "#fff",
            fontWeight: "bold",
            padding: "2px 10px",
            borderRadius: "8px",
            fontSize: "12px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        >
          {timeStart} - {timeEnd}
        </div>

        <div
          style={{
            marginTop: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            textAlign: "center",
          }}
        >
          <Typography.Text
            strong
            style={{ alignItems: "center", color: "#c08c3e", fontSize: "14px" }}
          >
            {teacher}
          </Typography.Text>
          <Typography.Text
            strong
            style={{ color: "#1677ff", fontSize: "14px" }}
          >
            {student}
          </Typography.Text>
        </div>
      </div>
    );
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    setSelectedEvent(clickInfo.event.extendedProps as QueueEvent);
    setIsModalOpen(true);
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
          <div
            style={{
              overflowX: "auto",
              overflowY: "hidden",
              minWidth: "100%",
              touchAction: "pan-x",
              WebkitOverflowScrolling: "touch",
              display: "flex",
            }}
          >
            <div style={{ minWidth: "1300px", pointerEvents: "auto" }}>
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={screens.xs ? "timeGridDay" : "dayGridMonth"}
                events={events}
                locale={"id"}
                eventContent={renderEventContent}
                eventClick={handleEventClick}
              />
            </div>
          </div>
        )}
      </Card>

      <Modal
        title={
          <Title level={4} style={{ marginBottom: 0 }}>
            Detail Pertemuan
          </Title>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        {selectedEvent && (
          <Descriptions
            bordered
            column={1}
            size="middle"
            layout="vertical"
            style={{ marginTop: 12 }}
          >
            <Descriptions.Item
              label={
                <span>
                  <BookOutlined /> Nama Program
                </span>
              }
            >
              <Text>{selectedEvent.name_program || "-"}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="Total Pertemuan">
              <Text>{selectedEvent.student_count}</Text>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
