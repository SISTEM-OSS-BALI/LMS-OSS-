"use client";

import React from "react";
import { Card, Radio, Space, Button, Typography } from "antd";

const { Title, Text } = Typography;

interface Question {
  question_id: string;
  question: string;
  options?: string[];
}

interface WritingMockTest {
  writing_id: string;
  base_mock_test_id: string;
  prompt: string;
  questions: Question[];
}

interface WritingMockTestProps {
  data: WritingMockTest;
  selectedQuestion: number;
  onSelectQuestion: (index: number) => void;
  selectedAnswers: Record<string, string>; // 🔹 Jawaban yang sudah dipilih
  onAnswerChange: (questionId: string, answer: string) => void; // 🔹 Fungsi menyimpan jawaban
}

export default function WritingMockTestStudent({
  data,
  selectedQuestion,
  onSelectQuestion,
  selectedAnswers,
  onAnswerChange,
}: WritingMockTestProps) {
  const question = data.questions[selectedQuestion];

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
      <Title level={4} style={{ marginBottom: "12px" }}>
        Writing Test
      </Title>

      {/* Prompt */}
      <div
        style={{
          background: "#eef7ff",
          padding: "12px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <Text>{data.prompt}</Text>
      </div>

      {/* Soal */}
      <Title level={5} style={{ marginBottom: "12px" }}>
        Question
      </Title>

      <Card
        style={{
          background: "#f9f9f9",
          padding: "10px",
          borderRadius: "8px",
          marginBottom: "8px",
          boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Pertanyaan */}
        <Text strong>{question.question}</Text>

        {/* Opsi Jawaban */}
        {question.options && (
          <Radio.Group
            onChange={(e) =>
              onAnswerChange(question.question_id, e.target.value)
            }
            value={selectedAnswers[question.question_id] || ""}
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
      </Card>

      {/* Navigasi Soal */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          onClick={() => onSelectQuestion(selectedQuestion - 1)}
          disabled={selectedQuestion === 0}
        >
          Sebelumnya
        </Button>

        <Button
          onClick={() => onSelectQuestion(selectedQuestion + 1)}
          disabled={selectedQuestion === data.questions.length - 1}
        >
          Selanjutnya
        </Button>
      </div>
    </Card>
  );
}
