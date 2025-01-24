"use client";

import { useUsername } from "@/app/lib/auth/useLogin";
import { Typography, Modal, Badge, Card } from "antd";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Link from "next/link";
import { useMeetings } from "./useMeetingViewModel";

dayjs.extend(utc);

const { Title, Text } = Typography;

export default function HomeStudent() {
  const username = useUsername();

  const {
    formatDateTimeToUTC,
    isModalVisible,
    selectedEvent,
    handleEventClick,
    handleModalClose,
    events,
  } = useMeetings();

  // Custom rendering for events
  const renderEventContent = (eventInfo: any) => {
    const { teacherName, time } = eventInfo.event.extendedProps;

    return (
      <Badge.Ribbon text={time} color="blue">
        <div
          style={{
            height: "100%", // Memenuhi tinggi kotak tanggal
            width: "100%", // Memenuhi lebar kotak tanggal
            padding: "8px",
            borderRadius: "6px",
            backgroundColor: "#E6F7FF", // Warna latar belakang Ant Design light blue
            textAlign: "center",
            display: "flex", // Flexbox untuk penataan
            flexDirection: "column", // Menata konten secara vertikal
            justifyContent: "center", // Memusatkan konten secara vertikal
            alignItems: "center", // Memusatkan konten secara horizontal
            boxSizing: "border-box", // Memastikan padding dihitung dalam ukuran elemen
          }}
        >
          <br />
          <Text strong style={{ fontSize: "14px" }}>
            {teacherName}
          </Text>
        </div>
      </Badge.Ribbon>
    );
  };

  return (
    <div
      style={{
        padding: "24px",
      }}
    >
      <Card>
        <Title level={3}>
          Selamat Datang, {username || "Student"}!
        </Title>
        <p>Jaga Selalu Kerahasian Akun Anda</p>
      </Card>
      <Card style={{ marginTop: "20px" }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          selectable
          editable
          showNonCurrentDates={false}
          locale="id"
          events={events}
          eventContent={renderEventContent}
          eventClick={handleEventClick}
        />
      </Card>

      {/* Modal for Event Details */}
      <Modal
        title={<Title level={4}>Detail Pertemuan</Title>}
        visible={isModalVisible}
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
              <Text strong>Link:</Text>{" "}
              <Link href={selectedEvent.meetLink} style={{ color: "#1890FF" }}>
                {selectedEvent.meetLink}
              </Link>
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
