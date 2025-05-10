import { useState } from "react";
import {
  Table,
  Card,
  Radio,
  Typography,
  Row,
  Col,
  Button,
  Alert,
  Drawer,
  Grid,
  Space,
} from "antd";
import {
  TrophyOutlined,
  PercentageOutlined,
  StarOutlined,
  MenuOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

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
  const screens = useBreakpoint();
  const [selectedSection, setSelectedSection] = useState("multipleChoice");
  const [drawerVisible, setDrawerVisible] = useState(false);

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
    <div style={{ padding: screens.xs ? "10px" : "30px" }}>
      <Row gutter={[16, 16]} justify="center">
        {/* Tombol Menu untuk Mobile */}
        {screens.xs && (
          <Col span={24}>
            <Button
              type="primary"
              icon={<MenuOutlined />}
              block
              onClick={() => setDrawerVisible(true)}
            >
              Pilih Section
            </Button>
          </Col>
        )}

        {/* Sidebar untuk Desktop */}
        {!screens.xs && (
          <Col span={6}>
            <Card
              title="Navigasi Section"
              bordered={false}
              style={{
                borderRadius: "12px",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                {sections.map((section, index) => (
                  <Button
                    key={index}
                    type={
                      selectedSection === section.key ? "primary" : "default"
                    }
                    onClick={() => setSelectedSection(section.key)}
                    block
                  >
                    {section.name}
                  </Button>
                ))}
              </Space>
            </Card>
          </Col>
        )}

        {/* Konten */}
        <Col span={screens.xs ? 24 : 18}>
          <Card
            style={{
              textAlign: "center",
              padding: screens.xs ? "15px" : "30px",
              borderRadius: "12px",
              background: "#f0f2f5",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              marginBottom: "30px",
            }}
          >
            <Title level={2} style={{ marginBottom: "20px", color: "#1890ff" }}>
              Placement Test History
            </Title>

            <Row gutter={[16, 16]} justify="center">
              <Col>
                <TrophyOutlined
                  style={{ fontSize: "32px", color: "#faad14" }}
                />
                <br />
                <Text strong>Total Score</Text>
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
              </Col>

              <Col>
                <PercentageOutlined
                  style={{ fontSize: "32px", color: "#13c2c2" }}
                />
                <br />
                <Text strong>Percentage</Text>
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
              </Col>

              <Col>
                <StarOutlined
                  style={{
                    fontSize: "32px",
                    color: levelColors[level] || "#8c8c8c",
                  }}
                />
                <br />
                <Text strong>Level</Text>
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
              </Col>
            </Row>
          </Card>

          {/* Data Soal */}
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
                {entry.trueFalseQuestion && (
                  <div>
                    <Title level={4}>{entry.trueFalseQuestion.question}</Title>
                    <Radio.Group
                      value={entry.studentAnswer}
                      style={{ display: "block", marginBottom: 10 }}
                    >
                      <Radio
                        value="true"
                        style={{
                          display: "block",
                          background:
                            entry.studentAnswer === "true"
                              ? entry.trueFalseQuestion.correctAnswer
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
                            entry.studentAnswer === "false"
                              ? !entry.trueFalseQuestion.correctAnswer
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
                    {entry.trueFalseQuestion.correctAnswer.toString()}
                  </div>
                )}

                {/* Writing Section */}
                {entry.writingQuestion && (
                  <div>
                    <Title level={4}>
                      <div
                        dangerouslySetInnerHTML={{
                          __html:
                            entry.writingQuestion?.question ||
                            "Pertanyaan tidak tersedia",
                        }}
                      />
                    </Title>
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
        </Col>
      </Row>

      {/* Drawer Navigasi untuk Mobile */}
      <Drawer
        title="Navigasi Section"
        placement="left"
        closable
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          {sections.map((section, index) => (
            <Button
              key={index}
              type={selectedSection === section.key ? "primary" : "default"}
              onClick={() => {
                setSelectedSection(section.key);
                setDrawerVisible(false);
              }}
              block
            >
              {section.name}
            </Button>
          ))}
        </Space>
      </Drawer>
    </div>
  );
};
