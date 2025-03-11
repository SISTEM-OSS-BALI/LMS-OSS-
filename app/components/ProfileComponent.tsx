"use client";

import { useState } from "react";
import { Program, User } from "@prisma/client";
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
  Upload,
  message,
  Image,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  FlagOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  EditOutlined,
  ToTopOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import Dragger from "antd/es/upload/Dragger";

interface UserWithProgram extends User {
  program?: Program;
}

interface ProfileComponentProps {
  data: UserWithProgram | null;
  isLoading: boolean;
  loading: boolean;
  loadingChangePassword: boolean;
  onUpdate: (updatedData: Partial<User>) => void;
  onUpdateAvatar: (imageUrl: string) => void;
  onSendEmail: () => void;
}

const { Title, Text } = Typography;

export const ProfileComponents = ({
  data,
  isLoading,
  loading,
  loadingChangePassword,
  onUpdate,
  onUpdateAvatar,
  onSendEmail,
}: ProfileComponentProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (info: any) => {
    if (info.file.status === "done") {
      const base64 = await getBase64(info.file.originFileObj as File);
      setImageUrl(base64);
    }
    setFileList(info.fileList);
  };

  const handleBeforeUpload = async (file: any) => {
    const base64 = await getBase64(file);
    setImageUrl(base64);
    return false;
  };

  const handleEdit = () => {
    form.setFieldsValue(data);
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      onUpdate(values);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleUpload = async () => {
    if (!fileList.length) {
      message.error("Pilih gambar terlebih dahulu");
      return;
    }

    const file = fileList[0].originFileObj;

    if (!imageUrl) {
      message.error("Terjadi kesalahan, gambar tidak ditemukan!");
      return;
    }

    onUpdateAvatar(imageUrl);
    setImageUrl(null);
    setFileList([]);
    setIsAvatarModalOpen(false);
  };

  const handleCancelAvatar = () => {
    setIsAvatarModalOpen(false);
    setImageUrl(null);
  };

  return (
    <Card
      bordered={false}
      style={{
        maxWidth: "800px",
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
          <div
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              display: "flex",
              gap: "10px",
            }}
          >
            <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
              Edit
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => onSendEmail()}
              loading={loadingChangePassword}
            >
              Ganti Password
            </Button>
          </div>

          {/* Avatar & Tombol Edit */}
          <Row
            align="middle"
            justify="center"
            style={{ marginBottom: 20, position: "relative" }}
          >
            <Col>
              <Avatar
                size={100}
                src={data?.imageUrl || ""}
                icon={!data?.imageUrl && <UserOutlined />}
                style={{ backgroundColor: "#1890ff", position: "relative" }}
              />
              {/* Ikon Edit di Atas Avatar */}
              <Button
                shape="circle"
                icon={<EditOutlined />}
                size="small"
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: -10,
                  background: "#fff",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                }}
                onClick={() => setIsAvatarModalOpen(true)}
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
              {data?.count_program || 0}
            </Descriptions.Item>
            <Descriptions.Item label="Wilayah">
              <FlagOutlined style={{ marginRight: 8 }} />
              {data?.region || "-"}
            </Descriptions.Item>
            {data?.role === "STUDENT" && (
              <>
                <Descriptions.Item label="Level">
                  <ToTopOutlined style={{ marginRight: 8 }} />
                  {data?.level || "Belum ditentukan"}
                </Descriptions.Item>
                <Descriptions.Item label="Program">
                  <CheckCircleOutlined style={{ marginRight: 8 }} />
                  {data?.program?.name || "Tidak ada program"}
                </Descriptions.Item>
                <Descriptions.Item label="Status Kursus">
                  {data?.is_completed ? (
                    <Badge status="success" text="Selesai" />
                  ) : (
                    <Badge status="warning" text="Belum Selesai" />
                  )}
                </Descriptions.Item>
              </>
            )}
            <Descriptions.Item label="Bergabung Sejak">
              {data?.joined_at
                ? new Date(data.joined_at).toLocaleDateString("id-ID")
                : "-"}
            </Descriptions.Item>
          </Descriptions>
        </>
      )}

      <Modal
        title="Edit Profil"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
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
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ width: "100%" }}
              loading={loading}
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Edit Avatar */}
      <Modal
        title="Ubah Foto Profil"
        open={isAvatarModalOpen}
        onCancel={() => handleCancelAvatar()}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleUpload}>
          <Form.Item name="image">
            <Dragger
              name="files"
              listType="picture-card"
              fileList={fileList}
              onChange={handleFileChange}
              beforeUpload={handleBeforeUpload}
              showUploadList={false}
              accept="image/png, image/jpeg"
            >
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="Image preview"
                  preview={false}
                  style={{ width: "100%", height: "auto", maxWidth: "250px" }}
                />
              ) : (
                <div>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Klik atau drag file ke area ini untuk upload
                  </p>
                  <p className="ant-upload-hint">
                    Hanya file PNG, JPEG, dan JPG yang diterima.
                  </p>
                </div>
              )}
            </Dragger>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ width: "100%" }}
              loading={loading}
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};
