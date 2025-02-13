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
  Image,
  FloatButton,
  Skeleton,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import { useEffect } from "react";
import Icon, { InboxOutlined } from "@ant-design/icons";
import { AddIcon, InfoIcon } from "@/app/components/Icon";
import { useMeetingViewModel } from "./useMeetingViewModel";
import Dragger from "antd/es/upload/Dragger";
import CustomerServiceChat from "@/app/components/CustomerService";

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
    showDate,
    isModalVisibleEmergency,
    handleCancelEmergency,
    handleFileChange,
    fileList,
    handleBeforeUpload,
    imageUrl,
    handleSubmitRescheduleEmergency,
    isLoadingMeeting,
    isLoadingProgram,
    isLoadingMeetingByDate,
    isLoadingMeetingById,
    isLoadingScheduleAll,
  } = useMeetingViewModel();

  const screens = useBreakpoint();
  useEffect(() => {
    if (selectedMeeting) {
      setMeetingId(selectedMeeting.meeting_id);
    }
  }, [selectedMeeting, setMeetingId]);

  const cellRender = (currentDate: any) => {
    const formattedDate = dayjs(currentDate).format("YYYY-MM-DD");
    const isShowTime = showDate.includes(formattedDate);

    return (
      <div className="ant-picker-cell-inner">
        {currentDate.date()}
        {isShowTime && (
          <Badge
            status="success"
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              transform: "translate(50%, -50%)",
            }}
          />
        )}
      </div>
    );
  };
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
            { title: "Pilih Guru" },
            { title: "Pilih Tanggal" },
            { title: "Ajukan Pertemuan" },
            { title: "Berhasil" },
          ]}
        />
        <Title level={screens.xs ? 4 : 3}>Pilih Guru</Title>
        <CustomerServiceChat />
        <Divider />

        {isLoadingMeeting ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : (
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
                {isLoadingMeeting ? (
                  <Skeleton.Avatar
                    active
                    size={100}
                    shape="circle"
                    style={{ marginBottom: 10 }}
                  />
                ) : (
                  <Avatar
                    size={100}
                    src={teacher.imageUrl}
                    style={{ marginBottom: 10 }}
                  />
                )}
                {isLoadingMeeting ? (
                  <Skeleton.Input active size="small" style={{ width: 80 }} />
                ) : (
                  <Checkbox
                    checked={selectedTeacher?.user_id === teacher.user_id}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectTeacher(teacher);
                    }}
                  >
                    {teacher.username}
                  </Checkbox>
                )}
              </Card>
            ))}
          </div>
        )}
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
              {isLoadingScheduleAll ? (
                <Skeleton active />
              ) : (
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
                />
              )}
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
              {isLoadingMeetingByDate ? (
                <Skeleton active paragraph={{ rows: 4 }} />
              ) : showMeetingByDate && showMeetingByDate.data.length > 0 ? (
                showMeetingByDate.data.map((meeting) => (
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
                <Alert type="info" message="Tidak ada jadwal pertemuan." />
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
        <Form layout="vertical" onFinish={handleSubmit} form={form}>
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
        onCancel={handleCancelReschedule}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleSubmitReschedule} form={form}>
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
              cellRender={cellRender}
            />
          </Form.Item>

          {/* Input waktu */}
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
                Pastikan anda melakukan reschedule maksimal 12 jam sebelum
                pertemuan berlangsung
              </strong>
            </Typography.Text>
          </Typography.Text>
        </div>
      </Modal>

      <Modal
        open={isModalVisibleEmergency}
        title="Pengajuan Emergency"
        footer={null}
        onCancel={handleCancelEmergency}
        width={800} // Lebar modal agar lebih lebar ke samping
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitRescheduleEmergency}
        >
          <Row gutter={16}>
            {/* Bagian Kiri - Data Meeting */}
            <Col xs={24} md={12}>
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
                    <Select.Option
                      key={teacher.user_id}
                      value={teacher.user_id}
                    >
                      {teacher.username}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

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
                  cellRender={cellRender}
                />
              </Form.Item>

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
                {() =>
                  form.getFieldValue("method") === "ONLINE" ? (
                    <Form.Item
                      label="Platform"
                      name="platform"
                      rules={[
                        { required: true, message: "Harap pilih platform!" },
                      ]}
                    >
                      <Select placeholder="Pilih Platform">
                        <Select.Option value="ZOOM">Zoom</Select.Option>
                        <Select.Option value="GOOGLE_MEET">
                          Google Meet
                        </Select.Option>
                      </Select>
                    </Form.Item>
                  ) : null
                }
              </Form.Item>
            </Col>

            {/* Bagian Kanan - Keterangan & Bukti */}
            <Col xs={24} md={12}>
              <Form.Item
                name="reason"
                label="Keterangan"
                rules={[{ required: true, message: "Keterangan harus diisi!" }]}
              >
                <Input.TextArea
                  placeholder="Masukan keterangan pengajuan"
                  rows={3}
                />
              </Form.Item>

              <Form.Item
                name="option_reason"
                label="Pilih Keterangan"
                rules={[
                  { required: true, message: "Opsi keterangan harus diisi!" },
                ]}
              >
                <Select placeholder="Pilih Keterangan">
                  <Select.Option value="NATURAL_DISASTERS">
                    Bencana Alam
                  </Select.Option>
                  <Select.Option value="GRIEF">Duka</Select.Option>
                  <Select.Option value="SICK">Sakit</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Upload Bukti"
                rules={[{ required: true, message: "Bukti harus diisi!" }]}
              >
                <Form.Item name="image">
                  <Dragger
                    name="files"
                    listType="picture-card"
                    fileList={fileList}
                    onChange={handleFileChange}
                    beforeUpload={handleBeforeUpload}
                    showUploadList={false}
                    accept="image/png, image/jpeg"
                  >
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt="Image preview"
                        preview={false}
                        style={{
                          width: "100%",
                          height: "auto",
                          borderRadius: "6px",
                        }}
                      />
                    ) : (
                      <div>
                        <p className="ant-upload-drag-icon">
                          <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">
                          Klik atau drag file ke area ini untuk upload
                        </p>
                        <p className="ant-upload-hint">
                          Support untuk single upload. Hanya file PNG, JPEG, dan
                          JPG yang diterima.
                        </p>
                      </div>
                    )}
                  </Dragger>
                </Form.Item>
              </Form.Item>
            </Col>
          </Row>

          {/* Tombol Submit */}
          <Button
            type="primary"
            htmlType="submit"
            style={{ width: "100%", marginTop: "16px" }}
            loading={loading}
          >
            Submit
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
