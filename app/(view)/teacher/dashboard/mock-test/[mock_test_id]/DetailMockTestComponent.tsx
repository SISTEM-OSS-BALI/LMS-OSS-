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
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Link from "next/link";
import Title from "antd/es/typography/Title";

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
  } = useDetailMockTestViewModel();

  return (
    <div style={{ padding: "20px" }}>
      <Flex justify="space-between" style={{ marginBottom: "20px" }}>
        <Title level={4}>Daftar Detail Mock Test </Title>
        <Button type="primary" onClick={() => handleOpenModalAccess()}>
          Akses
        </Button>
      </Flex>
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
                      onClick={() =>
                        console.log("Edit:", item.base_mock_test_id)
                      }
                    />
                    <Button
                      type="default"
                      shape="circle"
                      icon={<DeleteOutlined />}
                      danger
                      onClick={() =>
                        console.log("Delete:", item.base_mock_test_id)
                      }
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
    </div>
  );
}
