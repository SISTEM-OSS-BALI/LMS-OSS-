import {
  Badge,
  Button,
  DatePicker,
  Divider,
  Form,
  Input,
  Modal,
  Space,
  Typography,
  Grid,
  Card,
  Flex,
  Image,
} from "antd";
import { Meeting } from "@/app/model/meeting";
import Table, { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import TextArea from "antd/es/input/TextArea";
import { useQueueViewModel } from "./useQueueViewModel";
import Dragger from "antd/es/upload/Dragger";
import { InboxOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import { TeacherAbsence } from "@/app/model/user";

const { Title } = Typography;
const { useBreakpoint } = Grid;

export default function QueueComponent() {
  const screens = useBreakpoint();
  const {
    updateAbsentStatus,
    handleChangeDate,
    setSearchKeyword,
    searchKeyword,
    filteredData,
    showTimes,
    handleAction,
    setIsModalVisibleAddProgesStudent,
    isModalVisibleAddProgesStudent,
    handleCancel,
    form,
    handleOpenModalAddProges,
    handleAddProgresStudent,
    loading,
    handleOpenModalAction,
    isModalVisibleAddAction,
    handleCancelAddAction,
    imageUrl,
    handleFileChange,
    handleBeforeUpload,
    fileList,
    teacherAbsenceData,
  } = useQueueViewModel();

  const cellRender = (currentDate: any) => {
    const formattedDate = dayjs(currentDate).format("YYYY-MM-DD");
    const isShowTime = showTimes.includes(formattedDate);

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

  const columns: ColumnsType<
    Meeting & { studentName: string | undefined; teacherAbsence: boolean }
  > = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Waktu Mulai",
      dataIndex: "startTime",
      key: "startTime",
      render: (startTime: string) => dayjs.utc(startTime).format("HH:mm"),
    },
    {
      title: "Waktu Selesai",
      dataIndex: "endTime",
      key: "endTime",
      render: (endTime: string) => dayjs.utc(endTime).format("HH:mm"),
    },
    {
      title: "Program",
      dataIndex: "name_program",
      key: "name_program",
    },
    {
      title: "Metode",
      dataIndex: "method",
      key: "method",
    },
    {
      title: "Nama Siswa",
      dataIndex: "studentName",
      key: "studentName",
    },
    {
      title: "Absen",
      dataIndex: "absent",
      key: "absent",
      render: (_, record) => (
        <Space>
          <Button
            disabled={record.absent}
            style={{
              cursor: record.absent ? "not-allowed" : "pointer",
              backgroundColor: record.absent ? "green" : "transparent",
              color: record.absent ? "white" : "black",
            }}
            onClick={() =>
              updateAbsentStatus(record.meeting_id, record.student_id, true)
            }
          >
            Hadir
          </Button>
          <Button
            disabled={!record.absent}
            style={{
              cursor: !record.absent ? "not-allowed" : "pointer",
              backgroundColor: !record.absent ? "red" : "transparent",
              color: !record.absent ? "white" : "black",
            }}
            onClick={() =>
              updateAbsentStatus(record.meeting_id, record.student_id, false)
            }
          >
            Tidak Hadir
          </Button>
        </Space>
      ),
    },
    {
      title: "Modul",
      dataIndex: "module",
      key: "module",
      render: (module: boolean) => (module ? "Yes" : "No"),
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            danger
            disabled={record.teacherAbsence}
            onClick={() => handleOpenModalAction(record.meeting_id)}
          >
            {record.teacherAbsence
              ? "Sedang Diproses Admin"
              : "Tidak Bisa Mengajar"}
          </Button>
          <Button
            type="primary"
            onClick={() => handleOpenModalAddProges(record.meeting_id)}
          >
            Tambah Progress Siswa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        style={{
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Flex justify="space-between" gap={10}>
          <Title level={3} style={{ marginBlock: 0 }}>
            Daftar Antrian Siswa
          </Title>
          <Flex justify="space-between" gap={10}>
            <DatePicker
              placeholder="Pilih Tanggal"
              onChange={handleChangeDate}
              cellRender={cellRender}
              style={{ width: "100%" }}
            />
            <Input
              placeholder="Cari nama siswa"
              onChange={(e) => setSearchKeyword(e.target.value)}
              value={searchKeyword}
              style={{ width: "100%" }}
            />
          </Flex>
        </Flex>
      </Card>
      <Divider />
      <Card
        style={{
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          padding: "20px 0px",
        }}
      >
        <Table
          columns={columns}
          dataSource={filteredData}
          scroll={{ x: screens.md ? undefined : 800 }}
        />
      </Card>

      <Modal
        open={isModalVisibleAddProgesStudent}
        title="Progress Pertemuan"
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} onFinish={handleAddProgresStudent}>
          <Form.Item name="ability_scale">
            <TextArea placeholder="Masukan Skala Kemapuan Pertemuan Hari Ini" />
          </Form.Item>
          <Form.Item name="student_performance">
            <TextArea placeholder="Masukan Kinerja Siswa Pertemuan Hari Ini" />
          </Form.Item>
          <Form.Item name="progress_student">
            <TextArea placeholder="Masukan Inputan Pertemuan Hari Ini" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ width: "100%" }}
              loading={loading}
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={isModalVisibleAddAction}
        onCancel={handleCancelAddAction}
        title="Tidak Bisa Mengajar"
        footer={null}
      >
        <Form form={form} onFinish={handleAction}>
          <Form.Item name="reason">
            <TextArea placeholder="Masukan Alasan" />
          </Form.Item>
          <Form.Item>
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
                    style={{ width: "100%", height: "auto" }}
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
                      Support untuk single upload. Hanya file PNG, JPEG, dan JPG
                      yang diterima.
                    </p>
                  </div>
                )}
              </Dragger>
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ width: "100%" }}
              loading={loading}
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
