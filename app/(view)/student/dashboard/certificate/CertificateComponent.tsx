import { useEffect } from "react";
import { useCertificateViewModel } from "./useCertificateViewModel";
import {
  Col,
  Row,
  Checkbox,
  Button,
  Image,
  Spin,
  Card,
  Skeleton,
  Typography,
  Tag,
  Space,
  Modal,
  Form,
  Rate,
  Input,
  Grid,
} from "antd";
const { Text } = Typography;
import generateCertificate from "@/app/lib/utils/generateCertificate";
import Link from "next/link";

const { useBreakpoint } = Grid;

const { Title } = Typography;

export default function CertificateComponent() {
  const {
    isLoading,
    evaluationData,
    evaluationLoading,
    certificateBackPreview,
    certificateFrontPreview,
    generateCertificatePreview,
    certificate,
    handleCancelModalTestimoni,
    handleOpenModalTestimoni,
    isModalTestimoniVisible,
    form,
    handleSubmit,
    loading,
  } = useCertificateViewModel();

  useEffect(() => {
    if (certificate && evaluationData) {
      generateCertificatePreview();
    }
  }, [certificate, evaluationData, generateCertificatePreview]);

  const screens = useBreakpoint();

  return (
    <div style={{ padding: screens.xs ? "0px" : "24px", textAlign: "center" }}>
      <Title level={3} style={{ marginBottom: "20px", color: "#1890ff" }}>
        Cetak Sertifikat
      </Title>

      {isLoading || evaluationLoading ? (
        <Card style={{ borderRadius: "10px", padding: "24px" }}>
          <Skeleton active paragraph={{ rows: 4 }} />
        </Card>
      ) : !certificate ? (
        <Spin tip="Memuat sertifikat..." />
      ) : (
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} md={8}>
            <Card
              title={<Text strong>Status Sertifikat</Text>}
              style={{
                borderRadius: "10px",
                textAlign: "left",
                padding: screens.xs ? "12px" : "16px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                width: "100%",
              }}
            >
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                {/* Status Meeting */}
                <Tag
                  color={certificate.is_complated_meeting ? "green" : "red"}
                  style={{
                    fontSize: "16px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: screens.xs ? "wrap" : "nowrap",
                  }}
                >
                  <Text strong>Melakukan Jadwal Pertemuan:</Text>
                  {certificate.is_complated_meeting ? (
                    <Text strong style={{ color: "green" }}>
                      Selesai
                    </Text>
                  ) : (
                    <Link href="/student/dashboard/meeting">
                      <Button
                        type="link"
                        style={{ padding: 0, color: "#1890ff" }}
                      >
                        Selesaikan
                      </Button>
                    </Link>
                  )}
                </Tag>

                {/* Status Testimoni */}
                <Tag
                  color={certificate.is_complated_testimoni ? "green" : "red"}
                  style={{
                    fontSize: "16px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: screens.xs ? "wrap" : "nowrap",
                  }}
                >
                  <Text strong>Melakukan Testimoni:</Text>
                  {certificate.is_complated_testimoni ? (
                    <Text strong style={{ color: "green" }}>
                      Selesai
                    </Text>
                  ) : (
                    <Button
                      danger
                      onClick={handleOpenModalTestimoni}
                      size={screens.xs ? "small" : "middle"}
                      style={{
                        minWidth: screens.xs ? "100px" : "120px",
                        fontSize: screens.xs ? "14px" : "16px",
                      }}
                    >
                      Selesaikan
                    </Button>
                  )}
                </Tag>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              title="Pratinjau Sertifikat"
              style={{ borderRadius: "10px", textAlign: "center" }}
            >
              <Row gutter={[16, 16]} justify="center">
                <Col xs={24} md={16}>
                  {certificateFrontPreview ? (
                    <Image
                      src={certificateFrontPreview}
                      alt="Sertifikat Depan"
                      width={300}
                      preview={true}
                      style={{
                        borderRadius: "8px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                  ) : (
                    <Spin tip="Membuat pratinjau sertifikat depan..." />
                  )}
                </Col>
                <Col xs={24} md={16}>
                  {certificateBackPreview ? (
                    <Image
                      src={certificateBackPreview}
                      alt="Sertifikat Belakang"
                      width={300}
                      preview={true}
                      style={{
                        borderRadius: "8px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                  ) : (
                    <Spin tip="Membuat pratinjau sertifikat belakang..." />
                  )}
                </Col>
              </Row>

              <br />
              <Button
                type="primary"
                disabled={!certificate.is_download}
                onClick={() =>
                  generateCertificate(
                    certificate.student_name,
                    certificate.no_certificate,
                    (evaluationData?.data ?? []).map(
                      ({ section_type, level, comment }) => ({
                        section_type,
                        level,
                        comment,
                      })
                    ),
                    "/assets/images/certificate_front.png",
                    "/assets/images/certificate_back.png"
                  )
                }
                style={{ marginTop: 20, width: "100%" }}
              >
                Download Sertifikat
              </Button>
            </Card>
          </Col>
        </Row>
      )}
      <Modal
        open={isModalTestimoniVisible}
        onCancel={handleCancelModalTestimoni}
        title="Testimoni"
        footer={null}
        width={900} // Lebih lebar agar cukup untuk dua kolom
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={[16, 16]}>
            {/* Kolom 1 */}
            <Col xs={24} md={12}>
              <Form.Item
                label="Seberapa puas dengan materi pelajaran?"
                name="lesson_satisfaction"
                rules={[{ required: true, message: "Harap berikan rating" }]}
              >
                <Rate />
              </Form.Item>

              <Form.Item
                label="Apakah metode pengajaran memudahkan pemahaman?"
                name="teaching_method_effectiveness"
                rules={[{ required: true, message: "Harap berikan rating" }]}
              >
                <Rate />
              </Form.Item>

              <Form.Item
                label="Apakah jumlah latihan dan tugas sudah sesuai?"
                name="exercise_and_assignment_relevance"
                rules={[{ required: true, message: "Harap berikan rating" }]}
              >
                <Rate />
              </Form.Item>

              <Form.Item
                label="Seberapa relevan materi dengan kebutuhan bahasa Inggris?"
                name="material_relevance"
                rules={[{ required: true, message: "Harap berikan rating" }]}
              >
                <Rate />
              </Form.Item>

              <Form.Item
                label="Identitas Guru yang Mengajar"
                name="teacher_identity"
                rules={[
                  { required: true, message: "Harap isi identitas guru" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Bagaimana cara guru menyampaikan materi?"
                name="teaching_delivery"
                rules={[{ required: true, message: "Harap berikan rating" }]}
              >
                <Rate />
              </Form.Item>
            </Col>

            {/* Kolom 2 */}
            <Col xs={24} md={12}>
              <Form.Item
                label="Apakah guru memberikan perhatian kepada siswa yang kesulitan?"
                name="teacher_attention"
                rules={[{ required: true, message: "Harap berikan rating" }]}
              >
                <Rate />
              </Form.Item>

              <Form.Item
                label="Bagaimana sikap dan etika guru selama mengajar?"
                name="teacher_ethics"
                rules={[{ required: true, message: "Harap berikan rating" }]}
              >
                <Rate />
              </Form.Item>

              <Form.Item
                label="Apakah guru memberikan motivasi dalam belajar?"
                name="teacher_motivation"
                rules={[{ required: true, message: "Harap berikan rating" }]}
              >
                <Rate />
              </Form.Item>

              <Form.Item
                label="Ceritakan pengalaman Anda dalam kelas (Plus & Minus serta saran)"
                name="class_experience"
                rules={[
                  { required: true, message: "Harap isi pengalaman Anda" },
                ]}
              >
                <Input.TextArea rows={3} />
              </Form.Item>

              <Form.Item
                label="Apa yang paling Anda sukai dari pembelajaran ini?"
                name="favorite_part"
                rules={[
                  { required: true, message: "Harap isi bagian favorit" },
                ]}
              >
                <Input.TextArea rows={3} />
              </Form.Item>

              <Form.Item
                label="Apa yang perlu ditingkatkan dalam pembelajaran?"
                name="improvement_suggestions"
                rules={[
                  { required: true, message: "Harap isi saran perbaikan" },
                ]}
              >
                <Input.TextArea rows={3} />
              </Form.Item>
            </Col>
          </Row>

          {/* Tombol Submit */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ width: "100%" }}
              loading={loading}
            >
              Kirim Testimoni
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
