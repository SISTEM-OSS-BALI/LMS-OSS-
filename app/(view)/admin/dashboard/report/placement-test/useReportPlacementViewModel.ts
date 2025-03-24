import { crudService } from "@/app/lib/services/crudServices";
import { fetcher } from "@/app/lib/utils/fetcher";
import { notification } from "antd";
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
  const {
    data: placementReportData,
    isLoading: isLoadingPlacementReport,
    mutate,
  } = useSWR<PlacementTestReportResponse>(
    "/api/admin/report/freePlacementTest/show",
    fetcher
  );

  const handleDelete = async (session_id: string) => {
    try {
      await crudService.delete(
        `/api/admin/report/freePlacementTest/${session_id}/delete`,
        session_id
      );
      mutate();
      notification.success({ message: "Data berhasil dihapus" });
    } catch (error) {
      console.error(error);
      notification.error({ message: "Data gagal dihapus" });
    }
  };

  return {
    placementReportData,
    isLoadingPlacementReport,
    handleDelete,
  };
};
