import { fetcher } from "@/app/lib/utils/fetcher";
import { ScoreMockTest } from "@prisma/client";
import { useParams } from "next/navigation";
import useSWR from "swr";

// ✅ Interface untuk jawaban siswa di Mock Test
interface MockTestEntry {
  answer_id: string;
  studentAnswer: string;
  score: number;
  feedback?: string;

  readingQuestion?: {
    question_id: string;
    question: string;
    options?: string[];
    correctAnswer?: string;
  };

  listeningQuestion?: {
    question_id: string;
    question: string;
    options?: string[];
    correctAnswer?: string;
  };

  writingQuestion?: {
    question_id: string;
    question: string;
  };

  speakingTest?: {
    speaking_id: string;
    prompt: string;
    recording_url?: string; // URL rekaman untuk speaking test
  };
}

// ✅ Interface untuk respons API jawaban siswa
interface StudentAnswerMockTestResponse {
  data: MockTestEntry[];
}

// ✅ Interface untuk respons skor
interface ShowScoreResponse {
  data: {
    totalScore: number;
    percentageScore: number;
    level: string;
  };
}

// ✅ ViewModel untuk Fetching Data
export const useHistoryViewModel = () => {
  const query = useParams();
  const mock_test_id = query.mock_test_id as string;

  // 🔹 Fetch data jawaban siswa dari API
  const { data: studentAnswerData, isLoading: studentAnswerLoading } =
    useSWR<StudentAnswerMockTestResponse>(
      `/api/student/answerMockTest/${mock_test_id}/studentShowAnswer`,
      fetcher
    );

  // 🔹 Fetch skor siswa dari API
  const { data: showScoreData, isLoading: showScoreDataLoading } =
    useSWR<ShowScoreResponse>(
      `/api/student/answerMockTest/${mock_test_id}/showScore`,
      fetcher
    );

  return {
    studentAnswerData,
    studentAnswerLoading,
    showScoreData,
    showScoreDataLoading,
  };
};
