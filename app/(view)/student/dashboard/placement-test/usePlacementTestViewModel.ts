import { useState, useEffect, useMemo, useCallback } from "react";
import { fetcher } from "@/app/lib/utils/fetcher";
import { MultipleChoicePlacementTest } from "@prisma/client";
import useSWR from "swr";
import { useSearchParams, useRouter } from "next/navigation";
import { message, Modal } from "antd";
import { crudService } from "@/app/lib/services/crudServices";

const { confirm } = Modal;

interface MultipleChoicePlacementTestResponse {
  data: MultipleChoicePlacementTest[];
}

export const usePlacementTestViewModel = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Ambil parameter dari URL
  const selectedPlacementId = searchParams.get("testId") || "";
  const time = searchParams.get("t") || "0"; // Default ke 0 jika tidak ada
  const access_id = searchParams.get("accessId") || "";

  // Fetch data soal
  const {
    data: multipleChoicePlacementTestData,
    isLoading: multipleChoiceLoading,
  } = useSWR<MultipleChoicePlacementTestResponse>(
    selectedPlacementId
      ? `/api/student/placementTest/showMultipleChoice/${selectedPlacementId}`
      : null,
    fetcher
  );

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: string]: string;
  }>({});
  const [remainingTime, setRemainingTime] = useState(0); // Konversi menit ke detik
  const [isLoading, setIsLoading] = useState(true);

  // Shuffle questions & options **only once**
  const questions = useMemo(() => {
    if (!multipleChoicePlacementTestData?.data) return [];
    return multipleChoicePlacementTestData.data.map((question) => ({
      ...question,
      options: Array.isArray(question.options) ? [...question.options] : [],
    }));
  }, [multipleChoicePlacementTestData]);

  // Start countdown timer only after questions are loaded
  useEffect(() => {
    if (questions.length > 0) {
      setRemainingTime(Number(time) * 60 || 0);
      setIsLoading(false); // Ensure questions are fully loaded before setting loading to false
    }
  }, [questions, time]);

  useEffect(() => {
    if (remainingTime === 0 && questions.length > 0 && !isLoading) {
      handleSubmit();
    }
  }, [remainingTime, questions, isLoading]);

  useEffect(() => {
    if (remainingTime > 0) {
      const timer = setInterval(() => {
        setRemainingTime((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [remainingTime]);

  // Format waktu ke MM:SS
  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  }, []);

  // Navigasi soal
  const handleQuestionClick = useCallback((index: number) => {
    setCurrentQuestionIndex(index);
  }, []);

  // Menyimpan jawaban yang dipilih
  const handleAnswerChange = useCallback((mcqId: string, answer: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [mcqId]: answer,
    }));
  }, []);

  // Konfirmasi sebelum mengirim jawaban
  const showConfirmSubmit = () => {
    const allAnswered = questions.every((q) => selectedAnswers[q.mcq_id]);
    if (!allAnswered) {
      message.warning(
        "Pastikan Anda telah menjawab semua soal sebelum mengirim!"
      );
      return;
    }
    confirm({
      title: "Konfirmasi Pengiriman",
      content: "Apakah Anda yakin ingin mengirim jawaban?",
      okText: "Kirim",
      cancelText: "Batal",
      onOk() {
        handleSubmit();
      },
    });
  };

  // Mengirim jawaban ke backend
  const handleSubmit = async () => {
    const selectedData = Object.keys(selectedAnswers).map((mcq_id) => ({
      mcq_id,
      selectedAnswer: selectedAnswers[mcq_id],
    }));

    const payload = {
      selectedData,
      placement_test_id:
        multipleChoicePlacementTestData?.data[0]?.placement_test_id || "",
      access_id,
    };

    try {
      const response = await crudService.post(
        "/api/student/answerPlacement/studentSubmitAnswer",
        payload
      );

      if (response.status === 200 && !response.error) {
        sessionStorage.setItem(
          "placementTestResult",
          JSON.stringify(response.data)
        );
        router.push("/student/dashboard/placement-test/result");
      } else {
        message.error("Terjadi kesalahan saat mengirim jawaban.");
      }
    } catch (error) {
      message.error("Gagal menghubungi server. Coba lagi.");
    }
  };

  return {
    multipleChoicePlacementTestData,
    questions,
    time,
    remainingTime,
    formatTime,
    currentQuestionIndex,
    selectedAnswers,
    handleQuestionClick,
    handleAnswerChange,
    showConfirmSubmit,
    handleSubmit,
    isLoading,
  };
};
