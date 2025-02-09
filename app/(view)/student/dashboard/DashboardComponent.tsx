"use client";

import { useState } from "react";
import { useUsername } from "@/app/lib/auth/useLogin";
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
} from "antd";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useMeetings } from "./useMeetingViewModel";
import Link from "next/link";
import CustomAlert from "@/app/components/CustomAlert";

const { Title, Text } = Typography;

export default function HomeStudent() {
  const username = useUsername();

  const {
    isModalVisible,
    selectedEvent,
    handleEventClick,
    handleModalClose,
    events,
    mergedData,
    startQuiz,
  } = useMeetings();

  // State untuk modal Placement Test
  const [isTestModalVisible, setIsTestModalVisible] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);

  // Menampilkan modal deskripsi sebelum tes
  const handleStartTest = (test: any) => {
    setSelectedTest(test);
    setIsTestModalVisible(true);
  };

  // Redirect ke halaman Placement Test

  // Render event di FullCalendar
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
    <div style={{ padding: "24px" }}>
      <Card>
        <Title level={3}>Selamat Datang, {username || "Student"}!</Title>
        <p>Jaga Selalu Kerahasian Akun Anda</p>
      </Card>

      <Row gutter={20} style={{ marginTop: "20px" }}>
        <Col md={16}>
          <Title level={4}>Jadwal Pertemuan</Title>
          <Card style={{ marginTop: "20px" }}>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              selectable
              editable
              showNonCurrentDates={false}
              locale="id"
              contentHeight="auto"
              events={events}
              eventContent={renderEventContent}
              eventClick={handleEventClick}
            />
          </Card>
        </Col>

        <Col md={8}>
          <Title level={4}>To Do List</Title>
          <Card style={{ marginTop: "20px", padding: "10px" }}>
            {!!mergedData && mergedData.length > 0 ? (
              <List
                dataSource={mergedData}
                renderItem={(item: any) => (
                  <List.Item>
                    <Card
                      style={{
                        width: "100%",
                        borderRadius: "8px",
                        backgroundColor: "#FAFAFA",
                      }}
                    >
                      <Text strong>{item.name}</Text>
                      <p style={{ margin: "5px 0" }}>
                        <Text>{item.description}</Text>
                      </p>
                      {item.is_completed ? (
                        <Space>
                          <Button
                            type="primary"
                            onClick={() => handleStartTest(item)}
                            disabled
                          >
                            Tes Telah Dilakukan
                          </Button>
                          <Button type="primary">Riwayat</Button>
                        </Space>
                      ) : (
                        <Button
                          type="primary"
                          onClick={() => handleStartTest(item)}
                        >
                          Mulai
                        </Button>
                      )}
                    </Card>
                  </List.Item>
                )}
              />
            ) : (
              <Alert
                type="warning"
                message="Tidak ada to do list yang tersedia."
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Modal Deskripsi Placement Test */}
      <Modal
        title="Deskripsi Tes"
        open={isTestModalVisible}
        onCancel={() => setIsTestModalVisible(false)}
        footer={null}
      >
        {selectedTest ? (
          <div>
            <p>
              <Text strong>Deskripsi:</Text> {selectedTest.description}
            </p>
            <p>
              <Text strong>Durasi:</Text> {selectedTest.timeLimit} menit
            </p>
            <Button type="primary" onClick={startQuiz}>
              Start
            </Button>
          </div>
        ) : (
          <Text>Tidak ada informasi tes yang tersedia.</Text>
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
