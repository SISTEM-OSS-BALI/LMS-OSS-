"use client";

import { Form, Input, Button, Spin, Typography } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useChangePasswordViewModel } from "./useChangePasswordViewMode";

const { Title } = Typography;

export default function ChangePasswordComponent() {
  const { handleChangePassword, loading, form } = useChangePasswordViewModel();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#f5f5f5",
      }}
    >
      <div
        style={{
          width: "400px",
          padding: "24px",
          background: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Title level={3} style={{ textAlign: "center", marginBottom: "20px" }}>
          Ubah Password
        </Title>

        <Form layout="vertical" onFinish={handleChangePassword} form={form}>
          {/* Password Lama */}
          <Form.Item
            name="oldPassword"
            label="Password Lama"
            rules={[{ required: true, message: "Masukkan password lama" }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#1890ff" }} />}
              placeholder="Masukkan password lama"
            />
          </Form.Item>

          {/* Password Baru */}
          <Form.Item
            name="newPassword"
            label="Password Baru"
            rules={[
              { required: true, message: "Masukkan password baru" },
              { min: 6, message: "Password harus minimal 6 karakter" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#1890ff" }} />}
              placeholder="Masukkan password baru"
            />
          </Form.Item>

          {/* Konfirmasi Password Baru */}
          <Form.Item
            name="confirmPassword"
            label="Konfirmasi Password Baru"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Konfirmasi password baru" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Konfirmasi password tidak cocok!")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#1890ff" }} />}
              placeholder="Konfirmasi password baru"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ width: "100%" }}
              disabled={loading}
            >
              {loading ? <Spin /> : "Ganti Password"}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
