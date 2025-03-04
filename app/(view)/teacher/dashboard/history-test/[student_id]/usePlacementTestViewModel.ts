import { fetcher } from "@/app/lib/utils/fetcher";
import { useParams } from "next/navigation";
import useSWR from "swr";

export interface PlacementTest {
  placement_test_id: string;
  name: string;
  description: string;
  timeLimit: number;
}

export interface PlacementTestHistory {
  access_placement_test_id: string;
  user_id: string;
  placement_test_id: string;
  createdAt: string;
  updatedAt: string;
  is_completed: boolean;
  placementTest: PlacementTest;
}

export interface PlacementTestHistoryResponse {
  status: number;
  error: boolean;
  data: PlacementTestHistory[];
}

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

export const usePlacementTestViewModel = () => {
  const query = useParams();
  const student_id = query.student_id;
  const { data: placementTest, isLoading: placementTestLoading } =
    useSWR<PlacementTestHistoryResponse>(
      `/api/teacher/historyTest/${student_id}/showPlacement`,
      fetcher
    );
  return { placementTest, placementTestLoading };
};
