import {
  Button,
  Card,
  Divider,
  Drawer,
  Flex,
  FloatButton,
  Form,
  Image,
  Input,
  List,
  Modal,
  Popconfirm,
  Space,
  Tooltip,
} from "antd";
import Icon from "@ant-design/icons";
import CustomAlert from "@/app/components/CustomAlert";
import Loading from "@/app/components/Loading";
import Title from "antd/es/typography/Title";
import Meta from "antd/es/card/Meta";
import Link from "next/link";
import { DeleteIcon, EditIcon } from "@/app/components/Icon";
import randomBgCourse from "@/app/lib/utils/randomBgCourse";
import { formatDate } from "@/app/lib/utils/formatDate";
import { useCourseViewModel } from "./useCourseViewModel";
import { Suspense } from "react";

export default function DetailCourseTeacherComponent() {
  const backgroundImages = randomBgCourse();
  const {
    detailCourse,
    materialsList,
    studentEnrolledList,
    isModalVisible,
    isChoosingType,
    isCreatingAssignment,
    isDrawerVisible,
    form,
    loading,
    selectedId,
    handleCancel,
    handleUpdate,
    handleDelete,
    handleCreate,
    handleTypeSelection,
    handleOk,
    courseError,
    studentEnrolledError,
    materialsError,
    courseData,
    materialsData,
    studentEnrolled,
    setIsDrawerVisible,
    course_id,
  } = useCourseViewModel();

  if (courseError || studentEnrolledError || materialsError)
    return (
      <CustomAlert
        type="error"
        message={
          courseError?.message ||
          studentEnrolledError?.message ||
          materialsError?.message
        }
      />
    );
  if (!courseData || !materialsData || !studentEnrolled) return <Loading />;

  return (
    <Suspense fallback={<Loading />}>
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Title level={4}>{detailCourse.name}</Title>
          <Button type="primary" onClick={handleCreate}>
            Tambah Materi / Assignment
          </Button>
        </div>
        <Divider />
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {materialsList.length > 0 ? (
            materialsList.map((item: any, index: number) => (
              <Card
                key={item.base_id}
                cover={
                  <Image
                    alt="default"
                    src={backgroundImages[index % backgroundImages.length]}
                    preview={false}
                  />
                }
                style={{ width: 300, margin: 20 }}
              >
                <Meta
                  title={
                    <Link
                      href={
                        item.type === "ASSIGNMENT"
                          ? `/teacher/dashboard/courses/${course_id}/assignments/${item.base_id}`
                          : `/teacher/dashboard/courses/${course_id}/materials/${item.base_id}`
                      }
                    >
                      {item.title}
                    </Link>
                  }
                />
                <Divider />
                <Flex justify="space-between" style={{ marginTop: 20 }}>
                  <Tooltip title="Edit">
                    <Button
                      type="primary"
                      onClick={() => handleUpdate(item.base_id)}
                    >
                      <Icon component={EditIcon} />
                    </Button>
                  </Tooltip>
                  <Popconfirm
                    title="Yakin ingin menghapus?"
                    onConfirm={() => handleDelete(item.base_id)}
                    onCancel={() => console.log("Batal menghapus")}
                    okText="Ya"
                    cancelText="Tidak"
                  >
                    <Tooltip title="Hapus ">
                      <Button danger>
                        <Icon component={DeleteIcon} />
                      </Button>
                    </Tooltip>
                  </Popconfirm>
                </Flex>
              </Card>
            ))
          ) : (
            <CustomAlert type="info" message="Belum ada Materi / Assignment" />
          )}
        </div>

        <FloatButton
          tooltip="Informasi Siswa"
          onClick={() => setIsDrawerVisible(true)}
        />

        <Drawer
          title="Siswa yang Terdaftar"
          placement="right"
          onClose={() => setIsDrawerVisible(false)}
          open={isDrawerVisible}
          width={350}
        >
          {studentEnrolledList.length > 0 ? (
            <List
              dataSource={studentEnrolledList}
              renderItem={(student: any) => (
                <List.Item key={student.student_id}>
                  <List.Item.Meta title={student.user.username} />
                  <List.Item.Meta title={formatDate(student.enrolledAt)} />
                </List.Item>
              )}
            />
          ) : (
            <CustomAlert type="info" message="Belum ada siswa yang terdaftar" />
          )}
        </Drawer>

        <Modal
          title={
            isChoosingType
              ? "Pilih Jenis yang Akan Dibuat"
              : selectedId
              ? `Edit ${isCreatingAssignment ? "Assignment" : "Materi"}`
              : isCreatingAssignment
              ? "Buat Assignment"
              : "Masukan Nama Materi"
          }
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
        >
          {isChoosingType ? (
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                type="primary"
                block
                onClick={() => handleTypeSelection("material")}
              >
                Buat Materi
              </Button>
              <Button
                type="primary"
                block
                onClick={() => handleTypeSelection("assignment")}
              >
                Buat Assignment
              </Button>
            </Space>
          ) : (
            <Form
              form={form}
              name="createForm"
              initialValues={{ remember: true }}
              onFinish={handleOk}
              autoComplete="off"
            >
              <Form.Item
                name="title"
                rules={[
                  {
                    required: true,
                    message: `Please enter ${
                      isCreatingAssignment ? "assignment" : "material"
                    } title`,
                  },
                ]}
              >
                <Input
                  placeholder={`Nama ${
                    isCreatingAssignment ? "Assignment" : "Materi"
                  }`}
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Submit
                </Button>
              </Form.Item>
            </Form>
          )}
        </Modal>
      </div>
    </Suspense>
  );
}
