import Title from "antd/es/typography/Title";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import dayjs from "dayjs";
import { Card, Flex, Select, Skeleton } from "antd";
import { useState } from "react";
import { useDashboard } from "./useDashboardViewModel";

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

const monthNameMap: { [key: string]: string } = {
  January: "Januari",
  February: "Februari",
  March: "Maret",
  April: "April",
  May: "Mei",
  June: "Juni",
  July: "Juli",
  August: "Agustus",
  September: "September",
  October: "Oktober",
  November: "November",
  December: "Desember",
};

export default function DashboardComponent() {
  const {
    monthlyStudentData,
    selectedYear,
    changeYear,
    isLoadingMonthly,
    dataStudentNewPerWeek,
    isLoadingStudentNewPerWeek,
    dataStudentPerProgram,
    isLoadingStudentPerProgram,
    dataStudentCanceled,
    isLoadingStudentCanceled,
  } = useDashboard();

  const [chartTypeMonthly, setChartTypeMonthly] = useState("bar");
  const [chartTypeWeekly, setChartTypeWeekly] = useState("bar");
  const [chartTypeProgram, setChartTypeProgram] = useState("bar");
  const [chartTypeCanceled, setChartTypeCanceled] = useState("bar");
  const [selectedMonthProgram, setSelectedMonthProgram] = useState("January");
  const [selectedMonthCanceled, setSelectedMonthCanceled] = useState("January");

  // Filter data berdasarkan bulan yang dipilih
  const filteredWeeklyData = dataStudentNewPerWeek?.data.filter(
    (item) => item.month === monthNameMap[selectedMonthProgram]
  );

  const filteredCanceledData = dataStudentCanceled?.data.filter(
    (item) => item.month === monthNameMap[selectedMonthCanceled]
  );

  const weeklyChartDataCanceled = filteredCanceledData?.map((item) => ({
    name: `Minggu ${item.week}`,
    total_meetings: item.total_meetings,
    total_cancelled_meetings: Number(item.cancelled_meetings),
  }));

  // Format Data untuk Chart
  const weeklyChartData = filteredWeeklyData?.map((item) => ({
    name: `Minggu ${item.week}`,
    total_students: item.total_students,
  }));

  return (
    <div style={{ width: "100%", padding: "24px" }}>
      <Flex
        justify="space-between"
        align="center"
        wrap="wrap" // Allows for responsive layout
      >
        <Title
          level={3}
          style={{ marginBottom: "24px", flex: "1 1 100%" }} // Ensure title takes full width on mobile
        >
          Dashboard Admin
        </Title>
        <Select
          defaultValue={selectedYear}
          style={{ width: 120, marginBottom: "24px" }}
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

      {/* Chart Per Bulan */}
      <Card style={{ marginBottom: "24px", padding: "20px" }}>
        <Flex justify="space-between" align="center" wrap="wrap">
          <h2 style={{ flex: "1 1 100%" }}>Jumlah Siswa Per Bulan</h2>
          <Flex gap={16}>
            <Select
              defaultValue={chartTypeMonthly}
              style={{ width: 150, marginTop: 16 }}
              onChange={(value) => setChartTypeMonthly(value)}
            >
              <Select.Option value="line">Line Chart</Select.Option>
              <Select.Option value="bar">Bar Chart</Select.Option>
            </Select>
          </Flex>
        </Flex>

        {isLoadingMonthly ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            {chartTypeMonthly === "line" ? (
              <LineChart
                data={monthlyStudentData?.data}
                margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
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
            ) : (
              <BarChart
                data={monthlyStudentData?.data}
                margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
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
                <Bar
                  dataKey="total_students"
                  fill="#0088FE"
                  barSize={40}
                  name="Total Siswa"
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </Card>

      {/* Chart Per Minggu */}
      <Card style={{ marginBottom: "24px", padding: "20px" }}>
        <Flex justify="space-between" wrap="wrap">
          <h2 style={{ flex: "1 1 100%" }}>Jumlah Siswa Baru Per Minggu</h2>
          <Flex
            gap={16}
            style={{
              width: "100%",
              justifyContent: "start",
              flexWrap: "wrap",
              textAlign: "center",
            }}
          >
            <Select
              defaultValue={selectedMonthProgram}
              style={{ width: 150, marginTop: 16 }}
              onChange={(value) => setSelectedMonthProgram(value)}
            >
              {Object.keys(monthNameMap).map((month) => (
                <Select.Option value={month} key={month}>
                  {monthNameMap[month]}
                </Select.Option>
              ))}
            </Select>

            <Select
              defaultValue={chartTypeWeekly}
              style={{ width: 150, marginTop: 16 }}
              onChange={(value) => setChartTypeWeekly(value)}
            >
              <Select.Option value="line">Line Chart</Select.Option>
              <Select.Option value="bar">Bar Chart</Select.Option>
            </Select>
          </Flex>
        </Flex>

        {isLoadingStudentNewPerWeek ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            {chartTypeWeekly === "line" ? (
              <LineChart
                data={weeklyChartData}
                margin={{ top: 10, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  height={50}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  label={{
                    value: "Jumlah Siswa",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  formatter={(value) => [value + " Siswa", "Total Siswa Baru"]}
                />
                <Legend verticalAlign="top" align="right" />
                <Line
                  type="monotone"
                  dataKey="total_students"
                  stroke="#FF5733"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Total Siswa Baru"
                />
              </LineChart>
            ) : (
              <BarChart
                data={weeklyChartData}
                margin={{ top: 10, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  height={50}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  label={{
                    value: "Jumlah Siswa",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  formatter={(value) => [value + " Siswa", "Total Siswa Baru"]}
                />
                <Legend verticalAlign="top" align="right" />
                <Bar
                  dataKey="total_students"
                  fill="#FF5733"
                  barSize={30}
                  name="Total Siswa Baru"
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </Card>

      {/* Chart Per Program */}
      <Card style={{ marginBottom: "24px", padding: "20px" }}>
        <Flex justify="space-between" align="center" wrap="wrap">
          <h2 style={{ flex: "1 1 100%" }}>Total Siswa Berdasarkan Program</h2>
          <Select
            defaultValue={chartTypeProgram}
            style={{ width: 150, marginTop: 16 }}
            onChange={(value) => setChartTypeProgram(value)}
          >
            <Select.Option value="line">Line Chart</Select.Option>
            <Select.Option value="bar">Bar Chart</Select.Option>
          </Select>
        </Flex>

        {isLoadingStudentPerProgram ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            {chartTypeProgram === "line" ? (
              <LineChart
                data={dataStudentPerProgram?.data}
                margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="program_name"
                  tick={{ fontSize: 12 }}
                  interval={0}
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
                  stroke="#82ca9d"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Total Siswa"
                />
              </LineChart>
            ) : (
              <BarChart
                data={dataStudentPerProgram?.data}
                margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="program_name"
                  tick={{ fontSize: 12 }}
                  interval={0}
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
                <Bar
                  dataKey="total_students"
                  fill="#0088FE"
                  barSize={40}
                  name="Total Siswa"
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </Card>

      {/* Chart Siswa Batal */}
      <Card style={{ marginBottom: "24px", padding: "20px" }}>
        <Flex justify="space-between" wrap="wrap">
          <h2 style={{ flex: "1 1 100%" }}>Jumlah Siswa Cancel Per Minggu</h2>
          <Flex
            gap={16}
            style={{
              width: "100%",
              justifyContent: "start",
              flexWrap: "wrap",
              textAlign: "center",
            }}
          >
            {/* Pilih Bulan */}
            <Select
              value={selectedMonthCanceled}
              style={{ width: 150, marginTop: 16 }}
              onChange={(value) => setSelectedMonthCanceled(value)}
            >
              {Object.keys(monthNameMap).map((month) => (
                <Select.Option value={month} key={month}>
                  {monthNameMap[month]}
                </Select.Option>
              ))}
            </Select>

            {/* Pilih Tipe Chart */}
            <Select
              value={chartTypeCanceled}
              style={{ width: 150, marginTop: 16 }}
              onChange={(value) => setChartTypeCanceled(value)}
            >
              <Select.Option value="line">Line Chart</Select.Option>
              <Select.Option value="bar">Bar Chart</Select.Option>
            </Select>
          </Flex>

          {/* Chart */}
          {isLoadingStudentCanceled ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : chartTypeCanceled === "bar" ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={weeklyChartDataCanceled}
                margin={{ top: 10, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  height={50}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  domain={[0, "auto"]}
                  label={{
                    value: "Jumlah Cancel",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  formatter={(value) => [`${value} Siswa`, "Siswa Cancel"]}
                />
                <Legend verticalAlign="top" align="right" />
                <Bar
                  dataKey="total_cancelled_meetings"
                  fill="#FF4D4F"
                  barSize={30}
                  name="Siswa Cancel"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={weeklyChartDataCanceled}
                margin={{ top: 10, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  height={50}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  label={{
                    value: "Jumlah Cancel",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  formatter={(value) => [`${value} Siswa`, "Siswa Cancel"]}
                />
                <Legend verticalAlign="top" align="right" />
                <Line
                  type="monotone"
                  dataKey="total_cancelled_meetings"
                  stroke="#FF4D4F"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Siswa Cancel"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Flex>
      </Card>
    </div>
  );
}
