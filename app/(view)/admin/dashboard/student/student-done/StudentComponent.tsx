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
  Form,
  Select,
  Descriptions,
} from "antd";
import { useStudentViewModel } from "./useStudentViewModel";
import { useEffect } from "react";
import Icon, {
  UserOutlined,
  PhoneOutlined,
  AimOutlined,
  CalendarOutlined,
  BookOutlined,
  TeamOutlined,
  DeleteFilled,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PoweroffOutlined,
  InfoCircleFilled,
} from "@ant-design/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Program, User, UserProgramRenewal } from "@prisma/client";
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

interface Consultant {
  consultant_id: string;
  name: string;
  no_phone: string;
}

interface Student {
  user_id: string;
  username: string | null;
  no_phone: string | null;
  region: string | null;
  program_name?: string;
  count_program: number | null;
  target?: string | null;
  meetings: Meeting[];
  name_group?: string | null;
  is_active: boolean | null;
  renew_program: boolean | null;
  consultant?: Consultant | null;
}

interface ProgramResponse {
  data: Program[];
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
    loading,
    handleFrezeAccount,
    openModal,
    isModalVisible,
    closeModal,
    programDataAll,
    form,
    programId,
    setProgramId,
    handleUpdateProgram,
    loadingUpdate,
    handleOpenModalDetail,
    isModalDetailVisible,
    closeModalDetail,
    filteredProgramRenewal,
  }: {
    mergedStudent: Student[];
    meetingDataLoading: boolean;
    programDataLoading: boolean;
    teacherDataLoading: boolean;
    handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
    filteredStudent: Student[];
    handleDelete: (student_id: string) => void;
    loading: boolean;
    openModal: (student_id: string) => void;
    handleFrezeAccount: (student_id: string, is_active: boolean) => void;
    isModalVisible: boolean;
    closeModal: () => void;
    programDataAll: ProgramResponse | undefined;
    form: any;
    programId: string;
    setProgramId: (program_id: string) => void;
    handleUpdateProgram: () => void;
    loadingUpdate: boolean;
    handleOpenModalDetail: (student_id: string) => void;
    isModalDetailVisible: boolean;
    closeModalDetail: () => void;
    filteredProgramRenewal: any;
  } = useStudentViewModel();


  const isLoading =
    meetingDataLoading || programDataLoading || teacherDataLoading;
  const isDataEmpty = !mergedStudent || mergedStudent.length === 0;

  const programList = programDataAll?.data || [];

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

  const showConfirmFrezeAccount = (student_id: string, is_active: boolean) => {
    Modal.confirm({
      title: "Konfirmasi",
      content: is_active
        ? "Apakah Anda yakin menonaktifkan akun siswa ini?"
        : "Apakah Anda yakin mengaktifkan akun siswa ini?",
      okText: "Ya",
      okType: "danger",
      cancelText: "Tidak",
      onOk: () => handleFrezeAccount(student_id, is_active),
    });
  };

  // **🔹 Kolom untuk tabel siswa**
  const columns = [
    {
      title: "Nama Siswa",
      key: "username",
      render: (_: any, record: Student) => (
        <Space>
          <UserOutlined />
          {record.username ? record.username : record.name_group ?? "-"}
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
      title: "Nama Konsultan",
      key: "consultant_name",
      render: (record: any) => (
        <Space>
          <UserOutlined style={{ color: "#1890ff" }} />{" "}
          {record.consultant?.name ?? "-"}
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
            Selesai
          </Tag>
        ) : (
          <Tag
            icon={<CloseCircleOutlined />}
            color="error"
            style={{ fontWeight: 600 }}
          >
            Belum Selesai
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
          {/* {student.is_active === true ? (
            <Button
              icon={<PoweroffOutlined />}
              onClick={() => showConfirmFrezeAccount(student.user_id, false)}
            >
              Tutup Akun
            </Button>
          ) : (
            <Button
              icon={<PoweroffOutlined />}
              onClick={() => showConfirmFrezeAccount(student.user_id, true)}
            >
              Buka Akun
            </Button>
          )}
          {student.program_name !== "Group Class" && (
            <Button onClick={() => openModal(student.user_id)}>
              Perbaharui Program
            </Button>
          )} */}
        </Space>
      ),
    },
    // {
    //   title: "Detail",
    //   key: "detail",
    //   render: (_: any, student: Student) =>
    //     student.renew_program === true ? (
    //       <Button
    //         onClick={() => handleOpenModalDetail(student.user_id)}
    //         icon={<InfoCircleFilled />}
    //       />
    //     ) : null,
    // },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Flex justify="space-between" style={{ marginBottom: "20px" }}>
        <Title level={3} style={{ marginBlock: 0 }}>
          Data Siswa Selesai
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
      <div>
        <Modal
          open={isModalVisible}
          onCancel={closeModal}
          footer={null}
          title="Perbaharui Program"
        >
          <Form form={form} layout="vertical" onFinish={handleUpdateProgram}>
            <Form.Item name="program_id">
              <Select
                placeholder="Pilih Program"
                onChange={(value) => setProgramId(value)}
              >
                {programList.map((program) => (
                  <Select.Option
                    key={program.program_id}
                    value={program.program_id}
                  >
                    {program.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button
                htmlType="submit"
                type="primary"
                style={{ width: "100%" }}
                loading={loadingUpdate}
              >
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
      <div>
        <Modal
          open={isModalDetailVisible}
          onCancel={closeModalDetail}
          footer={null}
          title="Detail Perbaharuan Program"
          width={480}
          centered
          bodyStyle={{
            padding: 24,
            background: "#fafbfc",
          }}
        >
          <Descriptions
            bordered
            column={1}
            size="middle"
            labelStyle={{
              fontWeight: "bold",
              background: "#f5f5f5",
              width: 200,
              fontSize: 15,
              color: "#234",
              letterSpacing: 0.2,
            }}
            contentStyle={{
              fontSize: 15,
              color: "#222",
              background: "#fff",
            }}
          >
            <Descriptions.Item label="Program Lama">
              {filteredProgramRenewal?.[0]?.old_program_name}
            </Descriptions.Item>
            <Descriptions.Item label="Program Baru">
              {filteredProgramRenewal?.[0]?.new_program_name}
            </Descriptions.Item>
            <Descriptions.Item label="Tanggal Perbaharuan">
              {filteredProgramRenewal?.[0]?.renew_date
                ? dayjs(filteredProgramRenewal[0].renew_date).format(
                    "YYYY-MM-DD"
                  )
                : "-"}
            </Descriptions.Item>
          </Descriptions>
        </Modal>
      </div>
    </div>
  );
}
