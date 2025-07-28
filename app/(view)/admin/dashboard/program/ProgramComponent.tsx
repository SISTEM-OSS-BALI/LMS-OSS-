import {
  Button,
  Card,
  Divider,
  Flex,
  Form,
  Input,
  Modal,
  Tooltip,
  Skeleton,
  Spin,
  Grid,
} from "antd";
import Title from "antd/es/typography/Title";
import { useProgramViewModel } from "./useProgramViewModel";
import ReactQuill from "react-quill";
import { Program } from "@/app/model/program";
import Table, { ColumnsType } from "antd/es/table";
import Icon, { ExclamationCircleOutlined } from "@ant-design/icons";
import { DeleteIcon, EditIcon } from "@/app/components/Icon";
const { useBreakpoint } = Grid;

export default function ProgramComponent() {
  const {
    handleOk,
    handleCancel,
    form,
    isLoadingProgram,
    isModalVisible,
    setIsModalVisible,
    loading,
    handleEdit,
    handleDelete,
    filteredData,
    setSearchKeyword,
    searchKeyword,
    selectedProgram,
  } = useProgramViewModel();

  const screens = useBreakpoint();

  const showDeleteConfirm = (program_id: string) => {
    Modal.confirm({
      title: "Yakin Menghapus Program?",
      icon: <ExclamationCircleOutlined />,
      content: "Aksi ini tidak dapat dibalik.",
      okText: "Ya",
      okType: "danger",
      cancelText: "Tidak",
      onOk: () => handleDelete(program_id),
    });
  };

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
            <Button danger onClick={() => showDeleteConfirm(record.program_id)}>
              <Icon component={DeleteIcon} />
            </Button>
          </Tooltip>
        </Flex>
      ),
    },
  ];

  return (
    <div style={{ padding: screens.xs ? "10px" : "24px" }}>
      <Flex
        justify="space-between"
        gap={screens.xs ? 10 : 30}
        wrap={screens.xs ? "wrap" : "nowrap"}
      >
        <Title
          level={screens.xs ? 4 : 3}
          style={{ marginBottom: "20px", marginBlock: 0 }}
        >
          Data Program
        </Title>
        <Input
          style={{ width: screens.xs ? "100%" : "500px" }}
          placeholder="Cari nama program"
          onChange={(e) => setSearchKeyword(e.target.value)}
          value={searchKeyword}
        />
      </Flex>
      <Divider />
      <Card
        style={{
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          padding: "20px",
        }}
      >
        {isLoadingProgram ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <>
            <Button
              type="primary"
              style={{ marginBottom: "20px" }}
              onClick={() => setIsModalVisible(true)}
            >
              Tambah Program
            </Button>
            <Table
              columns={columns}
              loading={isLoadingProgram}
              dataSource={filteredData}
              size={screens.xs ? "small" : "middle"}
              scroll={screens.xs ? { x: true } : undefined}
            />
          </>
        )}
      </Card>
      <Modal
        title={selectedProgram ? "Edit Data Program" : "Tambah Data Program"}
        open={isModalVisible}
        footer={null}
        onCancel={handleCancel}
      >
        <Spin spinning={loading}>
          <Form
            name="createProgram"
            onFinish={handleOk}
            form={form}
            layout="vertical"
          >
            <Form.Item name="name">
              <Input placeholder="Masukan Nama Program Kursus" />
            </Form.Item>
            <Form.Item name="description">
              <ReactQuill
                theme="snow"
                placeholder="Masukkan Deskripsi Program"
              />
            </Form.Item>
            <Form.Item name="count_program">
              <Input placeholder="Masukan Total Pertemuan" />
            </Form.Item>
            <Form.Item name="duration">
              <Input placeholder="Masukan Durasi Program" />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{ width: "100%" }}
              >
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
}
