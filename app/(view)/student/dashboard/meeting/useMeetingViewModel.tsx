import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import utc from "dayjs/plugin/utc";
import { Button, Form, message, notification } from "antd";
import { fetcher } from "@/app/lib/utils/fetcher";
import { Teacher } from "@/app/model/course";
import { Program } from "@/app/model/program";
import { useSearchParams, useRouter } from "next/navigation";
import { Meeting } from "@/app/model/meeting";
import Cookies from "js-cookie";
import { ScheduleMonth, ShiftSchedule, TeacherLeave } from "@prisma/client";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(utc);

interface User {
  user_id: string;
  color: string;
  username: string;
  imageUrl: string;
  email: string;
  ScheduleMonth: ScheduleMonth[];
}

interface UserResponse {
  data: User[];
}

interface MeetingResponse {
  data: Meeting[];
}

interface ProgramResponse {
  data: Program[];
}

interface ShiftResponse {
  data: ShiftSchedule[];
}

interface ScheduleTeacherResponse {
  data: TeacherLeave;
}

interface ProgramDetailResponse {
  data: Program;
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
  handleTeacherChange: (value: any) => void;
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
  const { data: dataTeacher } = useSWR<UserResponse>(
    "/api/admin/teacher/showByRegion",
    fetcher
  );

  const searchParams = useSearchParams();
  const date = searchParams.get("date") || dayjs().format("YYYY-MM-DD");

  const { data: programData, isLoading: isLoadingProgram } =
    useSWR<ProgramResponse>("/api/admin/program/show", fetcher);

  const { data: programDetail } = useSWR<ProgramDetailResponse>(
    `/api/student/programDetail`,
    fetcher
  );

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
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const { data: showScheduleTeacher } = useSWR(
    selectedTeacher
      ? `/api/admin/schedule/${selectedTeacher.user_id}/showSchedule`
      : null,
    fetcher
  );

  const fetchUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (date) params.append("date", date);
    return `/api/student/meeting/showByDate?${params.toString()}`;
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

  const { data: shiftData } = useSWR<ShiftResponse>(
    "/api/admin/shift",
    fetcher
  );

