import { crudService } from "@/app/lib/services/crudServices";
import { fetcher } from "@/app/lib/utils/fetcher";
import { Form, message, notification } from "antd";
import { useParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

export const useAssignmentViewModel = () => {
  const [assignmentType, setAssignmentType] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [loadingDescription, setLoadingDescription] = useState(false);
  const [loadingTimeLimit, setLoadingTimeLimit] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [currentAssignmentType, setCurrentAssignmentType] =
    useState<string>("");
  const [currentAssignmentDescription, setCurrentAssignmentDescription] =
    useState<string>("");
  const [currentAssignmentId, setCurrentAssignmentId] = useState<string>("");
  const [currentAssignmentTimeLimit, setCurrentAssignmentTimeLimit] =
    useState<number>(0);
  const [questionCount, setQuestionCount] = useState<number>(1);
  const [questions, setQuestions] = useState([
    { question: "", options: [""], correctAnswer: "" },
  ]);
  const [isModalDescription, setIsModalDescription] = useState(false);
  const [selectedMcqId, setSelectedMcqId] = useState<string>("");
  const [isModalTimeLimit, setIsModalTimeLimit] = useState(false);
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState(0);
  const [selectedMultipleChoice, setSelectedMultipleChoice] =
    useState<any>(null);

  const [pairs, setPairs] = useState([{ question: "", correctAnswer: "" }]);
  const query = useParams();
  const base_id = query.base_id;
  const course_id = query.course_id;
  const { data: assigment, mutate } = useSWR(
    `/api/teacher/assignment/${base_id}/show`,
    fetcher
  );

  const { data: nameAssigment } = useSWR(
    `/api/teacher/materialAssignmentBase/${course_id}/${base_id}/detail`,
    fetcher
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setAssignmentType("");
    setCurrentAssignmentId("");
    setSelectedMcqId("");
    setQuestions([{ question: "", options: [""], correctAnswer: "" }]);
    setPairs([{ question: "", correctAnswer: "" }]);
    setContent("");
  };

  const handleCancelDescription = () => {
    setIsModalDescription(false);
  };

  const handleCancelTimeLimit = () => {
    setIsModalTimeLimit(false);
  };

  const handleQuestionCountChange = (value: number) => {
    setQuestionCount(value);
    const newQuestions = Array.from({ length: value }, () => ({
      question: "",
      options: [""],
      correctAnswer: "",
    }));
    setQuestions(newQuestions);
  };

  const handleQuestionChange = (
    index: number,
    field: keyof (typeof questions)[0],
    value: string
  ) => {
    const newQuestions = [...questions];

    if (field === "options") {
      newQuestions[index][field] = [value];
    } else {
      newQuestions[index][field] = value;
    }

    setQuestions(newQuestions);
  };

  const handleOptionChange = (
    qIndex: number,
    oIndex: number,
    value: string
  ) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const addOption = (qIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push("");
    setQuestions(newQuestions);
  };

  const handleCorrectAnswerChange = (qIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctAnswer = value;
    setQuestions(newQuestions);
  };

  const handlePairChange = (
    index: number,
    field: keyof (typeof pairs)[0],
    value: string
  ) => {
    const newPairs = [...pairs];
    newPairs[index][field] = value;
    setPairs(newPairs);
  };

  const addPair = () => {
    setPairs([...pairs, { question: "", correctAnswer: "" }]);
  };

  const handleUpdateDescription = (id: string) => {
    setIsModalDescription(true);

    const selectedItem = assigment.data.find(
      (item: any) => item.assignment_id === id
    );

    if (selectedItem) {
      setDescription(selectedItem.description);
    }
  };

  const handleUpdateTimeLimit = (id: string) => {
    setIsModalTimeLimit(true);

    const selectedItem = assigment.data.find(
      (item: any) => item.assignment_id === id
    );

    if (selectedItem) {
      setTimeLimit(selectedItem.timeLimit);
    }
  };

  const handleDelete = async (mcq_id: string) => {
    try {
      const response = await crudService.delete(
        `/api/teacher/assignment/[base_id]/[assignment_id]/deleteMcq/${mcq_id}`,
        mcq_id
      );

      if (response.status == 200) {
        notification.success({
          message: "Soal berhasil dihapus",
        });
      } else {
        notification.error({
          message: "Terjadi kesalahan saat menghapus soal",
        });
      }

      await mutate();
    } catch (error) {
      notification.error({
        message: `Terjadi kesalahan saat menghapus MCQ ${error}`,
      });
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);

    let payload: any = {};
    let endpoint = "";
    let method = "POST";

    try {
      if (!selectedMcqId) {
        payload = {
          description: values.description || currentAssignmentDescription,
          timeLimit: values.timeLimit || currentAssignmentTimeLimit,
          base_id: base_id,
          course_id: course_id,
          type: assignmentType || currentAssignmentType,
        };
        endpoint = "/api/teacher/assignment/create";
      } else {
        form.getFieldsValue();
        payload = {
          mcq_id: selectedMcqId,
          question: selectedMultipleChoice?.question?.trim(),
          options: selectedMultipleChoice?.options?.map((o: any) => o.trim()),
          correctAnswer: selectedMultipleChoice?.correctAnswer,
        };
        endpoint = `/api/teacher/assignment/${base_id}/${assigment.assignment_id}/updateMcq/${selectedMcqId}`;
        method = "PUT";
      }

      if (assignmentType || currentAssignmentType === "MULTIPLE_CHOICE") {
        const isFormValid = selectedMcqId
          ? payload.question &&
            payload.options.every((o: string) => o) &&
            payload.correctAnswer
          : questions.every(
              (q) =>
                q.question &&
                q.options.every((o) => o) &&
                q.correctAnswer !== undefined
            );

        if (!isFormValid) {
          notification.error({
            message: "Pertanyaan, opsi, dan jawaban yang benar diperlukan.",
          });
          return;
        }

        if (!selectedMcqId) {
          payload.questions = questions;
        }
      } else if (assignmentType || currentAssignmentType === "ESSAY") {
        if (!content) {
          message.error("Pertanyaan esai diperlukan.");
          return;
        }
        payload.question = content;
      } else if (
        assignmentType ||
        currentAssignmentType === "SENTENCE_MATCHING"
      ) {
        const isFormValid = pairs.every(
          (p) => p.question.trim() !== "" && p.correctAnswer.trim() !== ""
        );

        if (!isFormValid) {
          message.error("Semua pasangan pertanyaan dan jawaban harus diisi.");
          return;
        }

        payload.pairs = pairs;
      }

      const response = await crudService.request({
        method,
        endpoint,
        body: payload,
      });

      if (response.status === 200) {
        notification.success({
          message: selectedMcqId
            ? "Assignment berhasil diperbarui"
            : "Assignment berhasil dibuat",
        });

        setIsModalVisible(false);
        await mutate();
        form.resetFields();
        resetState();
      }
    } catch (error) {
      console.error("Error submitting assignment:", error);
      notification.error({
        message: selectedMcqId
          ? "Gagal memperbarui MCQ"
          : "Gagal membuat tugas",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setAssignmentType("");
    setCurrentAssignmentId("");
    setSelectedMcqId("");
    setQuestions([{ question: "", options: [""], correctAnswer: "" }]);
    setPairs([{ question: "", correctAnswer: "" }]);
    setContent("");
  };

  const onFinishDescription = async () => {
    setLoadingDescription(true);

    const payload = {
      description,
    };

    try {
      const response = await crudService.patch(
        `/api/teacher/assignment/${base_id}/${selectedAssignment?.assignment_id}/updateDescription`,
        {
          payload,
        }
      );

      if (response.status === 200) {
        notification.success({
          message: "Deskripsi berhasil diperbarui",
        });
      }

      setSelectedAssignment({
        ...selectedAssignment,
        description: description,
      });

      setIsModalDescription(false);
      await mutate();
    } catch (error) {
      console.error("Error updating description:", error);
      notification.error({
        message: "Gagal memperbarui deskripsi",
      });
    } finally {
      setLoadingDescription(false); // Set loading kembali ke false setelah selesai
    }
  };

  const onFinishTimeLimit = async (values: any) => {
    setLoadingTimeLimit(true); // Set loading saat memulai proses

    const payload = {
      timeLimit: values.timeLimit,
    };

    try {
      const response = await crudService.patch(
        `/api/teacher/assignment/${base_id}/${selectedAssignment?.assignment_id}/updateTimeLimit`,
        {
          payload,
        }
      );

      if (response.status === 200) {
        notification.success({
          message: "Waktu pengerjaan berhasil diperbarui",
        });
      }

      setSelectedAssignment({
        ...selectedAssignment,
        timeLimit: values.timeLimit,
      });

      setIsModalTimeLimit(false);
      await mutate();
    } catch (error) {
      console.error("Error updating time limit:", error);
      notification.error({
        message: "Gagal memperbarui waktu pengerjaan",
      });
    } finally {
      setLoadingTimeLimit(false); // Set loading kembali ke false setelah selesai
    }
  };

  const handleDrawerClose = () => {
    setIsDrawerVisible(false);
    setSelectedAssignment(null);
  };

  const openDrawerWithDetails = (assignment: any) => {
    setSelectedAssignment(assignment);
    setIsDrawerVisible(true);
  };

  const name = nameAssigment?.data?.title;

  return {
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
  };
};
