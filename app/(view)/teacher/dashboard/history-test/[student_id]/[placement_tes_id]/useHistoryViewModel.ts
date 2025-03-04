import { fetcher } from "@/app/lib/utils/fetcher";
import { ScorePlacementTest } from "@prisma/client";
import { useParams } from "next/navigation";
import { use } from "react";
import useSWR from "swr";

interface PlacementTestEntry {
  answer_id: string;
  studentAnswer: string;
  score: number;
  writing_feedback?: string;
  trueFalseQuestion?: {
    tf_id: string;
    question: string;
    correctAnswer: boolean;
  };
  trueFalseGroup?: {
    passage: string;
    trueFalseQuestions: {
      tf_id: string;
      question: string;
      correctAnswer: boolean;
    }[];
  };
  multipleChoice?: {
    question: string;
    correctAnswer: string;
    options: string[];
  };
  writingQuestion?: {
    question: string;
  };
}

interface StudentAnswerPlacementTestResponse {
  data: PlacementTestEntry[];
}

interface ShowScoreResponse {
  data: ScorePlacementTest;
}
export const useHistoryViewModel = () => {
  const query = useParams();
  const placement_tes_id = query.placement_tes_id as string;
  const student_id = query.student_id;
  const { data: studentAnsweData, isLoading: studentAnswerLoading } =
    useSWR<StudentAnswerPlacementTestResponse>(
      `/api/teacher/historyTest/${student_id}/${placement_tes_id}/studentShowAnswer`,
      fetcher
    );
  const { data: showScoreData, isLoading: showScoreDataLoading } =
    useSWR<ShowScoreResponse>(
      `
    /api/teacher/historyTest/${student_id}/${placement_tes_id}/showScore`,
      fetcher
    );
  return {
    studentAnsweData,
    studentAnswerLoading,
    showScoreData,
    showScoreDataLoading,
  };
};
