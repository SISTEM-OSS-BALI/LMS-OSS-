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
} from "antd";
import { Meeting } from "@/app/model/meeting";
import Table, { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import TextArea from "antd/es/input/TextArea";
import { useQueueViewModel } from "./useQueueViewModel";

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
      dataIndex: "startTime",
      key: "startTime",
      render: (startTime: string) => dayjs.utc(startTime).format("HH:mm"),
    },
    {
      title: "Waktu Selesai",
      dataIndex: "endTime",
      key: "endTime",
      render: (endTime: string) => {
        return dayjs.utc(endTime).format("HH:mm");
      },
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
    </div>
  );
}
