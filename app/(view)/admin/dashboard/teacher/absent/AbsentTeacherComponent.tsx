import Table, { ColumnsType } from "antd/es/table";
import { useAbsentViewModel } from "./useAbsentViewModel";
import { TeacherAbsence } from "@/app/model/user";
import { Button, Card, Image, Space } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Title from "antd/es/typography/Title";
dayjs.extend(utc);

export default function AbsentTeacherComponent() {
  const { mergedData, updateAbsentStatus } = useAbsentViewModel();

  const colums: ColumnsType<TeacherAbsence> = [
    {
      title: "Nama Guru",
      dataIndex: "teacher_name",
      key: "teacher_name",
    },
    {
      title: "Waktu Mulai",
      dataIndex: "startTime",
      key: "startTime",
      render: (startTime: string) =>
        dayjs.utc(startTime).format("DD/MM/YYYY, HH:mm"),
    },
    {
      title: "Waktu Selesai",
      dataIndex: "endTime",
      key: "endTime",
      render: (endTime: string) =>
        dayjs.utc(endTime).format("DD/MM/YYYY, HH:mm"),
    },
    {
      title: "Nama Program",
      dataIndex: "name_program",
      key: "name_program",
    },
    {
      title: "Alasan",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Bukti",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (imageUrl: string) => (
        <Image
          src={imageUrl}
          alt="Bukti"
          style={{ width: "100px", height: "100px" }}
        />
      ),
    },
    {
      title: "Konfirmasi",
      dataIndex: "status",
      key: "status",
      render: (_, record) => (
        <Space>
          <Button
            disabled={record.status}
            style={{
              cursor: record.status ? "not-allowed" : "pointer",
              backgroundColor: record.status ? "green" : "transparent",
              color: record.status ? "white" : "black",
            }}
            onClick={() =>
              updateAbsentStatus(
                record.teacher_absence_id,
                true,
                record.meeting_id
              )
            }
          >
            Konfirmasi
          </Button>
          <Button
            disabled={!record.status}
            style={{
              cursor: !record.status ? "not-allowed" : "pointer",
              backgroundColor: !record.status ? "red" : "transparent",
              color: !record.status ? "white" : "black",
            }}
            onClick={() =>
              updateAbsentStatus(
                record.teacher_absence_id,
                false,
                record.meeting_id
              )
            }
          >
            Tolak
          </Button>
        </Space>
      ),
    },
  ];
  return (
    <div style={{ padding: "24px" }}>
      <Title level={3}>Absent Teacher</Title>
      <Card
        style={{
          marginTop: "24px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Table columns={colums} dataSource={mergedData} />
      </Card>
    </div>
  );
}
