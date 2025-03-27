"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
  Spin,
  Input,
} from "antd";
import Loading from "@/app/components/Loading";
import { useQuestionViewModel } from "./useQuestionViewModel";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// Define types
interface MultipleChoicePlacementTest {
  mc_id: string;
  question: string;
  options: string[];
}

interface WritingPlacementTest {
  writing_id: string;
  question: string;
}

interface TrueFalseQuestion {
  tf_id: string;
  question: string;
  correctAnswer: boolean;
}

interface TrueFalseGroupPlacementTest {
  group_id: string;
  passage: string;
  trueFalseQuestions: TrueFalseQuestion[];
}

type QuestionType =
  | MultipleChoicePlacementTest
  | WritingPlacementTest
  | TrueFalseQuestion;

export default function QuestionComponent() {
  const screens = useBreakpoint();
  const {
    basePlacementTestData,
    remainingTime,
    formatTime,
    handleSubmit,
    time,
    basePlacementTestLoading,
    setCurrentSectionIndex,
    currentSectionIndex,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    selectedAnswers,
    handleAnswerChange,
    showConfirmSubmit,
    loading,
  } = useQuestionViewModel();

  const isAllSectionsCompleted = useMemo(() => {
    return basePlacementTestData?.data.every((section) => {
      const sectionQuestions = [
        ...(section.multipleChoices ?? []),
        ...(section.writingQuestions ?? []),
        ...(section.trueFalseGroups?.flatMap(
          (group) => group.trueFalseQuestions
        ) ?? []),
      ];

      return sectionQuestions.every((q) =>
        "mc_id" in q
          ? selectedAnswers[q.mc_id]
          : "writing_id" in q
          ? selectedAnswers[q.writing_id]
          : "tf_id" in q
          ? selectedAnswers[q.tf_id]
          : false
      );
    });
  }, [basePlacementTestData, selectedAnswers]);

  useEffect(() => {
    if (basePlacementTestData?.data?.length) {
      setCurrentSectionIndex(0);
      setCurrentQuestionIndex(0);
    }
  }, [basePlacementTestData, setCurrentSectionIndex, setCurrentQuestionIndex]);

  if (basePlacementTestLoading) {
    return <Loading />;
  }

  const currentSection =
    basePlacementTestData?.data?.[currentSectionIndex] ?? null;

  const isReadingSection = (currentSection?.trueFalseGroups?.length ?? 0) > 0;

  const currentQuestions: QuestionType[] = currentSection?.multipleChoices
    ?.length
    ? currentSection!.multipleChoices
    : currentSection?.writingQuestions?.length
    ? currentSection!.writingQuestions
    : isReadingSection
    ? currentSection?.trueFalseGroups?.flatMap(
        (group) => group.trueFalseQuestions
      ) ?? []
    : [];

  const getPassage = () => {
    if (!isReadingSection) return null;
    return currentSection?.trueFalseGroups?.[0]?.passage || null;
  };

  const handleNameChange = (name: string) => {
    switch (name) {
      case "WRITING":
        return "Writing";
      case "MULTIPLE_CHOICE":
        return "Multiple Choice";
      case "READING":
        return "Reading";
      default:
        return "";
    }
  };

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <Title level={3}>Placement Test</Title>

      <Row gutter={[24, 24]}>
        {/* Soal */}
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
                  {handleNameChange(currentSection?.name ?? "") || "Loading..."}
                </Title>
              </Col>
              <Col>
                <Text
                  strong
                  style={{ fontSize: screens.xs ? "14px" : "16px" }}
                ></Text>{" "}
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

            {/* Display Passage (Reading Section) */}
            {isReadingSection && (
              <Card
                style={{
                  marginBottom: "20px",
                  background: "#fff8e1",
                  padding: "15px",
                }}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: getPassage() ?? "",
                  }}
                />
              </Card>
            )}

            {/* Soal */}
            {currentQuestions.length > 0 ? (
              <>
                <Title
                  level={screens.xs ? 5 : 4}
                  style={{ marginBottom: "15px" }}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        currentQuestions[currentQuestionIndex]?.question ||
                        "Soal tidak tersedia",
                    }}
                  />
                </Title>

                {/* Multiple Choice */}
                {"mc_id" in currentQuestions[currentQuestionIndex] && (
                  <Radio.Group
                    onChange={(e) =>
                      handleAnswerChange(
                        (
                          currentQuestions[
                            currentQuestionIndex
                          ] as MultipleChoicePlacementTest
                        )?.mc_id || "",
                        e.target.value
                      )
                    }
                    value={
                      selectedAnswers[
                        (
                          currentQuestions[
                            currentQuestionIndex
                          ] as MultipleChoicePlacementTest
                        )?.mc_id || ""
                      ] || null
                    }
                  >
                    <Space direction="vertical" style={{ width: "100%" }}>
                      {(
                        currentQuestions[
                          currentQuestionIndex
                        ] as MultipleChoicePlacementTest
                      )?.options?.map((option, idx) => (
                        <Radio
                          key={idx}
                          value={option}
                          style={{ width: "100%" }}
                        >
                          {option}
                        </Radio>
                      ))}
                    </Space>
                  </Radio.Group>
                )}

                {/* Writing */}
                {"writing_id" in currentQuestions[currentQuestionIndex] && (
                  <Input.TextArea
                    rows={5}
                    placeholder="Jawaban Anda..."
                    onChange={(e) =>
                      handleAnswerChange(
                        (
                          currentQuestions[
                            currentQuestionIndex
                          ] as WritingPlacementTest
                        )?.writing_id || "",
                        e.target.value
                      )
                    }
                    value={
                      selectedAnswers[
                        (
                          currentQuestions[
                            currentQuestionIndex
                          ] as WritingPlacementTest
                        )?.writing_id || ""
                      ] || ""
                    }
                  />
                )}

                {/* True/False */}
                {"tf_id" in currentQuestions[currentQuestionIndex] && (
                  <Radio.Group
                    onChange={(e) =>
                      handleAnswerChange(
                        (
                          currentQuestions[
                            currentQuestionIndex
                          ] as TrueFalseQuestion
                        )?.tf_id || "",
                        e.target.value
                      )
                    }
                    value={
                      selectedAnswers[
                        (
                          currentQuestions[
                            currentQuestionIndex
                          ] as TrueFalseQuestion
                        )?.tf_id || ""
                      ] || null
                    }
                  >
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <Radio value="true">True</Radio>
                      <Radio value="false">False</Radio>
                    </Space>
                  </Radio.Group>
                )}

                {/* Navigasi Soal */}
                <Row justify="space-between" style={{ marginTop: "30px" }}>
                  <Button
                    disabled={currentQuestionIndex === 0}
                    onClick={() =>
                      setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))
                    }
                  >
                    Sebelumnya
                  </Button>
                  {currentQuestionIndex < currentQuestions.length - 1 ? (
                    <Button
                      type="primary"
                      onClick={() =>
                        setCurrentQuestionIndex((prev) =>
                          Math.min(prev + 1, currentQuestions.length - 1)
                        )
                      }
                    >
                      Selanjutnya
                    </Button>
                  ) : isAllSectionsCompleted ? (
                    <Button
                      type="primary"
                      onClick={showConfirmSubmit}
                      loading={loading}
                    >
                      Kirim
                    </Button>
                  ) : null}
                </Row>
              </>
            ) : (
              <Text>Tidak ada soal dalam bagian ini.</Text>
            )}
          </Card>
        </Col>

        {/* Navigasi Section */}
        <Col xs={24} md={8}>
          <Card
            title="Navigasi Section"
            bordered={false}
            style={{
              borderRadius: "12px",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
              marginBottom: "20px",
            }}
          >
            <Row gutter={[10, 10]}>
              {basePlacementTestData?.data.map((section, index) => {
                // Ambil semua soal dalam section ini
                const sectionQuestions = [
                  ...(section.multipleChoices ?? []),
                  ...(section.writingQuestions ?? []),
                  ...(section.trueFalseGroups?.flatMap(
                    (group) => group.trueFalseQuestions
                  ) ?? []),
                ];

                // Cek apakah semua soal dalam section ini sudah dijawab
                const isSectionCompleted = sectionQuestions.every((q) =>
                  "mc_id" in q
                    ? selectedAnswers[q.mc_id]
                    : "writing_id" in q
                    ? selectedAnswers[q.writing_id]
                    : "tf_id" in q
                    ? selectedAnswers[q.tf_id]
                    : false
                );

                return (
                  <Col key={index} span={8} style={{ textAlign: "center" }}>
                    <Button
                      type={
                        currentSectionIndex === index ? "primary" : "default"
                      }
                      onClick={() => {
                        setCurrentSectionIndex(index);
                        setCurrentQuestionIndex(0);
                      }}
                      style={{
                        width: "100%",
                        fontWeight: "bold",
                        borderRadius: "8px",
                        backgroundColor: isSectionCompleted
                          ? "#52c41a"
                          : undefined, // Beri warna hijau jika sudah selesai
                        color: isSectionCompleted ? "white" : undefined,
                      }}
                    >
                      {handleNameChange(section.name)}
                    </Button>
                  </Col>
                );
              })}
            </Row>
          </Card>

          <Card
            title="Navigasi Soal"
            bordered={false}
            style={{
              borderRadius: "12px",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Row gutter={[10, 10]}>
              {currentQuestions.map((_, index) => {
                const questionId =
                  (currentQuestions[index] as MultipleChoicePlacementTest)
                    .mc_id ||
                  (currentQuestions[index] as WritingPlacementTest)
                    .writing_id ||
                  (currentQuestions[index] as TrueFalseQuestion).tf_id;

                return (
                  <Col
                    key={index}
                    span={screens.xs ? 6 : 4}
                    style={{ textAlign: "center" }}
                  >
                    <Button
                      type={selectedAnswers[questionId] ? "primary" : "default"}
                      onClick={() => setCurrentQuestionIndex(index)}
                      style={{
                        width: "50px",
                        height: "50px",
                        fontWeight: "bold",
                        borderRadius: "8px",
                        backgroundColor: selectedAnswers[questionId]
                          ? "#52c41a"
                          : undefined,
                      }}
                    >
                      {index + 1}
                    </Button>
                  </Col>
                );
              })}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
