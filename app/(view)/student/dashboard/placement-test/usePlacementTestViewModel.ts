import { useState, useEffect, useMemo, useCallback } from "react";
import { fetcher } from "@/app/lib/utils/fetcher";
import useSWR from "swr";
import { useSearchParams, useRouter } from "next/navigation";
import { message, Modal } from "antd";
import { crudService } from "@/app/lib/services/crudServices";

const { confirm } = Modal;

// Interfaces
interface MultipleChoicePlacementTest {
  mc_id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  basePlacementTestId: string;
}

interface WritingPlacementTest {
  writing_id: string;
  question: string;
  marks: number | null;
  basePlacementTestId: string;
}

interface TrueFalseQuestion {
  tf_id: string;
  question: string;
  correctAnswer: boolean;
  group_id: string;
}

interface TrueFalseGroupPlacementTest {
  group_id: string;
  passage: string;
  basePlacementTestId: string;
  trueFalseQuestions: TrueFalseQuestion[];
}

interface BasePlacementTest {
  base_id: string;
  name: string;
  placementTestId: string;
  multipleChoices?: MultipleChoicePlacementTest[];
  writingQuestions?: WritingPlacementTest[];
  trueFalseGroups?: TrueFalseGroupPlacementTest[];
}

interface BasePlacementTestResponse {
  data: BasePlacementTest[];
}

export const usePlacementTestViewModel = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedPlacementId = searchParams.get("testId") || "";
  const time = searchParams.get("t") || "0";
  const access_id = searchParams.get("accessId") || "";
  const [loading, setLoading] = useState(false);

  // Fetching soal dari API
  const { data: basePlacementTestData, isLoading: basePlacementTestLoading } =
    useSWR<BasePlacementTestResponse>(
      selectedPlacementId
        ? `/api/student/placementTest/showBasePlacementTest/${selectedPlacementId}`
        : null,
      fetcher
    );

  // State
  const [remainingTime, setRemainingTime] = useState(Number(time) * 60 || 0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >(() => JSON.parse(localStorage.getItem("answersBySection") || "{}"));
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Soal aktif berdasarkan section yang sedang dikerjakan
  const currentSection = useMemo(() => {
    return basePlacementTestData?.data[currentSectionIndex] || null;
  }, [basePlacementTestData, currentSectionIndex]);

  const currentQuestions = useMemo(() => {
    if (!currentSection) return [];
    if (currentSection.multipleChoices?.length)
      return currentSection.multipleChoices;
    if (currentSection.writingQuestions?.length)
      return currentSection.writingQuestions;
    if (currentSection.trueFalseGroups?.length) {
      return currentSection.trueFalseGroups.flatMap(
        (group) => group.trueFalseQuestions
      );
    }
    return [];
  }, [currentSection]);

  // Timer countdown
  useEffect(() => {
    if (remainingTime > 0) {
      const timer = setInterval(() => {
        setRemainingTime((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (remainingTime === 0) {
      handleSubmit();
    }
  }, [remainingTime]);

  // Format waktu MM:SS
  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  }, []);

  // Navigasi antar soal
  const handleQuestionClick = useCallback((index: number) => {
    setCurrentQuestionIndex(index);
  }, []);

  // Simpan jawaban
  const handleAnswerChange = useCallback(
    (questionId: string, answer: string) => {
      setSelectedAnswers((prev) => ({
        ...prev,
        [questionId]: answer,
      }));
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "answersBySection",
          JSON.stringify(selectedAnswers)
        );
      }
    },
    []
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTime = Number(localStorage.getItem("remainingTime"));
      if (!isNaN(savedTime) && savedTime > 0) {
        setRemainingTime(savedTime);
      }
    }
  }, []);

  // Konfirmasi sebelum mengirim
  const showConfirmSubmit = () => {
    const allAnswered = currentQuestions.every(
      (q: any) => selectedAnswers[q.mc_id || q.writing_id || q.tf_id]
    );

    if (!allAnswered) {
      message.warning("Pastikan semua soal telah dijawab!");
      return;
    }

    confirm({
      title: "Konfirmasi Pengiriman",
      content: "Apakah Anda yakin ingin mengirim jawaban?",
      okText: "Kirim",
      cancelText: "Batal",
      onOk: () => {
        handleSubmit();
      },
    });
  };

  // Kirim jawaban ke backend
  const handleSubmit = async () => {
    const selectedData = Object.keys(selectedAnswers).map((id) => ({
      id,
      selectedAnswer: selectedAnswers[id],
    }));

    const payload = {

      selectedData,
      placement_test_id: selectedPlacementId,
      access_id,
    };

    try {
      setLoading(true);
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
        if (typeof window !== "undefined") {
          localStorage.removeItem("answersBySection");
          localStorage.removeItem("remainingTime");
        }
        setLoading(false);
      } else {
        setLoading(false);
        message.error("Terjadi kesalahan saat mengirim jawaban.");
      }
    } catch (error) {
      setLoading(false);
      message.error("Gagal menghubungi server. Coba lagi.");
    }
  };

  return {
    basePlacementTestData,
    basePlacementTestLoading,
    currentSection,
    currentQuestions,
    currentSectionIndex,
    currentQuestionIndex,
    remainingTime,
    formatTime,
    selectedAnswers,
    handleQuestionClick,
    handleAnswerChange,
    setCurrentSectionIndex,
    setCurrentQuestionIndex,
    showConfirmSubmit,
    handleSubmit,
    time,
    loading
  };
};
