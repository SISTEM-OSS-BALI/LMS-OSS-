"use client";

import { crudService } from "@/app/lib/services/crudServices";
import { fetcher } from "@/app/lib/utils/fetcher";
import { MockTest } from "@prisma/client";
import { message } from "antd";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";

interface Question {
  question_id: string;
  question: string;
  options?: string[];
  answer?: string;
}

// ✅ Interface untuk Jenis Soal
interface ReadingMockTest {
  reading_id: string;
  base_mock_test_id: string;
  questions: Question[];
  passage: string;
}

interface ListeningMockTest {
  listening_id: string;
  base_mock_test_id: string;
  questions: Question[];
  audio_url: string;
}

interface SpeakingMockTest {
  speaking_id: string;
  base_mock_test_id: string;
  prompt: string;
}

interface WritingMockTest {
  writing_id: string;
  base_mock_test_id: string;
  questions: Question[];
  prompt: string;
}

// ✅ Interface untuk Data Mock Test
interface BaseMockTest {
  base_mock_test_id: string;
  mock_test_id: string;
  type: "READING" | "LISTENING" | "SPEAKING" | "WRITING";
  createdAt: Date;
  reading?: ReadingMockTest;
  listening?: ListeningMockTest;
  speaking?: SpeakingMockTest;
  writing?: WritingMockTest;
}

interface BaseMockTestResponse {
  data: BaseMockTest[];
}

interface MockTestResponse {
  data: MockTest;
}

export const useQuestionViewModel = () => {
  const query = useParams();
  const searchParams = useSearchParams();
  const mock_test_id = query.mock_test_id;
  const email = searchParams.get("email");
  const router = useRouter();
  const [audioBlob, setAudioBlob] = useState<string | undefined>(undefined);
  const [speakingId, setSpeakingId] = useState<string | undefined>(undefined);
  const { data: mockTestData, isLoading: isLoadingMock } =
    useSWR<MockTestResponse>(
      `/api/freeMockTest/${mock_test_id}/detail`,
      fetcher
    );
  const { data: baseMockTestData, isLoading: baseMockTestDataLoading } =
    useSWR<BaseMockTestResponse>(
      mock_test_id
        ? `/api/freeMockTest/${mock_test_id}/showBaseMockTest`
        : null,
      fetcher
    );

  const time = mockTestData?.data.timeLimit || 0;

  // ✅ Ambil semua section
  const sectionData: BaseMockTest[] = baseMockTestData?.data || [];
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number>(0);
  const [selectedQuestion, setSelectedQuestion] = useState<number>(0);
  const [remainingTime, setRemainingTime] = useState<number>(time * 60);
  const [loading, setLoading] = useState(false);

  // ✅ Load jawaban dari sessionStorage jika ada
  const [answersBySection, setAnswersBySection] = useState<
    Record<string, Record<string, string>>
  >(() => JSON.parse(sessionStorage.getItem("answersFreeBySection") || "{}"));

  // ✅ Ambil pertanyaan untuk navigasi soal
  const sectionContent: BaseMockTest | null =
    sectionData.length > 0 ? sectionData[selectedSectionIndex] : null;

  const questions: Question[] =
    sectionContent?.reading?.questions ??
    sectionContent?.listening?.questions ??
    sectionContent?.writing?.questions ??
    [];

  // ✅ Ambil jawaban untuk section yang sedang dipilih
  const currentSectionId = sectionContent?.base_mock_test_id ?? "";
  const selectedAnswers = answersBySection[currentSectionId] || {};

  // ✅ Cek apakah semua section telah dijawab
  const isAllSectionsCompleted = sectionData.every((section) => {
    const sectionQuestions = [
      ...(section.reading?.questions ?? []),
      ...(section.listening?.questions ?? []),
      ...(section.writing?.questions ?? []),
    ];
    return sectionQuestions.every(
      (q) => answersBySection[section.base_mock_test_id]?.[q.question_id]
    );
  });

  // 🔹 Fungsi untuk menyimpan jawaban
  const handleAnswerChange = (questionId: string, answer: string) => {
    const updatedAnswers = {
      ...answersBySection,
      [currentSectionId]: {
        ...answersBySection[currentSectionId],
        [questionId]: answer,
      },
    };
    setAnswersBySection(updatedAnswers);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "answersFreeBySection",
        JSON.stringify(updatedAnswers)
      );
    }
  };

  // 🔹 Fungsi untuk submit audio
  const handleSubmitAudio = (blob: Blob, speaking_id: string) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);

    reader.onloadend = () => {
      const base64Audio = reader.result as string; // Simpan hasil konversi
      setAudioBlob(base64Audio);
      setSpeakingId(speaking_id);
      console.log(speakingId);
      message.success("Audio berhasil dikonversi dan disimpan!");
    };
  };

  // 🔹 Fungsi Kirim Semua Jawaban ke Backend
  const handleFinalSubmit = async () => {
    setLoading(true); // tambahkan setLoading true sebelum mengirim request
    const payload = {
      answers: answersBySection,
      testId: mock_test_id,
      audio: audioBlob,
      speaking_id: speakingId,
      email: email,
    };
    try {
      const response = await crudService.post(
        "/api/freeMockTest/studentSubmitAnswer",
        payload
      );
      if (response.status === 200 && !response.error) {
        sessionStorage.setItem(
          "freeMockTestResult",
          JSON.stringify(response.data)
        );
       router.push("/free-mock-test/result");
      }
      message.success("Seluruh jawaban telah dikirim!");
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("answersFreeBySection");
        sessionStorage.removeItem("remainingFreeTime");
      }
    } catch (error) {
      message.error("Gagal mengirim jawaban!");
      console.error("Error submitting answers:", error);
    } finally {
      setLoading(false); // tambahkan setLoading false setelah request selesai
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTime = Number(sessionStorage.getItem("remainingFreeTime"));
      if (!isNaN(savedTime) && savedTime > 0) {
        setRemainingTime(savedTime);
      }
    }
  }, []);

  // 🔹 Timer countdown
  useEffect(() => {
    if (remainingTime > 0) {
      const timer = setInterval(() => {
        setRemainingTime((prev) => {
          sessionStorage.setItem("remainingFreeTime", String(prev - 1));
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else if (remainingTime === 0) {
      handleFinalSubmit();
    }
  }, [remainingTime]);

  // 🔹 Muat kembali waktu yang tersisa dari sessionStorage saat komponen dimuat ulang
  useEffect(() => {
    const savedTime = Number(sessionStorage.getItem("remainingFreeTime"));
    if (!isNaN(savedTime) && savedTime > 0) {
      setRemainingTime(savedTime);
    }
  }, []);

  // 🔹 Format waktu MM:SS
  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  }, []);

  return {
    baseMockTestData,
    baseMockTestDataLoading,
    sectionData,
    selectedSectionIndex,
    setSelectedSectionIndex,
    selectedQuestion,
    setSelectedQuestion,
    questions,
    selectedAnswers,
    handleAnswerChange,
    handleSubmitAudio,
    handleFinalSubmit,
    isAllSectionsCompleted,
    remainingTime,
    formatTime,
    sectionContent,
    loading,
  };
};
