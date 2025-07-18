import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useAdminTeacherViewModel } from "./useAdminTeacherReportViewModel";
import {
  Row,
  Col,
  Typography,
  Select,
  Skeleton,
  Empty,
  Alert,
  Card,
} from "antd";

const { Title, Text } = Typography;
const { Option } = Select;

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const generateYears = (start: number, end: number) => {
  const years = [];
  for (let y = end; y >= start; y--) years.push(y);
  return years;
};

export default function ReportTeacherComponent() {
  const { data, error, isLoading, selectedYear, selectedMonth, changeDate, dataTeacherAbsent, errorTeacherAbsent, isLoadingDataTeaceherAbsent } =
    useAdminTeacherViewModel();

  const years = generateYears(2021, new Date().getFullYear());

  const handleYearChange = (value: number) => {
    changeDate(value, selectedMonth);
  };

  const handleMonthChange = (value: number) => {
    changeDate(selectedYear, value);
  };

  return (
    <Card
      bordered={false}
      style={{
        padding: 24,
        margin: "16px",
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
      }}
    >
      <Row
        justify="space-between"
        align="top"
        gutter={[16, 24]}
        style={{ marginBottom: 24 }}
      >
        <Col xs={24} md={12}>
          <Title level={3} style={{ marginBottom: 5 }}>
            Laporan Guru
          </Title>
          <Text type="secondary">
            Laporan kehadiran guru berdasarkan tahun dan bulan
          </Text>
        </Col>
      </Row>

      <Row gutter={[16, 16]} justify="start" style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Text strong style={{ display: "block", marginBottom: 4 }}>
            Pilih Tahun
          </Text>
          <Select
            value={selectedYear}
            onChange={handleYearChange}
            style={{ width: "100%" }}
          >
            {years.map((year) => (
              <Option key={year} value={year}>
                {year}
              </Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Text strong style={{ display: "block", marginBottom: 4 }}>
            Pilih Bulan
          </Text>
          <Select
            value={selectedMonth}
            onChange={handleMonthChange}
            style={{ width: "100%" }}
          >
            {months.map((month, index) => (
              <Option key={index + 1} value={index + 1}>
                {month}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      <div style={{ height: 420 }}>
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : error ? (
          <Alert
            message="Gagal memuat data"
            type="error"
            showIcon
            style={{ marginTop: 16 }}
          />
        ) : data.length === 0 ? (
          <Empty
            description="Tidak ada data yang tersedia"
            style={{ marginTop: 80 }}
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="username" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#1890ff" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
