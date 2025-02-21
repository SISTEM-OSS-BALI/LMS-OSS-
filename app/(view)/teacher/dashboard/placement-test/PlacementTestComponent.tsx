import {
  Alert,
  Button,
  Card,
  Flex,
  Form,
  Image,
  Input,
  Modal,
  Skeleton,
  Typography,
} from "antd";
import { usePlacementTestViewModel } from "./usePlacementTestViewModel";
import { useRandomBgCourse } from "@/app/lib/utils/useRandomBgCourse";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Link from "next/link";

const { Title } = Typography;

export default function PlacementTestComponent() {
  const {
    dataPlacementTest,
    isLoadingPlacementTest,
    handleCancelModal,
    handleOpenModal,
    isModalVisible,
    form,
    handleSubmit,
    loading,
    handleEdit,
    selectedPlacement,
    handleDelete,
  } = usePlacementTestViewModel();
  const backgroundImages = useRandomBgCourse();

  const confirmDelete = (placement_id: string) => {
    Modal.confirm({
      title: "Yakin menghapus data ini?",
      content: "Data yang dihapus tidak dapat dikembalikan",
      onOk() {
        handleDelete(placement_id);
      },
    });
  };

  return (
    <div style={{ padding: "24px" }}>
      <Flex justify="space-between" align="center">
        <Title level={3} style={{ marginBlock: 0 }}>
          Placement Test
        </Title>
        <Button type="primary" onClick={() => handleOpenModal()}>
          Tambah Data
        </Button>
      </Flex>

      <Flex wrap="wrap" gap={16} style={{ marginTop: 16 }}>
        {/* Skeleton Loading */}
        {isLoadingPlacementTest ? (
          [...Array(6)].map((_, index) => (
            <Card key={index} style={{ width: 300 }}>
              <Skeleton.Image style={{ width: "100%", height: 150 }} />
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          ))
        ) : dataPlacementTest && dataPlacementTest?.data?.length > 0 ? (
          dataPlacementTest?.data?.map((test, index: number) => (
            <Card
              key={test.placement_test_id}
              cover={
                backgroundImages && (
                  <Image
                    alt="default"
                    src={backgroundImages[index % backgroundImages.length]}
                    preview={false}
                  />
                )
              }
              actions={[
                <Link
                  key={test.placement_test_id}
                  href={`/teacher/dashboard/placement-test/${test.placement_test_id}`}
                >
                  Detail
                </Link>,
              ]}
              style={{ width: 300, position: "relative" }}
            >
              {/* Tombol Edit & Delete di Pojok Kanan Atas */}
              <div
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
                  onClick={() => handleEdit(test.placement_test_id)}
                />
                <Button
                  type="primary"
                  danger
                  shape="circle"
                  icon={<DeleteOutlined />}
                  onClick={() => confirmDelete(test.placement_test_id)}
                />
              </div>

              <Title level={4} style={{ textAlign: "center", marginBottom: 0 }}>
                {test.name}
              </Title>
            </Card>
          ))
        ) : (
          <Alert
            message="Informasi"
            description="Tidak ada data Placement Test tersedia."
            type="info"
            showIcon
            style={{ width: "100%", textAlign: "center" }}
          />
        )}
      </Flex>

      <Modal
        open={isModalVisible}
        onCancel={handleCancelModal}
        footer={null}
        title={selectedPlacement ? "Edit Data" : "Tambah Data"}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Nama"
            name="name"
            required
            rules={[{ required: true, message: "Nama harus diisi" }]}
          >
            <Input placeholder="Masukkan Nama" />
          </Form.Item>
          <Form.Item
            label="Deskripsi"
            name="description"
            required
            rules={[{ required: true, message: "Deskripsi harus diisi" }]}
          >
            <Input placeholder="Masukkan Deskripsi" />
          </Form.Item>
          <Form.Item
            label="Waktu"
            name="time_limit"
            required
            rules={[{ required: true, message: "Waktu harus diisi" }]}
          >
            <Input type="number" placeholder="Masukkan Durasi Pengerjaan" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              style={{ width: "100%" }}
              htmlType="submit"
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
