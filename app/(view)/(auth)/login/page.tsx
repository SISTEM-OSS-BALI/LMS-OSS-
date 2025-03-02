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
  const { login, loading } = useLoginViewModel();

  const onFinish = (values: any) => {
    login(values);
  };

  return (
    <Layout style={{ minHeight: "100vh", overflow: "hidden" }}>
      <Row>
        <Col span={13}>
          <Header style={{ backgroundColor: "#fff" }}>
            <Row align="middle">
              <Col>
                <Image
                  src="/assets/images/logo.jpg"
                  alt="Logo"
                  width={45}
                  preview={false}
                />
              </Col>
              <Col>
                <Title
                  level={5}
                  style={{ marginBottom: 20, marginLeft: 10, marginBlock: 0 }}
                >
                  LMS ONE STEP SOLUTION
                </Title>
              </Col>
            </Row>
          </Header>
        </Col>

        <Col span={11}>
          <Header
            style={{
              backgroundColor: "#578FCA",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <Button type="primary">Try Out Gratis</Button>
          </Header>
        </Col>
      </Row>

      <Content
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#fff",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <Row
          style={{
            width: "100%",
            maxWidth: "900px",
            backgroundColor: "#fff",
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          <Col
            xs={24}
            md={14}
            style={{
              padding: "2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Space
              direction="vertical"
              size="large"
              style={{ width: "100%", maxWidth: "400px" }}
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
                style={{ width: "100%" }}
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
                  <Input
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
                <Row justify="space-between">
                  <Link href="/forgot-password">Lupa Password?</Link>
                  <Link href="/register">Belum Punya Akun?</Link>
                </Row>
              </Form>
            </Space>
          </Col>

          <Col
            xs={24}
            md={10}
            style={{
              backgroundColor: "#578FCA",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
            }}
          >
            <Image
              src="/assets/images/logo_login.png"
              alt="Login Image"
              width={300}
              height={300}
              preview={false}
            />
          </Col>
        </Row>
      </Content>

      <Footer
        style={{
          textAlign: "center",
          backgroundColor: "#f0f2f5",
          padding: "1.5rem 2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Row justify="center" gutter={[16, 16]}>
          <Col>
            <div>
              <WhatsAppOutlined style={{ marginRight: "8px" }} />
              <strong>WhatsApp:</strong>{" "}
              <Link
                href="https://wa.me/+6287705092020"
                target="_blank"
                rel="noopener noreferrer"
              >
                +6287705092020
              </Link>
            </div>
          </Col>
          <Col>
            <div>
              <InstagramOutlined style={{ marginRight: "8px" }} />
              <strong>Instagram:</strong>{" "}
              <Link
                href="https://www.instagram.com/oss_bali"
                target="_blank"
                rel="noopener noreferrer"
              >
                @oss_bali
              </Link>
            </div>
          </Col>
          <Col>
            <div>
              <GlobalOutlined style={{ marginRight: "8px" }} />
              <strong>Website:</strong>{" "}
              <Link href="https://onestepsolutionbali.com/">
                onestepsolutionbali.com
              </Link>
            </div>
          </Col>
          <Col>
            <div>
              <LinkedinFilled style={{ marginRight: "8px" }} />
              <strong>Linkedin:</strong>{" "}
              <Link
                href="https://www.linkedin.com/company/onestepsolutionbali/"
                target="_blank"
                rel="noopener noreferrer"
              >
                onestepsolutionbali
              </Link>
            </div>
          </Col>
        </Row>
      </Footer>
    </Layout>
  );
}
