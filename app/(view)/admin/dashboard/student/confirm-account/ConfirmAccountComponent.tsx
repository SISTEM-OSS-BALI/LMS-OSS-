import { useState } from "react";
import Table, { ColumnsType } from "antd/es/table";
import { useConfirmAccountViewModel } from "./useConfirmAccountViewModel";
import { TermsAgreement } from "@prisma/client";
import {
  Tag,
  Image,
  Button,
  message,
  Skeleton,
  Card,
  Space,
  Modal,
  Form,
  Input,
  Select,
} from "antd";
import dayjs from "dayjs";
import Title from "antd/es/typography/Title";

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
  } = useConfirmAccountViewModel();

  // Function untuk menangani approval akun

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
          <Image src={text} width={50} height={50} alt="bukti" />
        ) : (
          <Tag color="red">Tidak ada</Tag>
        ),
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            onClick={() => handleApprove(record.user_id, true)}
            loading={loadingId === record.user_id}
            disabled={record.is_approved} // Disable jika sudah disetujui
          >
            Approve
          </Button>
          <Button
            type="primary"
            onClick={() => handleOpenModal(record.user_id)}
          >
            Tambah Data
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={3}>Konfirmasi Akun Siswa</Title>

      {/* Skeleton Loading untuk Tabel */}
      {isLoadingConfirmAccount ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <Card>
          <Table
            columns={columns}
            dataSource={confirmAccount?.data}
            loading={isLoadingConfirmAccount}
            rowKey="user_id"
          />
        </Card>
      )}
      <Modal
        open={isModalDataVisible}
        title="Tambah Data"
        onCancel={handleCloseModal}
        footer={null}
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
    </div>
  );
}
