import {
  Avatar,
  Button,
  Card,
  Col,
  Flex,
  Row,
  Table,
  Tooltip,
  Typography,
  Skeleton,
  Modal,
  Form,
  Select,
  Space,
  Input,
  Tag,
} from "antd";
import { useDetailStudentViewModel } from "./useDetailStudentViewModel";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import TextArea from "antd/es/input/TextArea";
import {
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  BookOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useParams } from "next/navigation";
dayjs.extend(utc);

const { Title, Text } = Typography;

export default function StudentDetailComponent() {
  const {
    filteredStudent,
    filteredMeetings,
    filteredPrograms,
    isLoadingStudent,
    isLoadingMeeting,
    isLoadingProgram,
    handleOpenModal,
    isModalCertificate,
    handleCancel,
    form,
    handleFinish,
    sectionTypes,
    loading,
  } = useDetailStudentViewModel();

  const query = useParams();
  const student_id = query.user_id;

  type SectionType = "LISTENING" | "READING" | "WRITING" | "SPEAKING";

  const levelOptions: Record<
    SectionType,
    { value: string; label: string; comment: string }[]
  > = {
    LISTENING: [
      {
        value: "A1",
        label: "A1",
        comment: "Student can recognise familiar words and very basic phrases.",
      },
      {
        value: "A2",
        label: "A2",
        comment:
          "Student can understand phrases and the highest frequency vocabulary related to areas of most immediate personal relevance.",
      },
      {
        value: "B1",
        label: "B1",
        comment:
          "Student can understand the main points of clear standard speech on familiar matters regularly encountered.",
      },
      {
        value: "B2",
        label: "B2",
        comment:
          "Student can understand extended speech and lectures and follow even complex lines of argument provided the topic is reasonably familiar.",
      },
      {
        value: "C1",
        label: "C1",
        comment:
          "Student can understand extended speech even when it is not clearly structured.",
      },
      {
        value: "C2",
        label: "C2",
        comment:
          "Student has no difficulty in understanding any kind of spoken language and gets familiar with the accent.",
      },
    ],
    READING: [
      {
        value: "A1",
        label: "A1",
        comment:
          "Student can understand familiar names, words and very simple sentences.",
      },
      {
        value: "A2",
        label: "A2",
        comment:
          "Student can read very short and simple texts, find specific, predictable information in simple everyday material.",
      },
      {
        value: "B1",
        label: "B1",
        comment:
          "Student can understand texts that consist mainly of high-frequency everyday or job-related language.",
      },
      {
        value: "B2",
        label: "B2",
        comment:
          "Student can read articles and reports concerned with contemporary problems in which the writers adopt particular attitudes or viewpoints.",
      },
      {
        value: "C1",
        label: "C1",
        comment:
          "Student can understand long and complex factual and literary texts, appreciating distinctions of style.",
      },
      {
        value: "C2",
        label: "C2",
        comment:
          "Student can read with ease virtually all forms of the written language, including abstract, structurally or linguistically complex texts.",
      },
    ],
    WRITING: [
      {
        value: "A1",
        label: "A1",
        comment:
          "Student can write a short, simple postcard, for example, sending holiday greetings.",
      },
      {
        value: "A2",
        label: "A2",
        comment:
          "Student can write short, simple notes and messages relating to matters in areas of immediate needs.",
      },
      {
        value: "B1",
        label: "B1",
        comment:
          "Student can write simple connected text on topics which are familiar or of personal interest.",
      },
      {
        value: "B2",
        label: "B2",
        comment:
          "Student can write clear, detailed text on a wide range of subjects related to their interests.",
      },
      {
        value: "C1",
        label: "C1",
        comment:
          "Student can express themselves in clear, well-structured text, expressing points of view at some length.",
      },
      {
        value: "C2",
        label: "C2",
        comment:
          "Student can write clear, smoothly flowing text in an appropriate style and write summaries and reviews of professional or literary works.",
      },
    ],
    SPEAKING: [
      {
        value: "A1",
        label: "A1",
        comment:
          "Student can ask and answer simple questions in areas of immediate need or on very familiar topics.",
      },
      {
        value: "A2",
        label: "A2",
        comment:
          "Student can communicate in simple and routine tasks requiring a simple and direct exchange of information on familiar topics and activities.",
      },
      {
        value: "B1",
        label: "B1",
        comment:
          "Student can enter unprepared into conversations on topics that are familiar, of personal interest, or pertinent to everyday life.",
      },
      {
        value: "B2",
        label: "B2",
        comment:
          "Student can interact with a degree of fluency and spontaneity that makes regular interaction with native speakers quite possible.",
      },
      {
        value: "C1",
        label: "C1",
        comment:
          "Student can use language flexibly and effectively for social and professional purposes.",
      },
      {
        value: "C2",
        label: "C2",
        comment:
          "Student can take part effortlessly in any conversation or discussion and have a good familiarity with idiomatic expressions and colloquialisms.",
      },
    ],
  };


   const handleLevelChange = (value: string, index: number, type: string) => {
     // Pastikan type ada dalam levelOptions
     const selectedLevel = levelOptions[
       type as keyof typeof levelOptions
     ]?.find((level) => level.value === value);

     if (selectedLevel) {
       // Update komentar secara otomatis di Form
       form.setFieldsValue({
         sections: form
           .getFieldValue("sections")
           .map((section: any, i: number) =>
             i === index
               ? { ...section, comment: selectedLevel.comment }
               : section
           ),
       });
     }
   };



  const columns: any = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Tanggal",
      dataIndex: "dateTime",
      key: "dateTime",
      render: (text: any) => dayjs.utc(text).format("YYYY-MM-DD HH:mm"),
    },
    { title: "Metode", dataIndex: "method", key: "method" },
    {
      title: "Skala Kemampuan",
      dataIndex: "abilityScale",
      key: "abilityScale",
    },
    {
      title: "Kinerja Siswa",
      dataIndex: "studentPerformance",
      key: "studentPerformance",
    },
    {
      title: "Hasil Inputan Guru",
      dataIndex: "progress_student",
      key: "progress_student",
    },
  ];

  const data = filteredMeetings?.map((meeting) => ({
    key: meeting.meeting_id,
    method: meeting.method,
    progress_student: meeting.progress_student,
    abilityScale: meeting.abilityScale,
    studentPerformance: meeting.studentPerformance,
    dateTime: meeting.dateTime,
  }));

  const columnsInfo = [
    {
      title: "Informasi",
      dataIndex: "label",
      key: "label",
      render: (text: any) => <Text strong>{text}</Text>,
    },
    {
      title: "Detail",
      dataIndex: "value",
      key: "value",
      render: (text: any, record: any) =>
        record.isTag ? <Tag color="blue">{text}</Tag> : text,
    },
  ];

  const dataInfo = [
    {
      key: "name",
      label: (
        <>
          <UserOutlined style={{ marginRight: 5 }} />
          Nama
        </>
      ),
      value: filteredStudent?.username || "Tidak tersedia",
    },
    {
      key: "phone",
      label: (
        <>
          <PhoneOutlined style={{ marginRight: 5 }} />
          No Telepon
        </>
      ),
      value: filteredStudent?.no_phone || "Tidak tersedia",
    },
    {
      key: "region",
      label: (
        <>
          <EnvironmentOutlined style={{ marginRight: 5 }} />
          Asal
        </>
      ),
      value: filteredStudent?.region || "Tidak tersedia",
    },
    ...(filteredPrograms?.map((program) => ({
      key: program.program_id,
      label: (
        <>
          <BookOutlined style={{ marginRight: 5 }} />
          Program
        </>
      ),
      value: program.name,
      isTag: true,
    })) || []),
    {
      key: "target",
      label: (
        <>
          <FileTextOutlined style={{ marginRight: 5 }} />
          Catatan
        </>
      ),
      value: filteredStudent?.target || "Tidak tersedia",
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Row gutter={[24, 24]}>
        {/* Student Details */}
        <Col md={16}>
          <Card style={{ borderRadius: "12px", padding: "20px" }}>
            <Title level={3} style={{ marginBottom: "24px" }}>
              Detail Siswa
            </Title>
            <Row
              gutter={[16, 16]}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              {/* Avatar Section */}
              <Col
                span={6}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {isLoadingStudent ? (
                  <Skeleton.Avatar active size={150} />
                ) : (
                  <Avatar
                    size={150}
                    src={filteredStudent?.imageUrl}
                    style={{
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      border: "2px solid #eaeaea",
                    }}
                  />
                )}
              </Col>

              {/* Table Section */}
              <Col
                span={17} // Memberikan lebih banyak ruang untuk tabel
                style={{ display: "flex", justifyContent: "flex-start" }}
              >
                {isLoadingStudent ? (
                  <Skeleton active paragraph={{ rows: 5 }} />
                ) : (
                  <Table
                    columns={columnsInfo}
                    dataSource={dataInfo}
                    pagination={false}
                    bordered
                    size="small"
                    style={{ width: "100%", maxWidth: "600px" }} // Membatasi lebar tabel agar proporsional
                  />
                )}
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Total Meetings */}
        <Col md={8}>
          <Card
            style={{
              textAlign: "center",
              borderRadius: "12px",
              padding: "24px",
              minHeight: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <Title level={3} style={{ marginBottom: "16px" }}>
              Total Pertemuan
            </Title>
            {isLoadingStudent ? (
              <Skeleton.Input active size="large" style={{ width: "80px" }} />
            ) : (
              <Text strong style={{ fontSize: "48px", color: "#1890ff" }}>
                {filteredStudent?.count_program}
              </Text>
            )}
          </Card>
        </Col>
      </Row>

      {/* Meeting History */}
      <Card
        style={{ marginTop: "24px", borderRadius: "12px", padding: "24px" }}
      >
        <Flex justify="space-between" style={{ marginBlock: "10px" }}>
          <Title level={3}>Riwayat Pertemuan</Title>
          <Flex justify="space-between" gap={10}>
            <Button type="primary" disabled={isLoadingProgram} href={`/teacher/dashboard/history-test/${student_id}`}>
              Riwayat Placement Test
            </Button>
            {isLoadingProgram ? (
              <Skeleton.Button active />
            ) : (
              <>
                {filteredPrograms &&
                filteredPrograms.length > 0 &&
                filteredStudent?.count_program ===
                  filteredPrograms[0]?.count_program ? (
                  <Button
                    type="primary"
                    onClick={
                      filteredStudent?.is_evaluation
                        ? undefined
                        : handleOpenModal
                    }
                    disabled={filteredStudent?.is_evaluation === true}
                  >
                    {filteredStudent?.is_evaluation
                      ? "Sudah Menilai Sertifikat"
                      : "Isi Nilai Sertifikat"}
                  </Button>
                ) : (
                  <Tooltip title="Pertemuan belum selesai">
                    <Button type="primary" disabled>
                      Nilai Sertifikat
                    </Button>
                  </Tooltip>
                )}
              </>
            )}
          </Flex>
        </Flex>

        {isLoadingMeeting ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : (
          <Table
            columns={columns}
            dataSource={data}
            pagination={{ pageSize: 5 }}
          />
        )}
      </Card>

      <Modal
        open={isModalCertificate}
        onCancel={handleCancel}
        title="Nilai Sertifikat"
        footer={null}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleFinish}
          initialValues={{
            sections: sectionTypes.map((type) => ({
              section_type: type,
              level: "",
              comment: "",
            })),
          }}
        >
          <Row gutter={[16, 16]}>
            {sectionTypes.map((type, index) => (
              <Col xs={24} sm={12} key={type}>
                <Typography.Text strong>{type}</Typography.Text>

                {/* Select Level */}
                <Form.Item
                  name={["sections", index, "level"]}
                  label="Level"
                  rules={[
                    { required: true, message: `Pilih level untuk ${type}!` },
                  ]}
                >
                  <Select
                    onChange={(value) => handleLevelChange(value, index, type)}
                  >
                    {levelOptions[type as SectionType]?.map((level) => (
                      <Select.Option key={level.value} value={level.value}>
                        {level.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* Input Komentar (Menggunakan TextArea) */}
                <Form.Item
                  name={["sections", index, "comment"]}
                  label="Komentar"
                  rules={[
                    {
                      required: true,
                      message: `Masukkan komentar untuk ${type}!`,
                    },
                  ]}
                >
                  <TextArea
                    placeholder={`Komentar akan muncul otomatis`}
                    autoSize={{ minRows: 2, maxRows: 4 }}
                  />
                </Form.Item>
              </Col>
            ))}
          </Row>

          {/* Tombol Simpan */}
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Simpan
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
