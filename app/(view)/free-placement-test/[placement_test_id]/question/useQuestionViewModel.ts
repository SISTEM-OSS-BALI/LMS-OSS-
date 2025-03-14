import { fetcher } from "@/app/lib/utils/fetcher";
import { PlacementTest } from "@prisma/client";
import { message, Modal, notification } from "antd";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";

const { confirm } = Modal;

interface PlacementTestResponse {
  data: PlacementTest;
}

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

export const useQuestionViewModel = () => {
  const query = useParams();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const placement_test_id = query.placement_test_id;
  const { data: placementTestData, isLoading: isLoadingPlacement } =
    useSWR<PlacementTestResponse>(
      `/api/freePlacementTest/${placement_test_id}/detail`,
      fetcher
    );
  const time = placementTestData?.data.timeLimit;

  const { data: basePlacementTestData, isLoading: basePlacementTestLoading } =
    useSWR<BasePlacementTestResponse>(
      placement_test_id
        ? `/api/freePlacementTest/${placement_test_id}/showBasePlacementTest`
        : null,
      fetcher
    );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [remainingTime, setRemainingTime] = useState(Number(time) * 60 || 0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >(() =>
    JSON.parse(sessionStorage.getItem("answersFreePlacementTest") || "{}")
  );
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
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

  const handleSubmit = async () => {
    const selectedData = Object.keys(selectedAnswers).map((id) => ({
      id,
      selectedAnswer: selectedAnswers[id],
    }));

    const payload = {
      selectedData,
      placement_test_id,
      email,
    };

    try {
      setLoading(true);
      const res = await fetch(`/api/freePlacementTest/studentSubmitAnswer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const response = await res.json();

      if (res.status === 200 && !response.error) {
        sessionStorage.setItem(
          "freePlacementTestResult",
          JSON.stringify(response.data)
        );
        notification.success({ message: "Berhasil mengirim jawaban" });
        router.push("/free-placement-test/result");
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("answersFreePlacementTest");
          sessionStorage.removeItem("remainingTimeFreePlacement");
        }
        setLoading(false);
      } else {
        setLoading(false);
        message.error(
          response.message || "Terjadi kesalahan saat mengirim jawaban."
        );
      }
    } catch (error) {
      setLoading(false);
      message.error("Gagal menghubungi server. Coba lagi.");
    }
  };

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
  }, [remainingTime, handleSubmit]);

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
        sessionStorage.setItem(
          "answersFreePlacementTest",
          JSON.stringify(selectedAnswers)
        );
      }
    },
    [selectedAnswers]
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTime = Number(
        sessionStorage.getItem("remainingTimeFreePlacement")
      );
      if (!isNaN(savedTime) && savedTime > 0) {
        setRemainingTime(savedTime);
      }
    }
  }, []);

  //   Konfirmasi sebelum mengirim
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
    loading,
  };
};
