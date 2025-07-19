"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useCallback, useEffect, useState } from "react";
import {
  Card,
  Modal,
  Form,
  Input,
  DatePicker,
  Button,
  message,
  Spin,
  Skeleton,
  Checkbox,
  Space,
  TimePicker,
  Drawer,
} from "antd";
import utc from "dayjs/plugin/utc";
import dayjs, { Dayjs } from "dayjs";
import { EventInput } from "@fullcalendar/core";
import Icon, { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useScheduleViewModel } from "./useScheduleViewModel";
import Loading from "@/app/components/Loading";
import { AddIcon, DeleteIcon } from "@/app/components/Icon";
dayjs.extend(utc);

interface ScheduleTime {
  startTime: string;
  endTime: string;
}

interface ScheduleDay {
  day: string;
  isAvailable: boolean;
  times?: ScheduleTime[];
}

interface Schedule {
  schedule_id: string;
  teacher_id: string;
  days: ScheduleDay[];
}

interface Teacher {
  color?: string;
  scheduleTeacher: Schedule[];
}

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

type DayOfWeek = (typeof DAYS)[number];

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

interface Teacher {
  teacher_id: string;
  username: string;
  days: {
    day: DayOfWeek;
    day_id: string;
    isAvailable: boolean;
    schedule_id: string;
    times: {
      time_id: string;
      startTime: string;
      endTime: string;
    }[];
  }[];
}

