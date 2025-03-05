import {
  Card,
  Skeleton,
  Row,
  Col,
  Button,
  Space,
  Flex,
  Modal,
  Form,
  Input,
  Alert,
} from "antd";
import { useMockTestViewModel } from "./useMockTestViewModel";
import {
  EditOutlined,
  DeleteOutlined,
  PlusCircleFilled,
} from "@ant-design/icons";
import Link from "next/link";

export default function MockTestComponent() {
  const {
    mockTestData,
    mockTestDataLoading,
    handleCancelModal,
    handleOpenModal,
    isModalVisible,
    form,
    handleEdit,
    handleSubmit,
    selectedMockTest,
    loading,
    handleDelete,
  } = useMockTestViewModel();

  const showConfirmDelete = (mock_test_id: string) => {
    Modal.confirm({
      title: "Hapus Data",
      content: "Apakah Anda yakin ingin menghapus data ini?",
      okText: "Ya",
      okType: "danger",
      cancelText: "Tidak",
      onOk: () => handleDelete(mock_test_id),
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <Flex justify="end">
        <Button
          type="primary"
          icon={<PlusCircleFilled />}
          onClick={handleOpenModal}
        >
          Tambah Data
        </Button>
      </Flex>

      {!mockTestDataLoading &&
        (!mockTestData || mockTestData?.data.length === 0) && (
          <Alert
            message="Tidak ada data tersedia"
            description="Silakan tambahkan data baru menggunakan tombol 'Tambah Data'."
            type="warning"
            showIcon
            style={{
              marginTop: "20px",
              marginBottom: "20px",
              borderRadius: "8px",
            }}
          />
        )}

      <Row
        gutter={[16, 16]}
        justify="end"
        style={{ flexDirection: "row-reverse" }} // Susun dari kanan ke kiri
      >
        {mockTestDataLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <Col key={index} xs={24} sm={12} md={8} lg={6}>
                <Skeleton active loading={true} />
              </Col>
            ))
          : mockTestData?.data.map((item) => (
              <Col key={item.mock_test_id} xs={24} sm={12} md={8} lg={6}>
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
                      onClick={() => handleEdit(item.mock_test_id)}
                    />
                    <Button
                      type="default"
                      shape="circle"
                      icon={<DeleteOutlined />}
                      danger
                      onClick={() => showConfirmDelete(item.mock_test_id)}
                    />
                  </Space>

                  {/* Isi Card */}
                  <h3 style={{ marginBottom: "20px" }}>{item.name}</h3>

                  {/* Tombol Detail di Bawah */}
                  <Link
                    href={`/teacher/dashboard/mock-test/${item.mock_test_id}`}
                    passHref
                  >
                    Detail
                  </Link>
                </Card>
              </Col>
            ))}
      </Row>
      <Modal
        open={isModalVisible}
        onCancel={handleCancelModal}
        footer={null}
        title={selectedMockTest ? "Edit Data" : "Tambah Data"}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Nama */}
          <Form.Item
            name="name"
            label="Nama"
            rules={[{ required: true, message: "Nama wajib diisi!" }]}
          >
            <Input placeholder="Masukkan Nama" />
          </Form.Item>

          {/* Deskripsi */}
          <Form.Item
            name="description"
            label="Deskripsi"
            rules={[{ required: true, message: "Deskripsi wajib diisi!" }]}
          >
            <Input.TextArea placeholder="Masukkan Deskripsi" />
          </Form.Item>

          {/* Lama Pengerjaan */}
          <Form.Item
            name="timeLimit"
            label="Lama Pengerjaan"
            rules={[
              { required: true, message: "Lama pengerjaan wajib diisi!" },
              {
                pattern: /^[0-9]+$/,
                message: "Lama pengerjaan harus berupa angka!",
              },
            ]}
          >
            <Input placeholder="Lama Pengerjaan (menit)" />
          </Form.Item>

          {/* Tombol Submit */}
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
