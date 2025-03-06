"use client";

import { useState } from "react";
import { User } from "@prisma/client";
import {
  Card,
  Avatar,
  Descriptions,
  Badge,
  Typography,
  Skeleton,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Input,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  FlagOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";

interface ProfileComponentProps {
  data: User | null;
  isLoading: boolean;
  onUpdate: (updatedData: Partial<User>) => void; // Fungsi untuk mengupdate data user
}

const { Title, Text } = Typography;

export const ProfileComponents = ({
  data,
  isLoading,
  onUpdate,
}: ProfileComponentProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleEdit = () => {
    form.setFieldsValue(data); // Mengisi form dengan data user saat ini
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      onUpdate(values); // Kirim data ke parent atau API
      setIsModalOpen(false);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  return (
    <Card
      bordered={false}
      style={{
        maxWidth: "700px",
        margin: "0 auto",
        padding: "24px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        background: "#f8f9fa",
        position: "relative",
      }}
    >
      {/* Skeleton Loading */}
      {isLoading ? (
        <Skeleton active avatar paragraph={{ rows: 4 }} />
      ) : (
        <>
          {/* Tombol Edit */}
          <Button
            type="primary"
            icon={<EditOutlined />}
            style={{ position: "absolute", top: 20, right: 20 }}
            onClick={handleEdit}
          >
            Edit
          </Button>

          {/* Avatar & Nama */}
          <Row align="middle" justify="center" style={{ marginBottom: 20 }}>
            <Col>
              <Avatar
                size={100}
                src={data?.imageUrl || ""}
                icon={!data?.imageUrl && <UserOutlined />}
                style={{ backgroundColor: "#1890ff" }}
              />
            </Col>
          </Row>
          <Title level={3} style={{ textAlign: "center", marginBottom: 10 }}>
            {data?.username || "Tidak Diketahui"}
          </Title>
          <Text
            type="secondary"
            style={{ display: "block", textAlign: "center", marginBottom: 16 }}
          >
            {data?.role === "STUDENT" ? "Student" : "Teacher"}
          </Text>

          {/* Informasi User */}
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="Email">
              <MailOutlined style={{ marginRight: 8 }} />
              {data?.email || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="No. Telepon">
              <PhoneOutlined style={{ marginRight: 8 }} />
              {data?.no_phone || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Total Pertemuan">
              <CalendarOutlined style={{ marginRight: 8 }} />
              {data?.count_program || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Wilayah">
              <FlagOutlined style={{ marginRight: 8 }} />
              {data?.region || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Peran">
              <Badge
                status={data?.role === "STUDENT" ? "processing" : "success"}
                text={data?.role}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Level">
              <CalendarOutlined style={{ marginRight: 8 }} />
              {data?.level || "Belum ditentukan"}
            </Descriptions.Item>
            <Descriptions.Item label="Program">
              <CheckCircleOutlined style={{ marginRight: 8 }} />
              {data?.program_id || "Tidak ada program"}
            </Descriptions.Item>
            <Descriptions.Item label="Status Kursus">
              {data?.is_completed ? (
                <Badge status="success" text="Selesai" />
              ) : (
                <Badge status="warning" text="Belum Selesai" />
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Bergabung Sejak">
              {data?.joined_at ? new Date(data.joined_at).toLocaleDateString("id-ID") : "-"}
            </Descriptions.Item>
          </Descriptions>
        </>
      )}

      {/* Modal Edit Profil */}
      <Modal
        title="Edit Profil"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleUpdate}
        okText="Simpan"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="Nama"
            rules={[{ required: true, message: "Masukkan nama" }]}
          >
            <Input placeholder="Nama Lengkap" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                type: "email",
                message: "Masukkan email valid",
              },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item name="no_phone" label="No. Telepon">
            <Input placeholder="No. Telepon" />
          </Form.Item>
          <Form.Item name="region" label="Wilayah">
            <Input placeholder="Wilayah" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};