  const { data: dayOffTeacher, isLoading: isLoadingDayOff } =
    useSWR<ScheduleTeacherResponse>(
      selectedTeacher
        ? `/api/student/showDayOffTeacher/${selectedTeacher?.user_id}`
        : null,
      fetcher
    );

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);
  const [isModalInfoVisible, setIsModalInfoVisible] = useState(false);
  const [isModalVisibleEmergency, setIsModalVisibleEmergency] = useState(false);
  const [form] = Form.useForm();
  const filterProgram = programDetail?.data?.program_id;

  const handleOpenModalDateClick = () => {
    setIsModalVisible(true);
    setCurrentStep(3);
  };

  const handleOpenModalInfo = () => setIsModalInfoVisible(true);
  const handleCancelModalInfo = () => setIsModalInfoVisible(false);

  /* ===================== SHIFT LOOKUP ===================== */
  const shiftMap = useMemo(() => {
    const map = new Map<
      string,
      { id: string; title: string; start_time: string; end_time: string }
    >();
    const list = Array.isArray(shiftData?.data) ? shiftData.data : [];
    list.forEach((s: any) => map.set(s.id, s));
    return map;
  }, [shiftData]);

  type MeetingSchedule = {
    dateTime: string | Date;
    startTime?: string | Date | null;
    endTime?: string | Date | null;
    duration?: number;
    program_id?: string;
  };

  const resolveMeetingDuration = (
    m: MeetingSchedule,
    fallbackDuration?: number
  ) => {
    const startRaw = m?.startTime ?? m?.dateTime;
    const endRaw = m?.endTime;

    if (startRaw && endRaw) {
      const start = dayjs.utc(startRaw);
      const end = dayjs.utc(endRaw);
      const diff = end.diff(start, "minute");
      if (diff > 0) return diff;
    }

    if (typeof m?.duration === "number" && m.duration > 0) return m.duration;

    const programList = Array.isArray(programData?.data)
      ? programData.data
      : [];
    const matchedProgram = programList.find(
      (p: Program) => p.program_id === m?.program_id
    );

    if (matchedProgram?.duration) return matchedProgram.duration;
    if (typeof fallbackDuration === "number" && fallbackDuration > 0) {
      return fallbackDuration;
    }
    return 60;
  };

  /** Ambil jam harian (HH:mm) dari array times yang berisi shift_id */
  const getDailyTimesFromBlockTimes = (
    blockTimes: Array<{ shift_id: string }>
  ): { start: string; end: string }[] => {
    const out: { start: string; end: string }[] = [];
    for (const t of blockTimes || []) {
      const sh = t?.shift_id ? shiftMap.get(t.shift_id) : null;
      if (!sh) continue;
      out.push({
        start: dayjs.utc(sh.start_time).format("HH:mm"),
        end: dayjs.utc(sh.end_time).format("HH:mm"),
      });
    }
    return out;
  };

  const materializeRangesForDate = (
    selectedDateISO: string,
    daily: { start: string; end: string }[]
  ) => {
    return daily.map(({ start, end }) => {
      const s = dayjs.utc(`${selectedDateISO} ${start}`, "YYYY-MM-DD HH:mm");
      let e = dayjs.utc(`${selectedDateISO} ${end}`, "YYYY-MM-DD HH:mm");
      if (e.isBefore(s)) e = e.add(1, "day"); // cross-midnight
      return { start: s, end: e };
    });
  };

  const generateAvailableSlotsFromShifts = (
    dayScheduleTimes: Array<{ shift_id: string }>,
    meetings: MeetingSchedule[],
    selectedDateISO: string,
    programDuration: number
  ): string[] => {
    const slots: string[] = [];
    const daily = getDailyTimesFromBlockTimes(dayScheduleTimes);
    if (daily.length === 0) return [];

    const ranges = materializeRangesForDate(selectedDateISO, daily);

    const busy = meetings
      .map<{ start: dayjs.Dayjs; end: dayjs.Dayjs } | null>((m) => {
        const start = m?.startTime ?? m?.dateTime;
        if (!start) return null;

        const startUtc = dayjs.utc(start);
        const duration = resolveMeetingDuration(m, programDuration);
        const end = m?.endTime
          ? dayjs.utc(m.endTime)
          : startUtc.add(duration, "minute");

        return { start: startUtc, end };
      })
      .filter(
        (slot): slot is { start: dayjs.Dayjs; end: dayjs.Dayjs } => slot !== null
      );

    for (const r of ranges) {
      let cursor = r.start.clone();
      while (cursor.add(programDuration, "minute").isSameOrBefore(r.end)) {
        const s = cursor.clone();
        const e = s.add(programDuration, "minute");
        const overlaps = busy.some(
          (b) => s.isBefore(b.end) && e.isAfter(b.start)
        );
        if (!overlaps) slots.push(s.format("HH:mm"));
        cursor = cursor.add(programDuration, "minute");
      }
    }

    slots.sort((a, b) => dayjs(a, "HH:mm").diff(dayjs(b, "HH:mm")));
    return slots;
  };

  /* ========= HELPERS: gabung semua block pada tanggal terpilih ========= */
  const getBlocksCoveringDate = (scheduleMonths: any[], selectedDateISO: string) => {
    const selected = dayjs(selectedDateISO).startOf("day");
    return (scheduleMonths ?? [])
      .flatMap((m: any) => m.blocks ?? [])
      .filter((block: any) => {
        const start = dayjs(block.start_date).startOf("day");
        const end = dayjs(block.end_date).startOf("day");
        return (
          selected.isSame(start, "day") ||
          selected.isSame(end, "day") ||
          (selected.isAfter(start, "day") && selected.isBefore(end, "day"))
        );
      });
  };

  const mergeTimesFromBlocks = (blocks: any[]) => {
    const byShift = new Map<string, { shift_id: string }>();
    blocks.forEach((b: any) => (b?.times ?? []).forEach((t: any) => {
      if (t?.shift_id && !byShift.has(t.shift_id)) {
        byShift.set(t.shift_id, { shift_id: t.shift_id });
      }
    }));
    return Array.from(byShift.values());
  };

  /* ===================== DATE CLICK ===================== */
  const handleDateClick = (arg: any) => {
    if (!selectedTeacher) {
      message.warning("Silakan pilih guru terlebih dahulu.");
      return;
    }

    const selectedDay = dayjs(arg.date)
      .locale("id")
      .format("dddd, DD MMMM YYYY");
    setSelectedDate(selectedDay);

    const selectedDateFormatted = dayjs(arg.date).format("YYYY-MM-DD");

    const dayOffDates = Array.isArray(dayOffTeacher?.data)
      ? (dayOffTeacher.data as any[]).map((item: any) => item.leave_date)
      : [];

    if (dayOffDates.includes(selectedDateFormatted)) {
      message.warning(`Tanggal ${selectedDateFormatted} adalah hari libur guru.`);
      return;
    }

    const selectedDateISO = dayjs(arg.date).format("YYYY-MM-DD");
    const teacherSchedule = (showScheduleTeacher as any)?.data;
    const scheduleMonths = teacherSchedule?.ScheduleMonth ?? [];

    // Ambil SEMUA block yang meliputi tanggal tsb, lalu gabungkan times (dedup)
    const blocksToday = getBlocksCoveringDate(scheduleMonths, selectedDateISO);
    const mergedTimes = mergeTimesFromBlocks(blocksToday);

    if (mergedTimes.length === 0) {
      setAvailableTimes([]);
      setCurrentStep(1);
      message.warning("Tidak ada jadwal guru pada tanggal ini.");
      return;
    }

    const programDuration = programDetail?.data?.duration ?? 0;

    const meetingsToday =
      showMeeting?.data?.filter(
        (m) =>
          selectedTeacher &&
          m.teacher_id === selectedTeacher.user_id &&
          dayjs.utc(m.dateTime).format("YYYY-MM-DD") === selectedDateISO
      ) || [];

    const slots = generateAvailableSlotsFromShifts(
      mergedTimes,
      meetingsToday,
      selectedDateISO,
      programDuration
    );

    if (slots.length === 0) {
      setAvailableTimes([]);
      setCurrentStep(1);
      message.warning("Tidak ada waktu yang tersedia pada tanggal ini.");
      return;
    }

    setAvailableTimes(slots);
    setCurrentStep(2);
    handleOpenModalDateClick();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setAvailableTimes([]);
    form.resetFields();
    setSelectedEvent(null);
  };

  /* ===================== RESCHEDULE DATE CHANGE ===================== */
  const handleChangeDateReschedule = (dateVal: any) => {
    if (!dateVal || !selectedTeacher) return;

    const selectedDateISO = dayjs(dateVal).format("YYYY-MM-DD");
    const formattedDate = dayjs(dateVal).locale("id").format("dddd, DD MMMM YYYY");

    const teacherSchedule = (showScheduleTeacher as any)?.data;
    const scheduleMonths = teacherSchedule?.ScheduleMonth ?? [];

    // Ambil SEMUA block di tanggal itu & gabungkan times
    const blocksToday = getBlocksCoveringDate(scheduleMonths, selectedDateISO);
    const mergedTimes = mergeTimesFromBlocks(blocksToday);

    if (mergedTimes.length === 0) {
      setAvailableTimes([]);
      setCurrentStep(1);
      message.warning(`Tidak ada jadwal guru pada ${formattedDate}.`);
      return;
    }

    const programDuration = programDetail?.data?.duration ?? 0;

    const meetingsToday =
      showMeeting?.data?.filter(
        (m) =>
          selectedTeacher &&
          m.teacher_id === selectedTeacher.user_id &&
          dayjs.utc(m.dateTime).format("YYYY-MM-DD") === selectedDateISO
      ) || [];

    const slots = generateAvailableSlotsFromShifts(
      mergedTimes,
      meetingsToday,
      selectedDateISO,
      programDuration
    );

    if (slots.length > 0) {
      setAvailableTeachers([teacherSchedule]);
      setSelectedDate(selectedDateISO);
      setAvailableTimes(slots);
    } else {
      setAvailableTimes([]);
      setCurrentStep(1);
      message.warning(`Tidak ada waktu yang tersedia pada ${formattedDate}.`);
    }
  };

  /* ===================== SUBMIT CREATE ===================== */
  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const platform = values.method === "OFFLINE" ? null : "ZOOM";
      const payload = {
        teacher_id: selectedTeacher?.user_id,
        date: selectedDate,
        method: values.method,
        time: values.time,
        platform,
      };

      const response = await fetch(`/api/student/meeting/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 403) {
        notification.error({
          message: "Gagal Menambahkan Jadwal",
          description: "Jatah Pertemuan Kamu Sudah Habis",
        });
        handleCancel();
        return;
      }

      const responseData = await response.json();
      notification.success({ message: responseData.message });
      setCurrentStep(4);

      await mutateShowMeeting();
      await mutateShowMeetingById();
      await mutateShowMeetingByDate();
      setSelectedTeacher(null);
      setAvailableTimes([]);
      setSelectedDate("");
      handleCancel();
    } catch (error: any) {
      message.error(
        error?.message ||
          "Terjadi kesalahan saat menambahkan jadwal, silahkan hubungi admin"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ===================== EVENTS (kalender kecil student) ===================== */
  const events =
    showMeetingById?.data.map((meeting: Meeting) => {
      const filteredData = dataTeacher?.data.find(
        (teacher) => teacher.user_id === meeting.teacher_id
      );

      const formatDateTimeToUTC = (dateTime: any) =>
        dayjs.utc(dateTime).format("YYYY-MM-DD HH:mm:ss");

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

  const handleChangeDate = (dateVal: any) => {
    if (!dateVal) return;
    const formatedDate = dayjs(dateVal).format("YYYY-MM-DD");
    const scrollPosition = window.scrollY;
    router.replace(`/student/dashboard/meeting?date=${formatedDate}`);
    setTimeout(() => {
      window.scrollTo(0, scrollPosition);
    }, 100);
  };

  const handleRescheduleClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setIsRescheduleModalVisible(true);
  };

  const showScheduleAll = showScheduleAllTeacher?.data || [];

  const handleCancelReschedule = () => {
    setIsRescheduleModalVisible(false);
    setSelectedDate("");
    setSelectedTeacher(null);
    setAvailableTimes([]);
    setSelectedMeeting(null);
    form.resetFields();
  };

  const handleTeacherChange = (value: { value: string; label: string }) => {
    const teacher = dataTeacher?.data.find(
      (t: Teacher) => t.user_id === value.value
    );

    if (teacher) {
      setSelectedTeacher(teacher);

      const teacherSchedule = teacher?.ScheduleMonth ?? [];
      const availableDates = teacherSchedule.flatMap((month: any) =>
        month.blocks.map((block: any) => {
          const start = dayjs(block.start_date);
          const end = dayjs(block.end_date);
          const days: string[] = [];

          for (
            let d = start.clone();
            d.isSameOrBefore(end);
            d = d.add(1, "day")
          ) {
            days.push(d.format("dddd").toUpperCase());
          }

          return days;
        })
      );

      setAvailableDays(Array.from(new Set(availableDates.flat())));
    }
  };

  const showDate = useMemo(() => {
    const availableDates = new Set<string>();

    if (showScheduleAllTeacher?.data && selectedTeacher?.user_id) {
      const teacherSchedules = showScheduleAllTeacher.data.filter(
        (schedule: any) => schedule.teacher_id === selectedTeacher.user_id
      );

      const allBlocks = teacherSchedules.flatMap(
        (schedule: any) => schedule.blocks ?? []
      );

      allBlocks.forEach((block: any) => {
        const start = dayjs(block.start_date);
        const end = dayjs(block.end_date);

        if (!start.isValid() || !end.isValid()) return;

        let current = start.clone();
        while (current.isSameOrBefore(end, "day")) {
          availableDates.add(current.format("YYYY-MM-DD"));
          current = current.add(1, "day");
        }
      });
    }

    return Array.from(availableDates);
  }, [showScheduleAllTeacher, selectedTeacher]);

  /* ===================== RESCHEDULE SUBMIT ===================== */
  const handleSubmitReschedule = async (values: any) => {
    setLoading(true);
    try {
      const platform = values.method === "OFFLINE" ? null : "ZOOM";

      const payload = {
        teacher_id: selectedTeacher?.user_id,
        date: selectedDate,
        method: values.method,
        time: values.time,
        platform,
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
            data.error || "Maksimal H-12 Jam Sebelum Pertemuan Terakhir Kali",
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

      const responseData = await response.json();

      notification.success({ message: responseData.message });

      await mutateShowMeeting();
      await mutateShowMeetingById();
      await mutateShowMeetingByDate();
      setSelectedTeacher(null);
      setAvailableTimes([]);
      handleCancelReschedule();
    } catch (error: any) {
      message.error(
        error?.message ||
          "Terjadi kesalahan saat menambahkan jadwal, silahkan hubungi admin"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTeacher = (teacher: any) => {
    setSelectedTeacher(teacher);
    setCurrentStep(1);
  };

  const handleOpenModalEmergency = () => setIsModalVisibleEmergency(true);

  const handleCancelEmergency = () => {
    setIsModalVisibleEmergency(false);
    setSelectedTeacherId(null);
    setImageUrl(null);
    form.resetFields();
  };

  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

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
    if (!selectedTeacher) {
      message.error("Silakan pilih guru terlebih dahulu!");
      return;
    }

    const platform = values.method === "OFFLINE" ? null : "ZOOM";

    const payload = {
      teacher_id: selectedTeacher?.user_id,
      meeting_id: meetingId,
      date: selectedDate,
      method: values.method,
      time: values.time,
      platform,
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
      setSelectedTeacher(null);
      setAvailableTimes([]);
      setLoading(false);
      handleCancelEmergency();
    } catch {
      notification.error({
        message: "Gagal Menambahkan Action",
        description:
          "Pastikan Gambar Tercompres, jika tidak bisa silakan hubungi admin",
      });
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
