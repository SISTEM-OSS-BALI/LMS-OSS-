"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/app/lib/auth/authServices";
import {
  Typography,
  Card,
  Row,
  Col,
  Modal,
  Skeleton,
  Descriptions,
  Grid,
  Divider,
  Radio,
} from "antd";
import {
  VideoCameraOutlined,
  HomeOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useDashboardViewModel } from "./useDashboardViewModel";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import locale from "dayjs/locale/id";
import { Meeting } from "@prisma/client";
import Link from "next/link";

dayjs.extend(utc);
dayjs.locale(locale);

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

export default function DashboardComponent() {
  const { username } = useAuth();
  const { meetingData, isLoadingMeeting, queueData } = useDashboardViewModel();
  const screens = useBreakpoint();
  const [viewMode, setViewMode] = useState<"my" | "all">("my");

  const [selectedEvent, setSelectedEvent] = useState<Meeting | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const events = useMemo(() => {
    const dataToUse = viewMode === "all" ? queueData?.data : meetingData?.data;

    if (!Array.isArray(dataToUse)) return [];

    return dataToUse.map((meeting) => ({
      id: meeting.meeting_id,
      title: `Meeting (${meeting.method})${
        viewMode === "all" && meeting.teacher?.username
          ? ` - ${meeting.teacher.username}`
          : ""
      }`,
      start: dayjs.utc(meeting.startTime).format("YYYY-MM-DD HH:mm"),
      backgroundColor: meeting.method === "ONLINE" ? "#1890ff" : "#52c41a",
      borderColor: "transparent",
      extendedProps: { ...meeting },
    }));
  }, [viewMode, meetingData, queueData]);

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event.extendedProps as Meeting);
    setIsModalVisible(true);
  };

  return (
    <div style={{ margin: "0 auto" }}>
      <Row justify={"center"}>
        <Col xs={24} sm={20} md={16} lg={12}>
          <Card
            bordered={false}
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              background: "#f0f2f5",
              width: "100%",
            }}
          >
            <Title
              level={3}
              style={{
                textAlign: "center",
                marginBottom: "16px",
                color: "#333",
              }}
            >
              Welcome, {username}!
            </Title>
            <Text
              style={{
                display: "block",
                textAlign: "center",
                marginBottom: "24px",
                fontSize: "16px",
                color: "#666",
              }}
            >
              Dont forget to always follow your meeting schedule.
            </Text>
          </Card>
        </Col>
      </Row>

      {isLoadingMeeting ? (
        <Row justify="center" style={{ marginTop: "32px" }}>
          <Col xs={24} sm={22} md={20} lg={18}>
            <Card
              bordered={false}
              style={{ borderRadius: "12px", padding: "16px" }}
            >
              <Skeleton active paragraph={{ rows: 4 }} />
            </Card>
          </Col>
        </Row>
      ) : (
        <Row justify={"center"} style={{ marginTop: "32px" }}>
          <Col xs={24} sm={22} md={20} lg={18}>
            <Card
              bordered={false}
              style={{
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                padding: "16px",
                overflow: "hidden",
              }}
            >
              <div style={{ pointerEvents: "auto" }}>
                <Row justify="space-between" align="middle">
                  <Title level={3}>Meeting Schedule</Title>
                  <Radio.Group
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                    buttonStyle="solid"
                    style={{ marginBottom: 16 }}
                  >
                    <Radio.Button value="my">My Schedule</Radio.Button>
                    <Radio.Button value="all">All Schedule</Radio.Button>
                  </Radio.Group>
                </Row>
                <Divider />
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  events={events}
                  contentHeight="auto"
                  fixedWeekCount={false}
                  displayEventTime={false}
                  eventDisplay="block"
                  eventClick={handleEventClick}
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right:
                      typeof screens.xs === "number" && screens.xs < 768
                        ? ""
                        : "dayGridMonth",
                  }}
                />
              </div>
            </Card>
          </Col>
        </Row>
      )}

      <Modal
        title="Detail Meeting"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width="50%"
      >
        {selectedEvent ? (
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="Metode Meeting">
              {selectedEvent.method === "ONLINE" ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <VideoCameraOutlined
                      style={{
                        color: "#1890ff",
                        marginRight: "8px",
                        fontSize: "16px",
                      }}
                    />
                    <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                      Online Meeting
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "14px", color: "#555" }}>
                    Link:{" "}
                    <Link
                      href={selectedEvent.meetLink || ""}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {selectedEvent.meetLink}
                    </Link>
                  </p>
                </>
              ) : (
                <>
                  <HomeOutlined style={{ color: "#52c41a", marginRight: 8 }} />
                  Offline Meeting
                </>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Waktu Mulai">
              <ClockCircleOutlined style={{ marginRight: 8 }} />
              {dayjs.utc(selectedEvent.startTime).format("HH:mm")}
            </Descriptions.Item>
            <Descriptions.Item label="Waktu Berakhir">
              <ClockCircleOutlined style={{ marginRight: 8 }} />
              {dayjs.utc(selectedEvent.endTime).format("HH:mm")}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Skeleton active />
        )}
      </Modal>
    </div>
  );
}
