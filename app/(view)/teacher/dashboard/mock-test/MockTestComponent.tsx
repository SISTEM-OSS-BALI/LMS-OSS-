import {
  Card,
  Skeleton,
  Row,
  Col,
  Button,
  Space,
  Flex,
  Modal,
  Form,
  Input,
  Alert,
  Image,
} from "antd";
import { useMockTestViewModel } from "./useMockTestViewModel";
import {
  EditOutlined,
  DeleteOutlined,
  PlusCircleFilled,
  QrcodeOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { useRef } from "react";

export default function MockTestComponent() {
  const {
    mockTestData,
    mockTestDataLoading,
    handleCancelModal,
    handleOpenModal,
    isModalVisible,
    form,
    handleEdit,
    handleSubmit,
    selectedMockTest,
    loading,
    handleDelete,
    handleGenerateQRCode,
    handleCancelOpenModalQr,
    qrModalVisible,
    handleOpenModalQr,
  } = useMockTestViewModel();

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

          // Gambar logo tanpa clipping bulat
          context.drawImage(logo, x, y, logoSize, logoSize);

          // **Simpan QR Code sebagai gambar PNG**
          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/png", 1.0); // 1.0 = kualitas tertinggi
          link.download = "qrcode.png";
          link.click();
        };
      }
    }
  };

  const showConfirmDelete = (mock_test_id: string) => {
    Modal.confirm({
      title: "Hapus Data",
      content: "Apakah Anda yakin ingin menghapus data ini?",
      okText: "Ya",
      okType: "danger",
      cancelText: "Tidak",
      onOk: () => handleDelete(mock_test_id),
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <Flex justify="end">
        <Button
          type="primary"
          icon={<PlusCircleFilled />}
          onClick={handleOpenModal}
          style={{ marginBottom: "10px" }}
        >
          Tambah Data
        </Button>
      </Flex>

      {!mockTestDataLoading &&
        (!mockTestData || mockTestData?.data.length === 0) && (
          <Alert
            message="Tidak ada data tersedia"
            description="Silakan tambahkan data baru menggunakan tombol 'Tambah Data'."
            type="warning"
            showIcon
            style={{
              marginTop: "20px",
              marginBottom: "20px",
              borderRadius: "8px",
            }}
          />
        )}

      {/* Kontainer Scroll Horizontal */}
      <div
        style={{
          overflowX: "auto",
          whiteSpace: "nowrap",
          paddingBottom: "10px",
          width: "100%", // Pastikan container mengambil seluruh lebar
        }}
      >
        <Row
          gutter={[16, 16]}
          style={{
            display: "flex",
            flexWrap: "nowrap", // Cegah wrapping
            minWidth: "max-content", // Mencegah konten terpotong
          }}
        >
          {mockTestDataLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <Col key={index} style={{ flex: "0 0 auto", width: "250px" }}>
                  <Skeleton active loading={true} />
                </Col>
              ))
            : mockTestData?.data.map((item) => (
                <Col
                  key={item.mock_test_id}
                  style={{ flex: "0 0 auto", width: "250px" }}
                >
                  <Card
                    bordered={false}
                    style={{
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      borderRadius: "10px",
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
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
                        onClick={() => handleEdit(item.mock_test_id)}
                      />
                      <Button
                        type="default"
                        shape="circle"
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => showConfirmDelete(item.mock_test_id)}
                      />
                      <Button
                        key={`qr-${item.mock_test_id}`}
                        type="default"
                        shape="circle"
                        icon={<QrcodeOutlined />}
                        onClick={() => handleGenerateQRCode(item.mock_test_id)}
                      />
                    </Space>

                    <h3 style={{ marginBottom: "20px", marginTop: "20px" }}>
                      {item.name}
                    </h3>

                    <Link
                      href={`/teacher/dashboard/mock-test/${item.mock_test_id}`}
                      passHref
                    >
                      <Button type="link" style={{ padding: 0 }}>
                        Detail
                      </Button>
                    </Link>
                  </Card>
                </Col>
              ))}
        </Row>
      </div>
      <Modal
        open={isModalVisible}
        onCancel={handleCancelModal}
        footer={null}
        title={selectedMockTest ? "Edit Data" : "Tambah Data"}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Nama */}
          <Form.Item
            name="name"
            label="Nama"
            rules={[{ required: true, message: "Nama wajib diisi!" }]}
          >
            <Input placeholder="Masukkan Nama" />
          </Form.Item>

          {/* Deskripsi */}
          <Form.Item
            name="description"
            label="Deskripsi"
            rules={[{ required: true, message: "Deskripsi wajib diisi!" }]}
          >
            <Input.TextArea placeholder="Masukkan Deskripsi" />
          </Form.Item>

          {/* Lama Pengerjaan */}
          <Form.Item
            name="timeLimit"
            label="Lama Pengerjaan"
            rules={[
              { required: true, message: "Lama pengerjaan wajib diisi!" },
              {
                pattern: /^[0-9]+$/,
                message: "Lama pengerjaan harus berupa angka!",
              },
            ]}
          >
            <Input placeholder="Lama Pengerjaan (menit)" />
          </Form.Item>

          {/* Tombol Submit */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ width: "100%" }}
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
        title="QR Code Mock Test"
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
          {selectedMockTest && (
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
                  value={`${process.env.NEXT_PUBLIC_APP_URL}/free-mock-test/${selectedMockTest.mock_test_id}`}
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
