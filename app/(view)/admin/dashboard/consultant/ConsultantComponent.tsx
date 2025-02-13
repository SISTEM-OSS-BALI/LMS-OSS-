"use client";

import { useState } from "react";
import {
  Table,
  Button,
  Popconfirm,
  Modal,
  Form,
  Input,
  message,
  Space,
  Flex,
  Card,
  Skeleton,
  Spin,
  Grid,
} from "antd";
import { useConsultantViewModel } from "./useConsultantViewModel";
import Icon from "@ant-design/icons";
import {
  AddIcon,
  DeleteIcon,
  DetailsIcon,
  EditIcon,
} from "@/app/components/Icon";
import Title from "antd/es/typography/Title";

const { useBreakpoint } = Grid;

export default function ConsultantComponent() {
  const {
    consultantData,
    handleDetail,
    handleEdit,
    handleUpdate,
    handleDelete,
    isModalVisible,
    setIsModalVisible,
    selectedConsultant,
    setSelectedConsultant,
    form,
    isLoadingConsultant,
  } = useConsultantViewModel();

  const screens = useBreakpoint();

  // 🔹 Table Columns
  const columns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (text: any, record: any, index: number) => index + 1,
    },
    {
      title: "Nama",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "No Telpun",
      dataIndex: "no_phone",
      key: "no_phone",
    },
    {
      title: "Aksi",
      key: "actions",
      render: (_: any, record: any) => (
        <Space size={screens.xs ? "small" : "middle"}>
          <Button type="primary" onClick={() => handleEdit(record)}>
            <Icon component={EditIcon} />
          </Button>
          <Button type="default" danger>
            <Icon component={DeleteIcon} />
          </Button>
          <Button
            type="primary"
            onClick={() => handleDetail(record.consultant_id)}
          >
            <Icon component={DetailsIcon} />
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: screens.xs ? "10px" : "20px" }}>
      <Flex justify="space-between" wrap={screens.xs ? "wrap" : "nowrap"}>
        <Title level={screens.xs ? 4 : 3}>Daftar Konsultan</Title>
        <Button type="primary">
          <Icon component={AddIcon} />
          Tambah Konsultan
        </Button>
      </Flex>
      <Card>
        {isLoadingConsultant ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <Table
            columns={columns}
            dataSource={consultantData?.data}
            rowKey="consultant_id"
            size={screens.xs ? "small" : "middle"}
            scroll={screens.xs ? { x: true } : undefined}
          />
        )}
      </Card>

      <Modal
        title="Edit Consultant"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleUpdate}
      >
        <Spin spinning={isLoadingConsultant}>
          <Form form={form} layout="vertical">
            <Form.Item
              label="Name"
              name="name"
              rules={[
                { required: true, message: "Please enter consultant name" },
              ]}
            >
              <Input />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
}
