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
import { QRCodeCanvas } from "qrcode.react";
import { useRef } from "react";

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
    handleGenerateQRCode,
    handleCancelOpenModalQr,
    qrModalVisible,
    handleOpenModalQr,
  } = usePlacementTestViewModel();
  const backgroundImages = useRandomBgCourse();

  const qrRef = useRef<HTMLDivElement | null>(null);

  const handleDownloadQRCode = () => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (context && qrRef.current) {
      const qrElement = qrRef.current.querySelector("canvas"); // Ambil elemen QR Code (canvas)

      if (qrElement) {
        const qrSize = 800; // Ukuran besar untuk resolusi tinggi
        canvas.width = qrSize;
        canvas.height = qrSize;

        // **Gambar QR Code ke Canvas dalam resolusi tinggi**
        context.drawImage(qrElement, 0, 0, qrSize, qrSize);

        // **Tambahkan logo di tengah QR Code**
        const logo: HTMLImageElement = document.createElement("img");
        logo.src = "/assets/images/logo.jpg"; // Path logo
        logo.onload = () => {
          const logoSize = qrSize * 0.2; // Ukuran logo 20% dari QR Code
          const x = (qrSize - logoSize) / 2;
          const y = (qrSize - logoSize) / 2;

          // **Buat logo berbentuk bulat**
          context.save();
          context.beginPath();
          context.arc(
            x + logoSize / 2,
            y + logoSize / 2,
            logoSize / 2,
            0,
            Math.PI * 2
          );
          context.closePath();
          context.clip();

          // Gambar logo
          context.drawImage(logo, x, y, logoSize, logoSize);
          context.restore();

          // **Simpan QR Code sebagai gambar PNG**
          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/png", 1.0); // 1.0 = kualitas tertinggi
          link.download = "qrcode.png";
          link.click();
        };
      }
    }
  };


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
                <Button
                  key={`qr-${test.placement_test_id}`}
                  type="primary"
                  style={{
                    width: "90%",
                    margin: "0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={() => handleGenerateQRCode(test.placement_test_id)}
                >
                  Generate QR Code
                </Button>,
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

      <Modal
        open={qrModalVisible}
        onCancel={() => handleCancelOpenModalQr()}
        footer={null}
        title="QR Code Placement Test"
      >
        <div
          ref={qrRef}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: "20px",
          }}
        >
          {selectedPlacement && (
            <>
              <div
                style={{
                  position: "relative",
                  padding: 15,
                  backgroundColor: "#fff",
                  borderRadius: 10,
                  boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
                  display: "inline-block",
                }}
              >
                {/* QR Code */}
                <QRCodeCanvas
                  value={selectedPlacement.name}
                  size={200}
                  level="H"
                  includeMargin={true}
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
                {/* Logo di atas QR Code */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 50, // Sesuaikan ukuran logo
                    height: 50,
                    borderRadius: "50%", // Opsional untuk membuat logo bulat
                    backgroundColor: "white", // Latar belakang untuk kontras
                    padding: 5, // Padding agar logo tidak menyatu dengan QR Code
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    src="/assets/images/logo.jpg" // Ganti dengan path logo Anda
                    alt="Logo"
                    preview={false}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      borderRadius: "50%",
                    }}
                  />
                </div>
              </div>

              {/* Tombol Download */}
              <Button
                key="download"
                type="primary"
                style={{ width: "100%", marginTop: "15px" }}
                onClick={handleDownloadQRCode}
              >
                Download QR Code
              </Button>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
