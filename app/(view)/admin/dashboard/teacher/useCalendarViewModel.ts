import { crudService } from "@/app/lib/services/crudServices";
import { fetcher } from "@/app/lib/utils/fetcher";
import { User } from "@/app/model/user";
import { Form, Modal, notification } from "antd";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import { useEffect, useState } from "react";
import useSWR from "swr";
dayjs.extend(utc);
import Cookies from "js-cookie";

interface TeacherResponse {
  data: User[];
}
interface Schedule {
  schedule_id: string;
  day: string;
  isAvailable: boolean;
  times: { start: Dayjs | null; end: Dayjs | null }[];
}

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
const DAY_TRANSLATION = {
  Senin: "MONDAY",
  Selasa: "TUESDAY",
  Rabu: "WEDNESDAY",
  Kamis: "THURSDAY",
  Jumat: "FRIDAY",
  Sabtu: "SATURDAY",
  Minggu: "SUNDAY",
};

interface UseCalendarViewModelReturn {
  isLoading: boolean;
  isLoadingSchedule: boolean;
  loadingCheck: boolean;
  loading: boolean;
  selectedTeacher: User | null;
  setSelectedTeacher: React.Dispatch<React.SetStateAction<User | null>>;
  mutateDataTeacher: () => void;
  showScheduleTeacher: any;
  mutateShowScheduleTeacher: () => void;
  schedule: Schedule[];
  setSchedule: React.Dispatch<React.SetStateAction<Schedule[]>>;
  searchKeyword: string;
  setSearchKeyword: React.Dispatch<React.SetStateAction<string>>;
  drawerVisible: boolean;
  setIsDrawerVisible: React.Dispatch<React.SetStateAction<boolean>>;
  form: any;
  handleCheckboxChange: (
    day: string,
    isAvailable: boolean,
    schedule_id: string
  ) => void;
  handleTimeChange: (
    day: string,
    index: number,
    field: "start" | "end",
    value: Dayjs | null
  ) => void;
  addTimeSlot: (day: string) => void;
  removeTimeSlot: (day: string, index: number, schedule_id: string) => void;
  handleSubmit: () => Promise<void>;
  filteredData: User[] | undefined;
  handleEdit: (id: string) => void;
  DAYS: string[];
}

