import { useParams } from "next/navigation";
import { useBaseViewModel } from "./useBaseViewModel";
import ReadingMockTestComponent from "@/app/components/ReadingComponentMockTest";
import ListeningMockTestComponent from "@/app/components/ListeningMockTestComponent";
import SpeakingMockTestComponent from "@/app/components/SpeakingMockTestComponent";
import WritingMockTestComponent from "@/app/components/WritingComponentMockTest";
import {
  Skeleton,
  Alert,
  Flex,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Radio,
  Space,
} from "antd";
import { useState } from "react";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";

export default function BaseMockTestDetailComponent() {
  const query = useParams();
  const base_id = query.base_mock_test_id;
  const {
    baseDetailData,
    baseDetailDataLoading,
    handleOpenModal,
    handleCloseModal,
    isModalOpen,
    formType,
    form,
    questionCount,
    handleQuestionCountChange,
    handleAddOption,
    handleRemoveOption,
    handleOptionChange,
    handleCorrectAnswerChange,
    handleSubmit,
    options,
    correctAnswers,
    loading,
    handleAddQuestion,
    handleEditQuestion,
    handleDeleteQuestion,
    selectedQuestion,
    showQuestionForm,
  } = useBaseViewModel();

  // Skeleton Loading
  if (baseDetailDataLoading)
    return (
      <div style={{ padding: "20px" }}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );

  // Alert jika tidak ada data sama sekali
  if (!baseDetailData)
    return (
      <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
        <Alert
          message="No Data Available"
          description="The requested mock test data is not available."
          type="warning"
          showIcon
        />
      </div>
    );

  return (
    <div>
      <Flex justify="end" align="center" style={{ marginBottom: 16 }}>
        {baseDetailData.data.type === "READING" && (
          <Button type="primary" onClick={() => handleOpenModal("reading")}>
            Tambah Soal Reading
          </Button>
        )}
        {baseDetailData.data.type === "LISTENING" && (
          <Button type="primary" onClick={() => handleOpenModal("listening")}>
            Tambah Soal Listening
          </Button>
        )}
        {baseDetailData.data.type === "SPEAKING" && (
          <Button type="primary" onClick={() => handleOpenModal("speaking")}>
            Tambah Soal Speaking
          </Button>
        )}
        {baseDetailData.data.type === "WRITING" && (
          <Button type="primary" onClick={() => handleOpenModal("writing")}>
            Tambah Soal Writing
          </Button>
        )}
      </Flex>

      {baseDetailData.data.type === "READING" ? (
        baseDetailData.data.reading ? (
          <ReadingMockTestComponent
            data={baseDetailData.data.reading}
            onAddQuestion={() => handleOpenModal("reading")}
            onEditQuestion={(question) => handleOpenModal("reading", question)}
            onDeleteQuestion={handleDeleteQuestion}
            onEditPassage={(id) => console.log("Edit Passage:", id)}
          />
        ) : (
          <Alert
            message="Tidak Ada Data Ujian Reading"
            description="Ujian simulasi ini tidak memiliki data Reading."
            type="info"
            showIcon
            style={{ marginBottom: "16px" }}
          />
        )
      ) : null}

      {baseDetailData.data.type === "LISTENING" ? (
        baseDetailData.data.listening ? (
          <ListeningMockTestComponent
            data={baseDetailData.data.listening}
            onAddQuestion={() => console.log("Add Question")}
            onDeleteQuestion={(id) => console.log("Delete Question:", id)}
            onEditAudio={(id) => console.log("Edit Audio:", id)}
            onEditQuestion={(id) => console.log("Edit Question:", id)}
          />
        ) : (
          <Alert
            message="Tidak Ada Data Ujian Listening"
            description="Ujian simulasi ini tidak memiliki data listening."
            type="info"
            showIcon
            style={{ marginBottom: "16px" }}
          />
        )
      ) : null}

      {baseDetailData.data.type === "SPEAKING" ? (
        baseDetailData.data.speaking ? (
          <SpeakingMockTestComponent
            data={baseDetailData.data.speaking}
            onEdit={(id) => console.log("Edit Speaking:", id)}
            onDelete={(id) => console.log("Delete Speaking:", id)}
          />
        ) : (
          <Alert
            message="Tidak Ada Data Ujian Speaking"
            description="Ujian simulasi ini tidak memiliki data speaking."
            type="info"
            showIcon
            style={{ marginBottom: "16px" }}
          />
        )
      ) : null}

      {baseDetailData.data.type === "WRITING" ? (
        baseDetailData.data.writing ? (
          <WritingMockTestComponent
            data={baseDetailData.data.writing}
            onAddQuestion={() => console.log("Add Question")}
            onDeleteQuestion={(id) => console.log("Delete Question:", id)}
            onEditPrompt={(id) => console.log("Edit Prompt:", id)}
            onEditQuestion={(id) => console.log("Edit Question:", id)}
          />
        ) : (
          <Alert
            message="Tidak Ada Data Writing"
            description="Ujian simulasi ini tidak memiliki data writing."
            type="info"
            showIcon
            style={{ marginBottom: "16px" }}
          />
        )
      ) : null}

      <Modal
        title={
          selectedQuestion
            ? `Edit Soal ${formType?.toUpperCase()}`
            : `Tambah Soal ${formType?.toUpperCase()}`
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Hidden Input untuk Mock Test ID */}
          <Form.Item
            name="mock_test_id"
            initialValue={baseDetailData.data.mock_test_id}
            hidden
          >
            <Input />
          </Form.Item>

          {/* Hidden Input untuk Type */}
          <Form.Item name="type" initialValue={formType} hidden>
            <Input />
          </Form.Item>

          {/* Form Sesuai Section */}
          {formType === "writing" && (
            <Form.Item
              name="prompt"
              rules={[{ required: true, message: "Prompt wajib diisi!" }]}
            >
              <Input.TextArea placeholder="Masukkan prompt soal writing" />
            </Form.Item>
          )}

          {formType === "listening" && (
            <Form.Item
              name="audio_url"
              rules={[{ required: true, message: "URL Audio wajib diisi!" }]}
            >
              <Input placeholder="Masukkan URL Audio Listening" />
            </Form.Item>
          )}

          {formType === "reading" && (
            <Form.Item
              name="passage"
              rules={[{ required: true, message: "Passage wajib diisi!" }]}
            >
              <Input.TextArea placeholder="Masukkan passage soal reading" />
            </Form.Item>
          )}

          {formType === "speaking" && (
            <Form.Item
              name="prompt"
              rules={[{ required: true, message: "Prompt wajib diisi!" }]}
            >
              <Input.TextArea placeholder="Masukkan prompt soal speaking" />
            </Form.Item>
          )}

          {/* Input Jumlah Soal untuk Writing, Reading, dan Listening */}
          {formType !== "speaking" && (
            <Form.Item label="Jumlah Soal">
              <InputNumber
                min={1}
                max={10}
                value={questionCount}
                onChange={(value) => handleQuestionCountChange(value || 1)}
                style={{ width: "100%" }}
              />
            </Form.Item>
          )}

          {/* Input Soal dan Pilihan Ganda untuk Writing, Reading, dan Listening */}
          {formType !== "speaking" &&
            Array.from({ length: questionCount }).map((_, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "16px",
                  padding: "10px",
                  border: "1px solid #d9d9d9",
                  borderRadius: "8px",
                }}
              >
                <h4>Soal {index + 1}</h4>

                <Form.Item
                  name={`question_${index}`}
                  rules={[{ required: true, message: "Soal wajib diisi!" }]}
                >
                  <Input.TextArea placeholder={`Masukkan soal ${index + 1}`} />
                </Form.Item>

                {/* Pilihan Ganda */}
                <h4>Pilihan Ganda</h4>
                {(options[index] || []).map((option, optIndex) => (
                  <Space
                    key={optIndex}
                    style={{ display: "flex", marginBottom: "8px" }}
                  >
                    <Form.Item
                      name={`option_${index}_${optIndex}`}
                      rules={[{ required: true, message: "Opsi wajib diisi!" }]}
                      style={{ flex: 1 }}
                    >
                      <Input
                        placeholder={`Pilihan ${optIndex + 1}`}
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(index, optIndex, e.target.value)
                        }
                      />
                    </Form.Item>
                    <Button
                      type="text"
                      danger
                      icon={<MinusCircleOutlined />}
                      onClick={() => handleRemoveOption(index, optIndex)}
                    />
                  </Space>
                ))}

                {/* Tombol Tambah Opsi */}
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => handleAddOption(index)}
                  style={{ width: "100%", marginBottom: "10px" }}
                >
                  Tambah Opsi
                </Button>

                {/* Pilih Jawaban Benar */}
                <Form.Item label="Jawaban Benar">
                  <Radio.Group
                    value={correctAnswers[index]}
                    onChange={(e) =>
                      handleCorrectAnswerChange(index, e.target.value)
                    }
                  >
                    {(options[index] || []).map((option, optIndex) => (
                      <Radio key={optIndex} value={option}>
                        {option}
                      </Radio>
                    ))}
                  </Radio.Group>
                </Form.Item>
              </div>
            ))}


          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ width: "100%" }}
              loading={loading}
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
