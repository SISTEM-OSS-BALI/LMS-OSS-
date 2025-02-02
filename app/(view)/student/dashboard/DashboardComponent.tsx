import { useUsername } from "@/app/lib/auth/useLogin";
import { Typography, Modal, Badge, Card, Row, Col, List } from "antd";
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
    mergedData,
  } = useMeetings();

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
          <Text strong style={{ fontSize: "12px" }}>
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
        <Title level={3}>Selamat Datang, {username || "Student"}!</Title>
        <p>Jaga Selalu Kerahasian Akun Anda</p>
      </Card>
      <Row gutter={20} style={{ marginTop: "20px" }}>
        <Col md={16}>
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
          <Title level={4}>To Do List </Title>
          <Card style={{ marginTop: "10px", padding: "10px" }}>
            {!!mergedData && mergedData?.length > 0 ? (
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
                        <Text type="secondary">
                          Durasi: {item.timeLimit} menit
                        </Text>
                      </p>
                      <p style={{ margin: "5px 0" }}>
                        <Text>{item.description}</Text>
                      </p>
                    </Card>
                  </List.Item>
                )}
              />
            ) : (
              <Text type="secondary">
                Tidak ada tugas yang harus dikerjakan.
              </Text>
            )}
          </Card>
        </Col>
      </Row>

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
