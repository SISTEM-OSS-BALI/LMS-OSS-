import { Table, Collapse, Typography, Tag, Space, Card, Col } from "antd";
import { useStudentViewModel } from "./useStudentViewModel";
import { useEffect } from "react";
import {
  UserOutlined,
  PhoneOutlined,
  AimOutlined,
  CalendarOutlined,
  BookOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

const { Title, Text } = Typography;
const { Panel } = Collapse;

// **🔹 Definisi tipe data untuk siswa & pertemuan**
interface Meeting {
  meeting_id: string;
  method: string | null;
  teacherName: string;
  dateTime: Date;
}

interface Student {
  user_id: string;
  username: string;
  no_phone: string | null;
  region: string | null;
  program_name?: string;
  count_program: number | null;
  target?: string | null;
  meetings: Meeting[];
}

export default function StudentComponent() {
  const { mergedStudent }: { mergedStudent: Student[] } = useStudentViewModel();

  // **🔹 Kolom untuk tabel siswa**
  const columns = [
    {
      title: "Nama Siswa",
      dataIndex: "username",
      key: "username",
      render: (text: string) => (
        <Space>
          <UserOutlined /> {text}
        </Space>
      ),
    },
    {
      title: "Telepon",
      dataIndex: "no_phone",
      key: "no_phone",
      render: (text: string | null) => (
        <Space>
          <PhoneOutlined style={{ color: "#1890ff" }} />{" "}
          {text ?? "Tidak Diketahui"}
        </Space>
      ),
    },
    {
      title: "Wilayah",
      dataIndex: "region",
      key: "region",
      render: (text: string) => (
        <Tag color="green">
          <AimOutlined /> {text}
        </Tag>
      ),
    },
    {
      title: "Program",
      dataIndex: "program_name",
      key: "program_name",
      render: (text?: string) => (
        <Tag color="blue">
          <BookOutlined /> {text || "Tidak Ada Program"}
        </Tag>
      ),
    },
    {
      title: "Total Pertemuan",
      dataIndex: "count_program",
      key: "count_program",
      render: (text: number) => (
        <Tag color="purple">
          <TeamOutlined /> {text ?? 0}
        </Tag>
      ),
    },
    {
      title: "Target",
      dataIndex: "target",
      key: "target",
      render: (text?: string) =>
        text ? (
          <Tag color="green">{text}</Tag>
        ) : (
          <Text type="secondary">Tidak Ditentukan</Text>
        ),
    },
    {
      title: "Jadwal Pertemuan",
      key: "meetings",
      render: (_: any, student: Student) =>
        student.meetings.length > 0 ? (
          <Collapse ghost>
            <Panel header="Lihat Pertemuan" key="1">
              {/** Tabel untuk daftar pertemuan */}
              <Table
                columns={[
                  //   {
                  //     title: "Metode",
                  //     dataIndex: "method",
                  //     key: "method",
                  //     render: (text: string | null) => (
                  //       <Tag color="cyan">{text ?? "Tidak Diketahui"}</Tag>
                  //     ),
                  //   },
                  {
                    title: "Pengajar",
                    dataIndex: "teacherName",
                    key: "teacherName",
                    render: (text: string) => (
                      <Tag color="volcano">{text ?? "Tidak Diketahui"}</Tag>
                    ),
                  },
                  {
                    title: "Tanggal",
                    dataIndex: "dateTime",
                    key: "dateTime",
                    render: (text: string) => (
                      <Tag color="gold">
                        {dayjs.utc(text).format("YYYY-MM-DD HH:mm")}
                      </Tag>
                    ),
                  },
                ]}
                dataSource={student.meetings}
                pagination={false}
                size="small"
                rowKey="meeting_id"
                scroll={{ x: "max-content" }}
              />
            </Panel>
          </Collapse>
        ) : (
          <Text type="secondary">Tidak ada pertemuan terjadwal</Text>
        ),
    },
    {
      title: "Total Pertemuan per Guru",
      key: "total_meetings_per_teacher",
      render: (_: any, student: Student) => {
        const teacherMeetings = student.meetings.reduce<Record<string, number>>(
          (acc, meeting) => {
            acc[meeting.teacherName] = (acc[meeting.teacherName] || 0) + 1;
            return acc;
          },
          {}
        );

        return Object.entries(teacherMeetings).map(([teacher, count], i) => (
          <Col>
            <Tag key={i} color="geekblue">
              {teacher}: {count} Pertemuan
            </Tag>
          </Col>
        ));
      },
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Title level={3}>Data Siswa</Title>
      <Card>
        <Table
          columns={columns}
          dataSource={mergedStudent}
          rowKey="user_id"
          scroll={{ x: "max-content" }}
        />
      </Card>
    </div>
  );
}
