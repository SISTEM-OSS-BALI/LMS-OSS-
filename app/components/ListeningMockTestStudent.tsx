"use client";

import React, { useState } from "react";
import { Card, Radio, Space, Button, Typography } from "antd";

const { Title, Text } = Typography;

interface Question {
  question_id: string;
  question: string;
  options?: string[];
}

interface ListeningMockTest {
  listening_id: string;
  base_mock_test_id: string;
  audio_url: string;
  transcript?: string | null;
  questions: Question[];
}

interface ListeningMockTestProps {
  data: ListeningMockTest;
  selectedQuestion: number;
  onSelectQuestion: (index: number) => void;
  selectedAnswers: Record<string, string>; // 🔹 Menyimpan jawaban yang telah dipilih
  onAnswerChange: (questionId: string, answer: string) => void; // 🔹 Untuk menyimpan jawaban
}

// 🔹 Function untuk mengubah Google Drive URL menjadi direct link
const getGoogleDriveDirectLink = (url: string): string => {
  const match = url.match(/\/file\/d\/(.*?)\//);
  return match
    ? `https://drive.google.com/file/d/${match[1]}/preview?controls=0`
    : url;
};

export default function ListeningMockTestStudent({
  data,
  selectedQuestion,
  onSelectQuestion,
  selectedAnswers,
  onAnswerChange,
}: ListeningMockTestProps) {
  const directAudioUrl = getGoogleDriveDirectLink(data.audio_url);
  const question = data.questions[selectedQuestion];

  return (
    <Card
      style={{
        marginBottom: 16,
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#fff",
      }}
    >
      {/* Header */}
      <Title level={4} style={{ marginBottom: "12px" }}>
        Listening Test
      </Title>

      {/* Google Drive Embed Player */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#eef7ff",
          borderRadius: "10px",
          padding: "15px",
          marginBottom: "20px",
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <iframe
          src={directAudioUrl}
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
      </div>

      {/* Transcript (Jika Ada) */}
      {data.transcript && (
        <div
          style={{
            background: "#eef7ff",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <Title level={5} style={{ marginBottom: "8px" }}>
            📜 Transcript:
          </Title>
          <Text>{data.transcript}</Text>
        </div>
      )}

      {/* Soal */}
      <Title level={5} style={{ marginBottom: "10px" }}>
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
