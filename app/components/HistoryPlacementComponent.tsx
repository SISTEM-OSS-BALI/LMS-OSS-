import { Table, Card, Radio, Typography, Row, Col, Button, Alert } from "antd";
import { useState } from "react";
import {
  TrophyOutlined,
  PercentageOutlined,
  StarOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface PlacementTestEntry {
  answer_id: string;
  studentAnswer: string;
  score: number;
  writing_feedback?: string;
  trueFalseQuestion?: {
    tf_id: string;
    question: string;
    correctAnswer: boolean;
  };
  trueFalseGroup?: {
    passage: string;
    trueFalseQuestions: {
      tf_id: string;
      question: string;
      correctAnswer: boolean;
    }[];
  };
  multipleChoice?: {
    question: string;
    correctAnswer: string;
    options: string[];
  };
  writingQuestion?: {
    question: string;
  };
}

interface HistoryPlacementComponentProps {
  data?: PlacementTestEntry[];
  totalScore: number;
  percentageScore: number;
  level: string;
}

export const HistoryPlacementComponent: React.FC<
  HistoryPlacementComponentProps
> = ({ data = [], totalScore, percentageScore, level }) => {
  const [selectedSection, setSelectedSection] = useState("multipleChoice");

  const sections = [
    { key: "multipleChoice", name: "Multiple Choice" },
    { key: "reading", name: "Reading" },
    { key: "writing", name: "Writing" },
  ];

  const levelColors: Record<string, string> = {
    BASIC: "#f5222d",
    INTERMEDIATE: "#fa8c16",
    ADVANCED: "#52c41a",
  };

  const filteredData = data.filter((entry) => {
    if (selectedSection === "multipleChoice") return entry.multipleChoice;
    if (selectedSection === "reading")
      return entry.trueFalseQuestion || entry.trueFalseGroup;
    if (selectedSection === "writing") return entry.writingQuestion;
    return false;
  });

  return (
    <div style={{ display: "flex", margin: "0 auto", padding: "30px" }}>
      {/* Sidebar Navigasi */}
      <div style={{ width: "250px", marginRight: "20px" }}>
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
            {sections.map((section, index) => (
              <Col key={index} span={24} style={{ textAlign: "center" }}>
                <Button
                  type={selectedSection === section.key ? "primary" : "default"}
                  onClick={() => setSelectedSection(section.key)}
                  style={{
                    width: "100%",
                    fontWeight: "bold",
                    borderRadius: "8px",
                  }}
                >
                  {section.name}
                </Button>
              </Col>
            ))}
          </Row>
        </Card>
      </div>

      {/* Konten Section */}
      <div style={{ flex: 1 }}>
        <Card
          style={{
            textAlign: "center",
            padding: "30px",
            borderRadius: "12px",
            background: "#f0f2f5",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            marginBottom: "30px",
          }}
        >
          <Title level={2} style={{ marginBottom: "20px", color: "#1890ff" }}>
            Placement Test History
          </Title>

          <div
            style={{ display: "flex", justifyContent: "center", gap: "30px" }}
          >
            <div style={{ textAlign: "center" }}>
              <TrophyOutlined style={{ fontSize: "32px", color: "#faad14" }} />
              <br />
              <Text strong style={{ fontSize: "16px", color: "#595959" }}>
                Total Score
              </Text>
              <br />
              <Text
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#1890ff",
                }}
              >
                {totalScore}
              </Text>
            </div>

            <div style={{ textAlign: "center" }}>
              <PercentageOutlined
                style={{ fontSize: "32px", color: "#13c2c2" }}
              />
              <br />
              <Text strong style={{ fontSize: "16px", color: "#595959" }}>
                Percentage
              </Text>
              <br />
              <Text
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#1890ff",
                }}
              >
                {percentageScore}%
              </Text>
            </div>

            <div style={{ textAlign: "center" }}>
              <StarOutlined
                style={{
                  fontSize: "32px",
                  color: levelColors[level] || "#8c8c8c",
                }}
              />
              <br />
              <Text strong style={{ fontSize: "16px", color: "#595959" }}>
                Level
              </Text>
              <br />
              <Text
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: levelColors[level] || "#8c8c8c",
                }}
              >
                {level}
              </Text>
            </div>
          </div>
        </Card>

        {filteredData.length > 0 ? (
          filteredData.map((entry, entryIndex) => (
            <Card
              key={entry.answer_id || entryIndex}
              style={{
                marginBottom: 20,
                padding: 20,
                borderRadius: 10,
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              }}
            >
              {/* Multiple Choice */}
              {entry.multipleChoice && (
                <>
                  <Title level={4}>{entry.multipleChoice.question}</Title>
                  <Radio.Group
                    value={entry.studentAnswer}
                    style={{ display: "block", marginBottom: 10 }}
                  >
                    {entry.multipleChoice.options.map((option, index) => (
                      <Radio
                        key={index}
                        value={option}
                        style={{
                          display: "block",
                          background:
                            option === entry.studentAnswer
                              ? option === entry.multipleChoice?.correctAnswer
                                ? "#d4edda"
                                : "#f8d7da"
                              : "inherit",
                          padding: "8px 15px",
                          borderRadius: 5,
                          fontWeight: "bold",
                        }}
                      >
                        {option}
                      </Radio>
                    ))}
                  </Radio.Group>
                  <Text strong>Jawaban yang benar:</Text>{" "}
                  {entry.multipleChoice.correctAnswer}
                </>
              )}

              {/* Reading (True/False) */}
              {entry.trueFalseGroup && (
                <>
                  <div
                    style={{
                      background: "#f5f5f5",
                      padding: "15px",
                      borderRadius: "8px",
                      marginBottom: "15px",
                    }}
                  >
                    <Text>{entry.trueFalseGroup.passage}</Text>
                  </div>

                  {entry.trueFalseGroup.trueFalseQuestions.map(
                    (questionEntry, index) => {
                      const studentAnswerEntry = data.find(
                        (ans) =>
                          ans.trueFalseQuestion?.tf_id ===
                            questionEntry.tf_id ||
                          ans.trueFalseGroup?.trueFalseQuestions.some(
                            (q) => q.tf_id === questionEntry.tf_id
                          )
                      );

                      return (
                        <div key={index} style={{ marginBottom: "15px" }}>
                          <Title level={5}>{questionEntry.question}</Title>
                          <Radio.Group
                            value={studentAnswerEntry?.studentAnswer}
                            style={{ display: "block", marginBottom: 10 }}
                          >
                            <Radio
                              value="true"
                              style={{
                                display: "block",
                                background:
                                  studentAnswerEntry?.studentAnswer === "true"
                                    ? questionEntry.correctAnswer
                                      ? "#d4edda"
                                      : "#f8d7da"
                                    : "inherit",
                                padding: "8px 15px",
                                borderRadius: 5,
                              }}
                            >
                              True
                            </Radio>
                            <Radio
                              value="false"
                              style={{
                                display: "block",
                                background:
                                  studentAnswerEntry?.studentAnswer === "false"
                                    ? questionEntry.correctAnswer
                                      ? "#d4edda"
                                      : "#f8d7da"
                                    : "inherit",
                                padding: "8px 15px",
                                borderRadius: 5,
                              }}
                            >
                              False
                            </Radio>
                          </Radio.Group>
                          <Text strong>Jawaban yang benar:</Text>{" "}
                          {questionEntry.correctAnswer.toString()}
                        </div>
                      );
                    }
                  )}
                </>
              )}

              {/* Writing Section */}
              {entry.writingQuestion && (
                <div>
                  <Title level={4}>{entry.writingQuestion.question}</Title>
                  <div
                    style={{
                      background: "#f5f5f5",
                      padding: "15px",
                      borderRadius: "8px",
                      marginBottom: "10px",
                    }}
                  >
                    <Text strong>Jawaban:</Text> {entry.studentAnswer}
                  </div>
                  <Text strong>Skor:</Text> {entry.score}
                  <div
                    style={{
                      background: "#e3f2fd",
                      padding: "10px",
                      borderRadius: "8px",
                    }}
                  >
                    <Text strong>Feedback:</Text> {entry.writing_feedback}
                  </div>
                </div>
              )}
            </Card>
          ))
        ) : (
          <Alert showIcon type="warning" message="Tidak Ada Data" />
        )}
      </div>
    </div>
  );
};
