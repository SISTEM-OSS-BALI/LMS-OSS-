"use client";

import {
  Button,
  Col,
  Form,
  Input,
  Layout,
  Row,
  Typography,
  Image,
  Select,
  Flex,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  GlobalOutlined,
  InstagramOutlined,
  WhatsAppOutlined,
  LinkedinFilled,
  PhoneOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { Footer } from "antd/es/layout/layout";
import TermsCheckbox from "@/app/components/CheckboxCondition";
import { useState } from "react";
import { useRegisterGroupClassViewModel } from "./useRegisterGroupClassViewModel";

interface FormValues {
  username: string;
  email: string;
  password: string;
  program_name: string;
  program_id: string;
  birth_date: string | null;
  address: string;
  no_phone: string;
  name_group: string;
}

export default function RegisterGroupClass() {
  const { Content, Header } = Layout;
  const { Title } = Typography;

  const [isAgreed, setIsAgreed] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const { loading, setLoading, handleFinish } =
    useRegisterGroupClassViewModel();

  const onFinish = (values: any) => {
    if (!signature) {
      alert("Silakan tanda tangani terlebih dahulu!");
      return;
    }
    handleFinish({ ...values, signature, type: "GROUP" });
  };

  const [formValues, setFormValues] = useState<FormValues>({
    username: "",
    name_group: "",
    email: "",
    password: "",
    program_name: "",
    program_id: "",
    birth_date: null,
    address: "",
    no_phone: "",
  });

  const handleFormChange = (changedValues: any, allValues: any) => {
    setFormValues(allValues);
  };

  return (
    <Layout style={{ minHeight: "100vh", overflow: "hidden" }}>
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
            style={{ backgroundColor: "#578FCA", padding: "10px 20px" }}
          />
        </Col>
      </Row>

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
                Daftar Grup Kelas Baru
              </Title>
              <Form
                name="register_form"
                layout="vertical"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                onValuesChange={handleFormChange}
                style={{ width: "100%" }}
              >
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="name_group"
                      label="Nama Grup"
                      rules={[
                        { required: true, message: "Masukkan Nama Grup!" },
                      ]}
                    >
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="Nama Grup"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { required: true, message: "Masukkan Email!" },
                        { type: "email", message: "Format email tidak valid!" },
                      ]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="Email" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="password"
                      label="Password"
                      rules={[
                        { required: true, message: "Masukkan Password!" },
                      ]}
                    >
                      <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Password"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item>
                  <Typography.Title level={5}>
                    Anggota Grup Kelas
                  </Typography.Title>
                </Form.Item>

                <Form.List name="members">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <Row key={key} gutter={16} style={{ marginBottom: 8 }}>
                          <Col span={10}>
                            <Form.Item
                              {...restField}
                              name={[name, "username"]}
                              rules={[
                                { required: true, message: "Masukkan Nama!" },
                              ]}
                            >
                              <Input
                                placeholder="Nama Lengkap"
                                prefix={<UserOutlined />}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={10}>
                            <Form.Item
                              {...restField}
                              name={[name, "no_phone"]}
                              rules={[
                                {
                                  required: true,
                                  message: "Masukkan No. Telepon!",
                                },
                                {
                                  pattern: /^[0-9]+$/,
                                  message: "Nomor hanya boleh angka!",
                                },
                              ]}
                            >
                              <Input
                                placeholder="No. Telepon"
                                prefix={<PhoneOutlined />}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={4}>
                            <Button danger onClick={() => remove(name)} block>
                              Hapus
                            </Button>
                          </Col>
                        </Row>
                      ))}
                      <Form.Item>
                        <Button type="dashed" onClick={() => add()} block>
                          + Tambah Anggota
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>

                <Col span={24}>
                  <Form.Item
                    name="region"
                    label="Region"
                    rules={[{ required: true, message: "Masukkan Region!" }]}
                  >
                    <Select placeholder="Region">
                      <Select.Option value="Denpasar">Denpasar</Select.Option>
                      <Select.Option value="Karangasem">
                        Karangasem
                      </Select.Option>
                      <Select.Option value="Singaraja">Singaraja</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>

                <TermsCheckbox
                  type="register-group"
                  formValues={formValues}
                  setIsAgreed={setIsAgreed}
                  setSignature={setSignature}
                />

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={loading}
                    disabled={!isAgreed}
                    style={{
                      backgroundColor: isAgreed ? "#578FCA" : "#A0AEC0",
                      color: "white",
                      cursor: isAgreed ? "pointer" : "not-allowed",
                      opacity: isAgreed ? 1 : 0.7,
                    }}
                  >
                    Register
                  </Button>
                </Form.Item>

                <Flex justify="space-between">
                  <Link href="/login">Sudah Punya Akun?</Link>
                  <Link href="/register">Register</Link>
                </Flex>
              </Form>
            </Flex>
          </Col>

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
              alt="Register Image"
              width={300}
              height={300}
              preview={false}
              style={{ maxWidth: "100%" }}
            />
          </Col>
        </Row>
      </Content>

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
    </Layout>
  );
}
