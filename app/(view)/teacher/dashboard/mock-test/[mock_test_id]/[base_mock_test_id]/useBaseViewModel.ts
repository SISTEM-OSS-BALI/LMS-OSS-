import { crudService } from "@/app/lib/services/crudServices";
import { fetcher } from "@/app/lib/utils/fetcher";
import { Form, notification } from "antd";
import { useParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

export const useBaseViewModel = () => {
  const query = useParams();
  const base_id = query.base_mock_test_id;
  const mockTestId = query.mock_test_id;

  const {
    data: baseDetailData,
    isLoading: baseDetailDataLoading,
    mutate: baseDetailMutate,
  } = useSWR(`/api/teacher/mockTest/${mockTestId}/${base_id}/show`, fetcher);

  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const [formType, setFormType] = useState<
    "listening" | "writing" | "reading" | "speaking" | null
  >(null);

  const [questionCount, setQuestionCount] = useState(1);
  const [options, setOptions] = useState<{ [key: number]: string[] }>({});
  const [correctAnswers, setCorrectAnswers] = useState<{
    [key: number]: string;
  }>({});
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);

  const [editType, setEditType] = useState<
    | "passage"
    | "prompt"
    | "audio"
    | "question"
    | "addQuestionMore"
    | "editSpeaking"
    | null
  >(null);

  const handleOpenModal = (
    type: "listening" | "writing" | "reading" | "speaking",
    editType:
      | "passage"
      | "prompt"
      | "audio"
      | "question"
      | "addQuestionMore"
      | "editSpeaking"
      | null = null,
    questionId: string | null = null,
    id: string | null = null
  ) => {
    setFormType(type);
    setIsModalOpen(true);
    setEditType(editType);
    form.resetFields();

    let foundBaseData = null;
    let foundQuestion: {
      question_id: string;
      question: string;
      options: string[];
      answer: string;
    } | null = null;

    // ✅ Jika editType adalah "prompt", cari berdasarkan `id`
    if (editType === "prompt" && id) {
      foundBaseData = baseDetailData?.data?.writing;
      if (foundBaseData) {
        form.setFieldsValue({ prompt: foundBaseData.prompt });
      }
      return; // ⛔ STOP! Tak lanjut ke logika lain
    }

    // ✅ Jika editType adalah "passage", cari berdasarkan ``
    if (editType === "passage" && id) {
      foundBaseData = baseDetailData?.data?.reading;
      if (foundBaseData) {
        form.setFieldsValue({ passage: foundBaseData.passage });
      }
      return;
    }

    // ✅ Jika editType adalah "audio", cari berdasarkan ``
    if (editType === "audio" && id) {
      foundBaseData = baseDetailData?.data?.listening;
      if (foundBaseData) {
        form.setFieldsValue({ audio_url: foundBaseData.audio_url });
      }
      return;
    }

    if (editType === "editSpeaking" && id) {
      foundBaseData = baseDetailData?.data?.speaking;
      if (foundBaseData) {
        form.setFieldsValue({ prompt: foundBaseData.prompt });
      }
      return;
    }

    // ✅ Jika mode edit soal (question), cari berdasarkan questionId
    if (editType === "question" && questionId) {
      if (type === "writing") {
        foundQuestion = baseDetailData?.data?.writing?.questions.find(
          (q: any) => q.question_id === questionId
        );
      } else if (type === "reading") {
        foundQuestion = baseDetailData?.data?.reading?.questions.find(
          (q: any) => q.question_id === questionId
        );
      } else if (type === "listening") {
        foundQuestion = baseDetailData?.data?.listening?.questions.find(
          (q: any) => q.question_id === questionId
        );
      } else if (type === "speaking") {
        foundQuestion = baseDetailData?.data?.speaking?.questions.find(
          (q: any) => q.question_id === questionId
        );
      }

      if (foundQuestion) {
        setSelectedQuestion(foundQuestion);
        setOptions({ 0: foundQuestion.options || [] });
        setCorrectAnswers({ 0: foundQuestion.answer || "" });

        setTimeout(() => {
          form.setFieldsValue({
            question: foundQuestion?.question,
            ...foundQuestion?.options.reduce(
              (acc: any, option: string, index: number) => {
                acc[`option_${index}`] = option;
                return acc;
              },
              {}
            ),
            correctAnswer: foundQuestion?.answer || "",
          });
        }, 0);
      }
      return;
    }

    // ✅ Jika menambahkan soal baru (addQuestionMore), reset form
    if (editType === "addQuestionMore") {
      setSelectedQuestion(null);
      setOptions({});
      setCorrectAnswers({});
      setQuestionCount(1);
    }
  };

  const handleQuestionCountChange = (value: number) => {
    setQuestionCount(value || 1);
  };

  const handleAddOption = (index: number) => {
    setOptions((prev) => ({
      ...prev,
      [index]: [...(prev[index] || []), ""], // Tambahkan opsi baru sebagai string kosong
    }));
  };

  const handleRemoveOption = (index: number, optIndex: number) => {
    setOptions((prev) => {
      const newOptions = [...(prev[index] || [])];
      newOptions.splice(optIndex, 1);
      return { ...prev, [index]: newOptions };
    });

    // Jika opsi yang dihapus adalah jawaban benar, reset jawaban benar
    if (
      correctAnswers[index] &&
      correctAnswers[index] === options[index]?.[optIndex]
    ) {
      setCorrectAnswers((prev) => ({ ...prev, [index]: "" }));
    }
  };

  // Menangani perubahan isi opsi jawaban
  const handleOptionChange = (
    index: number,
    optIndex: number,
    value: string
  ) => {
    setOptions((prev) => {
      const newOptions = [...(prev[index] || [])];
      newOptions[optIndex] = value;
      return { ...prev, [index]: newOptions };
    });
  };

  // Menangani pemilihan jawaban benar
  const handleCorrectAnswerChange = (index: number, value: string) => {
    setCorrectAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditType(null);
    setFormType(null);
    setSelectedQuestion(null);
    setOptions({});
    setCorrectAnswers({});
  };

  const handleSubmit = async (values: any) => {
    console.log(values);
    setLoading(true);
    try {
      let url = "";
      let payload: any = {};

      // 🔹 Konversi soal menjadi array
      const formattedQuestions = Array.from({ length: questionCount }).map(
        (_, index) => ({
          question: values[`question_${index}`],
          options: options[index] || [],
          answer: correctAnswers[index] || "",
        })
      );

      // ✅ **Gunakan API `/createQuestion` untuk membuat seluruh section**
      if (formType && !baseDetailData?.data[formType]) {
        url = `/api/teacher/mockTest/${mockTestId}/${base_id}/createQuestion`;
        payload = {
          mock_test_id: values.mock_test_id,
          type: values.type,
          ...(formType === "writing" && { prompt: values.prompt }),
          ...(formType === "listening" && { audio_url: values.audio_url }),
          ...(formType === "reading" && { passage: values.passage }),
          ...(formType === "speaking" && { prompt: values.prompt }),
          questions: formattedQuestions, // 🔹 Kirim semua data termasuk prompt/passage/audio_url
        };

        // 🔥 Kirim request POST untuk membuat section baru
        await crudService.post(url, payload);
        notification.success({ message: "Section dan soal berhasil dibuat!" });
      }

      // ✅ **Gunakan API `/createQuestion` untuk menambah soal ke section yang sudah ada**
      else if (editType === "addQuestionMore") {
        url = `/api/teacher/mockTest/${mockTestId}/${base_id}/createQuestion`;
        payload = {
          mock_test_id: values.mock_test_id,
          type: values.type,
          questions: formattedQuestions, // ❌ Tidak menyertakan prompt, passage, atau audio_url
        };

        // 🔥 Kirim request POST hanya untuk menambah soal baru
        await crudService.post(url, payload);
        notification.success({ message: "Soal berhasil ditambahkan!" });
      }

      // ✅ **Gunakan API universal untuk semua jenis edit**
      else if (
        ["prompt", "passage", "audio", "editSpeaking", "question"].includes(
          editType as string
        )
      ) {
        url = `/api/teacher/mockTest/${mockTestId}/${base_id}/${
          selectedQuestion?.question_id
        }/updateQuestion`;

        payload = {
          mock_test_id: values.mock_test_id,
          type: values.type,
          ...(editType === "prompt" && { prompt: values.prompt }),
          ...(editType === "passage" && { passage: values.passage }),
          ...(editType === "audio" && { audio_url: values.audio_url }),
          ...(editType === "editSpeaking" && { prompt: values.prompt }),
          ...(editType === "question" &&
            selectedQuestion && {
              question: values.question,
              options: options[0] || [],
              answer: correctAnswers[0] || "",
            }),
        };

        // 🔥 Kirim request `PUT` ke API universal untuk mengupdate data
        await crudService.put(url, payload);
        notification.success({ message: "Perubahan berhasil disimpan!" });
      }

      // ⛔ Jika tidak ada aksi yang cocok, hentikan proses
      if (!url) {
        throw new Error("Tidak ada tindakan yang cocok!");
      }

      // 🔹 Refresh data setelah perubahan
      baseDetailMutate();
      handleCloseModal();
    } catch (error) {
      notification.error({
        message: "Gagal",
        description: "Terjadi kesalahan saat menyimpan data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (values: any) => {
    setLoading(true);
    try {
      await crudService.post(
        `/api/teacher/mockTest/${base_id}/addQuestion`,
        values
      );
      notification.success({ message: "Soal berhasil ditambahkan!" });
      baseDetailMutate(); // Refresh data setelah perubahan
      handleCloseModal();
    } catch (error) {
      notification.error({ message: "Gagal menambahkan soal." });
    } finally {
      setLoading(false);
    }
  };


  // 🔹 Fungsi untuk menghapus soal
  const handleDeleteQuestion = async (questionId: string) => {
    setLoading(true);
    try {
      await crudService.delete(
        `/api/teacher/mockTest/${mockTestId}/${base_id}/${questionId}/deleteQuestion`,
        questionId
      );
      notification.success({ message: "Soal berhasil dihapus!" });
      baseDetailMutate();
    } catch (error) {
      notification.error({ message: "Gagal menghapus soal." });
    } finally {
      setLoading(false);
    }
  };

  return {
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
    handleDeleteQuestion,
    selectedQuestion,
    setOptions,
    editType,
  };
};
