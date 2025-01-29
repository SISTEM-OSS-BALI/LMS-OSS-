import { fetcher } from "@/app/lib/utils/fetcher";
import useSWR from "swr";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
dayjs.extend(utc);

interface QueueViewModel {
  queueData: any;
  queueError: any;
  queueMutate: () => void;
  handleChangeDate: (date: any) => void;
  showTimes: any;
}

export const useQueueViewModel = (): QueueViewModel => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = searchParams.get("date") || dayjs().format("YYYY-MM-DD");
  const fetchUrl = useMemo(() => {
    let url = "/api/admin/queue/show";
    const params = new URLSearchParams();
    if (date) params.append("date", date);
    return `${url}?${params.toString()}`;
  }, [date]);
  const {
    data: queueData,
    error: queueError,
    mutate: queueMutate,
  } = useSWR(fetchUrl, fetcher);
  const { data: showTimeResponse } = useSWR(
    "/api/admin/queue/showDateTime",
    fetcher
  );
  const showTimeData = showTimeResponse?.data || [];

  const handleChangeDate = (date: any) => {
    if (date) {
      const formatedDate = dayjs(date).format("YYYY-MM-DD");
      router.push(`/admin/dashboard/queue?date=${formatedDate}`);
    }
  };

  const showTimes = useMemo(() => {
    if (!Array.isArray(showTimeData)) return [];
    const uniqueDates = new Set<string>(
      showTimeData.map((item) => dayjs.utc(item.dateTime).format("YYYY-MM-DD"))
    );
    return Array.from(uniqueDates);
  }, [showTimeData]);

  return {
    queueData,
    queueError,
    queueMutate,
    handleChangeDate,
    showTimes,
  };
};
