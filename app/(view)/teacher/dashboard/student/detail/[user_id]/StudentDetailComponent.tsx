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
  Input, // Tambahkan Skeleton untuk loading
} from "antd";
import { useDetailStudentViewModel } from "./useDetailStudentViewModel";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import TextArea from "antd/es/input/TextArea";
import { useEffect } from "react";
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

  return (
    <div style={{ padding: "24px" }}>
      <Row gutter={[24, 24]}>
        {/* Student Details */}
        <Col md={16}>
          <Card style={{ borderRadius: "12px", padding: "24px" }}>
            <Title level={3} style={{ marginBottom: "24px" }}>
              Detail Siswa
            </Title>
            <Row align="middle">
              {/* Avatar */}
              <Col span={6} style={{ textAlign: "center" }}>
                {isLoadingStudent ? (
                  <Skeleton.Avatar active size={150} />
                ) : (
                  <Avatar
                    size={150}
                    src={filteredStudent?.imageUrl}
                    style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  />
                )}
              </Col>
              {/* Student Info */}
              <Col span={18}>
                {isLoadingStudent ? (
                  <Skeleton active paragraph={{ rows: 5 }} />
                ) : (
                  <table style={{ width: "100%", lineHeight: "2" }}>
                    <tbody>
                      <tr>
                        <th>
                          <Text strong>Nama</Text>
                        </th>
                        <td>{filteredStudent?.username}</td>
                      </tr>
                      <tr>
                        <th>
                          <Text strong>No Telpon</Text>
                        </th>
                        <td>{filteredStudent?.no_phone}</td>
                      </tr>
                      <tr>
                        <th>
                          <Text strong>Asal</Text>
                        </th>
                        <td>{filteredStudent?.region}</td>
                      </tr>
                      {filteredPrograms?.map((program) => (
                        <tr key={program.program_id}>
                          <th>
                            <Text strong>Program</Text>
                          </th>
                          <td>{program.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
            <Button type="primary" disabled={isLoadingProgram}>
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
                    disabled={filteredStudent?.is_evaluation}
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

                {/* Input Level */}
                <Form.Item
                  name={["sections", index, "level"]}
                  label="Level"
                  rules={[
                    {
                      required: true,
                      message: `Masukkan level untuk ${type}!`,
                    },
                  ]}
                >
                  <Input placeholder={`Masukkan level untuk ${type}`} />
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
                    placeholder={`Masukkan komentar untuk ${type}`}
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
