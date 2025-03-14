"use client";

import {
  Button,
  Col,
  Form,
  Input,
  Layout,
  Row,
  Typography,
  Space,
  Image,
  Flex,
  Modal,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  GlobalOutlined,
  InstagramOutlined,
  WhatsAppOutlined,
  LinkedinFilled,
} from "@ant-design/icons";
import Link from "next/link";
import { useLoginViewModel } from "@/app/(view)/(auth)/login/useLoginViewModel";
import { Footer } from "antd/es/layout/layout";

export default function Login() {
  const { Content, Header } = Layout;
  const { Title } = Typography;
  const {
    login,
    loading,
    sendNotif,
    handleOpenModal,
    handleCloseModal,
    isModalVisible,
    form,
    loadingForgotPassword,
  } = useLoginViewModel();

  const onFinish = (values: any) => {
    login(values);
  };

  return (
    <Layout style={{ minHeight: "100vh", overflow: "hidden" }}>
      {/* Header */}
      <Row>
        <Col xs={24} md={13}>
          <Header style={{ backgroundColor: "#fff", padding: "10px 20px" }}>
            <Flex align="center">
              <Image
                src="/assets/images/logo.jpg"
                alt="Logo"
                width={45}
                preview={false}
              />
              <Title
                level={5}
                style={{ margin: "0 10px", whiteSpace: "nowrap" }}
              >
                LMS ONE STEP SOLUTION
              </Title>
            </Flex>
          </Header>
        </Col>

        <Col xs={24} md={11}>
          <Header
            style={{
              backgroundColor: "#578FCA",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              padding: "10px 20px",
            }}
          >
            <Button type="primary">Try Out Gratis</Button>
          </Header>
        </Col>
      </Row>

      {/* Konten Utama */}
      <Content
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff",
          padding: "2rem",
        }}
      >
        <Row
          gutter={[16, 16]}
          style={{
            width: "100%",
            maxWidth: "900px",
            backgroundColor: "#fff",
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            padding: "20px",
          }}
        >
          {/* Form Login */}
          <Col xs={24} md={14}>
            <Flex
              vertical
              align="center"
              justify="center"
              style={{ width: "100%" }}
            >
              <Title level={2} style={{ textAlign: "center" }}>
                Selamat Datang!
              </Title>
              <Title level={4} style={{ textAlign: "center" }}>
                Login
              </Title>

              <Form
                name="login_form"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                layout="vertical"
                style={{ width: "100%", maxWidth: "350px" }}
              >
                <Form.Item
                  name="email"
                  rules={[{ required: true, message: "Masukkan Email Anda!" }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Email"
                    size="large"
                  />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: "Masukkan Password Anda!" },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    type="password"
                    placeholder="Password"
                    size="large"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    loading={loading}
                    style={{ backgroundColor: "#578FCA", color: "white" }}
                  >
                    Login
                  </Button>
                </Form.Item>

                {/* Link Lupa Password & Register */}
                <Row justify="space-between">
                  <Button
                    danger
                    onClick={handleOpenModal}
                    size="small"
                    type="link"
                    style={{ padding: 0 }}
                  >
                    Lupa Password?
                  </Button>
                  <Link href="/register">Belum Punya Akun?</Link>
                </Row>
              </Form>
            </Flex>
          </Col>

          {/* Gambar */}
          <Col
            xs={24}
            md={10}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              src="/assets/images/logo_login.png"
              alt="Login Image"
              width={250}
              height={250}
              preview={false}
              style={{ maxWidth: "100%" }}
            />
          </Col>
        </Row>
      </Content>

      {/* Footer */}
      <Footer
        style={{
          textAlign: "center",
          backgroundColor: "#f0f2f5",
          padding: "1rem",
        }}
      >
        <Row justify="center" gutter={[16, 16]}>
          <Col>
            <Flex align="center">
              <WhatsAppOutlined style={{ marginRight: "8px" }} />
              <Link
                href="https://wa.me/+6287705092020"
                target="_blank"
                rel="noopener noreferrer"
              >
                Call Center
              </Link>
            </Flex>
          </Col>
          <Col>
            <Flex align="center">
              <InstagramOutlined style={{ marginRight: "8px" }} />
              <Link
                href="https://www.instagram.com/oss_bali"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </Link>
            </Flex>
          </Col>
          <Col>
            <Flex align="center">
              <GlobalOutlined style={{ marginRight: "8px" }} />
              <Link href="https://onestepsolutionbali.com/">Website</Link>
            </Flex>
          </Col>
          <Col>
            <Flex align="center">
              <LinkedinFilled style={{ marginRight: "8px" }} />
              <Link
                href="https://www.linkedin.com/company/onestepsolutionbali/"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </Link>
            </Flex>
          </Col>
        </Row>
      </Footer>

      {/* Modal Lupa Password */}
      <Modal
        title="Lupa Password?"
        open={isModalVisible}
        footer={null}
        onCancel={handleCloseModal}
      >
        <Form layout="vertical" form={form} onFinish={sendNotif}>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Masukkan email Anda!" },
              { type: "email", message: "Email tidak valid!" },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loadingForgotPassword}
              style={{ width: "100%" }}
            >
              Kirim Notifikasi
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
