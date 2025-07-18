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
  Grid,
  Drawer,
  Tooltip,
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
  QuestionCircleOutlined,
} from "@ant-design/icons";
import Dragger from "antd/es/upload/Dragger";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

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

export const ProfileComponents = ({
  data,
  isLoading,
  loading,
  loadingChangePassword,
  onUpdate,
  onUpdateAvatar,
  onSendEmail,
}: ProfileComponentProps) => {
  const screens = useBreakpoint();
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

  return (
    <Card
      bordered={false}
      style={{
        maxWidth: screens.xs ? "100%" : "800px",
        margin: screens.xs ? "0 auto" : "20px auto",
        padding: "24px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        background: "#f8f9fa",
        position: "relative",
      }}
    >
      {isLoading ? (
        <Skeleton active avatar paragraph={{ rows: 4 }} />
      ) : (
        <>
          <Row
            justify={screens.xs ? "center" : "end"}
            gutter={[16, 16]}
            style={{ marginBottom: 20 }}
          >
            <Col>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
              >
                Edit Profil
              </Button>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={onSendEmail}
                loading={loadingChangePassword}
              >
                Ganti Password
              </Button>
            </Col>
          </Row>

          {/* Avatar Section */}
          <Row justify="center" style={{ marginBottom: 20 }}>
            <Col>
              <Avatar
                size={screens.xs ? 80 : 100}
                src={data?.imageUrl || ""}
                icon={!data?.imageUrl && <UserOutlined />}
                style={{ backgroundColor: "#1890ff", position: "relative" }}
              />
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

          <Title level={screens.xs ? 4 : 3} style={{ textAlign: "center" }}>
            {data?.username || "Tidak Diketahui"}
            <Tooltip title="Pastikan menggunakan nama lengkap">
              <QuestionCircleOutlined style={{ marginLeft: 8 }} />
            </Tooltip>
          </Title>

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
                <Descriptions.Item label="Status Akun">
                  <CheckCircleOutlined style={{ marginRight: 8 }} />
                  {data?.is_active ? "Aktif" : "Tidak Aktif"}
                </Descriptions.Item>
                {data?.is_active && (
                  <Descriptions.Item label="Aktif Hingga">
                    <CheckCircleOutlined style={{ marginRight: 8 }} />
                    {data?.end_date
                      ? new Date(data.end_date).toLocaleDateString("id-ID")
                      : "-"}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Bergabung Sejak">
                  {data?.joined_at
                    ? new Date(data.joined_at).toLocaleDateString("id-ID")
                    : "-"}
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        </>
      )}

      {/* Modal Edit Profil */}
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
          <Form.Item
            name="no_phone"
            label="No. Telepon"
            rules={[{ required: true, message: "Masukkan no. telepon" }]}
          >
            <Input placeholder="No. Telepon" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Simpan
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Ubah Avatar */}
      <Drawer
        title="Ubah Foto Profil"
        placement="bottom"
        open={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
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
      </Drawer>
    </Card>
  );
};
