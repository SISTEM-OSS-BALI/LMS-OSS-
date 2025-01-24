
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
} from "antd";
import { RadioChangeEvent } from "antd";
import { crudService } from "../lib/services/crudServices";
import { fetcher } from "../lib/utils/fetcher";
import useSWR from "swr";
import MultipleChoiceReview from "./MultipleChoiceReview";
import Loading from "./Loading";
import { MultipleChoice } from "../model/assigment";

const { Title } = Typography;

interface MultipleChoiceAssignmentProps {
  description: string;
  data : MultipleChoice[];
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
      notification.success({ message: "Jawaban Berhasil Di Submit" });
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
  }, [isTimeRunning, timeRemaining]);

  const handleStart = () => {
    setSelectedOptions({});
    setCurrentQuestionIndex(0);
    setTimeRemaining(timeLimit * 60); 
    setShowQuestions(true);
    setIsTimeRunning(true);
  };


  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secondsRemaining = seconds % 60;
    return `${hours > 0 ? `${hours}:` : ""}${
      minutes < 10 ? "0" : ""
    }${minutes}:${secondsRemaining < 10 ? "0" : ""}${secondsRemaining}`;
  };

  const handleNavigationClick = (index: number) => {
    setCurrentQuestionIndex(index);
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
    <div
      style={{
        paddingLeft: "100px",
        paddingRight: "100px",
        paddingTop: "20px",
      }}
    >
      {!showQuestions && !showReview ? (
        <div>
          <div
            dangerouslySetInnerHTML={{ __html: description }}
            style={{
              padding: "10px",
              background: "#fff",
            }}
          />
          <Title level={5} style={{ marginBottom: "10px" }}>
            Waktu pengerjaan: {timeLimit} menit
          </Title>

          {pointStudent?.completed === false && (
            <Title level={5}>Nilai Kamu Kurang</Title>
          )}

          {(pointStudent?.completed === false || !pointStudent) && (
            <Flex justify="end">
              <Button type="primary" onClick={handleStart}>
                Mulai
              </Button>
            </Flex>
          )}

          {pointStudent?.completed === true && (
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
              style={{ marginBottom: "20px" }}
            />
          )}
        </div>
      ) : showReview && studentAnswer ? (
        studentAnswer ? (
          <MultipleChoiceReview
            data={shuffledData}
            studentAnswers={
              Array.isArray(studentAnswer)
                ? studentAnswer.reduce((acc: any, answer: any) => {
                    acc[answer.mcq_id] = answer.studentAnswer;
                    return acc;
                  }, {} as { [key: string]: string })
                : studentAnswer
            }
            onBackToDescription={handleBackToDescription}
          />
        ) : (
          <Loading />
        )
      ) : (
        <div>
          <div
            style={{
              marginBottom: "20px",
              border: `2px solid ${
                timeRemaining > timeLimit * 30 ? "green" : "red"
              }`,
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            <p style={{ fontWeight: "bold" }}>
              Sisa Waktu: {formatTime(timeRemaining)}
            </p>
          </div>
          <Row gutter={[16, 16]} style={{ marginBottom: "20px" }}>
            {shuffledData.map((_, index) => (
              <Col key={index}>
                <Button
                  type={
                    selectedOptions[shuffledData[index].mcq_id]
                      ? "primary"
                      : "default"
                  }
                  onClick={() => handleNavigationClick(index)}
                >
                  {index + 1}
                </Button>
              </Col>
            ))}
          </Row>
          {shuffledData.length > 0 && (
            <Card style={{ marginBottom: "20px" }}>
              <Title level={4}>
                <div
                  dangerouslySetInnerHTML={{
                    __html: shuffledData[currentQuestionIndex].question,
                  }}
                />
              </Title>
              <Radio.Group
                onChange={(event) =>
                  handleOptionChange(
                    shuffledData[currentQuestionIndex].mcq_id,
                    event
                  )
                }
                value={
                  selectedOptions[shuffledData[currentQuestionIndex].mcq_id]
                }
              >
                {shuffledData[currentQuestionIndex].options.map(
                  (option: any, index: any) => (
                    <Radio
                      key={index}
                      value={option}
                      style={{ display: "block" }}
                    >
                      {option}
                    </Radio>
                  )
                )}
              </Radio.Group>
            </Card>
          )}
          <Popconfirm
            title="Apakah Anda yakin ingin submit jawaban Anda?"
            onConfirm={handleSubmit}
            okText="Ya"
            cancelText="Tidak"
          >
            <Button
              type="primary"
              disabled={
                Object.keys(selectedOptions).length !== shuffledData.length
              }
            >
              Submit
            </Button>
          </Popconfirm>
        </div>
      )}
    </div>
  );
};

export default MultipleChoiceAssignment;
