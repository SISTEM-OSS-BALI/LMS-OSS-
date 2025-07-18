import { Card, Row, Col, Typography, Skeleton, Empty, Grid } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useStatisticViewModel } from "./useStatisticViewModel";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export default function StatisticComponent() {
  const { dataTestimoni, isLoadingDataTestimoni } = useStatisticViewModel();
  const screens = useBreakpoint();

  const data = dataTestimoni?.data || [];

  const statsData =
    data.length > 0
      ? [
          {
            label: "Kepuasan Pelajaran",
            value:
              data.reduce(
                (acc, cur) => acc + (cur.lesson_satisfaction ?? 0),
                0
              ) / data.length,
          },
          {
            label: "Efektivitas Metode",
            value:
              data.reduce(
                (acc, cur) => acc + (cur.teaching_method_effectiveness ?? 0),
                0
              ) / data.length,
          },
          {
            label: "Relevansi Latihan & Tugas",
            value:
              data.reduce(
                (acc, cur) =>
                  acc + (cur.exercise_and_assignment_relevance ?? 0),
                0
              ) / data.length,
          },
          {
            label: "Relevansi Materi",
            value:
              data.reduce(
                (acc, cur) => acc + (cur.material_relevance ?? 0),
                0
              ) / data.length,
          },
          {
            label: "Penyampaian Guru",
            value:
              data.reduce((acc, cur) => acc + (cur.teaching_delivery ?? 0), 0) /
              data.length,
          },
          {
            label: "Perhatian Guru",
            value:
              data.reduce((acc, cur) => acc + (cur.teacher_attention ?? 0), 0) /
              data.length,
          },
          {
            label: "Etika Guru",
            value:
              data.reduce((acc, cur) => acc + (cur.teacher_ethics ?? 0), 0) /
              data.length,
          },
          {
            label: "Motivasi Guru",
            value:
              data.reduce(
                (acc, cur) => acc + (cur.teacher_motivation ?? 0),
                0
              ) / data.length,
          },
        ]
      : [];

  return (
    <Card
      bordered={false}
      style={{
        padding: screens.xs ? 16 : 24,
        margin: screens.xs ? "16px 16px" : "24px 32px",
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
      }}
    >
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={screens.xs ? 5 : 3} style={{ marginBottom: 4 }}>
            Rata-rata Statistik Testimoni
          </Title>
          <Text type="secondary" style={{ fontSize: screens.xs ? 12 : 14 }}>
            Analisis agregat penilaian siswa terhadap guru
          </Text>
        </Col>
      </Row>
      
      <div style={{ height: screens.xs ? 300 : 420 }}>
        {isLoadingDataTestimoni ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : statsData.length === 0 ? (
          <Empty description="Belum ada data testimoni yang tersedia" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={statsData}
              layout="vertical"
              margin={{
                top: 20,
                right: 30,
                left: screens.xs ? 40 : 80,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 5]} />
              <YAxis
                dataKey="label"
                type="category"
                width={screens.xs ? 100 : 180}
              />
              <Tooltip />
              <Bar dataKey="value" fill="#1890ff" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
