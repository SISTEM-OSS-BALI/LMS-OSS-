import {
  Table,
  Collapse,
  Typography,
  Tag,
  Space,
  Card,
  Col,
  Skeleton,
  Alert,
  Flex,
  Input,
  Button,
  Modal,
} from "antd";
import { useStudentViewModel } from "./useStudentViewModel";
import { useEffect } from "react";
import {
  UserOutlined,
  PhoneOutlined,
  AimOutlined,
  CalendarOutlined,
  BookOutlined,
  TeamOutlined,
  DeleteFilled,
  CheckCircleOutlined,
  CloseCircleOutlined,
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
  const {
    mergedStudent,
    meetingDataLoading,
    programDataLoading,
    teacherDataLoading,
    handleSearch,
    filteredStudent,
    handleDelete,
  }: {
    mergedStudent: Student[];
    meetingDataLoading: boolean;
    programDataLoading: boolean;
    teacherDataLoading: boolean;
    handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
    filteredStudent: Student[];
    handleDelete: (student_id: string) => void;
  } = useStudentViewModel();

  console.log(mergedStudent);

  const isLoading =
    meetingDataLoading || programDataLoading || teacherDataLoading;
  const isDataEmpty = !mergedStudent || mergedStudent.length === 0;

  const showConfirmDelete = (student_id: string) => {
    Modal.confirm({
      title: "Konfirmasi",
      content: "Apakah Anda yakin menghapus data siswa?",
      okText: "Ya",
      okType: "danger",
      cancelText: "Tidak",
      onOk: () => handleDelete(student_id),
    });
  };

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
          <Col key={i}>
            <Tag key={i} color="geekblue">
              {teacher}: {count} Pertemuan
            </Tag>
          </Col>
        ));
      },
    },

    {
      title: "Status",
      key: "status",
      render: (_: any, student: any) => {
        const completedCount = student.count_program ?? 0;
        const totalCount = student.program_count ?? 0;

        const isDone = completedCount >= totalCount;

        return isDone ? (
          <Tag
            icon={<CheckCircleOutlined />}
            color="success"
            style={{ fontWeight: 600 }}
          >
            DONE
          </Tag>
        ) : (
          <Tag
            icon={<CloseCircleOutlined />}
            color="error"
            style={{ fontWeight: 600 }}
          >
            NOT DONE
          </Tag>
        );
      },
    },
    {
      title: "Aksi",
      key: "action",
      render: (_: any, student: Student) => (
        <Space>
          <Button
            icon={<DeleteFilled />}
            danger
            onClick={() => showConfirmDelete(student.user_id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Flex justify="space-between" style={{ marginBottom: "20px" }}>
        <Title level={3} style={{ marginBlock: 0 }}>
          Data Siswa
        </Title>
        <Input
          placeholder="Cari nama siswa"
          onChange={handleSearch} // ✅ Gunakan handleSearch
          style={{ width: "30%" }}
        />
      </Flex>
      <Card>
        {/* Skeleton Loading */}
        {isLoading ? (
          <>
            <Skeleton active />
            <Skeleton active paragraph={{ rows: 4 }} />
          </>
        ) : isDataEmpty ? (
          <Alert
            message="Informasi"
            description="Tidak ada data siswa tersedia."
            type="info"
            showIcon
          />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredStudent} // ✅ Gunakan filteredStudent
            rowKey="user_id"
            scroll={{ x: "max-content" }}
          />
        )}
      </Card>
    </div>
  );
}
