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
  Popconfirm,
  Tooltip,
  Skeleton,
} from "antd";
import Icon from "@ant-design/icons";
import Title from "antd/es/typography/Title";
import Link from "next/link";
import { AddIcon, DeleteIcon, EditIcon } from "@/app/components/Icon";
import { useRandomBgCourse } from "@/app/lib/utils/useRandomBgCourse";
import { useCourseViewModel } from "./useCourseViewModel";
import CustomAlert from "@/app/components/CustomAlert";
import Meta from "antd/es/card/Meta";

export default function CoursesTeacherComponent() {
  const backgroundImages = useRandomBgCourse();

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
    handleSearch,
    isLoadingCourse,
  } = useCourseViewModel();

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
          style={{ width: "30%" }}
        />
      </Flex>
      <Divider />

      {/* Skeleton Loading */}
      {isLoadingCourse ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} style={{ width: 300 }} hoverable>
              <Skeleton.Image style={{ width: "100%", height: 200 }} />
              <Skeleton active title={true} paragraph={{ rows: 1 }} />
              <Divider />
              <Flex justify="space-between" gap={20}>
                <Skeleton.Button active style={{ width: "100%" }} />
                <Skeleton.Button active style={{ width: "100%" }} />
              </Flex>
            </Card>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
          {filteredCourses && filteredCourses.length > 0 ? (
            filteredCourses.map((course: any, index: number) => (
              <Card
                key={course.course_id}
                cover={
                  backgroundImages && (
                    <Image
                      alt="default"
                      style={{ width: "100%", height: 200 }}
                      src={backgroundImages[index % backgroundImages.length]}
                      preview={false}
                    />
                  )
                }
                hoverable
                style={{ width: 300 }}
              >
                <Meta
                  title={
                    <Link
                      href={`/teacher/dashboard/courses/${course.course_id}`}
                    >
                      {course.name}
                    </Link>
                  }
                />
                <Divider />
                <Flex justify="space-between" gap={20}>
                  <Tooltip title="Edit Modul">
                    <Button
                      style={{ width: "100%" }}
                      type="primary"
                      onClick={() => handleUpdate(course.course_id)}
                      icon={<Icon component={EditIcon} />}
                    />
                  </Tooltip>
                  <Tooltip title="Hapus Modul">
                    <Popconfirm
                      title="Yakin ingin menghapus modul ini?"
                      onConfirm={() => handleDelete(course.course_id)}
                      okText="Ya"
                      cancelText="Tidak"
                    >
                      <Button
                        danger
                        icon={<Icon component={DeleteIcon} />}
                        style={{ width: "100%" }}
                      />
                    </Popconfirm>
                  </Tooltip>
                </Flex>
              </Card>
            ))
          ) : (
            <CustomAlert type="info" message="Tidak ada data modul" />
          )}
        </div>
      )}

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
