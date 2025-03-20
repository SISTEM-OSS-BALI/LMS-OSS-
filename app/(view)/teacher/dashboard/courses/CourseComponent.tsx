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
  Grid,
  Alert,
} from "antd";
import Icon from "@ant-design/icons";
import Title from "antd/es/typography/Title";
import Link from "next/link";
import { AddIcon, DeleteIcon, EditIcon } from "@/app/components/Icon";
import { useRandomBgCourse } from "@/app/lib/utils/useRandomBgCourse";
import { useCourseViewModel } from "./useCourseViewModel";
import CustomAlert from "@/app/components/CustomAlert";
import Meta from "antd/es/card/Meta";

const { useBreakpoint } = Grid; // Ant Design Responsive Grid

export default function CoursesTeacherComponent() {
  const backgroundImages = useRandomBgCourse();
  const screens = useBreakpoint(); // Menangkap ukuran layar

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
    <div style={{ padding: screens.xs ? "10px" : "20px" }}>
      <Flex justify="space-between" align="center" wrap="wrap" gap={10}>
        <Title level={3} style={{ marginBlock: 0 }}>
          Daftar Modul
        </Title>
        <Input
          placeholder="Cari nama modul"
          onChange={handleSearch}
          style={{ width: screens.xs ? "100%" : "30%" }} // Lebar penuh di layar kecil
        />
        <FloatButton
          onClick={() => setIsModalVisible(true)}
          tooltip="Tambah Modul"
          icon={<Icon component={AddIcon} />}
        />
      </Flex>
      <Divider />

      {/* Skeleton Loading */}
      {isLoadingCourse ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: screens.xs
              ? "1fr"
              : "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "16px",
          }}
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} style={{ width: "100%" }} hoverable>
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
      ) : !filteredCourses || filteredCourses.length === 0 ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "200px", // Pastikan alert berada di tengah
            width: "100%",
          }}
        >
          <Alert
            style={{ width: "50%", textAlign: "center" }}
            type="info"
            message="Tidak ada data modul"
          />
        </div>
      ) : (
        // Menampilkan daftar modul jika ada data
        <div
          style={{
            display: "grid",
            gridTemplateColumns: screens.xs
              ? "1fr"
              : "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "16px",
          }}
        >
          {filteredCourses &&
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
                style={{ width: "100%" }}
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
            ))}
        </div>
      )}

      {/* Modal untuk Tambah / Update Modul */}
      <Modal
        title={selectedId ? "Update Modul" : "Tambah Modul"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={screens.xs ? "90%" : "50%"} // Modal lebih lebar di desktop
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
