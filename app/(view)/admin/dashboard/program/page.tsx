"use client";

import { Button, Divider, Flex, Form, Input, Modal, Tooltip } from "antd";
import Title from "antd/es/typography/Title";
import { useProgramViewModel } from "./useProgramViewModel";
import ReactQuill from "react-quill";
import Loading from "@/app/components/Loading";
import { Program } from "@/app/model/program";
import Table, { ColumnsType } from "antd/es/table";
import Icon from "@ant-design/icons";
import { DeleteIcon, EditIcon } from "@/app/components/Icon";

export default function ProgramPage() {
  const {
    handleOk,
    handleCancel,
    form,
    isLoading,
    isModalVisible,
    setIsModalVisible,
    loading,
    handleEdit,
    handleDelete,
    filteredData,
    setSearchKeyword,
    searchKeyword,
    selectedId,
  } = useProgramViewModel();

  if (isLoading) {
    return <Loading />;
  }

  const columns: ColumnsType<Program> = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Nama Program",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Deskripsi",
      dataIndex: "description",
      key: "description",
      render: (text) => <span dangerouslySetInnerHTML={{ __html: text }} />,
    },
    {
      title: "Jumlah Pertemuan",
      dataIndex: "count_program",
      key: "count_program",
    },
    {
      title: "Durasi",
      dataIndex: "duration",
      key: "duration",
      render: (text) => <span>{text} Menit</span>,
    },
    {
      title: "Aksi",
      key: "actions",
      render: (_, record) => (
        <Flex justify="start" gap={20}>
          <Tooltip title="Edit">
            <Button
              type="primary"
              onClick={() => handleEdit(record.program_id)}
            >
              <Icon component={EditIcon} />
            </Button>
          </Tooltip>
          <Tooltip title="Hapus">
            <Button danger onClick={() => handleDelete(record.program_id)}>
              <Icon component={DeleteIcon} />
            </Button>
          </Tooltip>
        </Flex>
      ),
    },
  ];

  return (
    <>
      <Title level={3} style={{ marginBottom: "20px" }}>
        Data Program
      </Title>
      <Flex justify="space-between" gap={30}>
        <Button type="primary" onClick={() => setIsModalVisible(true)}>
          Tambah Program
        </Button>
        <Input
          style={{ width: "500px" }}
          placeholder="Cari nama program"
          onChange={(e) => setSearchKeyword(e.target.value)}
          value={searchKeyword}
        />
      </Flex>
      <Divider />
      <Table columns={columns} loading={isLoading} dataSource={filteredData} />
      <Modal
        title={selectedId ? "Edit Data Program" : "Tambah Data Program"}
        open={isModalVisible}
        footer={null}
        onCancel={handleCancel}
      >
        <Form name="createProgram" onFinish={handleOk} form={form}>
          <Form.Item name="name">
            <Input placeholder="Masukan Nama Program Kursus" />
          </Form.Item>
          <Form.Item name="description">
            <ReactQuill theme="snow" placeholder="Masukkan Deskripsi Program" />
          </Form.Item>
          <Form.Item name="count_program">
            <Input placeholder="Masukan Total Pertemuan" />
          </Form.Item>
          <Form.Item name="duration">
            <Input placeholder="Masukan Durasi Program" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
