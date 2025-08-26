import { fetcher } from "@/app/lib/utils/fetcher";
import useSWR from "swr";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

interface QueueViewModel {
  queueData: any;
  queueError: any;
  queueMutate: () => void;
  isLoadingQueue: boolean;
}

export const useQueueViewModel = (): QueueViewModel => {
  const {
    data: queueData,
    error: queueError,
    mutate: queueMutate,
    isLoading: isLoadingQueue,
  } = useSWR("/api/admin/queue/show", fetcher);

  return {
    queueData,
    queueError,
    queueMutate,
    isLoadingQueue,
  };
};
