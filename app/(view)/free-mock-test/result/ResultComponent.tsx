"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, Typography, Row, Col, List } from "antd";

const { Title, Text } = Typography;

export default function ResultComponent() {
  const router = useRouter();
  const [result, setResult] = useState<{
    totalScore: number;
    percentageScore: number;
    level: string;
    speakingFeedback?: {
      speaking_id: string;
      score: number;
      feedback: string;
    }[];
  } | null>(null);

  useEffect(() => {
    const storedResult = sessionStorage.getItem("freeMockTestResult");
    if (storedResult) {
      setResult(JSON.parse(storedResult));
    }
  }, []);

  const userLevel = useMemo(() => {
    if (!result) return "Unknown";

    if (result.totalScore >= 46) {
      return "Advanced";
    } else if (result.totalScore >= 40) {
      return "Upper Intermediate";
    } else if (result.totalScore >= 33) {
      return "Intermediate";
    } else if (result.totalScore >= 25) {
      return "Pre-Intermediate";
    } else if (result.totalScore >= 16) {
      return "Elementary";
    }

    return "Beginner";
  }, [result]);

  const handleBack = () => {
    sessionStorage.removeItem("freeMockTestResult");
    router.push("/student/dashboard/home");
  };

  return result ? (
    <Row
      justify="center"
      align="middle"
      style={{ maxHeight: "100vh", padding: "20px" }}
    >
      <Col xs={24} sm={20} md={12} lg={10}>
        <Card
          style={{
            textAlign: "center",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Title level={2} style={{ color: "#1890ff", marginBottom: "20px" }}>
            Hasil Mock Test
          </Title>

          <Text strong style={{ fontSize: "18px", color: "#333" }}>
            Total Skor:
          </Text>
          <Text
            style={{ fontSize: "20px", color: "#fa541c", fontWeight: "bold" }}
          >
            {" "}
            {result.totalScore}
          </Text>
          <br />

          <Text strong style={{ fontSize: "18px", color: "#333" }}>
            Persentase Skor:
          </Text>
          <Text
            style={{ fontSize: "20px", color: "#fa541c", fontWeight: "bold" }}
          >
            {" "}
            {result.percentageScore}%
          </Text>
          <br />

          <Card
            style={{
              marginTop: "20px",
              padding: "15px",
              backgroundColor: "#f0f5ff",
              borderRadius: "8px",
              border: "1px solid #1890ff",
            }}
          >
            <Text strong style={{ fontSize: "18px", color: "#1890ff" }}>
              Level Kamu:
            </Text>
            <Text
              style={{
                fontSize: "22px",
                fontWeight: "bold",
                color: "#52c41a",
              }}
            >
              {" "}
              {userLevel}
            </Text>
          </Card>

          {/* 🔹 Writing Feedback */}
          {result.speakingFeedback && result.speakingFeedback.length > 0 && (
            <Card
              style={{
                marginTop: "20px",
                padding: "15px",
                backgroundColor: "#fffbe6",
                borderRadius: "8px",
                border: "1px solid #faad14",
                textAlign: "left",
              }}
            >
              <Title level={4} style={{ color: "#fa8c16" }}>
                Speaking Feedback
              </Title>
              <List
                itemLayout="vertical"
                dataSource={result.speakingFeedback}
                renderItem={(item, index) => (
                  <List.Item key={item.speaking_id}>
                    <Text strong style={{ fontSize: "16px", color: "#722ed1" }}>
                      ✏️ Speaking {index + 1} - Score: {item.score}/10
                    </Text>
                    <br />
                    <Text style={{ fontSize: "14px", color: "#333" }}>
                      {item.feedback}
                    </Text>
                  </List.Item>
                )}
              />
            </Card>
          )}
          {/* 🔹 Tombol Kembali */}
        </Card>
      </Col>
    </Row>
  ) : (
    <Row justify="center" align="middle" style={{ minHeight: "100vh" }}>
      <Text style={{ fontSize: "18px", color: "#ff4d4f" }}>
        Hasil tidak ditemukan.
      </Text>
    </Row>
  );
}
