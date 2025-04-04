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
  handleFinish: (values: any) => Promise<void>;
  handleCancel: () => void;
  isModalVisible: boolean;
  setIsModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  handleDelete: (user_id: string) => Promise<void>;
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
      ? `/api/admin/schedule/${selectedTeacher.user_id}/showScheduleAdmin`
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
  const [isModalVisible, setIsModalVisible] = useState(false);

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
          mutateShowScheduleTeacher();
        } catch (error) {
          notification.error({
            message: "Terjadi kesalahan saat menghapus waktu.",
          });
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
      setSelectedTeacher(null);
      setSchedule(
        DAYS.map((day) => ({
          schedule_id: "",
          day,
          isAvailable: false,
          times: [{ start: null, end: null }],
        }))
      );
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

  const handleFinish = async (values: any) => {
    setLoading(true);
    const payload = {
      username: values.username,
      email: values.email,
      password: values.password,
      no_phone: values.no_phone,
      region: values.region,
    };

    try {
      if (selectedTeacher) {
        await crudService.put(
          `/api/admin/teacher/${selectedTeacher.user_id}/update`,
          payload
        );
        notification.success({ message: "Guru berhasil diperbarui." });
      } else {
        // Create new teacher
        await crudService.post("/api/admin/teacher/create", payload);
        notification.success({ message: "Guru berhasil disimpan." });
      }
      setIsModalVisible(false);
      await mutateDataTeacher();
      setSelectedTeacher(null);
      form.resetFields();
    } catch (error) {
      notification.error({
        message: "Terjadi kesalahan saat menyimpan data guru.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setSelectedTeacher(null);
  };

  const handleDelete = async (user_id: string) => {
    try {
      await crudService.delete(`/api/admin/teacher/${user_id}/delete`, user_id);
      notification.success({ message: "Guru berhasil dihapus." });
      await mutateDataTeacher();
    } catch (error) {
      notification.error({
        message: "Terjadi kesalahan saat menghapus data guru.",
      });
    }
  };

  const handleEdit = (user_id: string) => {
    try {
      const selectedTeacher = dataTeacher?.data.find(
        (teacher) => teacher.user_id === user_id
      );

      if (selectedTeacher) {
        form.setFieldsValue({
          username: selectedTeacher.username,
          email: selectedTeacher.email,
          no_phone: selectedTeacher.no_phone,
          region: selectedTeacher.region,
        });
        setSelectedTeacher(selectedTeacher);
        setIsModalVisible(true);
      }
    } catch (error) {
      notification.error({
        message: "Terjadi kesalahan saat mengedit data guru.",
      });
    }
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
    handleFinish,
    handleCancel,
    isModalVisible,
    setIsModalVisible,
    handleDelete,
  };
};
