import { Card, Typography, Skeleton, Alert, Button } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import { usePlacementTestViewModel } from "./usePlacementTestViewModel";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

const { Title, Text } = Typography;

export default function HistoryTestComponent() {
  const { placementTest, placementTestLoading } = usePlacementTestViewModel();
  const query = useParams();
  const student_id = query.student_id;
  const router = useRouter();

  // Ambil data pertama dari array `data`
  const test = placementTest?.data?.length
    ? placementTest.data[0].placementTest
    : null;

  // Jika data tidak ditemukan dan tidak sedang loading, tampilkan alert
  if (!test && !placementTestLoading) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px" }}>
        <Alert
          message="Tidak Ada Data"
          description="Siswa belum melakukan ujian"
          type="warning"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px" }}>
      <Card
        title={
          placementTestLoading ? (
            <Skeleton.Input active size="default" />
          ) : (
            test?.name
          )
        }
        bordered={false}
        style={{
          borderRadius: "12px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          background: "#f0f2f5",
        }}
        actions={
          test
            ? [
                <Link
                  href={`/teacher/dashboard/history-test/${student_id}/${test.placement_test_id}`}
                >
                  Selengkapnya
                </Link>,
              ]
            : []
        }
      >
        {placementTestLoading ? (
          <>
            <Skeleton active paragraph={{ rows: 2 }} />
            <br />
            <Skeleton.Button active size="small" shape="round" />
          </>
        ) : (
          <>
            <Text style={{ fontSize: "16px", color: "#595959" }}>
              {test?.description}
            </Text>
            <br />
            <div
              style={{
                marginTop: "15px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <ClockCircleOutlined
                style={{ fontSize: "18px", color: "#1890ff" }}
              />
              <Text strong style={{ fontSize: "16px" }}>
                Time Limit: {test?.timeLimit} minutes
              </Text>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
