"use client";

import { useState } from "react";
import {
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

interface MockTestEntry {
  answer_id: string;
  studentAnswer: string;
  score: number;
  recording_url?: string;
  feedback?: string;

  readingPassage?: {
    passage: string;
  };

  readingQuestion?: {
    question: string;
    options?: string[];
    answer?: string;
  };

  listeningQuestion?: {
    question: string;
    options?: string[];
    answer?: string;
    listening?: {
      audio_url?: string;
    };
  };

  writingQuestion?: {
    question: string;
    options?: string[];
    answer?: string;
    writing?: {
      prompt: string;
    };
  };

  speakingTest?: {
    prompt: string;
    recording_url?: string;
  };
}

interface HistoryMockTestProps {
  data?: MockTestEntry[];
  totalScore: number;
  percentageScore: number;
  level: string;
}

export const HistoryMockTestComponent: React.FC<HistoryMockTestProps> = ({
  data = [],
  totalScore,
  percentageScore,
  level,
}) => {
  const screens = useBreakpoint();
  const [selectedSection, setSelectedSection] = useState("reading");
  const [drawerVisible, setDrawerVisible] = useState(false);

  const sections = [
    { key: "reading", name: "Reading" },
    { key: "listening", name: "Listening" },
    { key: "writing", name: "Writing" },
    { key: "speaking", name: "Speaking" },
  ];

  const levelColors: Record<string, string> = {
    BASIC: "#f5222d",
    INTERMEDIATE: "#fa8c16",
    ADVANCED: "#52c41a",
  };

  const filteredData = data.filter((entry) => {
    if (selectedSection === "reading") return entry.readingQuestion;
    if (selectedSection === "listening") return entry.listeningQuestion;
    if (selectedSection === "writing") return entry.writingQuestion;
    if (selectedSection === "speaking") return entry.speakingTest;
    return false;
  });

  const getGoogleDriveDirectLink = (url: string): string => {
    const match = url.match(/\/file\/d\/(.*?)\//);
    return match
      ? `https://drive.google.com/file/d/${match[1]}/preview?controls=0`
      : url;
  };

  return (
    <div style={{ padding: screens.xs ? "10px" : "30px" }}>
      <Row gutter={[16, 16]} justify="center">
        {screens.xs && (
          <Col span={24}>
            <Button
              type="primary"
              icon={<MenuOutlined />}
              block
              onClick={() => setDrawerVisible(true)}
            >
              Pilih Section (
              {sections.find((s) => s.key === selectedSection)?.name})
            </Button>
          </Col>
        )}

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
              Mock Test History
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

          {filteredData.length > 0 ? (
            filteredData.map((entry, index) => (
              <Card key={index} style={{ marginBottom: 20 }}>
                {entry.readingPassage && (
                  <Card>
                    <Title level={4}>Reading Passage</Title>
                    <Text>{entry.readingPassage.passage}</Text>
                  </Card>
                )}

                {entry.readingQuestion && (
                  <>
                    <Title level={4}>{entry.readingQuestion.question}</Title>
                    <Radio.Group value={entry.studentAnswer}>
                      {entry.readingQuestion.options?.map((option, i) => (
                        <Radio key={i} value={option}>
                          {option}
                        </Radio>
                      ))}
                    </Radio.Group>
                    <Text strong>
                      Jawaban Benar: {entry.readingQuestion.answer}
                    </Text>
                  </>
                )}

                {entry.listeningQuestion?.listening?.audio_url && (
                  <>
                    <Title level={4}>Listening Audio</Title>
                    <iframe
                      src={getGoogleDriveDirectLink(
                        entry.listeningQuestion?.listening?.audio_url || ""
                      )}
                      style={{
                        border: "none",
                        borderRadius: "8px",
                        backgroundColor: "#fff",
                        maxWidth: "300px",
                        maxHeight: "60px",
                      }}
                      allow="autoplay"
                      sandbox="allow-scripts allow-same-origin"
                    ></iframe>
                  </>
                )}

                {entry.listeningQuestion && (
                  <>
                    <Title level={4}>{entry.listeningQuestion.question}</Title>
                    <Radio.Group value={entry.studentAnswer}>
                      {entry.listeningQuestion.options?.map((option, i) => (
                        <Radio key={i} value={option}>
                          {option}
                        </Radio>
                      ))}
                    </Radio.Group>
                    <Text strong>
                      Jawaban Benar: {entry.listeningQuestion.answer}
                    </Text>
                  </>
                )}

                {entry.writingQuestion?.writing?.prompt && (
                  <>
                    <Title level={4}>Writing Prompt</Title>
                    <Text>{entry.writingQuestion.writing.prompt}</Text>
                  </>
                )}

                {entry.writingQuestion && (
                  <>
                    <Title level={4}>{entry.writingQuestion.question}</Title>
                    <Radio.Group value={entry.studentAnswer}>
                      {entry.writingQuestion.options?.map((option, i) => (
                        <Radio key={i} value={option}>
                          {option}
                        </Radio>
                      ))}
                    </Radio.Group>
                    <Text strong>
                      Jawaban Benar: {entry.writingQuestion.answer}
                    </Text>
                  </>
                )}

                {entry.speakingTest && (
                  <>
                    <Title level={4}>{entry.speakingTest.prompt}</Title>
                    <audio controls>
                      <source src={entry.recording_url} type="audio/mp3" />
                      Your browser does not support the audio element.
                    </audio>
                  </>
                )}
              </Card>
            ))
          ) : (
            <Alert showIcon type="warning" message="Tidak Ada Data" />
          )}
        </Col>
      </Row>
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
