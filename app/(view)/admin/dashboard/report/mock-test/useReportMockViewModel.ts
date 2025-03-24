import { crudService } from "@/app/lib/services/crudServices";
import { fetcher } from "@/app/lib/utils/fetcher";
import { notification } from "antd";
import useSWR from "swr";

// 🔹 Interface untuk Mock Test
interface MockTest {
  mock_test_id: string;
  name: string;
  description?: string;
  timeLimit: number;
  createdAt: string; // ISO format datetime
}

// 🔹 Interface untuk Session dari Mock Test
interface MockTestSession {
  session_id: string;
  mockTestId: string;
  sessionDate: string; // ISO format datetime
  mockTest: MockTest;
}

// 🔹 Interface untuk Partisipan Mock Test
interface MockTestParticipant {
  participant_id: string;
  sessionId: string;
  name: string;
  email: string;
  phone: string;
  institution: string;
  grade: string;
  social_media: string;
  createdAt: string; // ISO format datetime
  session: MockTestSession;
  ScoreFreeMockTest?: ScoreFreeMockTest[]; // Bisa lebih dari satu skor
}

// 🔹 Interface untuk Skor dari Mock Test
interface ScoreFreeMockTest {
  score_placement_test_id: string;
  participant_id: string;
  mock_test_id: string;
  totalScore: number;
  percentageScore: number;
  level: "BASIC" | "INTERMEDIATE" | "ADVANCED";
}

// 🔹 Interface untuk Response API
interface MockTestReportResponse {
  status: number;
  error: boolean;
  data: MockTestParticipant[];
}

// 🔹 Hook untuk Mengambil Data Mock Test Report
export const useReportMockViewModel = () => {
  const {
    data: mockReportData,
    isLoading: isLoadingMockReport,
    mutate,
  } = useSWR<MockTestReportResponse>(
    "/api/admin/report/freeMockTest/show",
    fetcher
  );

  const handleDelete = async (session_id: string) => {
    try {
      await crudService.delete(
        `/api/admin/report/freeMockTest/${session_id}/delete`,
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
    mockReportData,
    isLoadingMockReport,
    handleDelete,
  };
};
