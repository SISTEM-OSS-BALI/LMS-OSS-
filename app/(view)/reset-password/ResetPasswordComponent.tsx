"use client";

import { Button, Form, Input, Card, Typography, Space } from "antd";
import { useResetPasswordViewModel } from "./useResetPasswordViewModel";

export default function ResetPasswordComponent() {
  const { onFinish, loading } = useResetPasswordViewModel();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f4f6f9",
      }}
    >
      <Card
        style={{
          width: 400,
          padding: "2rem",
          borderRadius: "10px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          backgroundColor: "#fff",
        }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Typography.Title level={3} style={{ textAlign: "center" }}>
            Reset Password
          </Typography.Title>

          <Form onFinish={onFinish} layout="vertical">
            <Form.Item
              name="newPassword"
              label="Password Baru"
              rules={[{ required: true, message: "Masukkan password baru!" }]}
            >
              <Input.Password
                placeholder="Masukkan password baru"
                size="large"
              />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{ backgroundColor: "#578FCA", color: "white" }}
            >
              Reset Password
            </Button>
          </Form>
        </Space>
      </Card>
    </div>
  );
}
