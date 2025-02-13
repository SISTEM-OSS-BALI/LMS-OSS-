import Title from "antd/es/typography/Title";
import { useDashboard } from "./useDashboardViewModel";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import dayjs from "dayjs";
import { Card, Flex, Select, Skeleton } from "antd";

const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export default function DashboardComponent() {
  const { monthlyStudentData, selectedYear, changeYear, isLoadingMonthly } =
    useDashboard();

  return (
    <div style={{ width: "100%", height: 400, padding: 24 }}>
      <Title level={3}>Dashboard Admin</Title>
      <Card>
        <Flex justify="space-between">
          <h2>Jumlah Siswa Per Bulan</h2>
          <Select
            defaultValue={selectedYear}
            style={{ width: 120, marginBottom: 20 }}
            onChange={(value) => changeYear(value)}
          >
            {Array.from(
              new Array(20),
              (val, index) => dayjs().year() - index
            ).map((year, index) => (
              <Select.Option value={year} key={index}>
                {year}
              </Select.Option>
            ))}
          </Select>
        </Flex>
        {isLoadingMonthly ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={monthlyStudentData?.data}
              margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickFormatter={(month) => monthNames[month - 1]}
              />
              <YAxis
                allowDecimals={false}
                label={{
                  value: "Total Siswa",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip
                formatter={(value) => [`${value} Siswa`, "Total Siswa"]}
              />
              <Legend verticalAlign="top" align="right" />
              <Line
                type="monotone"
                dataKey="total_students"
                stroke="#0088FE"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Total Siswa"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}
