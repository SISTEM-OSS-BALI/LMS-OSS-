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

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimeRunning && timeRemaining > 0) {
      timer = setTimeout(() => setTimeRemaining((prev) => prev - 1), 1000);
    } else if (timeRemaining === 0) {
      message.warning("Waktu habis, jawaban disubmit otomatis.");
      handleSubmit();
    }
    return () => clearTimeout(timer);
  }, [isTimeRunning, timeRemaining, handleSubmit]);

  const handleOptionChange = (mcq_id: string, event: RadioChangeEvent) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [mcq_id]: event.target.value,
    }));
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
          <Flex justify="space-between">
            <Title level={4} style={{ fontWeight: "bold", marginBottom: "20px" }}>
              Assignment
            </Title>
            <Title level={4}>
              Sisa Waktu:{" "}
              <span style={{ color: "#d48806" }}>
                {formatTime(timeRemaining)}
              </span>
            </Title>
          </Flex>

          <Row gutter={24} style={{ marginTop: "20px" }}>
            <Col span={18}>
              <Card
                style={{
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.05)",
                  backgroundColor: "#ffffff",
                  border: "1px solid #f0f0f0",
                }}
              >
                <Title
                  level={5}
                  style={{
                    marginBottom: "16px",
                    fontWeight: "600",
                    color: "#333",
                  }}
                >
                  <span
                    dangerouslySetInnerHTML={{
                      __html: shuffledData[currentQuestionIndex]?.question,
                    }}
                  />
                </Title>

                <Radio.Group
                  onChange={(e) =>
                    handleOptionChange(
                      shuffledData[currentQuestionIndex].mcq_id,
                      e
                    )
                  }
                  value={
                    selectedOptions[shuffledData[currentQuestionIndex].mcq_id]
                  }
                  style={{ width: "100%" }}
                >
                  <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    size={12}
                  >
                    {shuffledData[currentQuestionIndex]?.options.map(
                      (option, index) => (
                        <Radio
                          key={index}
                          value={option}
                          style={{
                            padding: "14px 20px",
                            border: "1px solid #d9d9d9",
                            borderRadius: "8px",
                            fontSize: "16px",
                            width: "100%",
                            backgroundColor:
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
                            fontWeight:
                              selectedOptions[
                                shuffledData[currentQuestionIndex].mcq_id
                              ] === option
                                ? 600
                                : 400,
                            boxShadow:
                              selectedOptions[
                                shuffledData[currentQuestionIndex].mcq_id
                              ] === option
                                ? "0 2px 6px rgba(0, 0, 0, 0.1)"
                                : "none",
                            cursor: "pointer",
                            transition: "all 0.3s",
                          }}
                        >
                          {option}
                        </Radio>
                      )
                    )}
                  </Space>
                </Radio.Group>
              </Card>
            </Col>
            <Col span={6}>
              <Flex>
                <Card
                  style={{
                    padding: "12px",
                    borderRadius: "16px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                    border: "1px solid #f0f0f0",
                  }}
                >
                  <Space size="small">
                    {shuffledData.map((_, index) => {
                      const isAnswered =
                        !!selectedOptions[shuffledData[index].mcq_id];
                      const isCurrent = index === currentQuestionIndex;

                      return (
                        <Button
                          key={index}
                          shape="circle"
                          size="large"
                          onClick={() => setCurrentQuestionIndex(index)}
                          style={{
                            width: 42,
                            height: 42,
                            backgroundColor: isCurrent
                              ? "#d48806"
                              : isAnswered
                              ? "#ffd666"
                              : "#f5f5f5",
                            color: isCurrent || isAnswered ? "#fff" : "#333",
                            fontWeight: "bold",
                            border: "none",
                            boxShadow:
                              isCurrent || isAnswered
                                ? "0 2px 8px rgba(0,0,0,0.1)"
                                : "none",
                            transition: "all 0.3s ease",
                          }}
                        >
                          {index + 1}
                        </Button>
                      );
                    })}
                  </Space>
                </Card>
              </Flex>
            </Col>
          </Row>

          {/* Navigasi soal */}

          {/* Soal & opsi jawaban */}

          {/* Tombol Submit */}
          <Flex justify="end" style={{ marginTop: "20px" }}>
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
