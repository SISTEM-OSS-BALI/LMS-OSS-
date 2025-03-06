import { useParams } from "next/navigation";
import { useDetailMockTestViewModel } from "./useDetailMockTest";
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Skeleton,
  List,
  Avatar,
  Modal,
  Form,
  Input,
  Flex,
  Alert,
  Select,
  FloatButton,
  Drawer,
  Typography,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Link from "next/link";
import Title from "antd/es/typography/Title";
import { useState } from "react";

export default function DetailMockTestComponent() {
  //   const query = useParams();
  //   const mockTestId = query.mock_test_id;
  const {
    mockTestDetailData,
    mockTestDetailDataLoading,
    filteredStudent,
    handleSearch,
    handleCancelModalAccess,
    handleOpenModalAccess,
    loading,
    handleSubmitAccess,
    selectedStudent,
    setSelectedStudent,
    form,
    isModalAccessVisible,
    handleCancelModal,
    handleOpenModal,
    isModalVisible,
    selectedBase,
    handleDelete,
    handleSubmit,
    handleEdit,
    dataDetailMockTest,
    handleEditDescription,
    handleEditTimeLimit,
    handleSave,
    isEditingDescription,
    isEditingTimeLimit,
    handleCancelDrawer,
    setIsDrawerVisible,
    isDrawerVisible,
  } = useDetailMockTestViewModel();

  const detailMockTest = dataDetailMockTest?.data;
  

  const showConfirmDelete = (id: string) => {
    Modal.confirm({
      title: "Hapus Data",
      content: "Apakah Anda yakin ingin menghapus data ini?",
      okText: "Ya",
      okType: "danger",
      cancelText: "Tidak",
      onOk: () => handleDelete(id),
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <Flex justify="space-between" style={{ marginBottom: "20px" }}>
        <Title level={4}>Detail Mock Test</Title>
        <FloatButton onClick={() => setIsDrawerVisible(true)} />
        <Flex justify="space-between" gap={20}>
          <Button type="primary" onClick={() => handleOpenModal()}>
            Tambah Data
          </Button>
          <Button type="primary" onClick={() => handleOpenModalAccess()}>
            Akses
          </Button>
        </Flex>
      </Flex>
      {!mockTestDetailDataLoading &&
        (!mockTestDetailData || mockTestDetailData?.data.length === 0) && (
          <Alert
            message="Tidak ada data tersedia"
            description="Silakan tambahkan data"
            type="warning"
            showIcon
            style={{
              marginBottom: "20px",
              borderRadius: "8px",
            }}
          />
        )}
      <Row gutter={[16, 16]} justify="start">
        {mockTestDetailDataLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <Col key={index} xs={24} sm={12} md={8} lg={6}>
                <Skeleton active loading={true} />
              </Col>
            ))
          : mockTestDetailData?.data.map((item) => (
              <Col key={item.base_mock_test_id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  bordered={false}
                  style={{
                    position: "relative",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    borderRadius: "10px",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  {/* Tombol Edit & Delete */}
                  <Space
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      zIndex: 2,
                    }}
                  >
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(item.base_mock_test_id)}
                    />
                    <Button
                      type="default"
                      shape="circle"
                      icon={<DeleteOutlined />}
                      danger
                      onClick={() => showConfirmDelete(item.base_mock_test_id)}
                    />
                  </Space>

                  {/* Isi Card */}
                  <h3 style={{ marginBottom: "20px" }}>{item.type}</h3>
                  <Link
                    href={`/teacher/dashboard/mock-test/${item.mock_test_id}/${item.base_mock_test_id}`}
                    passHref
                  >
                    Detail
                  </Link>
                </Card>
              </Col>
            ))}
      </Row>

      <Drawer
        title="Detail Mock Test"
        placement="right"
        onClose={() => handleCancelDrawer()}
        open={isDrawerVisible}
        width={450} 
      >
        <div style={{ padding: "10px 16px" }}>
          <List
            bordered
            dataSource={[
              {
                label: "Deskripsi",
                value:
                  detailMockTest?.description || "No description available",
                editable: true,
                onEdit: handleEditDescription,
              },
              {
                label: "Waktu Pengerjaan",
                value: detailMockTest?.timeLimit
                  ? `${detailMockTest.timeLimit} menit`
                  : "Waktu belum diatur",
                editable: true,
                onEdit: handleEditTimeLimit,
              },
            ]}
            renderItem={(item) => (
              <List.Item
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  background: "#FAFAFA",
                  marginBottom: "8px",
                  wordBreak: "break-word", // Mencegah teks panjang meluber
                }}
              >
                <div style={{ flex: 1 }}>
                  <Typography.Text strong>{item.label}:</Typography.Text>
                  <Typography.Text
                    style={{
                      display: "block",
                      whiteSpace: "pre-wrap", // Memastikan deskripsi panjang tidak terpotong
                      marginTop: 4,
                    }}
                  >
                    {item.value}
                  </Typography.Text>
                </div>
                {item.editable && (
                  <Button
                    type="default"
                    shape="circle"
                    icon={<EditOutlined />}
                    onClick={item.onEdit}
                    style={{ marginLeft: "10px", background: "#F5E3C8" }}
                  />
                )}
              </List.Item>
            )}
          />

          <Form
            form={form}
            onFinish={handleSave}
            layout="vertical"
            style={{
              marginTop: 20,
              padding: "16px",
              background: "#FFF",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            {isEditingDescription && (
              <Form.Item
                name="description"
                label="Deskripsi"
                rules={[{ required: true, message: "Deskripsi wajib diisi!" }]}
              >
                <Input.TextArea rows={4} />
              </Form.Item>
            )}

            {isEditingTimeLimit && (
              <Form.Item
                name="timeLimit"
                label="Waktu Pengerjaan (menit)"
                rules={[
                  { required: true, message: "Waktu pengerjaan wajib diisi!" },
                ]}
              >
                <Input type="number" placeholder="Masukkan Durasi Pengerjaan" />
              </Form.Item>
            )}

            {(isEditingDescription || isEditingTimeLimit) && (
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{ width: "100%" }}
                >
                  Save
                </Button>
              </Form.Item>
            )}
          </Form>
        </div>
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
        title={selectedBase ? "Edit Data Section" : "Tambah Data Section"}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="type">
            <Select placeholder="Pilih Tipe">
              <Select.Option value="WRITING">Writing</Select.Option>
              <Select.Option value="READING">Reading</Select.Option>
              <Select.Option value="LISTENING">Listening</Select.Option>
              <Select.Option value="SPEAKING">Speaking</Select.Option>
            </Select>
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
    </div>
  );
}
