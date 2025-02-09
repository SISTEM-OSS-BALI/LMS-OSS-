"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation"; // For secure redirection
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Radio,
  Space,
  Progress,
  Grid,
  Modal,
  message,
  Spin,
} from "antd";
import { usePlacementTestViewModel } from "./usePlacementTestViewModel";
import { crudService } from "@/app/lib/services/crudServices";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { confirm } = Modal;

export default function PlacementTestComponent() {
  const router = useRouter(); // Secure redirection
  const {
    multipleChoicePlacementTestData,
    questions,
    time,
    remainingTime,
    formatTime,
    currentQuestionIndex,
    selectedAnswers,
    handleQuestionClick,
    handleAnswerChange,
    showConfirmSubmit,
    handleSubmit,
    isLoading,
  } = usePlacementTestViewModel();
  const screens = useBreakpoint();

  return isLoading ? (
    <Row justify="center" align="middle" style={{ height: "100vh" }}>
      <Spin size="large" tip="Memuat soal..." />
    </Row>
  ) : (
    <Row
      gutter={screens.xs ? [10, 10] : [24, 24]}
      style={{
        padding: screens.xs ? "15px" : "30px",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Col md={16}>
        <Card
          bordered={false}
          style={{
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Timer */}
          <Row
            justify="space-between"
            align="middle"
            style={{ marginBottom: "15px" }}
          >
            <Col>
              <Title level={screens.xs ? 5 : 4} style={{ marginBottom: 0 }}>
                Placement Test
              </Title>
            </Col>
            <Col>
              <Text strong style={{ fontSize: screens.xs ? "14px" : "16px" }}>
                Waktu Tersisa:
              </Text>{" "}
              <Text
                type="danger"
                style={{
                  fontSize: screens.xs ? "16px" : "18px",
                  fontWeight: "bold",
                }}
              >
                {formatTime(remainingTime)}
              </Text>
            </Col>
          </Row>

          <Progress
            percent={(remainingTime / (Number(time) * 60)) * 100 || 0}
            showInfo={false}
            strokeColor="#fa541c"
            style={{ marginBottom: "20px" }}
          />

          {/* Soal */}
          <Title level={screens.xs ? 5 : 4} style={{ marginBottom: "15px" }}>
            {currentQuestionIndex + 1}.{" "}
            {questions[currentQuestionIndex].question}
          </Title>
          <Radio.Group
            onChange={(e) =>
              handleAnswerChange(
                questions[currentQuestionIndex]?.mcq_id || "",
                e.target.value
              )
            }
            value={
              selectedAnswers[questions[currentQuestionIndex]?.mcq_id || ""] ||
              null
            }
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              {Array.isArray(questions[currentQuestionIndex]?.options) // Ensure options is an array
                ? questions[currentQuestionIndex]?.options
                    .filter(
                      (option): option is string => typeof option === "string"
                    )
                    .map((option, idx) => (
                      <Radio key={idx} value={option} style={{ width: "100%" }}>
                        {option}
                      </Radio>
                    ))
                : null}
            </Space>
          </Radio.Group>

          {/* Navigasi Soal */}
          <Row justify="space-between" style={{ marginTop: "30px" }}>
            <Button
              disabled={currentQuestionIndex === 0}
              onClick={() => handleQuestionClick(currentQuestionIndex - 1)}
            >
              Sebelumnya
            </Button>
            {currentQuestionIndex === questions.length - 1 ? (
              <Button type="primary" onClick={showConfirmSubmit}>
                Kirim
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={() => handleQuestionClick(currentQuestionIndex + 1)}
              >
                Selanjutnya
              </Button>
            )}
          </Row>
        </Card>
      </Col>

      {/* Navigasi Soal dalam Bentuk Grid */}
      <Col xs={24} md={8}>
        <Card
          title="Navigasi Soal"
          bordered={false}
          style={{
            height: "100%",
            borderRadius: "12px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Row gutter={[10, 10]}>
            {questions.map((_, index) => (
              <Col
                key={index}
                span={screens.xs ? 6 : 4}
                style={{ textAlign: "center" }}
              >
                <Button
                  type={currentQuestionIndex === index ? "primary" : "default"}
                  onClick={() => handleQuestionClick(index)}
                  style={{
                    width: screens.xs ? "40px" : "50px",
                    height: screens.xs ? "40px" : "50px",
                    fontSize: screens.xs ? "14px" : "16px",
                    fontWeight: "bold",
                    borderRadius: "8px",
                  }}
                >
                  {index + 1}
                </Button>
              </Col>
            ))}
          </Row>
        </Card>
      </Col>
    </Row>
  );
}
