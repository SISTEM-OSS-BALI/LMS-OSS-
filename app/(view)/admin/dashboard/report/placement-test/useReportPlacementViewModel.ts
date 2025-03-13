import { fetcher } from "@/app/lib/utils/fetcher";
import useSWR from "swr";

interface PlacementTest {
  placement_test_id: string;
  name: string;
  description?: string;
  timeLimit: number;
}

interface PlacementTestSession {
  session_id: string;
  sessionDate: string; // Format ISO string (ex: "2025-03-13T10:00:00.000Z")
  placementTest: PlacementTest;
}

interface PlacementTestParticipant {
  participant_id: string;
  name: string;
  email: string;
  phone: string;
  institution: string;
  grade: string;
  social_media: string;
  createdAt: string; // Format ISO string (ex: "2025-03-13T10:00:00.000Z")
  session: PlacementTestSession;
  ScoreFreePlacementTest?: ScoreFreePlacementTest;
}

interface ScoreFreePlacementTest {
  score_placement_test_id: string;
  totalScore: number;
  percentageScore: number;
  level: "BASIC" | "INTERMEDIATE" | "ADVANCED";
}

interface PlacementTestReportResponse {
  status: number;
  error: boolean;
  data: PlacementTestParticipant[];
}


export const useReportPlacementViewModel = () => {
    const {data: placementReportData, isLoading: isLoadingPlacementReport} = useSWR<PlacementTestReportResponse>("/api/admin/report/freePlacementTest/show", fetcher);
    return {
        placementReportData,
        isLoadingPlacementReport
    };
};