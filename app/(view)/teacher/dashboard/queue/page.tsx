"use client";

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
} from "antd";
import { useQueueViewModel } from "./useQueueViewModel";
import { Meeting } from "@/app/model/meeting";
import Table, { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import TextArea from "antd/es/input/TextArea";
dayjs.extend(utc);

const { Title } = Typography;
const { useBreakpoint } = Grid;

export default function Queue() {
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
    handleGetIdMeeting,
    handleAddProgresStudent,
    loading,
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

  const columns: ColumnsType<Meeting & { studentName?: string }> = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Waktu Mulai",
      dataIndex: "dateTime",
      key: "dateTime",
      render: (dateTime: string) => dayjs.utc(dateTime).format("HH:mm"),
    },
    {
      title: "Waktu Selesai",
      dataIndex: "dateTime",
      key: "dateTime",
      render: (dateTime: string) =>
        dayjs.utc(dateTime).add(1, "hour").format("HH:mm"),
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
      render: (text: any, record: Meeting) => (
        <Space>
          {record.absent ? (
            <Button
              disabled
              style={{
                cursor: "not-allowed",
                backgroundColor: "green",
                color: "white",
              }}
            >
              Hadir
            </Button>
          ) : (
            <Button
              onClick={() =>
                updateAbsentStatus(record.meeting_id, record.student_id, true)
              }
            >
              Hadir
            </Button>
          )}
          {!record.absent ? (
            <Button
              disabled
              style={{
                cursor: "not-allowed",
                backgroundColor: "red",
                color: "white",
              }}
            >
              Tidak Hadir
            </Button>
          ) : (
            <Button
              onClick={() =>
                updateAbsentStatus(record.meeting_id, record.student_id, false)
              }
            >
              Tidak Hadir
            </Button>
          )}
        </Space>
      ),
    },
    {
      title: "Modul",
      dataIndex: "module",
      key: "module",
      render: (module: any) => (module ? "Yes" : "No"),
    },
    {
      title: "Aksi",
      key: "action",
      render: (text, record) => (
        <Space>
          <Button
            danger
            onClick={async () => {
              await handleAction(record.meeting_id);
            }}
          >
            Tidak Bisa Mengajar
          </Button>
          <Button
            type="primary"
            onClick={() => handleGetIdMeeting(record.meeting_id)}
          >
            Tambah Progress Siswa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: screens.md ? "row" : "column",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        <Title level={3}>Daftar Antrian Siswa</Title>
        <DatePicker
          placeholder="Pilih Tanggal"
          style={{ width: screens.md ? "20%" : "100%" }}
          onChange={handleChangeDate}
          cellRender={cellRender}
        />
        <Input
          placeholder="Cari nama siswa"
          style={{ width: screens.md ? "50%" : "100%" }}
          onChange={(e) => setSearchKeyword(e.target.value)}
          value={searchKeyword}
        />
      </div>
      <Divider />
      <Table
        columns={columns}
        dataSource={filteredData}
        scroll={{ x: screens.md ? undefined : 800 }}
      />

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
    </div>
  );
}
