import { crudService } from "@/app/lib/services/crudServices";
import { fetcher } from "@/app/lib/utils/fetcher";
import { Form, Modal, notification } from "antd";
import { useState } from "react";
import useSWR from "swr";
import { EventInput } from "@fullcalendar/core";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import Cookies from "js-cookie";

dayjs.extend(utc);

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface ScheduleTime {
  time_id: string;
  day_id: string;
  startTime: string;
  endTime: string;
}

export interface ScheduleDay {
  day_id: string;
  schedule_id: string;
  day: DayOfWeek;
  isAvailable: boolean;
  times: ScheduleTime[];
}

export interface ScheduleTeacher {
  schedule_id: string;
  teacher_id: string;
  createdAt: string;
  updatedAt: string;
  days: ScheduleDay[];
}

export interface Teacher {
  user_id: string;
  username: string;
  email: string;
  color: string;
  imageUrl: string;
  scheduleTeacher: ScheduleTeacher[];
  days: any;
}

interface ScheduleTeacherResponse {
  data: Teacher;
}

interface ScheduleResponse {
  data: any;
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

interface TimeSlot {
  time_id?: string;
  start: string | null;
  end: string | null;
}

interface DaySchedule {
  schedule_id: string;
  day: DayOfWeek;
  isAvailable: boolean;
  times: TimeSlot[];
}

export const useScheduleViewModel = () => {
  const {
    data: scheduleTeacher,
    isLoading: isLoadingSchedule,
    mutate: mutateSchedule,
  } = useSWR<ScheduleTeacherResponse>("/api/teacher/schedule/detail", fetcher);

  const {
    data: dayOffTeacher,
    isLoading: isLoadingDayOff,
    mutate: mutateDayOff,
  } = useSWR<ScheduleTeacherResponse>(
    "/api/teacher/schedule/showDayOff",
    fetcher
  );

  const {
    data,
    isLoading: isLoadingScheduleTeacher,
    mutate: mutateShowScheduleTeacher,
  } = useSWR<ScheduleResponse>("/api/teacher/schedule/showSchedule", fetcher);

  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [form] = Form.useForm();
  const [drawerVisible, setIsDrawerVisible] = useState(false);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [loadingCheck, setLoadingCheck] = useState(false);

  const showDrawer = () => {
    const teacher = data?.data?.[0] as Teacher;
    if (teacher) {
      const mappedSchedule: DaySchedule[] = DAYS.map((dayIndo) => {
        const dayEng = DAY_TRANSLATION[
          dayIndo as keyof typeof DAY_TRANSLATION
        ] as DayOfWeek;
        const found = (teacher.days || []).find((d: any) => d.day === dayEng);

        return {
          schedule_id: found?.schedule_id || "",
          day: dayEng,
          isAvailable: found?.isAvailable || false,
          times:
            found?.times?.map((t: any) => ({
              time_id: t.time_id,
              start: dayjs.utc(t.startTime).format("HH:mm"),
              end: dayjs.utc(t.endTime).format("HH:mm"),
            })) || [],
        };
      });
      setSchedule(mappedSchedule);
      setIsDrawerVisible(true);
    }
  };

  const getIndonesianDay = (dayEng: string) => {
    return (
      Object.entries(DAY_TRANSLATION).find(
        ([indo, eng]) => eng === dayEng
      )?.[0] || dayEng
    );
  };

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
              body: JSON.stringify({
                day: getIndonesianDay(day), // ✅ convert di sini
                index,
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }
          mutateShowScheduleTeacher();
        } catch (error) {
          notification.error({
            message: "Terjadi kesalahan saat menghapus waktu.",
          });
        }
      },
    });
  };

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        alasan: values.alasan,
        tanggal: selectedDate ? dayjs(selectedDate).format("YYYY-MM-DD") : null
      }
      console.log(payload)
      await crudService.post("/api/teacher/schedule/dayOff", payload);
      setIsModalOpen(false);
      notification.success({
        message: "Data berhasil disimpan!",
        description: "Data telah berhasil disimpan ke database.",
      });
      await mutateSchedule();
      await mutateDayOff();
      form.resetFields();
      setSelectedDate(null);
    } catch (error) {
      console.error("Error:", error);
      notification.error({
        message: "Gagal menyimpan data!",
        description: "Terjadi kesalahan saat menyimpan data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const hasInvalidTime = schedule.some(
        (item) =>
          item.isAvailable &&
          item.times.some(
            (time) =>
              time.start &&
              time.end &&
              dayjs(time.start).isAfter(dayjs(time.end))
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
        .map((item) => {
          const dayInIndonesian =
            Object.entries(DAY_TRANSLATION).find(
              ([indo, eng]) => eng === item.day
            )?.[0] || item.day;

          return {
            day: dayInIndonesian,
            times: item.times.map((time) => ({
              startTime:
                time.start && dayjs.isDayjs(time.start)
                  ? time.start.format("HH:mm")
                  : typeof time.start === "string"
                  ? time.start
                  : null,

              endTime:
                time.end && dayjs.isDayjs(time.end)
                  ? time.end.format("HH:mm")
                  : typeof time.end === "string"
                  ? time.end
                  : null,
            })),
          };
        });

      const payload = {
        teacherId: scheduleTeacher?.data.user_id,
        schedule: formattedSchedule,
      };

      await crudService.post("/api/admin/schedule/create", payload);
      notification.success({ message: "Jadwal berhasil disimpan." });
      setIsDrawerVisible(false);
      mutateShowScheduleTeacher();
      setSchedule(
        DAYS.map((day) => ({
          schedule_id: "",
          day: DAY_TRANSLATION[
            day as keyof typeof DAY_TRANSLATION
          ] as DayOfWeek,
          isAvailable: false,
          times: [{ start: null, end: null }],
        }))
      );
    } catch (error) {
      notification.error({
        message: "Terjadi kesalahan saat menyimpan jadwal.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelModal = () => {
    setIsModalOpen(false);
    form.resetFields();
    setSelectedDate(null);
  };

  return {
    scheduleTeacher,
    isLoadingSchedule,
    mutateSchedule,
    handleFinish,
    loading,
    events,
    isModalOpen,
    setIsModalOpen,
    selectedDate,
    setSelectedDate,
    form,
    setEvents,
    dayOffTeacher,
    isLoadingDayOff,
    data,
    isLoadingScheduleTeacher,
    handleSubmit,
    loadingSubmit,
    showDrawer,
    handleCheckboxChange,
    handleTimeChange,
    addTimeSlot,
    removeTimeSlot,
    drawerVisible,
    setIsDrawerVisible,
    setSchedule,
    loadingCheck,
    schedule,
    getIndonesianDay,
    handleCancelModal,
  };
};
