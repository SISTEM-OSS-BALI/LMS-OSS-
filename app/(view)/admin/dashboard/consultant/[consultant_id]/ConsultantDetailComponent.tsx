import {
  Card,
  Col,
  Image,
  Row,
  Tag,
  Table,
  Typography,
  Spin,
  Flex,
  Button,
} from "antd";
import { useDetailConsultantViewModel } from "./useDetailConsultantViewModel";
import { ColumnsType } from "antd/es/table";
import { User } from "@prisma/client";
import Icon, { LoadingOutlined } from "@ant-design/icons";
import { EyeIcon } from "@/app/components/Icon";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// ✅ Interface untuk Student dengan Program
interface StudentWithProgram extends User {
  program_name: string;
}

export default function ConsultantDetailComponent() {
  const {
    detailConsultantData,
    mergedDataStudent,
    countStudent,
    handlePushDetail,
  } = useDetailConsultantViewModel();

  const { Title, Text } = Typography;
  useEffect(() => {
    console.log(mergedDataStudent);
  }, [mergedDataStudent]);

  // ✅ Konfigurasi tabel
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
      render: (text) => (
        <Image
          src={text || "/default-avatar.png"}
          alt="gambar"
          width={50}
          height={50}
          style={{ borderRadius: "50%", objectFit: "cover" }}
        />
      ),
    },
    {
      title: "Nama",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Program",
      dataIndex: "program_name",
      key: "program_name",
    },
    {
      title: "Region",
      dataIndex: "region",
      key: "region",
    },
    {
      title: "Total Pertemuan",
      dataIndex: "count_program",
      key: "count_program",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => {
        if (text === "DONE") {
          return <Tag color="blue">DONE</Tag>;
        } else if (text === "HALF") {
          return <Tag color="yellow">HALF</Tag>;
        } else {
          return <Tag color="red"></Tag>;
        }
      },
    },
    {
      title: "Detail",
      dataIndex: "detail",
      key: "detail",
      render: (_, record) => {
        return (
          <Button
            type="primary"
            onClick={() => handlePushDetail(record.user_id)}
          >
            <Icon component={EyeIcon} />
          </Button>
        );
      },
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Detail Konsultan</Title>

      <Row gutter={[20, 20]} style={{ marginBottom: "20px" }}>
        <Col xs={24} md={12}>
          <Card bordered={false} style={{ backgroundColor: "#f0f2f5" }}>
            <Title level={4}>Konsultan</Title>
            <Text strong>
              {detailConsultantData?.data.name || "Loading..."}
            </Text>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card bordered={false} style={{ backgroundColor: "#f0f2f5" }}>
            <Title level={4}>Total Siswa</Title>
            <Text strong>
              {countStudent ?? <Spin indicator={<LoadingOutlined />} />}
            </Text>
          </Card>
        </Col>
      </Row>
      <Card>
        <Table
          columns={columns}
          dataSource={mergedDataStudent}
          rowKey="user_id"
          pagination={{ pageSize: 5 }}
          loading={!mergedDataStudent.length}
        />
      </Card>
    </div>
  );
}
