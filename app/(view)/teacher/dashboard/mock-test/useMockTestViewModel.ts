import { fetcher } from "@/app/lib/utils/fetcher";
import { MockTest } from "@prisma/client";
import useSWR from "swr";

interface MockTestResponse {
  data: MockTest[];
}

export const useMockTestViewModel = () => {
  const { data: mockTestData, isLoading: mockTestDataLoading } =
    useSWR<MockTestResponse>("/api/teacher/mockTest/show", fetcher);
  return {
    mockTestData,
    mockTestDataLoading,
  };
};
