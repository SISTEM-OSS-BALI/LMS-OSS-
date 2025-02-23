import React from "react";
import { Card, Typography, Button, Popconfirm, Radio, Space, Flex } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

interface TrueFalseQuestion {
  tf_id: string;
  question: string;
  correctAnswer: boolean;
}

interface ReadingPlacement {
  group_id: string;
  passage: string;
  basePlacementTestId: string;
  trueFalseQuestions: TrueFalseQuestion[];
}

interface ReadingPlacementProps {
  data: ReadingPlacement[];
  onEditPassage: (group_id: string) => void;
  onEditQuestion: (group_id: string, tf_id: string) => void;
  onDeleteQuestion: (tf_id: string) => void;
  onAddQuestionMore: (group_id: string) => void;
}

const ReadingPlacementTestDisplay: React.FC<ReadingPlacementProps> = ({
  data,
  onEditPassage,
  onEditQuestion,
  onDeleteQuestion,
  onAddQuestionMore,
}) => {
  return (
    <div>
      {data.map(({ group_id, passage, trueFalseQuestions }) => (
        <Card key={group_id} style={{ marginBottom: "20px", padding: "20px" }}>
          {/* Header Passage */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <Title level={4}>Soal</Title>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => onEditPassage(group_id)}
            >
              Edit Passage
            </Button>
          </div>

          {/* Passage Text */}
          <Paragraph
            style={{
              background: "#f5f5f5",
              padding: "15px",
              borderRadius: "8px",
              textAlign: "justify",
              lineHeight: "1.6",
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: passage }} />
          </Paragraph>

          {/* Daftar Pertanyaan True/False */}
          <div style={{ marginTop: "20px" }}>
            <Flex justify="space-between" style={{ marginBottom: "24px" }}>
              <Title level={4} style={{ marginBlock: 0 }}>
                Pertanyaan
              </Title>
              <Button
                type="primary"
                onClick={() => onAddQuestionMore(group_id)}
              >
                Tambah Pertanyaan
              </Button>
            </Flex>

            {trueFalseQuestions.map(({ tf_id, question, correctAnswer }) => (
              <Card
                key={tf_id}
                style={{ marginBottom: "10px", padding: "10px" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text>
                    <div dangerouslySetInnerHTML={{ __html: question }} />
                  </Text>
                  <Space>
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() => onEditQuestion(group_id, tf_id)}
                    >
                      Edit
                    </Button>
                      <Button type="primary" danger icon={<DeleteOutlined />} onClick={() => onDeleteQuestion(tf_id)}>
                        Hapus
                      </Button>
                  </Space>
                </div>
                <Radio.Group
                  value={correctAnswer}
                  disabled
                  style={{ display: "block", marginTop: "10px" }}
                >
                  <Radio value={true}>True</Radio>
                  <Radio value={false}>False</Radio>
                </Radio.Group>
              </Card>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ReadingPlacementTestDisplay;
