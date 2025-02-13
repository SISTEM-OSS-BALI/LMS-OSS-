import Table, { ColumnsType } from "antd/es/table";
import { useAbsentViewModel } from "./useAbsentViewModel";
import { TeacherAbsence } from "@/app/model/user";
import { Button, Card, Image, Space, Grid, Skeleton } from "antd"; // Import Grid untuk useBreakpoint
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Title from "antd/es/typography/Title";
import { useState } from "react";
dayjs.extend(utc);

const { useBreakpoint } = Grid; 

export default function AbsentTeacherComponent() {
  const { mergedData, updateAbsentStatus, isLoadingAbsent, isLoadingTeacher } = useAbsentViewModel();
  const [showHistory, setShowHistory] = useState(false);
  const screens = useBreakpoint(); // Menentukan ukuran layar

  // Filter data berdasarkan is_delete
  const filteredData = showHistory
    ? mergedData?.filter((item) => item.is_delete === true) || []
    : mergedData?.filter((item) => item.is_delete === false) || [];

  const columns: ColumnsType<TeacherAbsence> = [
    {
      title: "Nama Guru",
      dataIndex: "teacher_name",
      key: "teacher_name",
      responsive: ["md"], // Disembunyikan di mobile
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
      responsive: ["md"], 
    },
    {
      title: "Bukti",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (imageUrl: string) => (
        <Image
          src={imageUrl}
          alt="Bukti"
          width={screens.xs ? 50 : 80} // Ukuran lebih kecil di mobile
          height={screens.xs ? 50 : 80}
          style={{ borderRadius: "8px", objectFit: "cover" }}
        />
      ),
    },
    {
      title: "Konfirmasi",
      dataIndex: "status",
      key: "status",
      render: (_, record) =>
        !showHistory && (
          <Space wrap>
            <Button
              disabled={record.status}
              size={screens.xs ? "small" : "middle"}
              style={{
                backgroundColor: record.status ? "#52c41a" : "#d9d9d9",
                color: "white",
                borderRadius: "5px",
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
              size={screens.xs ? "small" : "middle"}
              style={{
                backgroundColor: !record.status ? "#ff4d4f" : "#d9d9d9",
                color: "white",
                borderRadius: "5px",
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
    <div style={{ padding: screens.xs ? "12px" : "24px" }}>
      <Title level={3} style={{ color: "#1890ff" }}>
        Absensi Guru
      </Title>

      {/* Tombol Riwayat */}
      <Space
        style={{
          marginBottom: "16px",
          display: "flex",
          justifyContent: "start",
        }}
      >
        <Button
          type={showHistory ? "default" : "primary"}
          size={screens.xs ? "small" : "middle"}
          onClick={() => setShowHistory(false)}
        >
          Data Aktif
        </Button>
        <Button
          type={showHistory ? "primary" : "default"}
          size={screens.xs ? "small" : "middle"}
          onClick={() => setShowHistory(true)}
        >
          Riwayat
        </Button>
      </Space>

      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
        }}
      >
        {isLoadingAbsent ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="teacher_absence_id"
            pagination={{ pageSize: 5 }}
            scroll={screens.xs ? { x: "max-content" } : undefined} // Scroll untuk mobile
          />
        )}
      </Card>
    </div>
  );
}
