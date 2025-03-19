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
  Select,
  DatePicker,
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
  IdcardOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { Footer } from "antd/es/layout/layout";
import { useRegisterViewModel } from "./useRegisterViewModel";
import TermsCheckbox from "@/app/components/CheckboxCondition";
import { useState } from "react";

interface FormValues {
  username: string;
  email: string;
  password: string;
  no_phone: string;
  birth_date: string;
  address: string;
  program_id: string;
  region: string;
  program_name: string;
}

export default function Register() {
  const { Content, Header } = Layout;
  const { Title } = Typography;

  const { programData, form, loading, handleFinish } = useRegisterViewModel();

  const [isAgreed, setIsAgreed] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);

  const onFinish = (values: any) => {
    if (!signature) {
      alert("Silakan tanda tangani terlebih dahulu!");
      return;
    }
    handleFinish({ ...values, signature });
  };

  const [formValues, setFormValues] = useState<FormValues>({
    username: "",
    email: "",
    password: "",
    no_phone: "",
    birth_date: "",
    address: "",
    program_id: "",
    region: "",
    program_name: "",
  });

  const handleFormChange = (changedValues: any, allValues: any) => {
    setFormValues(allValues);
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
              padding: "10px 20px",
            }}
          />
        </Col>
      </Row>

      {/* Konten */}
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
          {/* Form Register */}
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
                Daftar Akun Baru
              </Title>

              <Form
                name="register_form"
                layout="vertical"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                form={form}
                onValuesChange={handleFormChange}
                style={{ width: "100%" }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="username"
                      label="Username"
                      rules={[
                        { required: true, message: "Masukkan Username!" },
                      ]}
                    >
                      <Input
                        prefix={<IdcardOutlined />}
                        placeholder="Username"
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
                </Row>

                <Row gutter={16}>
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
                  <Col span={12}>
                    <Form.Item
                      name="no_phone"
                      label="No. Telepon"
                      rules={[
                        { required: true, message: "Masukkan No. Telepon!" },
                        {
                          pattern: /^[0-9]+$/,
                          message: "Masukkan hanya angka!",
                        },
                      ]}
                    >
                      <Input
                        prefix={<PhoneOutlined />}
                        placeholder="Nomor Telepon"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="birth_date"
                      label="Tanggal Lahir"
                      rules={[
                        { required: true, message: "Masukkan Tanggal Lahir!" },
                      ]}
                    >
                      <DatePicker
                        format="YYYY-MM-DD"
                        placeholder="Tanggal Lahir"
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="address"
                      label="Alamat"
                      rules={[{ required: true, message: "Masukkan Alamat!" }]}
                    >
                      <Input placeholder="Alamat" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="program_id"
                      label="Program"
                      rules={[{ required: true, message: "Pilih Program!" }]}
                    >
                      <Select placeholder="Pilih Program">
                        {programData?.data.map((program) => (
                          <Select.Option
                            key={program.program_id}
                            value={program.program_id}
                          >
                            {program.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
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
                        <Select.Option value="Singaraja">
                          Singaraja
                        </Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <TermsCheckbox
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
                <Row justify="end">
                  <Link href="/login">Sudah Punya Akun?</Link>
                </Row>
              </Form>
            </Flex>
          </Col>

          {/* Gambar */}
          <Col xs={24} md={10} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
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
    </Layout>
  );
}
