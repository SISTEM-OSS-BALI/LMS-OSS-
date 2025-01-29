"use client";

import { Card, Row, Col, Divider, Flex, Input } from "antd";
import { useStudentViewModel } from "./useStudentViewModel";
import Title from "antd/es/typography/Title";
import Link from "next/link";

export default function StudentPage() {
  const { studentDataAll, handleSearch, filteredStudent } =
    useStudentViewModel();

  return (
    <div style={{ padding: "20px" }}>
      <Flex justify="space-between">
        <Title level={3} style={{ marginBottom: "20px", marginBlock: 0 }}>
          Daftar Siswa
        </Title>
        <Input
          placeholder="Cari nama siswa"
          onChange={handleSearch}
          style={{ width: "30%" }}
        />
      </Flex>
      <Divider />
      <Row gutter={[16, 16]}>
        {filteredStudent?.map((student) => (
          <Col key={student.user_id} xs={24} sm={12} md={8} lg={6}>
            <Card
              bordered
              hoverable
              style={{
                borderRadius: "10px",
                padding: "16px",
                backgroundColor: "#fdecef",
                textAlign: "center",
              }}
              actions={[
                <Link
                  key={student.user_id}
                  href={`/teacher/dashboard/student/detail/${student.user_id}`}
                  style={{ color: "#1890ff" }}
                >
                  Detail
                </Link>,
              ]}
            >
              <Title level={5} style={{ color: "#333" }}>
                {student.username}
              </Title>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