export default function ScheduleComponent() {
  const {
    scheduleTeacher,
    isLoadingSchedule,
    handleFinish,
    events,
    isModalOpen,
    setIsModalOpen,
    selectedDate,
    setSelectedDate,
    form,
    setEvents,
    loading,
    dayOffTeacher,
    isLoadingDayOff,
    data,
    isLoadingScheduleTeacher,
    loadingSubmit,
    handleSubmit,
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
    handleCancelModal
  } = useScheduleViewModel();

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const generateEventsInRange = useCallback(
    (startDate: Date, endDate: Date): EventInput[] => {
      const teacher = scheduleTeacher?.data as Teacher | undefined;
      const schedule = teacher?.scheduleTeacher?.[0];
      const color = teacher?.color || "#1890ff";

      if (!schedule || !schedule.days) return [];

      const days = schedule.days;

      const daysOff = Array.isArray(dayOffTeacher?.data)
        ? dayOffTeacher?.data.map((item: any) => item.leave_date)
        : [];

      const generated: EventInput[] = [];

      for (
        let d = dayjs(startDate);
        d.isBefore(dayjs(endDate).add(1, "day"));
        d = d.add(1, "day")
      ) {
        const dateStr = d.format("YYYY-MM-DD");

        // Hari libur
        if (daysOff.includes(dateStr)) {
          generated.push({
            title: "LIBUR",
            start: d.startOf("day").toISOString(),
            end: d.endOf("day").toISOString(),
            backgroundColor: "#f5222d",
            borderColor: "#f5222d",
            textColor: "#fff",
          });
          continue;
        }

        const dayName = d.locale("en").format("dddd").toUpperCase();
        const matchedDay = days.find(
          (day) => day.day === dayName && day.isAvailable
        );
        if (!matchedDay) continue;

        matchedDay.times?.forEach((time) => {
          const startTime = dayjs.utc(time.startTime);
          const endTime = dayjs.utc(time.endTime);

          const start = dayjs(d)
            .hour(startTime.hour())
            .minute(startTime.minute())
            .second(0)
            .millisecond(0);

          const end = dayjs(d)
            .hour(endTime.hour())
            .minute(endTime.minute())
            .second(0)
            .millisecond(0);

          generated.push({
            title: "",
            start: start.toISOString(),
            end: end.toISOString(),
            extendedProps: {
              displayTime: `${formatTime(start.toDate())} - ${formatTime(
                end.toDate()
              )}`,
            },
            backgroundColor: color,
            borderColor: color,
            textColor: "#fff",
          });
        });
      }

      return generated;
    },
    [scheduleTeacher, dayOffTeacher]
  );

  useEffect(() => {
    if (
      !isLoadingSchedule &&
      !isLoadingDayOff &&
      scheduleTeacher?.data && // pastikan data ada
      dayOffTeacher?.data
    ) {
      const start = dayjs().startOf("month").toDate();
      const end = dayjs().endOf("month").toDate();
      const newEvents = generateEventsInRange(start, end);
      setEvents(newEvents);
    }
  }, [
    isLoadingSchedule,
    isLoadingDayOff,
    scheduleTeacher,
    dayOffTeacher,
    generateEventsInRange,
    setEvents,
  ]);

  const handleDateRangeChange = (arg: any) => {
    if (
      !scheduleTeacher?.data?.scheduleTeacher ||
      scheduleTeacher.data.scheduleTeacher.length === 0
    )
      return;

    const rangeStart = dayjs(arg.start).toDate();
    const rangeEnd = dayjs(arg.end).toDate();
    const newEvents = generateEventsInRange(rangeStart, rangeEnd);
    setEvents(newEvents);
  };

  const renderEventContent = (eventInfo: any) => {
    const isHoliday = eventInfo.event.title === "LIBUR";
    const displayText =
      eventInfo.event.extendedProps.displayTime || eventInfo.event.title;

    return (
      <div
        style={{
          backgroundColor: isHoliday ? "#f5222d" : undefined,
          color: isHoliday ? "#fff" : "black",
          width: "100%",
          height: "100%",
          textAlign: "center",
          fontWeight: "bold",
          fontSize: 13,
          lineHeight: "40px", // tinggi sel default FullCalendar dayGrid
          borderRadius: 4,
        }}
      >
        {displayText}
      </div>
    );
  };
  const handleDateClick = (arg: any) => {
    const clickedDate = dayjs(arg.dateStr);
    const dateStr = clickedDate.format("YYYY-MM-DD");

    const daysOff = Array.isArray(dayOffTeacher?.data)
      ? dayOffTeacher.data.map((item: any) => item.leave_date)
      : [];

    if (daysOff.includes(dateStr)) {
      message.warning("Tanggal tersebut adalah hari libur.");
      return;
    }

    setSelectedDate(clickedDate.toDate());
    form.setFieldsValue({ tanggal: clickedDate });
    setIsModalOpen(true);
  };

  if (isLoadingSchedule || isLoadingDayOff) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    );
  }

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={showDrawer} loading={isLoadingSchedule}>
          Lihat Jadwal
        </Button>
      </div>

      <Drawer
        placement="right"
        open={drawerVisible}
        loading={isLoadingSchedule}
        onClose={() => {
          setIsDrawerVisible(false);
          setSchedule(
            DAYS.map((day) => ({
              schedule_id: "",
              day,
              isAvailable: false,
              times: [{ start: null, end: null }],
            }))
          );
        }}
        title={"Jadwal Guru"}
        width={480}
      >
        {loadingCheck && <Loading />}
        {schedule ? (
          <Form layout="vertical" onFinish={handleSubmit}>
            {schedule.map((item) => (
              <Form.Item key={item.day} style={{ marginBottom: 20 }}>
                <Checkbox
                  checked={item.isAvailable || false}
                  onChange={(e) =>
                    handleCheckboxChange(
                      item.day,
                      e.target.checked,
                      item.schedule_id
                    )
                  }
                >
                  {getIndonesianDay(item.day)}
                </Checkbox>

                {item.isAvailable && (
                  <div style={{ marginTop: 16 }}>
                    {item.times.map((time, index) => (
                      <Space
                        key={index}
                        size="middle"
                        align="start"
                        style={{ display: "flex", marginBottom: 8 }}
                      >
                        {/* TimePicker for Start */}
                        <Form.Item style={{ marginBottom: 0 }} required>
                          <TimePicker
                            value={
                              time.start ? dayjs(time.start, "HH:mm") : null
                            }
                            onChange={(value) =>
                              handleTimeChange(item.day, index, "start", value)
                            }
                            format="HH:mm"
                            placeholder="Waktu Mulai"
                            style={{ width: 120 }}
                          />
                        </Form.Item>
                        -{/* TimePicker for End */}
                        <Form.Item style={{ marginBottom: 0 }} required>
                          <TimePicker
                            value={time.end ? dayjs(time.end, "HH:mm") : null}
                            onChange={(value) =>
                              handleTimeChange(item.day, index, "end", value)
                            }
                            format="HH:mm"
                            placeholder="Waktu Berakhir"
                            style={{ width: 120 }}
                          />
                        </Form.Item>
                        {/* Remove Button */}
                        <Button
                          type="text"
                          danger
                          onClick={() =>
                            removeTimeSlot(item.day, index, item.schedule_id)
                          }
                          icon={<Icon component={DeleteIcon} />}
                        />
                      </Space>
                    ))}

                    {/* Add Slot Button */}
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => addTimeSlot(item.day)}
                        style={{ marginTop: 8 }}
                        icon={<Icon component={AddIcon} />}
                      >
                        Tambah Waktu
                      </Button>
                    </Form.Item>
                  </div>
                )}
              </Form.Item>
            ))}

            {/* Save Button */}
            <Form.Item style={{ marginTop: 20 }}>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Simpan Jadwal
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Loading />
        )}
      </Drawer>

      <Card>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="id"
          events={events}
          eventContent={renderEventContent}
          height="auto"
          datesSet={handleDateRangeChange}
          dateClick={handleDateClick}
        />
      </Card>

      <Modal
        title="Ajukan Libur"
        open={isModalOpen}
        onCancel={handleCancelModal}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={handleFinish}>
          <Form.Item
            name="tanggal"
            label="Tanggal Libur"
            rules={[{ required: true }]}
          >
            <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="alasan"
            label="Alasan Libur"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={3} placeholder="Contoh: keperluan keluarga" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Ajukan
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
