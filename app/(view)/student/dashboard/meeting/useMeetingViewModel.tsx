import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Button, Form, message, notification } from "antd";
import { fetcher } from "@/app/lib/utils/fetcher";
import { crudService } from "@/app/lib/services/crudServices";
import { Teacher } from "@/app/model/course";
import { Program } from "@/app/model/program";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Meeting } from "@/app/model/meeting";
import Cookies from "js-cookie";
import { color } from "html2canvas/dist/types/css/types/color";
import { User } from "@/app/model/user";
import { useAuth } from "@/app/lib/auth/authServices";

dayjs.extend(utc);

const DAY_TRANSLATION: { [key: string]: string } = {
  Senin: "MONDAY",
  Selasa: "TUESDAY",
  Rabu: "WEDNESDAY",
  Kamis: "THURSDAY",
  Jumat: "FRIDAY",
  Sabtu: "SATURDAY",
  Minggu: "SUNDAY",
};

interface UserResponse {
  data: User[];
}

interface MeetingResponse {
  data: Meeting[];
}

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface ProgramResponse {
  data: Program[];
}

interface UseMeetingViewModelReturn {
  handleDateClick: (arg: any) => void;
  handleCancel: () => void;
  handleSubmit: (values: any) => void;
  events: any[];
  availableTimes: string[];
  isModalVisible: boolean;
  setSelectedTeacher: (teacher: any) => void;
  setIsModalVisible: (visible: boolean) => void;
  selectedDate: string;
  form: any;
  setSelectedDate: (date: string) => void;
  dataTeacher: UserResponse | undefined;
  loading: boolean;
  programData: ProgramResponse | undefined;
  selectedEvent: any;
  handleChangeDate: (date: any) => void;
  showMeetingByDate: MeetingResponse | undefined;
  availableTeachers: any[];
  handleCancelReschedule: () => void;
  handleChangeDateReschedule: (date: any) => void;
  handleRescheduleClick: (arg: any) => void;
  isRescheduleModalVisible: boolean;
  setIsRescheduleModalVisible: (visible: boolean) => void;
  selectedMeeting: Meeting | undefined;
  showScheduleAll: any;
  handleTeacherChange: (value: string) => void;
  selectedTeacherId: string | null;
  setMeetingId: any;
  selectedTeacher: any;
  currentStep: any;
  isModalInfoVisible: boolean;
  handleSelectTeacher: (teacher: any) => void;
  handleSubmitReschedule: (values: any) => void;
  handleOpenModalInfo: () => void;
  handleCancelModalInfo: () => void;
  showDate: any;
  handleOpenModalEmergency: () => void;
  isModalVisibleEmergency: boolean;
  handleCancelEmergency: () => void;
  handleFileChange: (info: any) => Promise<void>;
  handleBeforeUpload: (file: any) => Promise<boolean>;
  fileList: any[];
  imageUrl: string | null;
  handleSubmitRescheduleEmergency: (values: any) => Promise<void>;
  isLoadingMeeting: boolean;
  isLoadingProgram: boolean;
  isLoadingMeetingByDate: boolean;
  isLoadingMeetingById: boolean;
  isLoadingScheduleAll: boolean;
}

