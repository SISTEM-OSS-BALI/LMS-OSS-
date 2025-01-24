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
    const handleChangeDate = (date: any) => {
        if (date) {
          const formatedDate = dayjs(date).format("YYYY-MM-DD");
          router.push(`/admin/dashboard/queue?date=${formatedDate}`);
        }
      };
    return {
        queueData,
        queueError,
        queueMutate,
        handleChangeDate
    }
};
