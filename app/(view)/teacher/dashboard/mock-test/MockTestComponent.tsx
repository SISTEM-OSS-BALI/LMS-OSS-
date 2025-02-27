import { Card, Skeleton, Row, Col, Button, Space } from "antd";
import { useMockTestViewModel } from "./useMockTestViewModel";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Link from "next/link";

export default function MockTestComponent() {
  const { mockTestData, mockTestDataLoading } = useMockTestViewModel();

  return (
    <div style={{ padding: "20px" }}>
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
                      onClick={() => console.log("Edit:", item.mock_test_id)}
                    />
                    <Button
                      type="default"
                      shape="circle"
                      icon={<DeleteOutlined />}
                      danger
                      onClick={() => console.log("Delete:", item.mock_test_id)}
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
    </div>
  );
}