export const useCalendarViewModel = (): UseCalendarViewModelReturn => {
  const {
    data: dataTeacher,
    isLoading,
    mutate: mutateDataTeacher,
  } = useSWR<TeacherResponse>("/api/admin/teacher/show", fetcher);
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
  const {
    data: showScheduleTeacher,
    mutate: mutateShowScheduleTeacher,
    isLoading: isLoadingSchedule,
  } = useSWR(
    selectedTeacher
      ? `/api/admin/schedule/${selectedTeacher.user_id}/showSchedule`
      : null,
    fetcher
  );

  const [schedule, setSchedule] = useState<Schedule[]>(
    DAYS.map((day) => ({
      schedule_id: "",
      day,
      isAvailable: false,
      times: [{ start: null, end: null }],
    }))
  );

  useEffect(() => {
    if (showScheduleTeacher?.data?.length > 0) {
      const apiSchedule = showScheduleTeacher.data[0];
      const transformedSchedule = DAYS.map((day) => {
        const englishDay = DAY_TRANSLATION[day as keyof typeof DAY_TRANSLATION];
        const apiDay = apiSchedule.days?.find((d: any) => d.day === englishDay);
        return {
          schedule_id: apiSchedule?.schedule_id,
          day,
          isAvailable: apiDay?.isAvailable || false,
          times:
            apiDay?.times?.map((time: any) => ({
              start: dayjs(time.startTime).utc(),
              end: dayjs(time.endTime).utc(),
            })) || [],
        };
      });
      setSchedule(transformedSchedule);
    }
  }, [showScheduleTeacher]);

  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [drawerVisible, setIsDrawerVisible] = useState<boolean>(false);
  const [loadingCheck, setLoadingCheck] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  const handleCheckboxChange = async (
    day: string,
    isAvailable: boolean,
    schedule_id: string
  ) => {
    setSchedule((prev) =>
      prev.map((item) => (item.day === day ? { ...item, isAvailable } : item))
    );

    setLoadingCheck(true);
    try {
      const payload = {
        schedule_id: schedule_id,
        day,
        isAvailable,
      };
      await crudService.patch(
        "/api/admin/schedule/handleAvailableStatus",
        payload
      );
      mutateShowScheduleTeacher();
    } catch (error) {
      console.error("Error updating schedule:", error);
    } finally {
      setLoadingCheck(false);
    }
  };

  const handleTimeChange = (
    day: string,
    index: number,
    field: "start" | "end",
    value: Dayjs | null
  ) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.day === day
          ? {
              ...item,
              times: item.times.map((time, i) =>
                i === index ? { ...time, [field]: value } : time
              ),
            }
          : item
      )
    );
  };

  const addTimeSlot = (day: string) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.day === day
          ? { ...item, times: [...item.times, { start: null, end: null }] }
          : item
      )
    );
  };

  const removeTimeSlot = async (
    day: string,
    index: number,
    schedule_id: string
  ) => {
    Modal.confirm({
      title: "Yakin Menghapus Waktu?",
      content: "Aksi ini tidak dapat dibalik.",
      okText: "Ya",
      cancelText: "Tidak",
      onOk: async () => {
        setSchedule((prev) =>
          prev.map((item) =>
            item.day === day
              ? {
                  ...item,
                  times: item.times.filter((_, i) => i !== index),
                }
              : item
          )
        );

        try {
          const token = Cookies.get("token");
          const response = await fetch(
            `/api/admin/schedule/deleteTimeSlot/${schedule_id}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ day, index }),
            }
          );

          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }

          const result = await response.json();
          console.log("Delete successful:", result);
          mutateShowScheduleTeacher();
        } catch (error) {
          console.error("Error deleting time slot:", error);
          // Handle error (e.g., show notification)
        }
      },
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    const hasInvalidTime = schedule.some(
      (item) =>
        item.isAvailable &&
        item.times.some(
          (time) => time.start && time.end && time.start.isAfter(time.end)
        )
    );

    if (hasInvalidTime) {
      notification.error({
        message: "Waktu mulai harus lebih awal dari waktu selesai.",
      });
      setLoading(false);
      return;
    }

    const formattedSchedule = schedule
      .filter((item) => item.isAvailable)
      .map((item) => ({
        day: item.day,
        times: item.times.map((time) => ({
          startTime: time.start ? time.start.format("HH:mm") : null,
          endTime: time.end ? time.end.format("HH:mm") : null,
        })),
      }));

    const payload = {
      teacherId: selectedTeacher?.user_id,
      schedule: formattedSchedule,
    };

    try {
      await crudService.post("/api/admin/schedule/create", payload);
      notification.success({ message: "Jadwal berhasil disimpan." });
      setIsDrawerVisible(false);
      mutateShowScheduleTeacher();
    } catch (error) {
      console.error("Error:", error);
      notification.error({
        message: "Terjadi kesalahan saat menyimpan jadwal.",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredData = dataTeacher?.data.filter((teacher) =>
    teacher.username.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const handleEdit = (id: string) => {
    console.log("Edit teacher with ID:", id);
  };
  return {
    isLoading,
    selectedTeacher,
    setSelectedTeacher,
    mutateDataTeacher,
    showScheduleTeacher,
    mutateShowScheduleTeacher,
    schedule,
    setSchedule,
    searchKeyword,
    setSearchKeyword,
    drawerVisible,
    setIsDrawerVisible,
    form,
    handleCheckboxChange,
    handleTimeChange,
    addTimeSlot,
    removeTimeSlot,
    handleSubmit,
    filteredData,
    handleEdit,
    DAYS,
    isLoadingSchedule,
    loadingCheck,
    loading,
  };
};
