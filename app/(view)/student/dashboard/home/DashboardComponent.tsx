"use client";

import { useEffect, useState } from "react";
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
    mergedDataCourse,
    handleStartTest,
    isTestModalVisible,
    setIsTestModalVisible,
    selectedTest,
  } = useMeetings();



  // State untuk modal Placement Test

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
          <Card
            title={<Title level={4}>Jadwal Pertemuan</Title>}
            style={{
              borderRadius: "10px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
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

        <Col md={8} xs={24}>
          <Card
            style={{
              borderRadius: "10px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
            title={<Title level={4}>Daftar Aktivitas</Title>}
          >
            {(!!mergedData && mergedData.length > 0) ||
            (!!mergedDataCourse && mergedDataCourse.length > 0) ? (
              <List
                dataSource={[
                  ...(mergedData || []),
                  ...(mergedDataCourse || []),
                ]}
                renderItem={(item: any) => (
                  <List.Item>
                    <Card
                      style={{
                        width: "100%",
                        borderRadius: "8px",
                        backgroundColor: "#FAFAFA",
                      }}
                    >
                      <Title
                        level={5}
                        style={{
                          color: item.timeLimit ? "#FA541C" : "#1890FF",
                        }}
                      >
                        {item.timeLimit ? "Ujian" : "Modul"}
                      </Title>
                      {/* Jika Item adalah Placement Test */}
                      {item.timeLimit ? (
                        <>
                          <Text strong>{item.name}</Text>
                          <p style={{ margin: "5px 0" }}>
                            <Text>{item.description}</Text>
                          </p>
                          {item.is_completed ? (
                            <Space>
                              <Button type="primary" disabled>
                                Tes Telah Dilakukan
                              </Button>
                              <Button type="primary">Riwayat</Button>
                            </Space>
                          ) : (
                            <Button
                              type="primary"
                              style={{ width: "100%" }}
                              onClick={() => handleStartTest(item)}
                            >
                              Mulai
                            </Button>
                          )}
                        </>
                      ) : (
                        <>
                          {/* Jika Item adalah Course */}
                          <Space
                            direction="vertical"
                            size={15}
                            style={{ width: "100%" }}
                          >
                            <Text
                              strong
                              style={{ fontSize: "16px", marginBottom: "10px" }}
                            >
                              {item.name}
                            </Text>
                            <Button
                              type="primary"
                              block
                              href="/student/dashboard/course-followed"
                            >
                              Lihat Detail
                            </Button>
                          </Space>
                        </>
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
