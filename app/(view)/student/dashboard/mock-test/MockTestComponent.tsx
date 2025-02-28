"use client";

import React, { useState } from "react";
import {
  Typography,
  Card,
  Button,
  Row,
  Col,
  Progress,
  message,
  Modal,
} from "antd";
import { useMockTestViewModel } from "./useMockTestViewModel";
import ReadingMockTestStudent from "@/app/components/ReadingComponentMockTest";
import ListeningMockTestStudent from "@/app/components/ListeningMockTestStudent";
import SpeakingMockTestStudent from "@/app/components/SpeakingMockTestStudent";
import WritingMockTestStudent from "@/app/components/WritingMockTestStudent";

const { Title, Text } = Typography;

// ✅ Interface untuk Data Soal

export default function MockTestComponent() {
  const {
    sectionData,
    selectedSectionIndex,
    setSelectedSectionIndex,
    selectedQuestion,
    setSelectedQuestion,
    questions,
    selectedAnswers,
    handleAnswerChange,
    handleSubmitAudio,
    handleFinalSubmit,
    isAllSectionsCompleted,
    remainingTime,
    formatTime,
    baseMockTestData,
    baseMockTestDataLoading,
    sectionContent,
    loading,
  } = useMockTestViewModel();

  // 🔹 State untuk navigasi section & soal

  const showConfirmSubmit = () => {
    Modal.confirm({
      title: "Konfirmasi",
      content: "Apakah Anda yakin ingin mengirimkan tes ini?",
      okText: "Ya",
      okType: "danger",
      cancelText: "Tidak",
      onOk: () => handleFinalSubmit(),
    });
  };

  return (
    <div style={{ display: "flex", gap: "24px", padding: "24px" }}>
      {/* 🔹 Kolom Kiri (Timer & Soal) */}
      <div
        style={{
          flex: 2,
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* 🔹 Timer */}
        <Card
          bordered={false}
          style={{
            textAlign: "center",
            backgroundColor: "#fff7e6",
            borderRadius: "12px",
            padding: "10px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Text strong style={{ fontSize: "16px" }}>
            Waktu Tersisa:
          </Text>
          <br />
          <Text type="danger" style={{ fontSize: "18px", fontWeight: "bold" }}>
            {formatTime(remainingTime)}
          </Text>
          <Progress
            percent={(remainingTime / (10 * 60)) * 100}
            showInfo={false}
            strokeColor="#fa541c"
            style={{ marginTop: "10px" }}
          />
        </Card>

        {/* 🔹 Soal */}
        <div>
          {baseMockTestDataLoading ? (
            <p>Loading...</p>
          ) : sectionContent ? (
            <div>
              {sectionContent.type === "READING" && sectionContent.reading && (
                <ReadingMockTestStudent
                  data={sectionContent.reading}
                  selectedQuestion={selectedQuestion}
                  onSelectQuestion={setSelectedQuestion}
                  onAnswerChange={handleAnswerChange}
                  selectedAnswers={selectedAnswers}
                />
              )}

              {sectionContent.type === "LISTENING" &&
                sectionContent.listening && (
                  <ListeningMockTestStudent
                    data={sectionContent.listening}
                    selectedQuestion={selectedQuestion}
                    onSelectQuestion={setSelectedQuestion}
                    onAnswerChange={handleAnswerChange}
                    selectedAnswers={selectedAnswers}
                  />
                )}

              {sectionContent.type === "SPEAKING" &&
                sectionContent.speaking && (
                  <SpeakingMockTestStudent
                    data={sectionContent.speaking}
                    onSubmitAudio={handleSubmitAudio}
                  />
                )}

              {sectionContent.type === "WRITING" && sectionContent.writing && (
                <WritingMockTestStudent
                  data={sectionContent.writing}
                  selectedQuestion={selectedQuestion}
                  onSelectQuestion={setSelectedQuestion}
                  onAnswerChange={handleAnswerChange}
                  selectedAnswers={selectedAnswers}
                />
              )}
            </div>
          ) : (
            <p>Tidak ada data</p>
          )}
        </div>
      </div>

      {/* 🔹 Kolom Kanan (Navigasi Section & Navigasi Soal) */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* 🔹 Navigasi Section */}
        <Card
          bordered={false}
          style={{
            width: "100%",
            borderRadius: "12px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Title level={4} style={{ textAlign: "center" }}>
            Navigasi Section
          </Title>
          <Row gutter={[10, 10]}>
            {sectionData.map((section, index) => {
              const sectionQuestions = [
                ...(section.reading?.questions ?? []),
                ...(section.listening?.questions ?? []),
                ...(section.writing?.questions ?? []),
              ];

              const isSectionCompleted = sectionQuestions.every((q) =>
                selectedAnswers[q.question_id] ? true : false
              );

              return (
                <Col key={index} span={12} style={{ textAlign: "center" }}>
                  <Button
                    type={
                      selectedSectionIndex === index ? "primary" : "default"
                    }
                    onClick={() => {
                      setSelectedSectionIndex(index);
                      setSelectedQuestion(0);
                    }}
                    style={{
                      width: "100%",
                      fontWeight: "bold",
                      borderRadius: "8px",
                      backgroundColor: isSectionCompleted
                        ? "#52c41a"
                        : undefined,
                      color: isSectionCompleted ? "white" : undefined,
                    }}
                  >
                    {section.type}
                  </Button>
                </Col>
              );
            })}
          </Row>
        </Card>

        {/* 🔹 Navigasi Soal */}
        {questions.length > 0 && (
          <Card
            title="Navigasi Soal"
            bordered={false}
            style={{ width: "100%", borderRadius: "12px" }}
          >
            <Row gutter={[5, 5]} justify="start">
              {questions.map((q, index) => (
                <Col key={index} span={4} style={{ textAlign: "center" }}>
                  <Button
                    type={selectedQuestion === index ? "primary" : "default"}
                    onClick={() => setSelectedQuestion(index)}
                    style={{
                      width: "40px",
                      height: "40px",
                      fontWeight: "bold",
                      borderRadius: "8px",
                      backgroundColor: selectedAnswers[q.question_id]
                        ? "#52c41a"
                        : undefined, // ✅ Warna hijau jika sudah dijawab
                      color: selectedAnswers[q.question_id]
                        ? "white"
                        : undefined,
                    }}
                  >
                    {index + 1}
                  </Button>
                </Col>
              ))}
            </Row>
          </Card>
        )}
        {isAllSectionsCompleted && (
          <Button
            type="primary"
            onClick={showConfirmSubmit}
            style={{ marginTop: "20px", width: "100%" }}
            loading={loading}
          >
            Kirim Jawaban
          </Button>
        )}
      </div>
    </div>
  );
}
