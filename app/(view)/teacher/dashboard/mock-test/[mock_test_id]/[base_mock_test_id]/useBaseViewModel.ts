import { fetcher } from "@/app/lib/utils/fetcher";
import { useParams } from "next/navigation";
import useSWR from "swr";

export const useBaseViewModel = () => {
  const query = useParams();
  const base_id = query.base_mock_test_id;
  const mockTestId = query.mock_test_id;

  const { data: baseDetailData, isLoading: baseDetailDataLoading } = useSWR(
    `/api/teacher/mockTest/${mockTestId}/${base_id}/show`,
    fetcher
  );
  return {
    baseDetailData,
    baseDetailDataLoading,
  };
};
