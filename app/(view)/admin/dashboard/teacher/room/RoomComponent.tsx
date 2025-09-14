"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Flex,
  Form,
  Modal,
  TimePicker,
  Table,
  Tag,
  Space,
  Popconfirm,
  message,
  Input,
  Card,
} from "antd";
import type { TableProps } from "antd";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import Icon from "@ant-design/icons";
import Title from "antd/es/typography/Title";
import { DeleteIcon, EditIcon } from "@/app/components/Icon";
import useRoomViewModel from "./useRoomViewModel";

dayjs.extend(utc);

export type RoomFormValues = {
  name: string;
};

export type RoomRow = {
  room_id: string;
  name: string;
};
// ===== Types =====

export default function ShiftComponent() {
  const {
    form,
    editingRow,
    setEditingRow,
    open,
    setOpen,
    openEdit,
    handleDelete,
    handleFinish,
    roomData,
    openCreate,
    submitting,
  } = useRoomViewModel();

  // ===== STATE =====

  // ===== Table =====
  const columns: TableProps<RoomRow>["columns"] = [
    {
      title: "Nama",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, row) => (
        <Space>
          <Button onClick={() => openEdit(row)}>
            <Icon component={EditIcon} />
          </Button>
          <Popconfirm
            title="Hapus ruang kelas ini?"
            okText="Hapus"
            cancelText="Batal"
            onConfirm={() => handleDelete(row)}
          >
            <Button danger>
             <Icon component={DeleteIcon} />
            </Button>
          </Popconfirm>
        </Space>
      ),
      width: 160,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Flex justify="start" align="center" style={{ marginBottom: 12 }}>
        <Title level={3} style={{ margin: 0 }}>
          Ruang Kelas
        </Title>
      </Flex>

      <Card>
        <Flex justify="end" style={{ marginBottom: 12 }}>
          <Button type="primary" onClick={openCreate}>
            Tambah Ruang Kelas
          </Button>
        </Flex>
        <Table
          rowKey={(r) => r.room_id}
          dataSource={roomData?.data}
          columns={columns}
          loading={!roomData} 
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20, 50],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} Ruang Kelas`,
          }}
        />
      </Card>

      <Modal
        title={editingRow ? "Edit Ruang Kelas" : "Tambah Ruang Kelas"}
        open={open}
        onCancel={() => {
          setOpen(false);
          setEditingRow(null);
        }}
        footer={null}
        destroyOnClose
      >
        <Form<RoomFormValues>
          layout="vertical"
          form={form}
          onFinish={handleFinish}
          initialValues={{} as RoomFormValues}
        >
          <Form.Item name="name" label="Nama Ruang Kelas">
            <Input placeholder="Nama Ruang Kelas" />
          </Form.Item>

          <Flex justify="flex-end" gap={8}>
            <Button
              onClick={() => {
                setOpen(false);
                setEditingRow(null);
              }}
            >
              Batal
            </Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Simpan
            </Button>
          </Flex>
        </Form>
      </Modal>
    </div>
  );
}
