import React from "react";
import { Card, Modal, Input, Button, Form, Flex, Image, Divider } from "antd";
import Link from "next/link";
import Title from "antd/es/typography/Title";
import Meta from "antd/es/card/Meta";
import CustomAlert from "@/app/components/CustomAlert";
import randomBgCourse from "@/app/lib/utils/useRandomBgCourse";
import { useCourseViewModel } from "./useCourseViewModel";

export default function CoursesStudentComponent() {
  const {
    loading,
    isModalVisible,
    courseCode,
    filteredCourses,
    handleOk,
    handleCancel,
    handleCardClick,
    handleSearch,
  } = useCourseViewModel();

  const backgroundImages = randomBgCourse();

  return (
    <div>
      <Flex justify="space-between">
        <Title level={3} style={{ marginBlock: 0 }}>
          Modul
        </Title>
        <Flex justify="space-between">
          <Input
            placeholder="Cari nama modul"
            onChange={handleSearch}
            style={{ width: 300, marginRight: 10 }}
          />
          <Button type="primary">
            <Link href="/student/dashboard/course-followed">
              Modul Yang Diikuti
            </Link>
          </Button>
        </Flex>
      </Flex>
      <Divider />
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {filteredCourses && filteredCourses.length > 0 ? (
          filteredCourses.map((course, index) => (
            <Card
              key={course.course_id}
              style={{ width: 300, margin: 20 }}
              cover={
                <Image
                  alt="default"
                  src={backgroundImages[index % backgroundImages.length]}
                  preview={false}
                />
              }
              hoverable
              onClick={() => handleCardClick(course)}
            >
              <Meta title={course.name} description={course.teacher.username} />
            </Card>
          ))
        ) : (
          <CustomAlert type="info" message="Tidak ada modul" />
        )}
      </div>

      <Modal
        title="Masukan Kode Modul"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          name="courseCodeForm"
          initialValues={{ remember: true }}
          onFinish={handleOk}
          autoComplete="off"
        >
          <Form.Item
            name="course_code"
            rules={[{ required: true, message: "Please enter course code" }]}
          >
            <Input placeholder="Course Code" value={courseCode} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
