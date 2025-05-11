import {
  Card,
  Col,
  Image,
  Row,
  Tag,
  Table,
  Typography,
  Spin,
  Skeleton,
  Button,
  Avatar,
} from "antd";
import { useDetailConsultantViewModel } from "./useDetailConsultantViewModel";
import { ColumnsType } from "antd/es/table";
import { User } from "@prisma/client";
import Icon, { UserOutlined } from "@ant-design/icons";
import { EyeIcon } from "@/app/components/Icon";

interface StudentWithProgram extends User {
  program_name: string;
}

export default function ConsultantDetailComponent() {
  const {
    detailConsultantData,
    mergedDataStudent,
    countStudent,
    handlePushDetail,
    isLoading,
  } = useDetailConsultantViewModel();

  const { Title, Text } = Typography;

  const columns: ColumnsType<StudentWithProgram> = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Gambar",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (text) =>
        isLoading ? (
          <Skeleton.Avatar active size={50} shape="circle" />
        ) : text ? (
          <Image
            src={text}
            alt="gambar"
            width={50}
            height={50}
            style={{ borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <Avatar
            size={50}
            icon={<UserOutlined />}
            style={{ backgroundColor: "#d9d9d9" }}
          />
        ),
    },
    {
      title: "Nama",
      dataIndex: "username",
      key: "username",
      render: (text) =>
        isLoading ? <Skeleton.Input active size="small" /> : text,
    },
    {
      title: "Program",
      dataIndex: "program_name",
      key: "program_name",
      render: (text) =>
        isLoading ? <Skeleton.Input active size="small" /> : text,
    },
    {
      title: "Region",
      dataIndex: "region",
      key: "region",
      render: (text) =>
        isLoading ? <Skeleton.Input active size="small" /> : text,
    },
    {
      title: "Total Pertemuan",
      dataIndex: "count_program",
      key: "count_program",
      render: (text) =>
        isLoading ? <Skeleton.Input active size="small" /> : text,
    },
    {
      title: "Detail",
      dataIndex: "detail",
      key: "detail",
      render: (_, record) =>
        isLoading ? (
          <Skeleton.Button active size="small" />
        ) : (
          <Button
            type="primary"
            onClick={() => handlePushDetail(record.user_id)}
          >
            <Icon component={EyeIcon} />
          </Button>
        ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Detail Konsultan</Title>

      <Row gutter={[20, 20]} style={{ marginBottom: "20px" }}>
        <Col xs={24} md={12}>
          <Card bordered={false} style={{ backgroundColor: "#f0f2f5" }}>
            <Title level={4}>Konsultan</Title>
            {isLoading ? (
              <Skeleton.Input active size="small" />
            ) : (
              <Text strong>{detailConsultantData?.data.name || "-"}</Text>
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card bordered={false} style={{ backgroundColor: "#f0f2f5" }}>
            <Title level={4}>Total Siswa</Title>
            {isLoading ? (
              <Skeleton.Input active size="small" />
            ) : (
              <Text strong>{countStudent ?? "-"}</Text>
            )}
          </Card>
        </Col>
      </Row>
      <Card>
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <Table
            columns={columns}
            dataSource={mergedDataStudent}
            rowKey="user_id"
            pagination={{ pageSize: 5 }}
          />
        )}
      </Card>
    </div>
  );
}
