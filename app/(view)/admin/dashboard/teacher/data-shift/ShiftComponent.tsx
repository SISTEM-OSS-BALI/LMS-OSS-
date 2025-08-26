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
import useShiftViewModel from "./useShiftViewModel";
import Title from "antd/es/typography/Title";
import { DeleteIcon, EditIcon } from "@/app/components/Icon";

dayjs.extend(utc);

const timeFormat = "HH:mm";

export type ShiftFormValues = {
  title: string;
  time_range: [Dayjs, Dayjs];
};

export type ShiftRow = {
  id: string;
  title?: string;
  start_time: string; // ISO
  end_time: string; // ISO
};
// ===== Types =====

export default function ShiftComponent() {
  const {
    shiftData,
    mutateShift,
    formatTimeLocal,
    computeDurationLabel,
    handleDelete,
    openCreate,
    openEdit,
    handleFinish,
    submitting,
    form,
    editingRow,
    setEditingRow,
    setOpen,
    open,
    rows,
  } = useShiftViewModel();

  // ===== STATE =====

  // ===== Table =====
  const columns: TableProps<ShiftRow>["columns"] = [
    {
      title: "Nama Shift",
      dataIndex: "title",
      key: "title",
      render: (val) => val || "-",
      ellipsis: true,
    },
    {
      title: "Mulai",
      dataIndex: "start_time",
      key: "start",
      render: (val: string) => <Tag>{formatTimeLocal(val)}</Tag>,
      sorter: (a, b) => dayjs(a.start_time).diff(dayjs(b.start_time)),
      width: 120,
    },
    {
      title: "Selesai",
      dataIndex: "end_time",
      key: "end",
      render: (val: string) => <Tag>{formatTimeLocal(val)}</Tag>,
      sorter: (a, b) => dayjs(a.end_time).diff(dayjs(b.end_time)),
      width: 120,
    },
    {
      title: "Durasi",
      key: "duration",
      render: (_, row) => computeDurationLabel(row.start_time, row.end_time),
      width: 120,
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
            title="Hapus shift ini?"
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
          Jadwal Shift
        </Title>
      </Flex>

      <Card>
        <Flex justify="end" style={{ marginBottom: 12 }}>
          <Button type="primary" onClick={openCreate}>
            Tambah Shift
          </Button>
        </Flex>
        <Table
          rowKey={(r) => r.id}
          dataSource={rows}
          columns={columns}
          bordered
          loading={!shiftData} // simple loading dari hook
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20, 50],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} shift`,
          }}
        />
      </Card>

      <Modal
        title={editingRow ? "Edit Shift" : "Tambah Shift"}
        open={open}
        onCancel={() => {
          setOpen(false);
          setEditingRow(null);
        }}
        footer={null}
        destroyOnClose
      >
        <Form<ShiftFormValues>
          layout="vertical"
          form={form}
          onFinish={handleFinish}
          initialValues={{} as ShiftFormValues}
        >
          <Form.Item name="title" label="Nama Shift">
            <Input placeholder="Contoh: Shift Pagi" />
          </Form.Item>

          <Form.Item
            name="time_range"
            label="Rentang Jam"
            rules={[{ required: true, message: "Isi rentang jam shift" }]}
            tooltip="Disimpan sebagai jam harian (UTC) dengan tanggal dummy 1970-01-01"
          >
            <TimePicker.RangePicker
              format={timeFormat}
              minuteStep={5}
              allowClear
              style={{ width: "100%" }}
            />
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
