"use client";

import React, { useState } from "react";
import {
  Typography,
  Card,
  Button,
  Row,
  Col,
  Progress,
  Modal,
  Drawer,
  Grid,
  Space,
} from "antd";
import ListeningMockTestStudent from "@/app/components/ListeningMockTestStudent";
import SpeakingMockTestStudent from "@/app/components/SpeakingMockTestStudent";
import WritingMockTestStudent from "@/app/components/WritingMockTestStudent";
import ReadingMockTestStudent from "@/app/components/ReadingMockTestStudent";
import Loading from "@/app/components/Loading";
import { MenuOutlined } from "@ant-design/icons";
import { useQuestionViewModel } from "./useQuestionComponent";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export default function QuestionComponent() {
  const screens = useBreakpoint();
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
  } = useQuestionViewModel();

  const [drawerVisible, setDrawerVisible] = useState(false);

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
    <div style={{ padding: screens.xs ? "10px" : "24px" }}>
      <Row gutter={[16, 16]}>
        {/* Timer dan Soal */}
        <Col span={screens.xs ? 24 : 16}>
          {/* Timer */}
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
            <Text
              type="danger"
              style={{ fontSize: "18px", fontWeight: "bold" }}
            >
              {formatTime(remainingTime)}
            </Text>
            <Progress
              percent={(remainingTime / (10 * 60)) * 100}
              showInfo={false}
              strokeColor="#fa541c"
              style={{ marginTop: "10px" }}
            />
          </Card>

          {/* Soal */}
          <div>
            {baseMockTestDataLoading ? (
              <Loading />
            ) : sectionContent ? (
              <div>
                {sectionContent.type === "READING" &&
                  sectionContent.reading && (
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

                {sectionContent.type === "WRITING" &&
                  sectionContent.writing && (
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
        </Col>

        {/* Navigasi Section & Soal */}
        {!screens.xs ? (
          <Col span={8}>
            <Card
              bordered={false}
              style={{
                borderRadius: "12px",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Title level={4} style={{ textAlign: "center" }}>
                Navigasi Section
              </Title>
              <Space direction="vertical" style={{ width: "100%" }}>
                {sectionData.map((section, index) => {
                  return (
                    <Button
                      key={index}
                      type={
                        selectedSectionIndex === index ? "primary" : "default"
                      }
                      onClick={() => {
                        setSelectedSectionIndex(index);
                        setSelectedQuestion(0);
                      }}
                      block
                    >
                      {section.type}
                    </Button>
                  );
                })}
              </Space>
            </Card>
          </Col>
        ) : (
          <Button
            type="primary"
            shape="circle"
            icon={<MenuOutlined />}
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              zIndex: 1000,
            }}
            onClick={() => setDrawerVisible(true)}
          />
        )}
      </Row>

      {/* Drawer Navigasi Section untuk Mobile */}
      <Drawer
        title="Navigasi Section"
        placement="bottom"
        closable
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          {sectionData.map((section, index) => (
            <Button
              key={index}
              type={selectedSectionIndex === index ? "primary" : "default"}
              onClick={() => {
                setSelectedSectionIndex(index);
                setSelectedQuestion(0);
                setDrawerVisible(false);
              }}
              block
            >
              {section.type}
            </Button>
          ))}
        </Space>
      </Drawer>

      {/* Tombol Kirim Jawaban */}
      {isAllSectionsCompleted && (
        <Button
          type="primary"
          onClick={showConfirmSubmit}
          style={{
            marginTop: "20px",
            width: screens.xs ? "100%" : "auto",
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
          }}
          loading={loading}
        >
          Kirim Jawaban
        </Button>
      )}
    </div>
  );
}
