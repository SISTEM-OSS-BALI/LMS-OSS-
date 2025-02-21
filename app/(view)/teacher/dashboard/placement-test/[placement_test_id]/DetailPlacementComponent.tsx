import {
  Drawer,
  FloatButton,
  Card,
  List,
  Typography,
  Modal,
  Form,
  Avatar,
  Button,
  Input,
  Flex,
  Row,
  Col,
  Space,
  Divider,
  Skeleton,
  Select,
  Alert,
} from "antd";
import { useDetailPlacementTestViewModel } from "./useDetailPlacemetTestViewModel";
import { useState } from "react";
import Title from "antd/es/typography/Title";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Link from "next/link";

export default function DetailPlacementComponent() {
  const {
    dataDetailPlacementTest,
    filteredStudent,
    handleSearch,
    handleCancelModalAccess,
    isModalVisible,
    isModalAccessVisible,
    selectedStudent,
    setSelectedStudent,
    form,
    handleOpenModalAccess,
    handleSubmitAccess,
    loading,
    basePlacementTestData,
    isLoadingBasePlacementTest,
    handleCancelModal,
    handleOpenModal,
    handleSubmit,
    handleEdit,
  } = useDetailPlacementTestViewModel();
  const detailPlacement = dataDetailPlacementTest?.data;
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  return (
    <div style={{ padding: "24px" }}>
      <Flex justify="space-between">
        <Title level={3}>Detail {detailPlacement?.name}</Title>
        <Button type="primary" onClick={handleOpenModalAccess}>
          Akses
        </Button>
      </Flex>
      <FloatButton onClick={() => setIsDrawerVisible(true)} />

      <Divider />
      <Card>
        <Flex justify="space-between" style={{ marginBottom: "24px" }}>
          <Title level={4}>Daftar Section</Title>
          <Button type="primary" onClick={() => handleOpenModal()}>
            Tambah Section
          </Button>
        </Flex>

        {/* Skeleton Loading untuk Section */}
        {isLoadingBasePlacementTest ? (
          <Row gutter={[16, 16]}>
            {[...Array(6)].map((_, index) => (
              <Col key={index} xs={24} sm={12} md={8} lg={6} xl={4}>
                <Skeleton active paragraph={{ rows: 2 }} />
              </Col>
            ))}
          </Row>
        ) : basePlacementTestData && basePlacementTestData?.data.length > 0 ? (
          <Row gutter={[16, 16]}>
            {basePlacementTestData?.data.map((baseTest) => (
              <Col key={baseTest.base_id} xs={24} sm={12} md={8} lg={6} xl={4}>
                <Card
                  hoverable
                  style={{
                    textAlign: "center",
                    borderRadius: "16px",
                    background: "linear-gradient(to bottom, #ffffff, #f8f8f8)",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    height: "100%",
                  }}
                  bodyStyle={{ padding: "24px" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 16px rgba(0, 0, 0, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 8px rgba(0, 0, 0, 0.1)";
                  }}
                >
                  {/* Nama */}
                  <Typography.Title
                    level={4}
                    style={{ color: "#333", marginBottom: "12px" }}
                  >
                    <Link
                      href={`/teacher/dashboard/placement-test/${baseTest.placementTestId}/${baseTest.base_id}`}
                    >
                      {baseTest.name}
                    </Link>
                  </Typography.Title>

                  {/* Tombol Aksi */}
                  <Space>
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      style={{ borderRadius: "8px", padding: "4px 12px" }}
                      onClick={() => handleEdit(baseTest.base_id)}
                    />
                    <Button
                      type="primary"
                      danger
                      icon={<DeleteOutlined />}
                      style={{ borderRadius: "8px", padding: "4px 12px" }}
                    />
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Alert
            message="Informasi"
            description="Tidak ada data Placement Test tersedia."
            type="info"
            showIcon
            style={{ width: "100%", textAlign: "center", marginTop: "16px" }}
          />
        )}
      </Card>

      <Drawer
        title="Detail Placement Test"
        placement="right"
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
      >
        <List
          bordered
          dataSource={[
            {
              label: "Deskripsi",
              value: detailPlacement?.description || "No description available",
            },
            {
              label: "Waktu Pengerjaan",
              value: detailPlacement?.timeLimit
                ? `${detailPlacement.timeLimit} menit`
                : "Waktu belum diatur",
            },
          ]}
          renderItem={(item) => (
            <List.Item>
              <Typography.Text strong>{item.label}:</Typography.Text>{" "}
              {item.value}
            </List.Item>
          )}
        />
      </Drawer>

      <Modal
        title="Pilih Siswa"
        open={isModalAccessVisible}
        onCancel={handleCancelModalAccess}
        footer={null}
        bodyStyle={{ maxHeight: "500px", overflowY: "hidden" }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitAccess}>
          <Input
            placeholder="Cari Siswa"
            style={{ marginBottom: 10 }}
            onChange={handleSearch}
          />

          <div
            style={{
              maxHeight: "400px",
              overflowY: "auto",
              paddingRight: "5px",
            }}
          >
            <List
              dataSource={filteredStudent || []}
              renderItem={(student) => {
                const isSelected = selectedStudent === student.user_id;

                return (
                  <List.Item key={student.user_id}>
                    <Card
                      onClick={() => setSelectedStudent(student.user_id)}
                      style={{
                        width: "100%",
                        cursor: "pointer",
                        border: isSelected
                          ? "2px solid #1890ff"
                          : "1px solid #d9d9d9",
                        borderRadius: "10px",
                        boxShadow: isSelected
                          ? "0 4px 12px rgba(24, 144, 255, 0.3)"
                          : "none",
                        padding: "12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <Avatar src={student.imageUrl} size={64} />
                        <Title level={5} style={{ margin: 0 }}>
                          {student.username}
                        </Title>
                      </div>
                    </Card>
                  </List.Item>
                );
              }}
            />
          </div>

          <Form.Item style={{ marginTop: 16, textAlign: "right" }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={!selectedStudent}
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        open={isModalVisible}
        onCancel={handleCancelModal}
        title="Tambah Section"
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            rules={[{ required: true, message: "Nama harus diisi" }]}
          >
            <Select placeholder="Pilih jenis soal">
              <Select.Option value="MULTIPLE_CHOICE">
                Multiple Choice
              </Select.Option>
              <Select.Option value="WRITING">Writing</Select.Option>
              <Select.Option value="READING">Reading</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              style={{ width: "100%" }}
              loading={loading}
              htmlType="submit"
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
