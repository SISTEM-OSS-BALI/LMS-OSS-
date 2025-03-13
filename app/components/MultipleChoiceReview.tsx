import React from "react";
import { Button, Card, Divider, Radio, Typography, Grid } from "antd";

const { Title } = Typography;
const { useBreakpoint } = Grid;

interface MultipleChoiceProps {
  data: {
    mcq_id: string;
    question: string;
    options: string[];
    correctAnswer: string;
  }[];
  studentAnswers: {
    data: {
      answer_id: string;
      mcq_id: string;
      studentAnswer: string;
      isCorrect: boolean;
    }[];
  };
  onBackToDescription: () => void;
}

const MultipleChoiceReview: React.FC<MultipleChoiceProps> = ({
  data,
  studentAnswers,
  onBackToDescription,
}) => {
  const screens = useBreakpoint();
  // if (!data || data.length === 0) {
  //   return <div>Loading...</div>;
  // }

  return (
    <div style={{ padding: screens.xs ? "20px" : "0px" }}>
      <Title level={3}>Review Assigment</Title>
      <Button type="primary" onClick={onBackToDescription}>
        Kembali
      </Button>
      <Divider />
      {data.map(({ mcq_id, question, options, correctAnswer }) => {
        const studentAnswerData = studentAnswers.data.find(
          (answer) => answer.mcq_id === mcq_id
        );

        const studentAnswer = studentAnswerData
          ? studentAnswerData.studentAnswer
          : "";
        const isCorrect = studentAnswer === correctAnswer;

        return (
          <Card key={mcq_id} style={{ marginBottom: "20px" }}>
            <Title level={4}>
              <div dangerouslySetInnerHTML={{ __html: question }} />
            </Title>
            <Radio.Group value={studentAnswer} disabled>
              {options.map((option, optionIndex) => (
                <Radio
                  key={optionIndex}
                  value={option}
                  style={{
                    display: "block",
                    backgroundColor:
                      studentAnswer === option
                        ? isCorrect
                          ? "lightgreen"
                          : "lightcoral"
                        : undefined,
                    borderRadius: "4px",
                    marginBottom: "8px",
                    padding: "5px",
                  }}
                >
                  {option}
                </Radio>
              ))}
            </Radio.Group>
            <p>
              <strong>Jawaban yang benar:</strong> {correctAnswer}
            </p>
            <p
              style={{
                color: isCorrect ? "green" : "red",
                fontWeight: "bold",
              }}
            >
              {isCorrect ? "Jawaban Anda Benar!" : "Jawaban Anda Salah"}
            </p>
          </Card>
        );
      })}
    </div>
  );
};

export default MultipleChoiceReview;
