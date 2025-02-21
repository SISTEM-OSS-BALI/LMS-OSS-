"use client";

import Loading from "@/app/components/Loading";
import { useUsername } from "@/app/lib/auth/useLogin";
import { Typography, Card, Row, Col } from "antd";
import { Suspense } from "react";

const { Title, Text } = Typography;

export default function HomeStudent() {
  const username = useUsername();

  return (
    <Suspense fallback={<Loading />}>
      <div style={{ padding: "24px" }}>
        <Row justify="center">
          <Col xs={24} sm={20} md={16} lg={12}>
            <Card
              bordered={false}
              style={{
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Title
                level={4}
                style={{ textAlign: "center", marginBottom: "16px" }}
              >
                Selamat Datang, {username}!
              </Title>
              <Text
                style={{
                  display: "block",
                  textAlign: "center",
                  marginBottom: "24px",
                }}
              >
                Selalu jaga kerahasiaan password Anda untuk melindungi akun
                Anda.
              </Text>
            </Card>
          </Col>
        </Row>
      </div>
    </Suspense>
  );
}
