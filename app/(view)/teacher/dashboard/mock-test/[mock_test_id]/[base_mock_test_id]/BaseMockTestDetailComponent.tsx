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
    handleDeleteQuestion,
    selectedQuestion,
    setOptions,
    editType,
  } = useBaseViewModel();

  // Skeleton Loading
  if (baseDetailDataLoading)
    return (
      <div style={{ padding: "20px" }}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );

    const showConfirmDelete = (id: string) => {
      Modal.confirm({
        title: "Hapus Data",
        content: "Apakah Anda yakin ingin menghapus data ini?",
        okText: "Ya",
        okType: "danger",
        cancelText: "Tidak",
        onOk: () => handleDeleteQuestion(id),
      });
    };

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
        {baseDetailData.data.type === "READING" &&
          baseDetailData.data.reading === null && (
            <Button type="primary" onClick={() => handleOpenModal("reading")}>
              Tambah Soal Reading
            </Button>
          )}
        {baseDetailData.data.type === "LISTENING" &&
          baseDetailData.data.listening === null && (
            <Button type="primary" onClick={() => handleOpenModal("listening")}>
              Tambah Soal Listening
            </Button>
          )}
        {baseDetailData.data.type === "SPEAKING" &&
          baseDetailData.data.speaking === null && (
            <Button type="primary" onClick={() => handleOpenModal("speaking")}>
              Tambah Soal Speaking
            </Button>
          )}
        {baseDetailData.data.type === "WRITING" &&
          baseDetailData.data.writing === null && (
            <Button type="primary" onClick={() => handleOpenModal("writing")}>
              Tambah Soal Writing
            </Button>
          )}
      </Flex>

      {baseDetailData.data.type === "READING" ? (
        baseDetailData.data.reading ? (
          <ReadingMockTestComponent
            data={baseDetailData.data.reading}
            onAddQuestion={() => handleOpenModal("reading", "addQuestionMore")}
            onEditQuestion={(questionId) =>
              handleOpenModal("reading", "question", questionId)
            }
            onDeleteQuestion={(id) => showConfirmDelete(id)}
            onEditPassage={(id) =>
              handleOpenModal("reading", "passage", null, id)
            }
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
            onAddQuestion={() =>
              handleOpenModal("listening", "addQuestionMore")
            }
            onEditQuestion={(questionId) =>
              handleOpenModal("listening", "question", questionId)
            }
            onDeleteQuestion={(id) => showConfirmDelete(id)}
            onEditAudio={(id) =>
              handleOpenModal("listening", "audio", null, id)
            }
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
            onEdit={(id) =>
              handleOpenModal("speaking", "editSpeaking", null, id)
            }
            onDelete={(id) => showConfirmDelete(id)}
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
            onAddQuestion={() => handleOpenModal("writing", "addQuestionMore")}
            onEditQuestion={(questionId) =>
              handleOpenModal("writing", "question", questionId)
            }
            onDeleteQuestion={(id) => showConfirmDelete(id)}
            onEditPrompt={(id) =>
              handleOpenModal("writing", "prompt", null, id)
            }
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
          {formType === "writing" &&
            selectedQuestion == null &&
            editType == null && (
              <Form.Item
                name="prompt"
                rules={[{ required: true, message: "Prompt wajib diisi!" }]}
              >
                <Input.TextArea placeholder="Masukkan prompt soal writing" />
              </Form.Item>
            )}

          {formType === "listening" &&
            selectedQuestion == null &&
            editType == null && (
              <Form.Item
                name="audio_url"
                rules={[{ required: true, message: "URL Audio wajib diisi!" }]}
              >
                <Input placeholder="Masukkan URL Audio Listening" />
              </Form.Item>
            )}

          {formType === "reading" &&
            selectedQuestion == null &&
            editType == null && (
              <Form.Item
                name="passage"
                rules={[{ required: true, message: "Passage wajib diisi!" }]}
              >
                <Input.TextArea placeholder="Masukkan passage soal reading" />
              </Form.Item>
            )}

          {formType === "speaking" && editType === null && (
            <Form.Item
              name="prompt"
              rules={[{ required: true, message: "Prompt wajib diisi!" }]}
            >
              <Input.TextArea placeholder="Masukkan prompt soal speaking" />
            </Form.Item>
          )}

          {formType === "speaking" && editType === "editSpeaking" && (
            <Form.Item
              name="prompt"
              rules={[{ required: true, message: "Prompt wajib diisi!" }]}
            >
              <Input.TextArea placeholder="Masukkan prompt soal speaking" />
            </Form.Item>
          )}

          {/* Input Jumlah Soal untuk Writing, Reading, dan Listening */}
          {formType !== "speaking" &&
            selectedQuestion == null &&
            editType == null && (
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

          {formType !== "speaking" &&
            selectedQuestion == null &&
            editType == null &&
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

          {/* Input Soal dan Pilihan Ganda untuk Writing, Reading, dan Listening */}
          {formType !== "speaking" &&
            selectedQuestion == null &&
            editType == "addQuestionMore" &&
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

          {selectedQuestion !== null &&
            formType !== "speaking" &&
            editType == "question" && (
              <>
                <h4>Soal</h4>
                <Form.Item
                  name="question"
                  rules={[{ required: true, message: "Soal wajib diisi!" }]}
                >
                  <Input.TextArea placeholder="Masukkan soal" />
                </Form.Item>
                <h4>Pilihan Ganda</h4>
                {options[0] && options[0].length > 0 ? (
                  options[0].map((option, optIndex) => (
                    <Space
                      key={optIndex}
                      style={{ display: "flex", marginBottom: "8px" }}
                    >
                      <Form.Item
                        name={`option_${optIndex}`}
                        rules={[
                          { required: true, message: "Opsi wajib diisi!" },
                        ]}
                        style={{ flex: 1 }}
                      >
                        <Input
                          placeholder={`Pilihan ${optIndex + 1}`}
                          value={option}
                          onChange={(e) =>
                            setOptions((prev) => ({
                              ...prev,
                              [0]: prev[0].map((opt, i) =>
                                i === optIndex ? e.target.value : opt
                              ),
                            }))
                          }
                        />
                      </Form.Item>
                      <Button
                        type="text"
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => handleRemoveOption(0, optIndex)}
                      />
                    </Space>
                  ))
                ) : (
                  <p style={{ color: "gray" }}>
                    Belum ada opsi. Tambahkan opsi baru.
                  </p>
                )}

                {/* Jika tidak ada kondisi yang cocok, modal akan kosong */}
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => handleAddOption(0)}
                  style={{ width: "100%", marginBottom: "10px" }}
                >
                  Tambah Opsi
                </Button>
                <Form.Item label="Jawaban Benar">
                  <Radio.Group
                    value={correctAnswers[0]}
                    onChange={(e) =>
                      handleCorrectAnswerChange(0, e.target.value)
                    }
                  >
                    {options[0]?.map((option, optIndex) => (
                      <Radio key={optIndex} value={option}>
                        {option}
                      </Radio>
                    ))}
                  </Radio.Group>
                </Form.Item>
              </>
            )}

          {editType === "prompt" ? (
            // ✅ Jika editType === "prompt", hanya tampilkan form prompt
            <Form.Item
              name="prompt"
              rules={[{ required: true, message: "Prompt wajib diisi!" }]}
            >
              <Input.TextArea placeholder="Masukkan prompt soal writing" />
            </Form.Item>
          ) : editType === "passage" ? (
            // ✅ Jika editType === "passage", hanya tampilkan form passage
            <Form.Item
              name="passage"
              rules={[{ required: true, message: "Passage wajib diisi!" }]}
            >
              <Input.TextArea placeholder="Masukkan passage soal reading" />
            </Form.Item>
          ) : editType === "audio" ? (
            // ✅ Jika editType === "audio", hanya tampilkan form audio
            <Form.Item
              name="audio_url"
              rules={[{ required: true, message: "URL Audio wajib diisi!" }]}
            >
              <Input placeholder="Masukkan URL Audio Listening" />
            </Form.Item>
          ) : null}
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
