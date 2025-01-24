"use client";

import {
  Button,
  Card,
  Divider,
  Flex,
  FloatButton,
  Form,
  Image,
  Input,
  Modal,
  notification,
  Popconfirm,
  Tooltip,
} from "antd";
import Icon from "@ant-design/icons";
import { useState } from "react";
import Title from "antd/es/typography/Title";
import Loading from "@/app/components/Loading";
import CustomAlert from "@/app/components/CustomAlert";
import Meta from "antd/es/card/Meta";
import Link from "next/link";
import { AddIcon, CopyIcon, DeleteIcon, EditIcon } from "@/app/components/Icon";
import randomBgCourse from "@/app/lib/utils/randomBgCourse";
import { useCourseViewModel } from "./useCourseViewModel";

export default function CoursesTeacher() {
  const backgroundImages = randomBgCourse();

  const {
    loading,
    isModalVisible,
    handleCancel,
    handleOk,
    handleDelete,
    handleUpdate,
    courseData,
    courseError,
    selectedId,
    filteredCourses,
    form,
    setIsModalVisible,
    handleSearch
  } = useCourseViewModel();

  if (courseError)
    return <CustomAlert type="error" message={courseError.message} />;
  if (!courseData) return <Loading />;

  return (
    <div>
      <Flex justify="space-between">
        <Title level={3} style={{ marginBlock: 0 }}>
          Daftar Modul
        </Title>
        <FloatButton
          onClick={() => setIsModalVisible(true)}
          tooltip="Tambah Modul"
          icon={<Icon component={AddIcon} />}
        />
        <Input
          placeholder="Cari nama modul"
          onChange={handleSearch}
          style={{ width: 300 }}
        />
      </Flex>
      <Divider />
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {filteredCourses!.length > 0 ? (
          filteredCourses!.map((course: any, index: number) => (
            <Card
              key={course.course_id}
              cover={
                <Image
                  alt="default"
                  src={backgroundImages[index % backgroundImages.length]}
                  preview={false}
                />
              }
              hoverable
              style={{ width: 300, margin: 20 }}
            >
              <Meta
                title={
                  <Link href={`/teacher/dashboard/courses/${course.course_id}`}>
                    {course.name}
                  </Link>
                }
              />
              <Divider />
              <Flex justify="space-between" style={{ marginTop: 20 }}>
                <Tooltip title="Edit Modul">
                  <Button
                    type="primary"
                    onClick={() => handleUpdate(course.course_id)}
                  >
                    <Icon component={EditIcon} />
                  </Button>
                </Tooltip>
                <Tooltip title="Salin Kode">
                  <Button
                    type="primary"
                    onClick={() => {
                      navigator.clipboard.writeText(course.code_course);
                      notification.success({
                        message: "Kode berhasil disalin",
                      });
                    }}
                  >
                    <Icon component={CopyIcon} />
                  </Button>
                </Tooltip>
                <Tooltip title="Hapus Modul">
                  <Popconfirm
                    title="Yakin ingin menghapus modul ini?"
                    onConfirm={() => handleDelete(course.course_id)}
                    okText="Ya"
                    cancelText="Tidak"
                  >
                    <Button danger>
                      <Icon component={DeleteIcon} />
                    </Button>
                  </Popconfirm>
                </Tooltip>
              </Flex>
            </Card>
          ))
        ) : (
          <CustomAlert type="info" message="Tidak ada data modul" />
        )}
      </div>

      <Modal
        title={selectedId ? "Update Modul" : "Tambah Modul"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          name="courseCreateForm"
          initialValues={{ remember: true }}
          onFinish={handleOk}
          autoComplete="off"
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: "Masukkan nama kursus" }]}
          >
            <Input placeholder="Nama Kursus" />
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
