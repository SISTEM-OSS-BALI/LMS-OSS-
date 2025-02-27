import React from "react";
import { Card, Button, Space, Typography } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface SpeakingMockTest {
  speaking_id: string;
  base_mock_test_id: string;
  prompt: string;
}

interface SpeakingMockTestProps {
  data: SpeakingMockTest;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function SpeakingMockTestComponent({
  data,
  onEdit,
  onDelete,
}: SpeakingMockTestProps) {
  return (
    <Card
      style={{
        marginBottom: 16,
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#fff",
      }}
      bodyStyle={{ position: "relative" }}
    >
      {/* Tombol Edit & Delete */}
      <Space
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          display: "flex",
          gap: 8,
        }}
      >
        <Button
          type="primary"
          shape="circle"
          icon={<EditOutlined />}
          onClick={() => onEdit(data.speaking_id)}
        />
        <Button
          type="default"
          shape="circle"
          icon={<DeleteOutlined />}
          danger
          onClick={() => onDelete(data.speaking_id)}
        />
      </Space>

      {/* Konten Speaking Test */}
      <Title level={4} style={{ marginBottom: "12px" }}>
        Speaking Test
      </Title>

      <Text strong>Soal:</Text>
      <Card
        style={{
          backgroundColor: "#f9f9f9",
          borderRadius: "8px",
          padding: "15px",
          marginTop: "8px",
          borderLeft: "4px solid #1890ff",
        }}
      >
        <Text style={{ fontSize: "16px", fontWeight: "500", color: "#333" }}>
          {data.prompt}
        </Text>
      </Card>
    </Card>
  );
}
