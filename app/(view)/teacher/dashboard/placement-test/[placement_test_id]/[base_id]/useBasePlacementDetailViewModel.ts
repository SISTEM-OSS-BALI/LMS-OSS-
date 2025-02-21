import { fetcher } from "@/app/lib/utils/fetcher";
import { useParams } from "next/navigation";
import useSWR from "swr";

export const useBasePlacementDetailViewModel = () => {
  const params = useParams();
  const { base_id, placement_test_id } = params;
  const {
    data: basePlacementDetail,
    error,
    isLoading,
  } = useSWR(
    `/api/teacher/placementTest/${placement_test_id}/${base_id}/showBase`,
    fetcher
  );

  return { basePlacementDetail, error, isLoading };
};
