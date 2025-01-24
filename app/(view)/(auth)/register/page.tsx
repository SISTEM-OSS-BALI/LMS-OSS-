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
  notification,
  message,
  Flex,
} from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { crudService } from "@/app/lib/services/crudServices";
import { primaryColor } from "@/app/lib/utils/colors";

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { Content, Header } = Layout;
  const { Title } = Typography;

  const onFinish = async (values: any) => {
    setLoading(true);

    const payload = {
      email: values.email,
      password: values.password,
    };
    try {
      const response = await crudService.post("/api/auth/login", payload);
      Cookies.set("token", response.token, { expires: 1 });

      notification.success({
        message: "Login Berhasil",
      });

      if (response.role === "TEACHER") {
        router.push("/teacher/dashboard");
      } else {
        router.push("/student/dashboard");
      }

      if (response.status == 404) {
        notification.error({
          message: "Login Gagal",
          description: `User Tidak Ditemukan`,
        });
      }
    } catch (error) {
      notification.error({
        message: "Login Gagal",
        description: `${error}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", overflow: "hidden" }}>
      <Row>
        <Col span={15}>
          <Header style={{ backgroundColor: "#fff", padding: "1rem 2rem" }}>
            <Row align="middle">
              <Col>
                <Image
                  src="/assets/images/logo.png"
                  alt="Logo"
                  width={50}
                  preview={false}
                />
              </Col>
              <Col>
                <Title level={5} style={{ marginBottom: 20, marginLeft: 10 }}>
                  LMS ONE STEP SOLUTION
                </Title>
              </Col>
            </Row>
          </Header>
        </Col>

        <Col span={9}>
          <Header style={{ backgroundColor: primaryColor }} />
        </Col>
      </Row>

      <Content style={{ height: "calc(100vh - 128px)" }}>
        <Row style={{ height: "100%" }}>
          {/* Left column (login form) */}
          <Col
            span={15}
            style={{
              padding: "2rem",
              backgroundColor: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Space
              direction="vertical"
              size="large"
              style={{ width: "100%", maxWidth: "400px" }}
            >
              <Title level={2}>Selamat Datang!</Title>
              <Form
                name="normal_login"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                style={{ width: "100%" }}
              >
                <Col>
                  <Row gutter={16}>
                    <Form.Item
                      name="name"
                      rules={[
                        {
                          required: true,
                          message: "Please input your Email!",
                        },
                      ]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="Nama" />
                    </Form.Item>
                    <Form.Item
                      name="email"
                      rules={[
                        {
                          required: true,
                          message: "Please input your Email!",
                        },
                      ]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="Email" />
                    </Form.Item>
                  </Row>
                </Col>
                <Form.Item
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: "Please input your Password!",
                    },
                  ]}
                >
                  <Input
                    prefix={<LockOutlined />}
                    type="password"
                    placeholder="Password"
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={loading}
                    style={{ backgroundColor: primaryColor, color: "white" }}
                  >
                    Login
                  </Button>
                </Form.Item>
              </Form>

              <Row justify="space-around" gutter={24} style={{ width: "100%" }}>
                <Col>
                  <div>
                    <strong>WhatsApp</strong>
                    <br />
                    +6281337373155
                  </div>
                </Col>
                <Col>
                  <div>
                    <strong>Email</strong>
                    <br />
                    oss@gmail.com
                  </div>
                </Col>
              </Row>
            </Space>
          </Col>

          {/* Right column (additional content) */}
          <Col
            span={9}
            style={{
              backgroundColor: primaryColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div>
              <Image
                src="/assets/images/logo_login.png"
                alt="Login Image"
                width={500}
                height={500}
                preview={false}
              />
            </div>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