export const useMeetingViewModel = (): UseMeetingViewModelReturn => {
  const { data: dataTeacher, isLoading } = useSWR<UserResponse>(
    "/api/admin/teacher/showByRegion",
    fetcher
  );

  const searchParams = useSearchParams();
  const date = searchParams.get("date") || dayjs().format("YYYY-MM-DD");
  const { program_id } = useAuth();

  const {
    data: programData,
    mutate: programDataMutate,
    isLoading: isLoadingProgram,
  } = useSWR<ProgramResponse>("/api/admin/program/show", fetcher);

  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedDateReschedule, setSelectedDateReschedule] =
    useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isRescheduleModalVisible, setIsRescheduleModalVisible] =
    useState(false);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [availableTeachers, setAvailableTeachers] = useState<any[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(
    null
  );
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const { data: showScheduleTeacher } = useSWR(
    selectedTeacher
      ? `/api/admin/schedule/${selectedTeacher.user_id}/showSchedule`
      : null,
    fetcher
  );
  const fetchUrl = useMemo(() => {
    let url = "/api/student/meeting/showByDate";
    const params = new URLSearchParams();
    if (date) params.append("date", date);
    return `${url}?${params.toString()}`;
  }, [date]);
  const {
    data: showMeeting,
    mutate: mutateShowMeeting,
    isLoading: isLoadingMeeting,
  } = useSWR<MeetingResponse>("/api/student/meeting/show", fetcher);
  const {
    data: showMeetingByDate,
    mutate: mutateShowMeetingByDate,
    isLoading: isLoadingMeetingByDate,
  } = useSWR<MeetingResponse>(fetchUrl, fetcher);

  const {
    data: showMeetingById,
    mutate: mutateShowMeetingById,
    isLoading: isLoadingMeetingById,
  } = useSWR("/api/student/meeting/showById", fetcher);

  const { data: showScheduleAllTeacher, isLoading: isLoadingScheduleAll } =
    useSWR("/api/admin/schedule/showScheduleAll", fetcher);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);
  const [isModalInfoVisible, setIsModalInfoVisible] = useState(false);
  const [isModalVisibleEmergency, setIsModalVisibleEmergency] = useState(false);
  const [form] = Form.useForm();
  const filterProgram = programData?.data.filter(
    (program) => program.program_id === program_id
  );

  const handleOpenModalDateClick = () => {
    setIsModalVisible(true);
    setCurrentStep(3);
  };

  const handleOpenModalInfo = () => {
    setIsModalInfoVisible(true);
  };

  const handleCancelModalInfo = () => {
    setIsModalInfoVisible(false);
  };

  const handleDateClick = (arg: any) => {
    if (!selectedTeacher) {
      message.warning("Silakan pilih guru terlebih dahulu.");
      return;
    }

    const selectedDay = dayjs(arg.date)
      .locale("id")
      .format("dddd, DD MMMM YYYY");
    setSelectedDate(selectedDay);
    const dayName = dayjs(arg.date).locale("id").format("dddd");
    const translatedDayName = DAY_TRANSLATION[dayName];

    if (showScheduleTeacher?.data) {
      const teacherSchedule = showScheduleTeacher.data[0];

      if (Array.isArray(teacherSchedule.days)) {
        const daySchedule = teacherSchedule.days.find(
          (d: any) => d.day === translatedDayName
        );

        if (daySchedule) {
          const generatedTimes = generateTimeIntervals(daySchedule.times);

          const formatDateTimeToUTC = (dateTime: any) => {
            return dayjs.utc(dateTime).format("YYYY-MM-DD HH:mm:ss");
          };

          // **Filter waktu yang sudah dipesan dari showMeeting**
          const bookedTimes = showMeeting?.data
            ?.map((meeting) => ({
              ...meeting,
              dateTime: formatDateTimeToUTC(meeting.dateTime), // Konversi dateTime ke UTC
            }))
            ?.filter(
              (meeting) =>
                meeting.teacher_id === selectedTeacher?.user_id && // Pastikan teacher_id sama
                dayjs(meeting.dateTime).isSame(dayjs(arg.date), "day") // Konversi dateTime dan arg.date ke UTC dan cek tanggal yang sama
            )
            ?.map((meeting) => ({
              time: dayjs(meeting.dateTime).format("HH:mm"), // Konversi ke UTC dan format ke HH:mm
            }));

          // console.log("Booked Times:", bookedTimes);

          // Filter hanya waktu yang belum dipesan
          const filteredTimes = generatedTimes.filter(
            (time) => !bookedTimes?.some((booked) => booked.time === time) // Pastikan `time` tidak ada di daftar waktu yang sudah dipesan
          );

          if (filteredTimes.length === 0) {
            message.warning("Tidak ada waktu yang tersedia pada tanggal ini.");
            return;
          }

          setAvailableTimes(filteredTimes);
          setCurrentStep(2);
          handleOpenModalDateClick();
        } else {
          setAvailableTimes([]);
          setCurrentStep(1);
          message.warning("Tidak ada waktu yang tersedia pada tanggal ini.");
        }
      } else {
        setAvailableTimes([]);
        setCurrentStep(1);
        message.warning("Tidak ada waktu yang tersedia pada tanggal ini.");
      }
    } else {
      setAvailableTimes([]);
      setCurrentStep(1);
      message.warning("Tidak ada waktu yang tersedia pada tanggal ini.");
    }

    // setIsModalVisible(true);
    // message.warning("Tidak ada waktu yang tersedia pada tanggal ini.");
  };
  const generateTimeIntervals = (timeRanges: TimeSlot[]): string[] => {
    const intervals: string[] = [];
    timeRanges.forEach(({ startTime, endTime }) => {
      let start = dayjs(startTime).utc().set("date", 1);
      const end = dayjs(endTime).utc().set("date", 1);
      while (start.isBefore(end)) {
        intervals.push(start.format("HH:mm"));
        start = start.add(filterProgram?.[0].duration ?? 0, "minute");
      }
    });
    return intervals;
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setAvailableTimes([]);
    form.resetFields();
    setSelectedEvent(null);
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        teacher_id: selectedTeacher?.user_id,
        date: selectedDate,
        method: values.method,
        time: values.time,
        platform: values.platform,
      };

      const response = await fetch(`/api/student/meeting/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status == 403) {
        notification.error({
          message: "Gagal Menambahkan Jadwal",
          description: "Jatah Pertemuan Kamu Sudah Habis",
        });
        handleCancel();
        return;
      }

      if (!response.ok) {
        throw new Error("Terjadi kesalahan saat menambahkan jadwal");
      }

      notification.success({ message: "Jadwal Berhasil Ditambahkan" });
      setCurrentStep(4);

      await mutateShowMeeting();
      await mutateShowMeetingById();
      await mutateShowMeetingByDate();
      setSelectedTeacher(null);
      handleCancel();
    } catch (error) {
      if (error instanceof Error) {
        message.error(
          error.message || "Terjadi kesalahan saat menambahkan jadwal"
        );
      } else {
        message.error("Terjadi kesalahan saat menambahkan jadwal");
      }
    } finally {
      setLoading(false);
    }
  };

  const events =
    showMeetingById?.data.map((meeting: Meeting) => {
      const filteredData = dataTeacher?.data.find(
        (teacher) => teacher.user_id === meeting.teacher_id
      );

      const formatDateTimeToUTC = (dateTime: any) => {
        return dayjs.utc(dateTime).format("YYYY-MM-DD HH:mm:ss");
      };

      return {
        title: filteredData?.username,
        start: formatDateTimeToUTC(meeting.dateTime),
        teacherName: filteredData?.username,
        time: dayjs.utc(meeting.dateTime).format("HH:mm"),
        method: meeting.method,
        platform: meeting.platform,
        extendedProps: {
          color: filteredData?.color,
        },
      };
    }) || [];

  const handleChangeDate = (date: any) => {
    if (date) {
      const formatedDate = dayjs(date).format("YYYY-MM-DD");
      const scrollPosition = window.scrollY;
      router.replace(`/student/dashboard/meeting?date=${formatedDate}`);
      setTimeout(() => {
        window.scrollTo(0, scrollPosition);
      }, 100);
    }
  };

  const handleRescheduleClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setIsRescheduleModalVisible(true);
  };

  const showScheduleAll = showScheduleAllTeacher?.data || [];

  const handleCancelReschedule = () => {
    setIsRescheduleModalVisible(false);
    setSelectedDate("");
    setSelectedTeacherId(null);
    setSelectedMeeting(null);
    form.resetFields();
  };

  const handleTeacherChange = (value: string) => {
    setSelectedTeacherId(value);
  };

  const handleChangeDateReschedule = (date: any) => {
    if (!date || !selectedTeacherId) return;

    const selectedDayReschedule = dayjs(date).format("dddd").toUpperCase();

    if (!showScheduleAllTeacher?.data) {
      console.log("Show Schedule All or Show Schedule All Data is undefined");
      return;
    }

    const teacherSchedule = showScheduleAllTeacher.data.find(
      (schedule: any) => schedule.teacher_id === selectedTeacherId
    );

    if (!teacherSchedule) {
      message.warning("Tidak ada guru yang tersedia pada tanggal ini.");
      return;
    }

    const availableDays = teacherSchedule.days.filter(
      (day: any) => day.day === selectedDayReschedule && day.isAvailable
    );

    if (availableDays.length === 0) {
      message.warning("Tidak ada waktu yang tersedia pada tanggal ini.");
      return;
    }

    const teacherTimes = availableDays.flatMap((day: any) => day.times);
    const generatedTimes = generateTimeIntervals(teacherTimes); // e.g. ["09:00", "09:30", ...]

    const getOccupiedTimesFromMeeting = (
      start: string,
      duration: number,
      interval: number = 30
    ): string[] => {
      const times: string[] = [];
      const startTime = dayjs(start);
      const endTime = startTime.add(duration, "minute");

      let current = startTime;
      while (current.isBefore(endTime)) {
        times.push(current.format("HH:mm"));
        current = current.add(interval, "minute");
      }

      return times;
    };

    const bookedTimes = showMeeting?.data
      ?.filter(
        (meeting) =>
          meeting.teacher_id === selectedTeacherId &&
          dayjs.utc(meeting.dateTime).isSame(dayjs.utc(date), "day")
      )
      ?.flatMap((meeting) => {
        const duration =
          meeting.endTime && meeting.startTime
            ? dayjs(meeting.endTime).diff(dayjs(meeting.startTime), "minute")
            : 60; // fallback default 60 menit

        const utcStart = dayjs.utc(meeting.dateTime).format("YYYY-MM-DD HH:mm");
        return getOccupiedTimesFromMeeting(utcStart, duration);
      });

    // Filter waktu yang masih tersedia
    const filteredTimes = generatedTimes.filter(
      (time) => !bookedTimes?.includes(time)
    );

    if (filteredTimes.length > 0) {
      setAvailableTeachers([teacherSchedule]);
      setSelectedDate(dayjs(date).format("YYYY-MM-DD"));
      setAvailableTimes(filteredTimes);
    } else {
      message.warning("Tidak ada waktu yang tersedia pada tanggal ini.");
    }
  };

  const showDate = useMemo(() => {
    let uniqueDates = new Set<string>();

    if (showScheduleAllTeacher && showScheduleAllTeacher.data) {
      const teacherSchedule = showScheduleAllTeacher.data.find(
        (schedule: any) => schedule.teacher_id === selectedTeacherId
      );

      if (teacherSchedule) {
        const availableDays = teacherSchedule.days
          .filter((day: any) => day.isAvailable)
          .map((day: any) => day.day); // Misalnya: ["SATURDAY", "THURSDAY"]

        // Loop dari hari ini ke depan (misal, 2 tahun ke depan)
        const today = dayjs();
        const futureDate = today.add(2, "year"); // Bisa diubah sesuai kebutuhan

        let currentDate = today;

        while (currentDate.isBefore(futureDate)) {
          const dayName = currentDate.format("dddd").toUpperCase(); // "SATURDAY", "THURSDAY", etc.

          if (availableDays.includes(dayName)) {
            uniqueDates.add(currentDate.format("YYYY-MM-DD"));
          }

          currentDate = currentDate.add(1, "day"); // Pindah ke hari berikutnya
        }
      }
    }

    return Array.from(uniqueDates);
  }, [showScheduleAllTeacher, selectedTeacherId]);

  const handleSubmitReschedule = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        teacher_id: selectedTeacherId,
        date: selectedDate,
        method: values.method,
        time: values.time,
        platform: values.platform,
      };

      const response = await fetch(`/api/student/meeting/${meetingId}/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 400) {
        const data = await response.json();
        notification.info({
          message: "Tidak Bisa Melakukan Reschedule",
          description:
            data.error || "Maksimal H-2 Jam Sebelum Pertemuan Terakhir Kali",
          btn: (
            <Button danger onClick={() => handleOpenModalEmergency()}>
              Pengajuan Emergency
            </Button>
          ),
        });

        handleCancelReschedule();
        return;
      } else if (response.status === 403) {
        notification.error({
          message: "Tidak Bisa Melakukan Reschedule",
          description: "Jatah Pertemuan Kamu Sudah Habis",
        });
        handleCancelReschedule();
        return;
      }

      if (!response.ok) {
        throw new Error("Terjadi kesalahan saat menambahkan jadwal");
      }

      notification.success({ message: "Jadwal Berhasil Direschedule" });

      await mutateShowMeeting();
      await mutateShowMeetingById();
      await mutateShowMeetingByDate();
      handleCancelReschedule();
    } catch (error) {
      if (error instanceof Error) {
        message.error(
          error.message || "Terjadi kesalahan saat menambahkan jadwal"
        );
      } else {
        message.error("Terjadi kesalahan saat menambahkan jadwal");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTeacher = (teacher: any) => {
    setSelectedTeacher(teacher);
    setCurrentStep(1);
  };

  const handleOpenModalEmergency = () => {
    setIsModalVisibleEmergency(true);
  };

  const handleCancelEmergency = () => {
    setIsModalVisibleEmergency(false);
    setSelectedTeacherId(null);
    setImageUrl(null);
    form.resetFields();
  };

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (info: any) => {
    if (info.file.status === "done") {
      const base64 = await getBase64(info.file.originFileObj as File);
      setImageUrl(base64);
    }
    setFileList(info.fileList);
  };

  const handleBeforeUpload = async (file: any) => {
    const base64 = await getBase64(file);
    setImageUrl(base64);
    return false;
  };

  const handleSubmitRescheduleEmergency = async (values: any) => {
    if (!selectedTeacherId) {
      message.error("Silakan pilih guru terlebih dahulu!");
      return;
    }

    // Buat payload sesuai skema `RescheduleMeeting`
    const payload = {
      teacher_id: selectedTeacherId,
      meeting_id: meetingId,
      date: selectedDate,
      method: values.method,
      time: values.time,
      platform: values.platform,
      reason: values.reason,
      option_reason: values.option_reason,
      imageUrl: imageUrl,
      status: "PENDING",
    };

    try {
      setLoading(true);
      const response = await fetch(`/api/student/rescheduleMeeting/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Terjadi kesalahan saat menambahkan jadwal");
      }

      notification.success({
        message: "Berhasil Mengirimkan Pengajuan",
        description:
          "Menunggu konfirmasi admin, hasil konfirmasi akan dikirim ke Whatsapp",
      });

      await mutateShowMeeting();
      await mutateShowMeetingById();
      await mutateShowMeetingByDate();
      setLoading(false);
      handleCancelEmergency();
    } catch (error) {
      if (error instanceof Error) {
        message.error(
          error.message || "Terjadi kesalahan saat menambahkan jadwal"
        );
      } else {
        message.error("Terjadi kesalahan saat menambahkan jadwal");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    showMeetingByDate,
    handleDateClick,
    handleCancel,
    handleSubmit,
    events,
    availableTimes,
    isModalVisible,
    setIsModalVisible,
    setSelectedTeacher,
    selectedDate,
    setSelectedDate,
    availableTeachers,
    handleChangeDateReschedule,
    form,
    dataTeacher,
    loading,
    programData,
    selectedEvent,
    handleChangeDate,
    handleCancelReschedule,
    handleRescheduleClick,
    isRescheduleModalVisible,
    setIsRescheduleModalVisible,
    selectedMeeting,
    showScheduleAll,
    handleTeacherChange,
    selectedTeacherId,
    setMeetingId,
    handleSubmitReschedule,
    selectedTeacher,
    handleSelectTeacher,
    currentStep,
    handleOpenModalInfo,
    handleCancelModalInfo,
    isModalInfoVisible,
    showDate,
    handleOpenModalEmergency,
    isModalVisibleEmergency,
    handleCancelEmergency,
    handleFileChange,
    handleBeforeUpload,
    fileList,
    imageUrl,
    handleSubmitRescheduleEmergency,
    isLoadingMeeting,
    isLoadingProgram,
    isLoadingMeetingByDate,
    isLoadingMeetingById,
    isLoadingScheduleAll,
  };
};
