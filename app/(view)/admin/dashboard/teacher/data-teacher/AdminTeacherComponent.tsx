import {
  Button,
  Divider,
  Drawer,
  Flex,
  Input,
  Popconfirm,
  Table,
  Tooltip,
  Checkbox,
  TimePicker,
  Space,
  Form,
  Modal,
  Card,
  Grid,
  Skeleton,
} from "antd";
import Title from "antd/es/typography/Title";
import {
  AddIcon,
  CalendarIcon,
  DeleteIcon,
  EditIcon,
} from "@/app/components/Icon";
import { ColumnsType } from "antd/es/table";
import Loading from "@/app/components/Loading";
import Icon, { ExclamationCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useCalendarViewModel } from "./useCalendarViewModel";
import { User } from "@/app/model/user";
dayjs.extend(utc);

export default function AdminDashboardTeacheComponent() {
  const {
    isLoading,
    selectedTeacher,
    searchKeyword,
    setSearchKeyword,
    filteredData,
    handleEdit,
    loading,
    handleCancel,
    handleFinish,
    isModalVisible,
    setIsModalVisible,
    form,
    handleDelete,
  } = useCalendarViewModel();

  const { useBreakpoint } = Grid;
  const screens = useBreakpoint(); // Responsive breakpoint

  const showDeleteConfirm = (user_id: string) => {
    Modal.confirm({
      title: "Yakin Menghapus Guru?",
      icon: <ExclamationCircleOutlined />,
      content: "Aksi ini tidak dapat dibalik.",
      okText: "Ya",
      okType: "danger",
      cancelText: "Tidak",
      onOk: () => handleDelete(user_id),
    });
  };

  const columns: ColumnsType<User> = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Nama Guru",
      dataIndex: "username",
      key: "username",
      sorter: (a, b) => a.username.localeCompare(b.username),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "No Telepon",
      dataIndex: "no_phone",
      key: "no_phone",
      sorter: (a, b) => a.no_phone.localeCompare(b.no_phone),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Tempat",
      dataIndex: "region",
      key: "region",
      sorter: (a, b) => (a.region || "").localeCompare(b.region || ""),
      sortDirections: ["ascend", "descend"],
      render: (text) => text || "Tidak ada data",
    },
    {
      title: "Total Pertemuan",
      dataIndex: "count_program",
      key: "count_program",
    },
    {
      title: "Aksi",
      key: "actions",
      render: (_, record) => (
        <Flex justify="start" gap={screens.xs ? 10 : 20}>
          <Tooltip title="Edit">
            <Button
              type="primary"
              onClick={() => handleEdit(record.user_id)}
              size={screens.xs ? "small" : "middle"}
            >
              <Icon component={EditIcon} />
            </Button>
          </Tooltip>
          <Tooltip title="Hapus">
            <Button
              danger
              onClick={() => showDeleteConfirm(record.user_id)}
              size={screens.xs ? "small" : "middle"}
            >
              <Icon component={DeleteIcon} />
            </Button>
          </Tooltip>
        </Flex>
      ),
    },
  ];

  return (
    <div style={{ padding: screens.xs ? "12px" : "24px" }}>
      <Flex justify="space-between" wrap={screens.xs ? "wrap" : "nowrap"}>
        <Title level={screens.xs ? 4 : 3} style={{ marginBlock: 0 }}>
          Data Guru
        </Title>
        <Input
          placeholder="Cari nama guru"
          style={{ width: screens.xs ? "100%" : 300 }}
          onChange={(e) => setSearchKeyword(e.target.value)}
          value={searchKeyword}
        />
      </Flex>
      <Divider />
      <Card
        style={{
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          padding: screens.xs ? "12px" : "20px",
        }}
      >
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <div>
            <Flex justify="space-between" wrap="wrap">
              <Button
                type="primary"
                style={{ marginBottom: 20 }}
                onClick={() => setIsModalVisible(true)}
                size={screens.xs ? "small" : "middle"}
              >
                <Icon component={AddIcon} />
                Tambah Guru
              </Button>
              <Button
                type="primary"
                href="/admin/dashboard/teacher/data-teacher/report"
              >
                Timesheet
              </Button>
            </Flex>
            <Table
              columns={columns}
              dataSource={filteredData || []}
              rowKey="user_id"
              loading={isLoading}
              bordered
              pagination={{ pageSize: 5 }}
              scroll={{ x: "max-content" }}
            />
          </div>
        )}
      </Card>

      <Modal
        open={isModalVisible}
        onCancel={handleCancel}
        title={selectedTeacher ? "Edit Guru" : "Tambah Guru"}
        footer={null}
        width={screens.xs ? "100%" : 480}
      >
        <Form form={form} onFinish={handleFinish}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input placeholder="Username" />
          </Form.Item>
          {!selectedTeacher && (
            <>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please input your email!" },
                ]}
              >
                <Input placeholder="Email" />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                ]}
              >
                <Input.Password placeholder="Password" />
              </Form.Item>
            </>
          )}
          <Form.Item
            name="no_phone"
            rules={[
              { required: true, message: "Please input your phone number!" },
            ]}
          >
            <Input placeholder="No Telpun" />
          </Form.Item>
          <Form.Item
            name="region"
            rules={[{ required: true, message: "Please input your region!" }]}
          >
            <Input placeholder="Tempat" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Simpan
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
