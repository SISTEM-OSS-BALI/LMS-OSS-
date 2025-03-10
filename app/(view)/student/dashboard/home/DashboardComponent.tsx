"use client";

import {
  Typography,
  Modal,
  Badge,
  Card,
  Row,
  Col,
  List,
  Button,
  Alert,
  Space,
  Skeleton,
  Divider,
  Tag,
} from "antd";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useMeetings } from "./useMeetingViewModel";
import Link from "next/link";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ReadOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/app/lib/auth/authServices";
import { useEffect, useState } from "react";

const { Title, Text } = Typography;

export default function HomeStudent() {
  const { username } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const {
    isModalVisible,
    selectedEvent,
    handleEventClick,
    handleModalClose,
    events,
    mergedData,
    startQuiz,
    mergedDataCourse,
    handleStartTest,
    isTestModalVisible,
    setIsTestModalVisible,
    selectedTest,
    mergedDataMockTest,
    handleModalCloseTest,
    isLoadingAccess,
    isLoadingPlacemenet,
    isLoadingAccessCourse,
    isLoadingDataTeacher,
    isLoadingMock,
    isLoadingCourse,
    isLoadingAccessMock,
    isLoadingShowMeetingById,
    checkMeetingToday,
  } = useMeetings();

  const renderEventContent = (eventInfo: any) => {
    const { teacherName, time } = eventInfo.event.extendedProps;
    return (
      <Badge.Ribbon text={time} color="blue">
        <div
          style={{
            height: "100%",
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            backgroundColor: "#E6F7FF",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            boxSizing: "border-box",
          }}
        >
          <br />
          <Text strong style={{ fontSize: "12px" }}>
            {teacherName}
          </Text>
        </div>
      </Badge.Ribbon>
    );
  };

  return (
    <div style={{ padding: isMobile ? "0px" : "24px" }}>
      <Card>
        {isLoadingDataTeacher ? (
          <Skeleton active paragraph={{ rows: 1 }} />
        ) : (
          <>
            <Title level={3}>Selamat Datang, {username || "Student"}!</Title>
            <Title level={5} style={{ fontWeight: 400, marginTop: "8px" }}>
              <Tag>{checkMeetingToday()}</Tag>
            </Title>
          </>
        )}
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: "20px" }}>
        <Col xs={24} md={16}>
          <Card
            title={<Title level={4}>Jadwal Pertemuan</Title>}
            style={{
              borderRadius: "10px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            {isLoadingShowMeetingById ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : (
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={"dayGridMonth"} // Mode mobile jadi timeGridDay
                selectable
                editable
                showNonCurrentDates={false}
                locale="id"
                contentHeight="auto"
                events={events}
                eventContent={renderEventContent}
                eventClick={handleEventClick}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right:
                    window.innerWidth < 768 ? "" : "dayGridMonth,timeGridWeek",
                }}
                dayMaxEventRows={2} // 🔹 Maksimal 2 event per hari di mobile
                // eventMaxHeightPercentage={80} // 🔹 Hindari event keluar dari cell
                eventDisplay="block" // 🔹 Paksa event tetap dalam batas cell
                eventTextColor="white"
              />
            )}
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              backgroundColor: "#fff",
            }}
            title={
              <Title level={4} style={{ marginBottom: 0, color: "#333" }}>
                Daftar Aktivitas
              </Title>
            }
          >
            {isLoadingCourse || isLoadingAccessCourse || isLoadingMock ? (
              <Skeleton active paragraph={{ rows: 5 }} />
            ) : !!mergedData?.length ||
              !!mergedDataCourse?.length ||
              !!mergedDataMockTest?.length ? (
              <List
                dataSource={[
                  ...(mergedData || []),
                  ...(mergedDataCourse || []),
                  ...(mergedDataMockTest || []),
                ]}
                renderItem={(item: any) => (
                  <List.Item>
                    <Card
                      style={{
                        width: "100%",
                        borderRadius: "10px",
                        backgroundColor: "#FAFAFA",
                        padding: "16px",
                        borderLeft: `5px solid ${
                          item.timeLimit ? "#FA541C" : "#1890FF"
                        }`,
                      }}
                    >
                      <Title
                        level={5}
                        style={{
                          color: item.timeLimit ? "#FA541C" : "#1890FF",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {item.timeLimit ? (
                          <ClockCircleOutlined style={{ fontSize: "18px" }} />
                        ) : (
                          <ReadOutlined style={{ fontSize: "18px" }} />
                        )}
                        {item.timeLimit ? "Ujian" : "Modul"}
                      </Title>

                      <Divider style={{ margin: "8px 0" }} />

                      <Title level={5} style={{ marginBottom: "8px" }}>
                        {item.name}
                      </Title>
                      <Text style={{ fontSize: "14px", color: "#595959" }}>
                        {item.description}
                      </Text>

                      <Divider style={{ margin: "8px 0" }} />

                      {item.mock_test_id ? (
                        <>
                          {item.is_completed ? (
                            <Space>
                              <Button
                                type="primary"
                                disabled
                                icon={<CheckCircleOutlined />}
                              >
                                Tes Telah Dilakukan
                              </Button>
                              <Button type="primary">Riwayat</Button>
                            </Space>
                          ) : (
                            <Button
                              type="primary"
                              style={{
                                width: "100%",
                                fontWeight: "bold",
                                transition: "0.3s",
                              }}
                              onClick={() => handleStartTest(item)}
                            >
                              Mulai
                            </Button>
                          )}
                        </>
                      ) : item.timeLimit ? (
                        <>
                          {item.is_completed ? (
                            <Space>
                              <Button
                                type="primary"
                                disabled
                                icon={<CheckCircleOutlined />}
                              >
                                Tes Telah Dilakukan
                              </Button>
                              <Button
                                type="primary"
                                href={`/student/dashboard/placement-test/history/${item.placement_test_id}`}
                              >
                                Riwayat
                              </Button>
                            </Space>
                          ) : (
                            <Button
                              type="primary"
                              style={{
                                width: "100%",
                                fontWeight: "bold",
                                transition: "0.3s",
                              }}
                              onClick={() => handleStartTest(item)}
                            >
                              Mulai
                            </Button>
                          )}
                        </>
                      ) : (
                        <Space
                          direction="vertical"
                          size={15}
                          style={{ width: "100%" }}
                        >
                          <Button
                            type="primary"
                            block
                            icon={<FileTextOutlined />}
                            href="/student/dashboard/course-followed"
                            style={{ fontWeight: "bold", transition: "0.3s" }}
                          >
                            Lihat Detail
                          </Button>
                        </Space>
                      )}
                    </Card>
                  </List.Item>
                )}
              />
            ) : (
              <Alert
                type="warning"
                message="Tidak ada aktivitas yang tersedia."
                style={{
                  textAlign: "center",
                  fontSize: "16px",
                  padding: "12px",
                }}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Modal Deskripsi Placement Test */}

      <Modal
        title={
          <Title level={3} style={{ marginBottom: 0 }}>
            Deskripsi Tes
          </Title>
        }
        open={isTestModalVisible}
        onCancel={handleModalCloseTest}
        footer={null}
      >
        {selectedTest ? (
          <div style={{ padding: "16px" }}>
            {/* 📝 Informasi Tes */}
            <Title level={4} style={{ color: "#1890FF" }}>
              {selectedTest.name}
            </Title>

            <Divider />

            {/* 🔹 Deskripsi */}
            <Title level={5} style={{ marginBottom: 4 }}>
              Deskripsi
            </Title>
            <Text style={{ fontSize: "16px", color: "#595959" }}>
              {selectedTest.description}
            </Text>

            <Divider />

            {/* ⏳ Durasi */}
            <Title level={5} style={{ marginBottom: 4 }}>
              Durasi
            </Title>
            <Text style={{ fontSize: "16px", color: "#595959" }}>
              {selectedTest.timeLimit} menit
            </Text>

            <Divider />

            {/* 🎯 Tombol Mulai Tes */}
            <Button
              type="primary"
              size="large"
              onClick={startQuiz}
              style={{ width: "100%", marginTop: "16px", fontWeight: "bold" }}
            >
              Mulai Tes Sekarang
            </Button>
          </div>
        ) : (
          <Title level={5} style={{ textAlign: "center", color: "#FA541C" }}>
            Tidak ada informasi tes yang tersedia.
          </Title>
        )}
      </Modal>

      {/* Modal Detail Pertemuan */}
      <Modal
        title={<Title level={4}>Detail Pertemuan</Title>}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
      >
        {selectedEvent && (
          <div style={{ padding: "16px" }}>
            <p>
              <Text strong>Nama Guru:</Text> {selectedEvent.teacherName}
            </p>
            <p>
              <Text strong>Waktu:</Text> {selectedEvent.time}
            </p>
            <p>
              <Text strong>Metode:</Text> {selectedEvent.method}
            </p>
            <p>
              {selectedEvent.meetLink ? (
                <p>
                  <Text strong>Link:</Text>{" "}
                  <Link
                    href={selectedEvent.meetLink}
                    style={{ color: "#1890FF" }}
                  >
                    {selectedEvent.meetLink}
                  </Link>
                </p>
              ) : (
                <p>
                  <Text strong>Link:</Text> <span>Tidak ada link</span>
                </p>
              )}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
