import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Title from "antd/es/typography/Title";
import {
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
  Checkbox,
  Avatar,
  Steps,
  Divider,
  Flex,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import { useMeetingViewModel } from "./useMeetingViewModel";
import { useEffect } from "react";
import Icon from "@ant-design/icons";
import { InfoIcon } from "@/app/components/Icon";

const { useBreakpoint } = Grid;

export default function MeetingComponent() {
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
    handleChangeDateReschedule,
    handleTeacherChange,
    selectedTeacherId,
    setMeetingId,
    selectedTeacher,
    handleCancelReschedule,
    handleSubmitReschedule,
    handleSelectTeacher,
    currentStep,
    handleOpenModalInfo,
    handleCancelModalInfo,
    isModalInfoVisible,
  } = useMeetingViewModel();

  const screens = useBreakpoint();
  useEffect(() => {
    if (selectedMeeting) {
      setMeetingId(selectedMeeting.meeting_id);
    }
  }, [selectedMeeting, setMeetingId]);
  const renderEventContent = (eventInfo: any) => {
    const { teacherName, time, color } = eventInfo.event.extendedProps;

    return (
      <div
        style={{
          backgroundColor: color,
          color: "#fff",
          padding: "4px",
          textAlign: "center",
          boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.1)",
          display: "flex",
          width: "100%",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          overflow: "hidden",
          borderRadius: "10px",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
      >
        <strong style={{ fontSize: screens.xs ? "10px" : "12px" }}>
          {time}
        </strong>
        <div
          style={{ fontSize: screens.xs ? "10px" : "12px", fontWeight: "bold" }}
        >
          {teacherName}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: "24px" }}>
      <Card
        style={{
          marginBottom: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Steps
          size="small"
          current={currentStep}
          style={{ marginBottom: "24px" }}
          items={[
            {
              title: "Pilih Guru",
            },
            {
              title: "Pilih Tanggal",
            },
            {
              title: "Ajukan Pertemuan",
            },
            {
              title: "Behasil",
            },
          ]}
        />
        <Title level={screens.xs ? 4 : 3}>Pilih Guru</Title>
        <Divider />

        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
          {dataTeacher?.data.map((teacher) => (
            <Card
              key={teacher.user_id}
              hoverable
              style={{
                width: 200,
                borderRadius: "8px",
                textAlign: "center",
                cursor: "pointer",
                border:
                  selectedTeacher?.user_id === teacher.user_id
                    ? "2px solid #1890ff"
                    : "1px solid #d9d9d9",
              }}
              onClick={() => handleSelectTeacher(teacher)}
            >
              <Avatar
                size={100}
                src={teacher.imageUrl}
                style={{ marginBottom: 10 }}
              />
              <Checkbox
                checked={selectedTeacher?.user_id === teacher.user_id}
                onChange={(e) => {
                  e.stopPropagation(); // Mencegah event onClick Card ikut terpanggil
                  handleSelectTeacher(teacher);
                }}
              >
                {teacher.username}
              </Checkbox>
            </Card>
          ))}
        </div>
        <Divider />
      </Card>

      <div style={{ marginTop: "50px" }}>
        <Row gutter={30}>
          <Col md={16}>
            <Title level={3}>Pilih Tanggal</Title>
            <Card
              style={{
                marginTop: "20px",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={screens.xs ? "timeGridDay" : "dayGridMonth"}
                selectable={true}
                editable={true}
                dateClick={handleDateClick}
                showNonCurrentDates={false}
                events={events}
                eventContent={renderEventContent}
                contentHeight="auto"
                locale={"id"}
                // eventClick={handleEventClick}
              />
            </Card>
          </Col>
          <Col md={8}>
            <Flex justify={"space-between"}>
              <Title level={3}>Reschedule Jadwal</Title>
              <Tooltip title="Tutorial">
                <Button
                  type="primary"
                  shape="round"
                  onClick={() => handleOpenModalInfo()}
                >
                  <Icon component={InfoIcon} />
                </Button>
              </Tooltip>
            </Flex>
            <Card
              style={{
                marginTop: "20px",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <DatePicker
                placeholder="Pilih Tanggal"
                onChange={handleChangeDate}
                style={{ width: "100%", margin: "20px 0" }}
              />
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
                <div style={{ marginTop: "20px" }}>
                  <Alert type="info" message="Tidak ada jadwal pertemuan." />
                </div>
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

      <Modal
        open={isModalInfoVisible}
        footer={null}
        onCancel={handleCancelModalInfo}
      >
        <div style={{ textAlign: "center" }}>
          <Typography.Title level={4}>
            Cara Melakukan Reschedule
          </Typography.Title>
        </div>
        <div style={{ padding: "20px" }}>
          <Typography.Text>
            <ol>
              <li>Pilih tanggal yang akan direschedule</li>
              <li>Tekan tombol reschedule</li>
              <li>Pilih tanggal yang baru</li>
              <li>Pilih guru</li>
              <li>Pilih waktu dan metode</li>
              <li>Tekan tombol submit</li>
            </ol>
          </Typography.Text>
          <Typography.Text>
            <Typography.Text type="danger">
              <strong>
                Pastikan anda melakukan reschedule maksimal H-2 jam sebelum
                pertemuan berlangsung
              </strong>
            </Typography.Text>
          </Typography.Text>
        </div>
      </Modal>
    </div>
  );
}
