import Table, { ColumnsType } from "antd/es/table";
import { useConfirmAccountViewModel } from "./useConfirmAccountViewModel";
import { TermsAgreement } from "@prisma/client";
import {
  Tag,
  Image,
  Button,
  Skeleton,
  Card,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Grid,
  Flex,
} from "antd";
import dayjs from "dayjs";
import Title from "antd/es/typography/Title";
import { DeleteOutlined } from "@ant-design/icons";

export default function ConfirmAccountComponent() {
  const {
    confirmAccount,
    isLoadingConfirmAccount,
    loadingId,
    handleApprove,
    isModalDataVisible,
    handleCloseModal,
    handleOpenModal,
    form,
    consultantData,
    handleFinish,
    loading,
    handleDelete,
    handleSearch,
    filteredStudent,
  } = useConfirmAccountViewModel();

  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  const showDeleteConfirm = (userId: string) => {
    Modal.confirm({
      title: "Hapus Data",
      content: "Apakah Anda yakin ingin menghapus data ini?",
      okText: "Ya",
      okType: "danger",
      cancelText: "Tidak",
      onOk() {
        handleDelete(userId);
      },
    });
  };

  const columns: ColumnsType<TermsAgreement> = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Nama",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Program",
      dataIndex: "program_name",
      key: "program_name",
    },
    {
      title: "Persetujuan",
      dataIndex: "is_agreed",
      key: "is_agreed",
      render: (text: boolean) =>
        text ? <Tag color="green">Sudah</Tag> : <Tag color="red">Belum</Tag>,
    },
    {
      title: "Tanggal",
      dataIndex: "agreed_at",
      key: "agreed_at",
      render: (text: string) => <span>{dayjs(text).format("YYYY-MM-DD")}</span>,
    },
    {
      title: "Bukti",
      dataIndex: "signature_url",
      key: "signature_url",
      render: (text: string) =>
        text ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center", // Posisi tengah secara horizontal
              alignItems: "center", // Posisi tengah secara vertikal
              textAlign: "center",
              width: "100%",
            }}
          >
            <Image
              src={text}
              width={screens.xs ? 100 : 50} // Ukuran gambar lebih besar di mobile
              height={screens.xs ? 100 : 50}
              alt="bukti"
              style={{
                maxWidth: "100%",
                objectFit: "contain",
                borderRadius: 8,
              }}
            />
          </div>
        ) : (
          <Tag color="red">Tidak ada</Tag>
        ),
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <Space
          wrap
          direction={screens.xs ? "vertical" : "horizontal"}
          style={{ width: "100%", justifyContent: "center" }}
        >
          <Button
            type="primary"
            onClick={() => handleApprove(record.user_id, true)}
            loading={loadingId === record.user_id}
            disabled={record.is_approved}
            block={screens.xs}
          >
            Approve
          </Button>
          <Button
            type="primary"
            onClick={() => handleOpenModal(record.user_id)}
            block={screens.xs}
          >
            Tambah Data
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            loading={loadingId === record.user_id}
            onClick={() => showDeleteConfirm(record.user_id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: screens.xs ? "12px" : "24px" }}>
      {/* Header */}
      <Flex justify="space-between" align="center" wrap="wrap">
        <Title
          level={screens.xs ? 4 : 3}
          style={{ marginBottom: screens.xs ? "12px" : "24px" }}
        >
          Konfirmasi Akun Siswa
        </Title>
        <Input
          placeholder="Cari nama siswa"
          onChange={handleSearch}
          style={{ width: "30%" }}
        />
      </Flex>

      {/* Skeleton Loading untuk Tabel */}
      {isLoadingConfirmAccount ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <Card
          style={{
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            padding: screens.xs ? "16px" : "20px",
          }}
        >
          <Table
            columns={columns}
            dataSource={filteredStudent
              ?.slice()
              ?.sort((a, b) => Number(a.is_approved) - Number(b.is_approved))}
            loading={isLoadingConfirmAccount}
            rowKey="user_id"
            bordered
            pagination={{ pageSize: 5 }}
            scroll={{ x: "max-content" }}
          />
        </Card>
      )}

      {/* Modal Tambah Data */}
      <Modal
        open={isModalDataVisible}
        title="Tambah Data"
        onCancel={handleCloseModal}
        footer={null}
        width={screens.xs ? "90%" : "50%"} // Modal lebih kecil di HP
      >
        <Form layout="vertical" form={form} onFinish={handleFinish}>
          <Form.Item name="target">
            <Input placeholder="Masukan target student" />
          </Form.Item>
          <Form.Item name="consultant_id">
            <Select placeholder="Pilih PJ Konsultan">
              {consultantData?.data.map((item: any) => (
                <Select.Option
                  key={item.consultant_id}
                  value={item.consultant_id}
                >
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
