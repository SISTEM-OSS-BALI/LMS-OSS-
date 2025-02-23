import { crudService } from "@/app/lib/services/crudServices";
import { fetcher } from "@/app/lib/utils/fetcher";
import {
  MultipleChoicePlacementTest,
  TrueFalseGroupPlacementTest,
  TrueFalseQuestion,
  WritingPlacementTest,
} from "@prisma/client";
import { Form, message, Modal, notification } from "antd";
import { useParams } from "next/navigation";
import { useState } from "react";
import useSWR, { mutate } from "swr";

export const useBasePlacementDetailViewModel = () => {
  const params = useParams();
  const { base_id, placement_test_id } = params;
  const {
    data: basePlacementDetail,
    error,
    isLoading,
    mutate: mutateBasePlacementDetail,
  } = useSWR(
    `/api/teacher/placementTest/${placement_test_id}/${base_id}/showBase`,
    fetcher
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formType, setFormType] = useState<
    "multipleChoice" | "writing" | "reading" | null
  >(null);
  const [form] = Form.useForm();

  const [questionCount, setQuestionCount] = useState(1);
  const [questions, setQuestions] = useState<
    { question: string; options?: string[]; correctAnswer?: string | boolean }[]
  >([]);
  const [passage, setPassage] = useState(""); // State untuk passage (Reading)
  const [loading, setLoading] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null
  );
  const [editType, setEditType] = useState<
    "passage" | "question" | "addQuestionMore" | null
  >(null);

  const handleAddQuestion = () => {
    if (basePlacementDetail?.data.name.name == "MULTIPLE_CHOICE") {
      setFormType("multipleChoice");
    } else if (basePlacementDetail?.data.name.name == "WRITING") {
      setFormType("writing");
    } else if (basePlacementDetail?.data.name.name == "READING") {
      setFormType("reading");
    }
    setQuestions([]);
    setQuestionCount(0);
    setPassage("");
    setIsModalOpen(true);
  };

  // Fungsi menangani perubahan jumlah soal
  const handleQuestionCountChange = (count: number) => {
    setQuestionCount(count);
    setQuestions(
      Array.from({ length: count }, () => ({
        question: "",
        options: formType === "multipleChoice" ? ["", "", "", ""] : undefined, // Default 4 opsi untuk Multiple Choice
        correctAnswer: formType === "reading" ? true : "",
      }))
    );
  };

  // Fungsi menangani perubahan pertanyaan

  // Fungsi menangani perubahan jawaban benar
  const handleCorrectAnswerChange = (qIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctAnswer = value;
    setQuestions(newQuestions);
  };

  // Fungsi menangani perubahan opsi jawaban (Multiple Choice)
  const handleOptionChange = (
    qIndex: number,
    oIndex: number,
    value: string
  ) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options![oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleQuestionChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const handleCancelModal = () => {
    setIsModalOpen(false);
    setFormType(null);
    setSelectedQuestionId(null);
    form.resetFields();
  };

  const handleEditQuestion = (
    groupId: string,
    type: "multipleChoice" | "writing" | "reading",
    editType: "passage" | "question" | "addQuestionMore" | null = null,
    tfId?: string
  ) => {
    setSelectedQuestionId(tfId || groupId);
    setFormType(type);
    setEditType(editType);
    setIsModalOpen(true);

    let selectedQuestion = null;

    if (type === "multipleChoice") {
      selectedQuestion = basePlacementDetail?.data.multipleChoice.find(
        (q: MultipleChoicePlacementTest) => q.mc_id === groupId
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
    } else if (type === "writing") {
      selectedQuestion = basePlacementDetail?.data.writing.find(
        (q: WritingPlacementTest) => q.writing_id === groupId
      );
      if (selectedQuestion) {
        form.setFieldsValue({ questions: selectedQuestion.question });
      }
    } else if (type === "reading") {
      selectedQuestion = basePlacementDetail?.data.trueFalse.find(
        (q: TrueFalseGroupPlacementTest) => q.group_id === groupId
      );

      if (selectedQuestion) {
        if (editType === "passage") {
          setPassage(selectedQuestion.passage);
          setQuestions([]);
        } else if (editType === "question" && tfId) {
          setPassage("");
          const selectedTfQuestion = selectedQuestion.trueFalseQuestions.find(
            (q: TrueFalseQuestion) => q.tf_id === tfId
          );
          if (selectedTfQuestion) {
            setQuestions([
              {
                question: selectedTfQuestion.question,
                correctAnswer: selectedTfQuestion.correctAnswer,
              },
            ]);
          }
        } else if (editType === "addQuestionMore") {
          setPassage("");
          setQuestions([]);
          setQuestionCount(1);
        }
      }
    }
  };

  // Fungsi submit form
  const handleFormSubmit = async () => {
    setLoading(true);
    try {
      let payload = {};

      if (formType === "multipleChoice") {
        payload = {
          type: "multipleChoice",
          basePlacementTestId: base_id,
          ...(selectedQuestionId
            ? {
                question: questions[0].question,
                options: questions[0].options,
                correctAnswer: questions[0].correctAnswer,
              }
            : {
                questions: questions.map((q) => ({
                  question: q.question,
                  options: q.options,
                  correctAnswer: q.correctAnswer,
                })),
              }),
        };
      } else if (formType === "writing") {
        payload = {
          type: "writing",
          basePlacementTestId: base_id,
          ...(selectedQuestionId
            ? { question: form.getFieldValue("questions") || "" } // ✅ Ambil dari form saat edit
            : {
                questions: [
                  {
                    question: form.getFieldValue("questions") || "", // ✅ Ambil dari form saat tambah
                  },
                ],
              }),
        };
      } else if (formType === "reading") {
        payload = {
          type: "reading",
          basePlacementTestId: base_id,
          ...(selectedQuestionId
            ? editType === "passage"
              ? { passage }
              : {
                  question: questions[0].question,
                  correctAnswer: questions[0].correctAnswer,
                }
            : {
                passage,
                questions: questions.map((q) => ({
                  question: q.question,
                  correctAnswer: q.correctAnswer,
                })),
              }),
        };
      }

      console.log(payload);

      // ✅ UPDATE QUESTION (Jika Ada `selectedQuestionId`)
      if (selectedQuestionId) {
        await crudService.put(
          `/api/teacher/placementTest/${placement_test_id}/${base_id}/${selectedQuestionId}/updateQuestion`,
          payload
        );
      } else {
        // ✅ CREATE QUESTION (Jika `selectedQuestionId` Tidak Ada)
        await crudService.post(
          `/api/teacher/placementTest/${placement_test_id}/${base_id}/createQuestion`,
          payload
        );
      }

      // ✅ Notifikasi Sukses
      notification.success({
        message: selectedQuestionId
          ? "Soal berhasil diperbarui"
          : "Soal berhasil dibuat",
      });

      mutateBasePlacementDetail();
      handleCancelModal();
    } catch (error) {
      message.error("Gagal mengirim data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, type: string) => {
    try {
      Modal.confirm({
        title: "Konfirmasi Hapus",
        content: "Apakah Anda yakin ingin menghapus soal ini?",
        okText: "Ya",
        cancelText: "Batal",
        onOk: async () => {
          await crudService.delete(
            `/api/teacher/placementTest/${placement_test_id}/${base_id}/${id}/deleteQuestion?type=${type}`,
            id
          );

          notification.success({
            message: "Soal berhasil dihapus",
          });

          mutateBasePlacementDetail(); // Perbarui daftar soal
        },
      });
    } catch (error) {
      message.error("Gagal menghapus data");
    }
  };

  return {
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
    setIsModalOpen,
    setPassage,
    handleCancelModal,
    loading,
    setFormType,
    handleEditQuestion,
    selectedQuestionId,
    setQuestions,
    setQuestionCount,
    editType,
    handleDelete,
  };
};
