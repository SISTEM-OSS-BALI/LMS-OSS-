import {
  Card,
  Modal,
  Skeleton,
  Form,
  Input,
  Button,
  Typography,
  Layout,
  Space,
  Divider,
} from "antd";
import {
  ClockCircleOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  UpOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { useFreeMockTestViewModel } from "./useFreeMockViewModel";

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

export default function FreeMockComponent() {
  const {
    mockTestData,
    isLoadingMock,
    isModalVisible,
    showModal,
    handleCancel,
    handleFormSubmit,
    form,
    loading,
    setIsModalStartVisible,
    isModalStartVisible,
    startQuiz,
  } = useFreeMockTestViewModel();
  const mockTest = mockTestData?.data;

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #E0EAFC, #CFDEF3)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <Content>
        <Space direction="vertical" align="center">
          {isLoadingMock ? (
            <Skeleton
              active
              avatar
              paragraph={{ rows: 2 }}
              style={{ width: 350 }}
            />
          ) : (
            <Card
              hoverable
              style={{
                width: 400,
                borderRadius: 12,
                boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
                textAlign: "center",
                background: "#ffffff",
              }}
              onClick={showModal}
            >
              <Title level={3} style={{ color: "#333" }}>
                {mockTest?.name}
              </Title>
              <Paragraph style={{ fontSize: "16px", color: "#555" }}>
                {mockTest?.description}
              </Paragraph>
              <Paragraph
                style={{
                  fontWeight: "bold",
                  fontSize: "16px",
                  color: "#007bff",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <ClockCircleOutlined
                  style={{ fontSize: "18px", color: "#007bff" }}
                />
                Durasi: {mockTest?.timeLimit} Menit
              </Paragraph>
              <Button
                type="primary"
                size="large"
                style={{ marginTop: "10px", width: "100%" }}
              >
                Mulai mock Test
              </Button>
            </Card>
          )}
        </Space>
      </Content>

      {/* Modal Form Data Diri */}
      <Modal
        title="Isi Data Diri"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item
            label="Nama Lengkap"
            name="fullName"
            rules={[{ required: true, message: "Nama Lengkap harus diisi" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Masukkan Nama Lengkap"
            />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Email harus diisi" },
              { type: "email", message: "Masukkan email yang valid" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Masukkan Email" />
          </Form.Item>

          <Form.Item
            label="Nomor Telepon"
            name="phone"
            rules={[{ required: true, message: "Nomor Telepon harus diisi" }]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="Masukkan Nomor Telepon"
            />
          </Form.Item>

          <Form.Item
            label="Sekolah / Universitas"
            name="institution"
            rules={[{ required: true, message: "Instansi harus diisi" }]}
          >
            <Input
              prefix={<HomeOutlined />}
              placeholder="Masukkan Nama Instansi"
            />
          </Form.Item>

          <Form.Item
            label="Kelas / Semester"
            name="grade"
            rules={[{ required: true, message: "Grade harus diisi" }]}
          >
            <Input prefix={<UpOutlined />} placeholder="Masukkan Grade" />
          </Form.Item>

          <Form.Item
            label="Sosial Media"
            name="socialMedia"
            rules={[{ required: true, message: "Sosial Media harus diisi" }]}
          >
            <Input prefix={<GlobalOutlined />} placeholder="Sosial Media" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ width: "100%" }}
              loading={loading}
            >
              Simpan & Lanjutkan
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={
          <Title level={3} style={{ marginBottom: 0 }}>
            Deskripsi Tes
          </Title>
        }
        open={isModalStartVisible}
        onCancel={() => setIsModalStartVisible(false)}
        footer={null}
      >
        <div style={{ padding: "16px" }}>
          {/* 📝 Informasi Tes */}
          <Title level={4} style={{ color: "#1890FF" }}>
            {mockTest?.name}
          </Title>

          <Divider />

          {/* 🔹 Deskripsi */}
          <Title level={5} style={{ marginBottom: 4 }}>
            Deskripsi
          </Title>
          <Text style={{ fontSize: "16px", color: "#595959" }}>
            {mockTest?.description}
          </Text>

          <Divider />

          {/* ⏳ Durasi */}
          <Title level={5} style={{ marginBottom: 4 }}>
            Durasi
          </Title>
          <Text style={{ fontSize: "16px", color: "#595959" }}>
            {mockTest?.timeLimit} menit
          </Text>

          <Divider />

          {/* 🎯 Tombol Mulai Tes */}
          <Button
            type="primary"
            size="large"
            onClick={startQuiz}
            style={{ width: "100%", marginTop: "16px", fontWeight: "bold" }}
          >
            Mulai Tes Sekarang
          </Button>
        </div>
      </Modal>
    </Layout>
  );
}
