import React, { useState, useEffect } from "react";
import {
  Card,
  Radio,
  Typography,
  Button,
  message,
  Row,
  Col,
  notification,
  Tag,
  Table,
  Popconfirm,
  Flex,
  Grid,
  Divider,
  Space,
} from "antd";
import { RadioChangeEvent } from "antd";
import { crudService } from "../lib/services/crudServices";
import { fetcher } from "../lib/utils/fetcher";
import useSWR from "swr";
import MultipleChoiceReview from "./MultipleChoiceReview";
import Loading from "./Loading";
import { MultipleChoice } from "../model/assigment";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

interface MultipleChoiceAssignmentProps {
  description: string;
  data: MultipleChoice[];
  timeLimit: number;
  assignment_id: string;
  base_id: string;
  course_id: string;
  pointStudent: any;
  mutate: () => void;
  onComplete?: () => void;
}

const MultipleChoiceAssignment: React.FC<MultipleChoiceAssignmentProps> = ({
  description,
  data,
  timeLimit,
  base_id,
  assignment_id,
  course_id,
  pointStudent,
  mutate,
  onComplete,
}) => {
  const screens = useBreakpoint();
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: string]: string;
  }>({});
  const [shuffledData, setShuffledData] = useState<MultipleChoice[]>([]);
  const [showQuestions, setShowQuestions] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60);
  const [isTimeRunning, setIsTimeRunning] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const { data: studentAnswer, mutate: mutateStudentAnswer } = useSWR(
    `/api/student/answerAssignment/${base_id}/${assignment_id}/studentShowAnswer`,
    fetcher
  );

  useEffect(() => {
    if (data.length > 0) {
      setShuffledData([...data].sort(() => Math.random() - 0.5));
    }
  }, [data]);

  useEffect(() => {
    if (showReview) setIsTimeRunning(false);
  }, [showReview]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimeRunning && timeRemaining > 0) {
      timer = setTimeout(() => setTimeRemaining((prev) => prev - 1), 1000);
    } else if (timeRemaining === 0) {
      message.warning("Waktu habis, jawaban disubmit otomatis.");
      handleSubmit();
    }
    return () => clearTimeout(timer);
  }, [isTimeRunning, timeRemaining]);

  const handleOptionChange = (mcq_id: string, event: RadioChangeEvent) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [mcq_id]: event.target.value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const selectedData = Object.keys(selectedOptions).map((mcq_id) => ({
        mcq_id,
        selectedAnswer: selectedOptions[mcq_id],
      }));
      const payload = { selectedData, assignment_id, base_id, course_id };
      await crudService.post(
        "/api/student/answerAssignment/studentSubmitAnswer",
        payload
      );
      mutate();
      notification.success({ message: "Jawaban Berhasil Disubmit" });
      setShowQuestions(false);
      setShowReview(false);
      if (onComplete) onComplete();
    } catch (error) {
      message.error(`Gagal mengirim jawaban: ${error}`);
    }
  };

  const handleStart = () => {
    setSelectedOptions({});
    setCurrentQuestionIndex(0);
    setTimeRemaining(timeLimit * 60);
    setShowQuestions(true);
    setIsTimeRunning(true);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secondsRemaining = seconds % 60;
    return `${minutes}:${secondsRemaining < 10 ? "0" : ""}${secondsRemaining}`;
  };

  const handleReview = async () => {
    await mutateStudentAnswer();
    setShowQuestions(false);
    setShowReview(true);
    setIsTimeRunning(false);
  };

  const columns = [
    {
      title: "Nilai",
      dataIndex: "score",
      render: () => <span>{pointStudent.score} </span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: () => (
        <Tag color={pointStudent.completed ? "green" : "red"}>
          {pointStudent.completed ? "Selesai" : "Belum Selesai"}
        </Tag>
      ),
    },
    {
      title: "Review Soal",
      dataIndex: "history",
      render: () => (
        <Button type="link" onClick={handleReview}>
          Review
        </Button>
      ),
    },
  ];

  const handleBackToDescription = () => {
    setShowReview(false);
  };

  return (
    <div style={{ padding: screens.xs ? "0px" : "50px" }}>
      {!showQuestions && !showReview ? (
        <div style={{ padding: screens.xs ? "20px" : "0px" }}>
          <Text style={{ fontSize: "16px", color: "#595959" }}>
            {/* Gunakan dangerouslySetInnerHTML hanya jika ada HTML di dalam description */}
            <span dangerouslySetInnerHTML={{ __html: description }} />
          </Text>
          <Divider />
          <Title level={5}>
            Waktu pengerjaan:{" "}
            <span style={{ color: "#1890ff" }}>{timeLimit} menit</span>
          </Title>

          {(pointStudent?.completed === false || !pointStudent) && (
            <Flex justify="end">
              <Button
                type="primary"
                size="large"
                onClick={handleStart}
                style={{ backgroundColor: "#1890ff", borderRadius: "6px" }}
              >
                Mulai
              </Button>
            </Flex>
          )}
          
          {pointStudent?.completed && (
            <Table
              columns={columns}
              dataSource={[
                {
                  key: "1",
                  score: pointStudent.score!,
                  status: pointStudent.completed,
                },
              ]}
              pagination={false}
              style={{ marginTop: "20px" }}
            />
          )}
        </div>
      ) : showReview && studentAnswer ? (
        <MultipleChoiceReview
          data={shuffledData}
          studentAnswers={studentAnswer}
          onBackToDescription={handleBackToDescription}
        />
      ) : (
        <div style={{ padding: screens.xs ? "20px" : "0px" }}>
          {/* Timer dengan desain lebih menarik */}
          <Title level={4} style={{ textAlign: "center", fontWeight: "bold" }}>
            Sisa Waktu:{" "}
            <span style={{ color: "#d48806" }}>
              {formatTime(timeRemaining)}
            </span>
          </Title>

          {/* Navigasi soal */}
          <Flex justify="center" gap={8} style={{ marginBottom: "16px" }}>
            {shuffledData.map((_, index) => (
              <Button
                key={index}
                shape="round"
                size="large"
                style={{
                  backgroundColor: selectedOptions[shuffledData[index].mcq_id]
                    ? "#d48806"
                    : "#f5f5f5",
                  color: selectedOptions[shuffledData[index].mcq_id]
                    ? "#fff"
                    : "#333",
                  border: "1px solid #d9d9d9",
                  fontWeight: "bold",
                }}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </Button>
            ))}
          </Flex>

          {/* Soal & opsi jawaban */}
          <Card
            style={{
              marginTop: "16px",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
            }}
          >
            <Title
              level={5}
              style={{ marginBottom: "10px", fontWeight: "bold" }}
            >
              <span
                dangerouslySetInnerHTML={{
                  __html: shuffledData[currentQuestionIndex]?.question,
                }}
              />
            </Title>

            <Radio.Group
              onChange={(e) =>
                handleOptionChange(shuffledData[currentQuestionIndex].mcq_id, e)
              }
              style={{ width: "100%" }}
            >
              <Space
                direction="vertical"
                size="large"
                style={{ width: "100%" }}
              >
                {shuffledData[currentQuestionIndex]?.options.map(
                  (option, index) => (
                    <Radio.Button
                      key={index}
                      value={option}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        padding: "12px",
                        borderRadius: "8px",
                        fontSize: "16px",
                        border: "1px solid #d9d9d9",
                        background:
                          selectedOptions[
                            shuffledData[currentQuestionIndex].mcq_id
                          ] === option
                            ? "#d48806"
                            : "#fff",
                        color:
                          selectedOptions[
                            shuffledData[currentQuestionIndex].mcq_id
                          ] === option
                            ? "#fff"
                            : "#333",
                      }}
                    >
                      {option}
                    </Radio.Button>
                  )
                )}
              </Space>
            </Radio.Group>
          </Card>

          {/* Tombol Submit */}
          <Flex justify="center" style={{ marginTop: "20px" }}>
            <Popconfirm
              title="Apakah Anda yakin ingin submit jawaban Anda?"
              onConfirm={handleSubmit}
              okText="Ya"
              cancelText="Tidak"
            >
              <Button
                type="primary"
                size="large"
                shape="round"
                disabled={
                  Object.keys(selectedOptions).length !== shuffledData.length
                }
                style={{
                  backgroundColor: "#d48806",
                  borderColor: "#d48806",
                  color: "#fff",
                  fontWeight: "bold",
                  padding: "10px 20px",
                }}
              >
                Submit Jawaban
              </Button>
            </Popconfirm>
          </Flex>
        </div>
      )}
    </div>
  );
};

export default MultipleChoiceAssignment;
