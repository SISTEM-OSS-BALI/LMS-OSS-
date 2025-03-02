import React, { useState } from "react";
import { Card, Radio, Space, Button, Typography } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface Question {
  question_id: string;
  question: string;
  options?: string[];
  answer?: string;
}

interface ReadingMockTest {
  reading_id: string;
  base_mock_test_id: string;
  passage: string;
  questions: Question[];
}

interface ReadingMockTestProps {
  data: ReadingMockTest;
  onEditPassage: (id: string) => void;
  onEditQuestion: (questionId: string) => void;
  onDeleteQuestion: (questionId: string) => void;
  onAddQuestion: () => void;
}

export default function ReadingMockTestComponent({
  data,
  onEditPassage,
  onEditQuestion,
  onDeleteQuestion,
  onAddQuestion,
}: ReadingMockTestProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: string]: string;
  }>({});

  const handleAnswerChange = (questionId: string, value: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  return (
    <Card
      style={{
        marginBottom: 16,
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Reading Test
        </Title>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => onEditPassage(data.reading_id)}
        >
          Edit Passage
        </Button>
      </div>

      {/* Passage */}
      <div
        style={{
          background: "#eef7ff",
          padding: "12px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <Title level={5} style={{ marginBottom: "8px" }}>
          Soal:
        </Title>
        <Text>{data.passage}</Text>
      </div>

      {/* Questions Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <Title level={5} style={{ margin: 0 }}>
          Pertanyaan
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={onAddQuestion}>
          Tambah Pertanyaan
        </Button>
      </div>

      {/* Questions List */}
      <ul
        style={{
          listStyleType: "none",
          padding: 0,
          margin: 0,
        }}
      >
        {data.questions.map((question) => (
          <li
            key={question.question_id}
            style={{
              background: "#f9f9f9",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "8px",
              boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.1)",
              position: "relative",
            }}
          >
            {/* Tombol Edit & Delete */}
            <Space
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                display: "flex",
                gap: 8,
              }}
            >
              <Button
                type="primary"
                shape="circle"
                icon={<EditOutlined />}
                onClick={() => onEditQuestion(question.question_id)}
              />
              <Button
                type="default"
                shape="circle"
                icon={<DeleteOutlined />}
                danger
                onClick={() => onDeleteQuestion(question.question_id)}
              />
            </Space>

            {/* Pertanyaan */}
            <Text strong>{question.question}</Text>

            {/* Opsi Jawaban */}
            {question.options && (
              <Radio.Group
                onChange={(e) =>
                  handleAnswerChange(question.question_id, e.target.value)
                }
                value={selectedAnswers[question.question_id] || question.answer} // Auto select correct answer
                style={{ marginTop: "8px", display: "block" }}
              >
                <Space direction="vertical">
                  {question.options.map((option, index) => (
                    <Radio key={index} value={option}>
                      {option}
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
