"use client";

import React from "react";
import {
  Form,
  Input,
  Button,
  Select,
  message,
  Modal,
  Radio,
  InputNumber,
  Flex,
  Divider,
  FloatButton,
  Drawer,
  List,
  Tooltip,
} from "antd";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import MultipleChoiceTeacherDisplay from "@/app/components/MultipleChoiceTeacherDisplay";
import CustomAlert from "@/app/components/CustomAlert";
import Title from "antd/es/typography/Title";
import Loading from "@/app/components/Loading";
import Icon from "@ant-design/icons";
import { AddIcon, EditIcon, SettingIcon } from "@/app/components/Icon";
import { formatAssignmentType } from "@/app/lib/utils/formatAssigmentName";
import { useAssignmentViewModel } from "./useAssignmentViewModel";

const { Option } = Select;

export default function Assignment() {
  const {
    assigment,
    name,
    selectedAssignment,
    isModalVisible,
    isModalDescription,
    isModalTimeLimit,
    isDrawerVisible,
    loading,
    loadingDescription,
    loadingTimeLimit,
    form,
    questions,
    pairs,
    content,
    description,
    timeLimit,
    assignmentType,
    currentAssignmentType,
    selectedMcqId,
    onFinishTimeLimit,
    onFinishDescription,
    handleDrawerClose,
    openDrawerWithDetails,
    onFinish,
    setCurrentAssignmentId,
    setCurrentAssignmentTimeLimit,
    setCurrentAssignmentType,
    setCurrentAssignmentDescription,
    currentAssignmentId,
    questionCount,
    handleCancel,
    handleCancelDescription,
    handleCancelTimeLimit,
    handleQuestionCountChange,
    handleQuestionChange,
    handleOptionChange,
    addOption,
    handleCorrectAnswerChange,
    handlePairChange,
    addPair,
    handleUpdateDescription,
    handleUpdateTimeLimit,
    handleDelete,
    setSelectedMcqId,
    setIsModalVisible,
    setSelectedMultipleChoice,
    selectedMultipleChoice,
    setContent,
    setAssignmentType,
    setDescription,
    setTimeLimit
  } = useAssignmentViewModel();

  const renderAssignment = () => {
    if (!assigment) {
      return <Loading />;
    }

    return assigment!.data!.length > 0 ? (
      assigment!.data!.map((assignment: any) => {
        if (assignment.typeData.type === "MULTIPLE_CHOICE") {
          return (
            <MultipleChoiceTeacherDisplay
              key={assignment.assignment_id}
              data={assignment.typeData.details.map((detail: any) => ({
                mcq_id: detail.mcq_id,
                question: detail.question,
                options: detail.options,
                correctAnswer: detail.correctAnswer,
              }))}
              onEdit={(mcq_id: string) => {
                setSelectedMcqId(mcq_id);
                setIsModalVisible(true);
                const selectedMultipleChoice = assignment.typeData.details.find(
                  (detail: any) => detail.mcq_id === mcq_id
                );

                if (selectedMultipleChoice) {
                  setSelectedMultipleChoice(selectedMultipleChoice);

                  form.setFieldsValue({
                    question: selectedMultipleChoice.question,
                    options: selectedMultipleChoice.options,
                    correctAnswer: selectedMultipleChoice.correctAnswer,
                  });
                }
              }}
              onDelete={(mcq_id: string) => {
                handleDelete(mcq_id);
              }}
            />
          );
        }
        return null;
      })
    ) : (
      <CustomAlert type="info" message="Belum Ada Assigment" />
    );
  };

  return (
    <div>
      <Flex justify="space-between">
        <Title level={3}>{name}</Title>
        {assigment && assigment.data && assigment.data.length === 0 && (
          <Button type="primary" onClick={() => setIsModalVisible(true)}>
            Buat Assigment
          </Button>
        )}
      </Flex>
      <Divider />
      <Modal
        title={
          currentAssignmentId
            ? "Tambah Pertanyaan Assignment"
            : selectedMcqId
            ? "Edit Pertanyaan Assignment"
            : "Buat Assignment"
        }
        open={isModalVisible}
        footer={null}
        onCancel={handleCancel}
        width={800}
      >
        <Form
          form={form}
          name="createAssignment"
          onFinish={onFinish}
          layout="vertical"
          autoComplete="off"
        >
          {currentAssignmentId ? (
            <>
              {currentAssignmentType === "MULTIPLE_CHOICE" && (
                <>
                  <Form.Item
                    label="Jumlah Soal"
                    rules={[
                      {
                        required: true,
                        message: "Silakan masukkan jumlah soal",
                      },
                    ]}
                  >
                    <Input
                      type="number"
                      placeholder="Masukkan jumlah soal"
                      min={1}
                      value={questionCount}
                      onChange={(e) =>
                        handleQuestionCountChange(Number(e.target.value))
                      }
                    />
                  </Form.Item>

                  {questions.map((question, qIndex) => (
                    <div key={qIndex} style={{ marginBottom: "20px" }}>
                      <Form.Item
                        label={`Pertanyaan ${qIndex + 1}`}
                        required
                        validateStatus={question.question ? "success" : "error"}
                        help={
                          !question.question && "Pertanyaan tidak boleh kosong"
                        }
                      >
                        <ReactQuill
                          theme="snow"
                          value={question.question}
                          onChange={(value) =>
                            handleQuestionChange(qIndex, "question", value)
                          }
                          placeholder={`Masukkan pertanyaan ${qIndex + 1}`}
                        />
                      </Form.Item>

                      {question.options.map((option, oIndex) => (
                        <Form.Item
                          key={oIndex}
                          label={`Opsi ${oIndex + 1}`}
                          required
                          validateStatus={option ? "success" : "error"}
                          help={!option && "Opsi tidak boleh kosong"}
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

                      <Button
                        type="dashed"
                        onClick={() => addOption(qIndex)}
                        style={{ marginBottom: "16px" }}
                      >
                        Tambahkan Opsi
                      </Button>

                      <Form.Item label={`Jawaban yang Benar ${qIndex + 1}`}>
                        <Radio.Group
                          onChange={(e) =>
                            handleCorrectAnswerChange(qIndex, e.target.value)
                          }
                          value={questions[qIndex].correctAnswer}
                        >
                          {question.options.map((option, oIndex) => (
                            <Radio
                              key={oIndex}
                              value={option}
                              style={{ display: "block" }}
                            >
                              {option}
                            </Radio>
                          ))}
                        </Radio.Group>
                      </Form.Item>
                    </div>
                  ))}
                </>
              )}
            </>
          ) : selectedMcqId ? (
            <>
              <Form.Item label="Pertanyaan">
                <ReactQuill
                  theme="snow"
                  value={selectedMultipleChoice.question}
                  onChange={(value) =>
                    setSelectedMultipleChoice({
                      ...selectedMultipleChoice,
                      question: value,
                    })
                  }
                />
              </Form.Item>

              {selectedMultipleChoice.options.map(
                (option: string, oIndex: number) => (
                  <Form.Item key={oIndex} label={`Opsi ${oIndex + 1}`}>
                    <Input
                      value={option}
                      onChange={(e) => {
                        const updatedOptions = [
                          ...selectedMultipleChoice.options,
                        ];
                        updatedOptions[oIndex] = e.target.value;
                        setSelectedMultipleChoice({
                          ...selectedMultipleChoice,
                          options: updatedOptions,
                        });
                      }}
                    />
                  </Form.Item>
                )
              )}

              <Form.Item label="Jawaban yang Benar">
                <Radio.Group
                  value={selectedMultipleChoice.correctAnswer}
                  onChange={(e) =>
                    setSelectedMultipleChoice({
                      ...selectedMultipleChoice,
                      correctAnswer: e.target.value,
                    })
                  }
                >
                  {selectedMultipleChoice.options.map(
                    (option: string, oIndex: number) => (
                      <Radio key={oIndex} value={option}>
                        {option}
                      </Radio>
                    )
                  )}
                </Radio.Group>
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item
                name="description"
                rules={[
                  { required: true, message: "Silakan masukkan deskripsi" },
                ]}
              >
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  placeholder="Masukkan deskripsi assignment"
                />
              </Form.Item>
              <Form.Item
                name="timeLimit"
                rules={[{ required: true, message: "Silakan masukkan waktu" }]}
              >
                <InputNumber
                  placeholder="Masukkan waktu dalam menit"
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item
                name="type"
                rules={[
                  { required: true, message: "Silakan pilih jenis assignment" },
                ]}
              >
                <Select
                  placeholder="Pilih jenis assignment"
                  onChange={(value) => setAssignmentType(value)}
                >
                  <Option value="MULTIPLE_CHOICE">Pilihan Ganda</Option>
                  <Option value="ESSAY">Esai</Option>
                  <Option value="SENTENCE_MATCHING">Pencocokan Kalimat</Option>
                </Select>
              </Form.Item>

              {assignmentType === "MULTIPLE_CHOICE" && (
                <>
                  <Form.Item
                    label="Jumlah Soal"
                    rules={[
                      {
                        required: true,
                        message: "Silakan masukkan jumlah soal",
                      },
                    ]}
                  >
                    <Input
                      type="number"
                      placeholder="Masukkan jumlah soal"
                      min={1}
                      value={questionCount}
                      onChange={(e) =>
                        handleQuestionCountChange(Number(e.target.value))
                      }
                    />
                  </Form.Item>

                  {questions.map((question, qIndex) => (
                    <div key={qIndex} style={{ marginBottom: "20px" }}>
                      <Form.Item
                        label={`Pertanyaan ${qIndex + 1}`}
                        required
                        validateStatus={question.question ? "success" : "error"}
                        help={
                          !question.question && "Pertanyaan tidak boleh kosong"
                        }
                      >
                        <ReactQuill
                          theme="snow"
                          value={question.question}
                          onChange={(value) =>
                            handleQuestionChange(qIndex, "question", value)
                          }
                          placeholder={`Masukkan pertanyaan ${qIndex + 1}`}
                        />
                      </Form.Item>

                      {question.options.map((option, oIndex) => (
                        <Form.Item
                          key={oIndex}
                          label={`Opsi ${oIndex + 1}`}
                          required
                          validateStatus={option ? "success" : "error"}
                          help={!option && "Opsi tidak boleh kosong"}
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

                      <Button
                        type="dashed"
                        onClick={() => addOption(qIndex)}
                        style={{ marginBottom: "16px" }}
                      >
                        Tambahkan Opsi
                      </Button>

                      <Form.Item label={`Jawaban yang Benar ${qIndex + 1}`}>
                        <Radio.Group
                          onChange={(e) =>
                            handleCorrectAnswerChange(qIndex, e.target.value)
                          }
                          value={questions[qIndex].correctAnswer}
                        >
                          {question.options.map((option, oIndex) => (
                            <Radio
                              key={oIndex}
                              value={option}
                              style={{ display: "block" }}
                            >
                              {option}
                            </Radio>
                          ))}
                        </Radio.Group>
                      </Form.Item>
                    </div>
                  ))}
                </>
              )}

              {assignmentType === "ESSAY" && (
                <Form.Item
                  label="Pertanyaan Esai"
                  required
                  validateStatus={content ? "success" : "error"}
                  help={!content && "Pertanyaan esai tidak boleh kosong"}
                >
                  <ReactQuill
                    value={content}
                    onChange={setContent}
                    theme="snow"
                    placeholder="Tulis pertanyaan esai di sini..."
                  />
                </Form.Item>
              )}

              {assignmentType === "SENTENCE_MATCHING" && (
                <>
                  {pairs.map((pair, index) => (
                    <div key={index} style={{ marginBottom: "20px" }}>
                      <Form.Item
                        label={`Pertanyaan ${index + 1}`}
                        required
                        validateStatus={pair.question ? "success" : "error"}
                        help={!pair.question && "Pertanyaan tidak boleh kosong"}
                      >
                        <Input
                          placeholder={`Masukkan pertanyaan ${index + 1}`}
                          value={pair.question}
                          onChange={(e) =>
                            handlePairChange(index, "question", e.target.value)
                          }
                        />
                      </Form.Item>
                      <Form.Item
                        label={`Jawaban yang Benar ${index + 1}`}
                        required
                        validateStatus={
                          pair.correctAnswer ? "success" : "error"
                        }
                        help={
                          !pair.correctAnswer && "Jawaban tidak boleh kosong"
                        }
                      >
                        <Input
                          placeholder={`Masukkan jawaban yang benar ${
                            index + 1
                          }`}
                          value={pair.correctAnswer}
                          onChange={(e) =>
                            handlePairChange(
                              index,
                              "correctAnswer",
                              e.target.value
                            )
                          }
                        />
                      </Form.Item>
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    onClick={addPair}
                    style={{ marginBottom: "16px" }}
                  >
                    Tambahkan Pasangan Pertanyaan
                  </Button>
                </>
              )}
            </>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <FloatButton.Group
        tooltip="Tambahan"
        trigger="click"
        icon={<Icon component={SettingIcon} />}
        style={{ right: 24 }}
      >
        <FloatButton
          tooltip="Informasi Detail"
          onClick={() => {
            if (assigment && assigment.data && assigment.data.length > 0) {
              openDrawerWithDetails(assigment.data[0]);
            } else {
              message.info("Tidak ada data assignment untuk ditampilkan.");
            }
          }}
        />

        <FloatButton
          tooltip="Tambahkan Pertanyaan"
          icon={<Icon component={AddIcon} />}
          onClick={() => {
            if (assigment && assigment.data && assigment.data.length > 0) {
              const firstAssignment = assigment.data[0];
              setCurrentAssignmentType(firstAssignment.typeData.type);
              setCurrentAssignmentDescription(firstAssignment.description);
              setCurrentAssignmentTimeLimit(firstAssignment.timeLimit);
              setCurrentAssignmentId(firstAssignment.assignment_id);
              setIsModalVisible(true);
            } else {
              message.info(
                "Tidak ada data assignment untuk menambahkan pertanyaan."
              );
            }
          }}
        />
      </FloatButton.Group>
      <Drawer
        title="Detail Assignment"
        placement="right"
        closable={true}
        onClose={handleDrawerClose}
        open={isDrawerVisible}
        width={500}
      >
        {assigment &&
        assigment.data &&
        assigment.data.length > 0 &&
        selectedAssignment ? (
          <List
            bordered
            dataSource={[
              {
                label: "Deskripsi",
                value: (
                  <>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: selectedAssignment.description,
                      }}
                    ></div>
                    <Divider />
                    <Flex justify="end" style={{ marginTop: 20 }}>
                      <Tooltip title="Edit">
                        <Button
                          type="primary"
                          onClick={() =>
                            handleUpdateDescription(
                              selectedAssignment.assignment_id
                            )
                          }
                        >
                          <Icon component={EditIcon} />
                        </Button>
                      </Tooltip>
                    </Flex>
                  </>
                ),
              },
              {
                label: "Waktu Pengerjaan",
                value: (
                  <>
                    {selectedAssignment.timeLimit} Menit
                    <Divider />
                    <Flex justify="end" style={{ marginTop: 20 }}>
                      <Tooltip title="Edit">
                        <Button
                          type="primary"
                          onClick={() =>
                            handleUpdateTimeLimit(
                              selectedAssignment.assignment_id
                            )
                          }
                        >
                          <Icon component={EditIcon} />
                        </Button>
                      </Tooltip>
                    </Flex>
                  </>
                ),
              },
              {
                label: "Tipe",
                value: formatAssignmentType(selectedAssignment.typeData.type),
              },
            ]}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={<strong>{item.label}</strong>}
                  description={item.value}
                />
              </List.Item>
            )}
          />
        ) : (
          <CustomAlert
            type="info"
            message="Tidak ada data untuk ditampilkan di drawer."
          />
        )}
      </Drawer>
      <Modal
        open={isModalDescription}
        title="Update Deskripsi"
        footer={null}
        onCancel={handleCancelDescription}
      >
        <Form
          form={form}
          name="updateDescription"
          onFinish={onFinishDescription}
          layout="vertical"
          autoComplete="off"
        >
          <ReactQuill
            theme="snow"
            value={description}
            onChange={(value) => setDescription(value)}
            placeholder="Masukkan deskripsi"
          />
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ marginTop: 20 }}
              loading={loadingDescription}
            >
              Simpan
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        open={isModalTimeLimit}
        title="Update Waktu Pengerjaan"
        footer={null}
        onCancel={handleCancelTimeLimit}
      >
        <Form
          form={form}
          name="updateTimeLimit"
          onFinish={onFinishTimeLimit}
          layout="vertical"
          autoComplete="off"
          initialValues={{
            timeLimit,
          }}
        >
          <Form.Item
            name="timeLimit"
            rules={[{ required: true, message: "Silakan masukkan waktu" }]}
          >
            <InputNumber
              placeholder="Masukkan waktu dalam menit"
              value={timeLimit}
              onChange={(value) => setTimeLimit(value!)}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loadingTimeLimit}>
              Simpan
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <div>{renderAssignment()}</div>
    </div>
  );
}
