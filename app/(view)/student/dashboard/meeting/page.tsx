"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Title from "antd/es/typography/Title";
import {
  Divider,
  Modal,
  Form,
  Select,
  Input,
  Button,
  Card,
  Grid,
  Row,
  Col,
  DatePicker,
  Alert,
  Badge,
  Typography,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import { useMeetingViewModel } from "./useMeetingViewModel";
import { useEffect, useState } from "react";

const { useBreakpoint } = Grid;

const color = [
  "rgb(229, 115, 115)",
  "rgb(255, 182, 77)",
  "rgb(78, 182, 171)",
  "rgb(66, 133, 244)",
  "rgb(102, 187, 106)",
];

export default function MeetingCalendar() {
  const {
    handleDateClick,
    handleCancel,
    handleSubmit,
    events,
    availableTimes,
    isModalVisible,
    setSelectedTeacher,
    selectedDate,
    form,
    dataTeacher,
    loading,
    handleEventClick,
    selectedEvent,
    handleChangeDate,
    showMeetingByDate,
    isRescheduleModalVisible,
    setIsRescheduleModalVisible,
    selectedMeeting,
    handleRescheduleClick,
    showScheduleAll,
    availableTeachers,
    handleChangeDateReschedule,
    handleTeacherChange,
    selectedTeacherId,
    setMeetingId,
    handleCancelReschedule,
    handleSubmitReschedule,
  } = useMeetingViewModel();

  const screens = useBreakpoint();
  useEffect(() => {
    if (selectedMeeting) {
      setMeetingId(selectedMeeting.meeting_id);
    }
  }, [selectedMeeting, setMeetingId]);
  const renderEventContent = (eventInfo: any) => {
    const { teacherName, time } = eventInfo.event.extendedProps;
    const randomColor = color[Math.floor(Math.random() * color.length)];

    return (
      <div
        style={{
          backgroundColor: randomColor,
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
        <strong style={{ fontSize: screens.xs ? "10px" : "12px" }}>
          {time}
        </strong>
        <div
          style={{ fontSize: screens.xs ? "12px" : "14px", fontWeight: "bold" }}
        >
          {teacherName}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: screens.xs ? "10px" : "20px" }}>
      <Card style={{ marginBottom: "20px" }}>
        <Title level={screens.xs ? 4 : 3}>Jadwal Pertemuan</Title>
        <Divider />

        <Form layout="vertical">
          <Form.Item label="Pilih Guru">
            <Select
              placeholder="Pilih Guru"
              onChange={(value) => {
                const selectedTeacherData = dataTeacher?.data.find(
                  (teacher) => teacher.username === value
                );
                setSelectedTeacher(selectedTeacherData ?? null);
              }}
            >
              {dataTeacher?.data.map((teacher) => (
                <Select.Option key={teacher.user_id} value={teacher.username}>
                  {teacher.username}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Card>

      <div>
        <Row gutter={50}>
          <Col md={16}>
            <Card style={{ marginTop: "20px" }}>
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={screens.xs ? "timeGridDay" : "dayGridMonth"}
                selectable={true}
                editable={true}
                dateClick={handleDateClick}
                showNonCurrentDates={false}
                events={events}
                eventContent={renderEventContent}
                locale={"id"}
                // eventClick={handleEventClick}
              />
            </Card>
          </Col>
          <Col md={8}>
            <DatePicker
              placeholder="Pilih Tanggal"
              onChange={handleChangeDate}
              style={{ width: "100%", margin: "20px 0" }}
            />
            <Card
              style={{
                marginBottom: "20px",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              {showMeetingByDate && showMeetingByDate.data.length > 0 ? (
                showMeetingByDate.data.map((meeting: any) => (
                  <Card
                    key={meeting.meeting_id}
                    style={{
                      marginBottom: "20px",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                    bodyStyle={{ padding: "16px" }}
                    hoverable
                  >
                    <Badge.Ribbon
                      text={dayjs.utc(meeting.dateTime).format("HH:mm")}
                      color="blue"
                    >
                      <div style={{ padding: "16px" }}>
                        <Typography.Text strong style={{ fontSize: "16px" }}>
                          {dayjs.utc(meeting.dateTime).format("DD MMMM YYYY")}
                        </Typography.Text>
                        <div style={{ marginTop: "10px" }}>
                          <Button
                            type="primary"
                            onClick={() => handleRescheduleClick(meeting)}
                          >
                            Reschedule Jadwal
                          </Button>
                        </div>
                      </div>
                    </Badge.Ribbon>
                  </Card>
                ))
              ) : (
                <Card style={{ marginTop: "20px" }}>
                  <Alert type="info" message="Tidak ada jadwal pertemuan." />
                </Card>
              )}
            </Card>
          </Col>
        </Row>
      </div>

      <Modal
        title={"Tambah Jadwal Pertemuan"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={handleSubmit}
          form={form}
          initialValues={{
            remember: true,
          }}
        >
          <Form.Item label="Tanggal">
            <Input value={selectedDate} disabled />
          </Form.Item>

          <Form.Item
            label="Pilih Jam"
            name="time"
            rules={[{ required: true, message: "Harap pilih waktu!" }]}
          >
            <Select
              placeholder="Pilih Waktu"
              notFoundContent="Tidak Ada Waktu Jadwal"
            >
              {availableTimes.map((time) => (
                <Select.Option key={time} value={time}>
                  {time || "Tidak Ada Jadwal"}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Metode"
            name="method"
            rules={[{ required: true, message: "Harap pilih metode!" }]}
          >
            <Select placeholder="Pilih Metode">
              <Select.Option value="ONLINE">Online</Select.Option>
              <Select.Option value="OFFLINE">Offline</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.method !== currentValues.method
            }
          >
            {() => {
              return form.getFieldValue("method") === "ONLINE" ? (
                <Form.Item
                  label="Platform"
                  name="platform"
                  rules={[{ required: true, message: "Harap pilih platform!" }]}
                >
                  <Select placeholder="Pilih Platform">
                    <Select.Option value="ZOOM">Zoom</Select.Option>
                    <Select.Option value="GOOGLE_MEET">
                      Google Meet
                    </Select.Option>
                  </Select>
                </Form.Item>
              ) : null;
            }}
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              {selectedEvent ? "Perbarui Jadwal" : "Simpan Jadwal"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={isRescheduleModalVisible}
        title="Reschedule Jadwal"
        onClose={handleCancelReschedule}
        onCancel={() => setIsRescheduleModalVisible(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={handleSubmitReschedule}
          form={form}
          initialValues={{
            remember: true,
          }}
        >
          {/* Input nama guru */}
          <Form.Item
            label="Nama Guru"
            name="teacher"
            rules={[{ required: true, message: "Nama guru harus diisi!" }]}
          >
            <Select
              placeholder="Pilih Guru"
              onChange={handleTeacherChange}
              value={selectedTeacherId}
            >
              {dataTeacher?.data.map((teacher) => (
                <Select.Option key={teacher.user_id} value={teacher.user_id}>
                  {teacher.username}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Input tanggal */}
          <Form.Item
            label="Tanggal"
            name="date"
            rules={[{ required: true, message: "Harap pilih tanggal!" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              placeholder="Pilih Tanggal"
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              }
              onChange={(date) => handleChangeDateReschedule(date)}
              disabled={!selectedTeacherId}
            />
          </Form.Item>

          {/* Input waktu */}
          <Form.Item
            label="Pilih Jam"
            name="time"
            rules={[{ required: true, message: "Harap pilih waktu!" }]}
          >
            <Select placeholder="Pilih Waktu">
              {availableTimes.map((time) => (
                <Select.Option key={time} value={time}>
                  {time}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Input metode */}
          <Form.Item
            label="Metode"
            name="method"
            rules={[{ required: true, message: "Harap pilih metode!" }]}
          >
            <Select placeholder="Pilih Metode">
              <Select.Option value="ONLINE">Online</Select.Option>
              <Select.Option value="OFFLINE">Offline</Select.Option>
            </Select>
          </Form.Item>

          {/* Input platform */}
          <Form.Item
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.method !== currentValues.method
            }
          >
            {() => {
              return form.getFieldValue("method") === "ONLINE" ? (
                <Form.Item
                  label="Platform"
                  name="platform"
                  rules={[{ required: true, message: "Harap pilih platform!" }]}
                >
                  <Select placeholder="Pilih Platform">
                    <Select.Option value="ZOOM">Zoom</Select.Option>
                    <Select.Option value="GOOGLE_MEET">
                      Google Meet
                    </Select.Option>
                  </Select>
                </Form.Item>
              ) : null;
            }}
          </Form.Item>

          {/* Tombol submit */}
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Reschedule Jadwal
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
