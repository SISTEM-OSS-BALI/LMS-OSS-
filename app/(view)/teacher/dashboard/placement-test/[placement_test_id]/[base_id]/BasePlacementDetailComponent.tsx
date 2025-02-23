import { useBasePlacementDetailViewModel } from "./useBasePlacementDetailViewModel";
import MultipleChoiceTeacherPlacementDisplay from "@/app/components/MultipleChoiceTeacherPlacementDisplay";
import WritingPlacementTestDisplay from "@/app/components/WritingTeacherPlacementDisplay";
import ReadingPlacementTestDisplay from "@/app/components/ReadingTeacherPlacementDisplay";
import {
  Skeleton,
  Typography,
  Alert,
  Flex,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Col,
} from "antd";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
  MultipleChoicePlacementTest,
  TrueFalseGroupPlacementTest,
  TrueFalseQuestion,
  WritingPlacementTest,
} from "@prisma/client";

// Lazy load ReactQuill untuk teks editor
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const { Title } = Typography;

export default function BasePlacementDetailComponent() {
  const {
    basePlacementDetail,
    error,
    isLoading,
    isModalOpen,
    formType,
    form,
    questionCount,
    questions,
    passage,
    handleAddQuestion,
    handleQuestionCountChange,
    handleQuestionChange,
    handleCorrectAnswerChange,
    handleOptionChange,
    handleFormSubmit,
    setPassage,
    handleCancelModal,
    loading,
    setFormType,
    selectedQuestionId,
    handleEditQuestion,
    setQuestions,
    setQuestionCount,
    editType,
    handleDelete,
  } = useBasePlacementDetailViewModel();
  // State

  const isDataEmpty =
    !basePlacementDetail?.data.multipleChoice.length &&
    !basePlacementDetail?.data.writing.length &&
    !basePlacementDetail?.data.trueFalse.length;

  useEffect(() => {
    if (selectedQuestionId && formType && editType) {
      let selectedQuestion = null;

      if (formType === "multipleChoice") {
        selectedQuestion = basePlacementDetail?.data.multipleChoice.find(
          (q: MultipleChoicePlacementTest) => q.mc_id === selectedQuestionId
        );
        if (selectedQuestion) {
          setQuestions([
            {
              question: selectedQuestion.question,
              options: selectedQuestion.options,
              correctAnswer: selectedQuestion.correctAnswer,
            },
          ]);
        }
      } else if (formType === "writing") {
        selectedQuestion = basePlacementDetail?.data.writing.find(
          (q: WritingPlacementTest) => q.writing_id === selectedQuestionId
        );
        if (selectedQuestion) {
          form.setFieldsValue({ questions: selectedQuestion.question });
        }
      } else if (formType === "reading") {
        selectedQuestion = basePlacementDetail?.data.trueFalse.find(
          (q: TrueFalseGroupPlacementTest) => q.group_id === selectedQuestionId
        );
        if (selectedQuestion) {
          if (editType === "passage") {
            setPassage(selectedQuestion.passage);
            setQuestions([]);
          } else if (editType === "question") {
            setPassage("");
            setQuestions(
              selectedQuestion.trueFalseQuestions.map(
                (q: TrueFalseQuestion) => ({
                  question: q.question,
                  correctAnswer: q.correctAnswer,
                })
              )
            );
          } else if (editType === "addQuestionMore") {
            setPassage("");
            setQuestions([]);
            setQuestionCount(1);
          }
        }
      }
    }
  }, [
    selectedQuestionId,
    formType,
    editType, // ✅ Include editType in dependencies
    basePlacementDetail,
    form,
    setPassage,
    setQuestions,
  ]);

  const handleNameChange = (name: string) => {
    switch (name) {
      case "WRITING":
        return "Writing";
      case "MULTIPLE_CHOICE":
        return "Multiple Choice";
      case "READING":
        return "Reading";
      default:
        return "";
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Title level={4}>
          Placement Test Detail{" "}
          {handleNameChange(basePlacementDetail?.data.name.name)}
        </Title>
        <Button type="primary" onClick={handleAddQuestion}>
          Tambah Soal
        </Button>
      </Flex>

      {isLoading ? (
        <>
          <Skeleton active />
          <Skeleton active />
          <Skeleton active />
        </>
      ) : isDataEmpty ? (
        <Alert
          message="Informasi"
          description="Tidak ada data Placement Test tersedia."
          type="info"
          showIcon
          style={{ marginTop: "16px" }}
        />
      ) : (
        <>
          {basePlacementDetail?.data.multipleChoice.length > 0 && (
            <MultipleChoiceTeacherPlacementDisplay
              data={basePlacementDetail.data.multipleChoice}
              onEdit={(id: string) => handleEditQuestion(id, "multipleChoice")}
              onDelete={(id: string) => handleDelete(id, "multipleChoice")}
            />
          )}

          {basePlacementDetail?.data.writing.length > 0 && (
            <WritingPlacementTestDisplay
              data={basePlacementDetail.data.writing}
              onEdit={(id: string) => handleEditQuestion(id, "writing")}
              onDelete={(id: string) => handleDelete(id, "writing")}
            />
          )}

          {basePlacementDetail?.data.trueFalse.length > 0 && (
            <ReadingPlacementTestDisplay
              data={basePlacementDetail.data.trueFalse}
              onEditPassage={(group_id: string) =>
                handleEditQuestion(group_id, "reading", "passage")
              }
              onEditQuestion={(group_id: string, tf_id: string) =>
                handleEditQuestion(group_id, "reading", "question", tf_id)
              }
              onDeleteQuestion={(tf_id: string) =>
                handleDelete(tf_id, "reading")
              }
              onAddQuestionMore={(group_id: string) =>
                handleEditQuestion(group_id, "reading", "addQuestionMore")
              }
            />
          )}
        </>
      )}

      {/* Modal Tambah Soal */}
      <Modal
        title={
          selectedQuestionId
            ? `Edit ${
                formType === "writing"
                  ? "Soal Writing"
                  : formType === "multipleChoice"
                  ? "Soal Multiple Choice"
                  : "Soal Reading"
              }`
            : `Tambah ${
                formType === "writing"
                  ? "Soal Writing"
                  : formType === "multipleChoice"
                  ? "Soal Multiple Choice"
                  : "Soal Reading"
              }`
        }
        open={isModalOpen}
        onCancel={handleCancelModal}
        width={800}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleFormSubmit}>
          {/* ✅ FORM TYPE: READING */}
          {formType === "reading" && (
            <>
              {/* ✅ ADDING NEW READING QUESTIONS */}
              {!selectedQuestionId && (
                <>
                  <Form.Item label="Passage (Bacaan)">
                    <ReactQuill
                      theme="snow"
                      value={passage}
                      onChange={setPassage}
                      placeholder="Masukkan passage..."
                    />
                  </Form.Item>

                  <Form.Item label="Jumlah Soal">
                    <InputNumber
                      min={1}
                      value={questionCount}
                      onChange={(value) =>
                        handleQuestionCountChange(value || 1)
                      }
                      style={{ width: "100%" }}
                    />
                  </Form.Item>

                  <Row gutter={[16, 16]}>
                    {questions.map((question, qIndex) => (
                      <Col span={24} key={qIndex}>
                        <Form.Item label={`Pertanyaan ${qIndex + 1}`} required>
                          <ReactQuill
                            theme="snow"
                            value={question.question}
                            onChange={(value) =>
                              handleQuestionChange(qIndex, "question", value)
                            }
                            placeholder={`Masukkan pertanyaan ${qIndex + 1}`}
                          />
                        </Form.Item>

                        <Form.Item label="Jawaban Benar">
                          <Radio.Group
                            onChange={(e) =>
                              handleQuestionChange(
                                qIndex,
                                "correctAnswer",
                                e.target.value
                              )
                            }
                            value={question.correctAnswer}
                          >
                            <Radio value={true}>True</Radio>
                            <Radio value={false}>False</Radio>
                          </Radio.Group>
                        </Form.Item>
                      </Col>
                    ))}
                  </Row>
                </>
              )}

              {/* ✅ EDITING PASSAGE (ONLY SHOW PASSAGE FIELD) */}
              {selectedQuestionId && editType === "passage" && (
                <Form.Item label="Passage (Bacaan)">
                  <ReactQuill
                    theme="snow"
                    value={passage}
                    onChange={setPassage}
                    placeholder="Masukkan passage..."
                  />
                </Form.Item>
              )}

              {/* ✅ ADDING MORE QUESTIONS (NEW INPUTS) */}
              {selectedQuestionId && editType === "addQuestionMore" && (
                <>
                  <Form.Item label="Jumlah Soal">
                    <InputNumber
                      min={1}
                      value={questionCount}
                      onChange={(value) =>
                        handleQuestionCountChange(value || 1)
                      }
                      style={{ width: "100%" }}
                    />
                  </Form.Item>

                  <Row gutter={[16, 16]}>
                    {questions.map((question, qIndex) => (
                      <Col span={24} key={qIndex}>
                        <Form.Item label={`Pertanyaan ${qIndex + 1}`} required>
                          <ReactQuill
                            theme="snow"
                            value={question.question}
                            onChange={(value) =>
                              handleQuestionChange(qIndex, "question", value)
                            }
                            placeholder={`Masukkan pertanyaan ${qIndex + 1}`}
                          />
                        </Form.Item>

                        <Form.Item label="Jawaban Benar">
                          <Radio.Group
                            onChange={(e) =>
                              handleQuestionChange(
                                qIndex,
                                "correctAnswer",
                                e.target.value
                              )
                            }
                            value={question.correctAnswer}
                          >
                            <Radio value={true}>True</Radio>
                            <Radio value={false}>False</Radio>
                          </Radio.Group>
                        </Form.Item>
                      </Col>
                    ))}
                  </Row>
                </>
              )}

              {/* ✅ EDITING A SINGLE QUESTION */}
              {selectedQuestionId &&
                editType === "question" &&
                questions.length > 0 && (
                  <Row gutter={[16, 16]}>
                    {questions.map((question, qIndex) => (
                      <Col span={24} key={qIndex}>
                        <Form.Item label={`Pertanyaan ${qIndex + 1}`} required>
                          <ReactQuill
                            theme="snow"
                            value={question.question}
                            onChange={(value) =>
                              handleQuestionChange(qIndex, "question", value)
                            }
                            placeholder={`Masukkan pertanyaan ${qIndex + 1}`}
                          />
                        </Form.Item>

                        <Form.Item label="Jawaban Benar">
                          <Radio.Group
                            onChange={(e) =>
                              handleQuestionChange(
                                qIndex,
                                "correctAnswer",
                                e.target.value
                              )
                            }
                            value={question.correctAnswer}
                          >
                            <Radio value={true}>True</Radio>
                            <Radio value={false}>False</Radio>
                          </Radio.Group>
                        </Form.Item>
                      </Col>
                    ))}
                  </Row>
                )}
            </>
          )}

          {/* ✅ FORM TYPE: WRITING */}
          {formType === "writing" && (
            <>
              <Form.Item label="Pertanyaan Writing">
                <ReactQuill
                  theme="snow"
                  value={form.getFieldValue("questions")}
                  onChange={(value) =>
                    form.setFieldsValue({ questions: value })
                  }
                  placeholder="Masukkan pertanyaan writing..."
                />
              </Form.Item>
            </>
          )}

          {/* ✅ FORM TYPE: MULTIPLE CHOICE */}
          {formType === "multipleChoice" && (
            <>
              {!selectedQuestionId && (
                <Form.Item label="Jumlah Soal">
                  <InputNumber
                    min={1}
                    value={questionCount}
                    onChange={(value) => handleQuestionCountChange(value || 1)}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              )}
              <Row gutter={[16, 16]}>
                {questions.map((question, qIndex) => (
                  <Col span={24} key={qIndex}>
                    <Form.Item label={`Pertanyaan ${qIndex + 1}`} required>
                      <ReactQuill
                        theme="snow"
                        value={question.question}
                        onChange={(value) =>
                          handleQuestionChange(qIndex, "question", value)
                        }
                        placeholder={`Masukkan pertanyaan ${qIndex + 1}`}
                      />
                    </Form.Item>

                    {question.options?.map((option, oIndex) => (
                      <Form.Item
                        key={oIndex}
                        label={`Opsi ${oIndex + 1}`}
                        required
                      >
                        <Input
                          placeholder={`Masukkan opsi ${oIndex + 1}`}
                          value={option}
                          onChange={(e) =>
                            handleOptionChange(qIndex, oIndex, e.target.value)
                          }
                        />
                      </Form.Item>
                    ))}

                    <Form.Item label="Jawaban Benar">
                      <Radio.Group
                        onChange={(e) =>
                          handleCorrectAnswerChange(qIndex, e.target.value)
                        }
                        value={question.correctAnswer}
                      >
                        {question.options?.map((option, oIndex) => (
                          <Radio key={oIndex} value={option}>
                            {option}
                          </Radio>
                        ))}
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                ))}
              </Row>
            </>
          )}

          <Form.Item>
            <Button
              type="primary"
              style={{ width: "100%" }}
              htmlType="submit"
              loading={loading}
            >
              {selectedQuestionId ? "Update" : "Submit"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
