"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Modal,
  Form,
  DatePicker,
  Button,
  Row,
  Col,
  Divider,
  message,
  Tooltip,
  notification,
  Card,
  Flex,
  Tag,
  Select,
} from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { crudService } from "@/app/lib/services/crudServices";
import { useScheduleViewModel } from "./useScheduleViewModel";

dayjs.extend(utc);

/* ============== Types ============== */
type DailyTime = { start: string; end: string }; // "HH:mm"
type FCEvent = {
  id: string;
  start: string; // YYYY-MM-DD (allDay)
  end?: string; // YYYY-MM-DD (exclusive)
  allDay?: boolean;
  color?: string;
  extendedProps?: {
    dailyTimes?: DailyTime[];
    shiftIds?: string[]; // simpan agar duplikasi/edit akurat tanpa tebak jam
  };
};

// GANTI tipe ini
type ApiBlock = {
  id: string;
  color?: string | null;
  start_date: string; // ISO 00:00Z
  end_date: string;   // ISO 00:00Z
  // times bisa datang dalam 2 bentuk:
  // - legacy: { start_time, end_time }
  // - baru:   { shift_id, shift: { id, start_time, end_time } }
  times?: Array<{
    start_time?: string;
    end_time?: string;
    shift_id?: string;
    shift?: { id?: string; start_time: string; end_time: string };
  }>;
};

type SaveBlockPayload = {
  year: number;
  month: number; // 1..12
  block: {
    color?: string | null;
    start_date: string; // UTC midnight ISO
    end_date: string; // UTC midnight ISO
    shift_ids: string[]; // referensi shift
  };
};

/* ============== Helpers ============== */
const palette = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#a855f7",
  "#ec4899",
];
const randomColor = () => palette[Math.floor(Math.random() * palette.length)];

const timeFormat = "HH:mm";
const ymd = (d: string | Dayjs | Date) => dayjs(d).format("YYYY-MM-DD");
const addDaysYMD = (d: string | Dayjs | Date, n: number) =>
  dayjs(d).add(n, "day").format("YYYY-MM-DD");

const fmtUtc = (iso?: string) =>
  iso ? dayjs.utc(iso).format(timeFormat) : "-";

/** ISO string UTC midnight dari tanggal lokal */
const toUtcMidnight = (d: Dayjs | Date) => {
  const dj = dayjs(d);
  return new Date(
    Date.UTC(dj.year(), dj.month(), dj.date(), 0, 0, 0, 0)
  ).toISOString();
};

/* ============== API create ============== */
async function saveScheduleBlock(payload: SaveBlockPayload) {
  // konsisten dengan API baru
  const res = await crudService.post("/api/teacher/schedule/create", payload);
  if (!res || !res.data?.block?.id) throw new Error("Gagal menyimpan jadwal");
  return res.data.block.id as string;
}

export default function Schedule() {
  const { scheduleTeacher, isLoadingSchedule, shiftData } =
    useScheduleViewModel();
  const [events, setEvents] = useState<FCEvent[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  /* ============== Data dari VM ============== */
  const apiBlocks: ApiBlock[] = useMemo(() => {
    const months = scheduleTeacher?.data?.ScheduleMonth;
    if (!Array.isArray(months)) return [];
    return months.flatMap((m: any) =>
      Array.isArray(m?.blocks) ? m.blocks : []
    );
  }, [scheduleTeacher]);

  /* Shift lookup */
  const { shiftOptions, shiftMap, shiftIndex } = useMemo(() => {
    const list = Array.isArray(shiftData?.data) ? shiftData.data : [];
    const opts = list.map((s: any) => ({
      value: s.id,
      label: `${s.title ?? "Shift"} (${fmtUtc(s.start_time)}–${fmtUtc(
        s.end_time
      )})`,
    }));
    const map = new Map<string, any>();
    list.forEach((s: any) => map.set(s.id, s));
    // index "HH:mm|HH:mm" -> array of shift_ids (antisipasi jam kembar)
    const idx = new Map<string, string[]>();
    list.forEach((s: any) => {
      const key = `${fmtUtc(s.start_time)}|${fmtUtc(s.end_time)}`;
      const arr = idx.get(key) ?? [];
      arr.push(s.id);
      idx.set(key, arr);
    });
    return { shiftOptions: opts, shiftMap: map, shiftIndex: idx };
  }, [shiftData]);

  /* Util map jam -> shift_ids */
  const resolveShiftIdsFromDailyTimes = useCallback(
    (dailyTimes: DailyTime[]): string[] => {
      const out: string[] = [];
      for (const t of dailyTimes) {
        const key = `${t.start}|${t.end}`;
        const pool = shiftIndex.get(key);
        if (pool?.length) {
          out.push(pool[0]); // jika perlu, bisa round-robin
        } else {
          console.warn("[duplicate] Tidak menemukan shift untuk", key);
        }
      }
      return out;
    },
    [shiftIndex]
  );

  // GANTI fungsi ini agar kalau API kirim shift_id langsung, kita pakai itu
const resolveShiftIdsFromIsoTimes = useCallback(
  (times: Array<{ start_time?: string; end_time?: string; shift_id?: string; shift?: { id?: string; start_time: string; end_time: string } }>): string[] => {
    // Prioritas: jika sudah ada shift_id di setiap item, pakai itu
    const direct = times.map((t) => t.shift_id ?? t.shift?.id).filter(Boolean) as string[];
    if (direct.length) return direct;

    // Fallback: cocokkan dari jam
    const dailyLike = times
      .map((t) => {
        const st = t.start_time ?? t.shift?.start_time;
        const en = t.end_time ?? t.shift?.end_time;
        if (!st || !en) return null;
        return {
          start: dayjs.utc(st).format("HH:mm"),
          end: dayjs.utc(en).format("HH:mm"),
        };
      })
      .filter(Boolean) as DailyTime[];

    return resolveShiftIdsFromDailyTimes(dailyLike);
  },
  [resolveShiftIdsFromDailyTimes]
);

  /* ============== Render event dari API ============== */
  // GANTI seluruh useMemo mappedEvents dengan versi ini
  const mappedEvents = useMemo<FCEvent[]>(() => {
    return apiBlocks.map((b) => {
      const startYMD = dayjs.utc(b.start_date).format("YYYY-MM-DD");
      const endExclusiveYMD = dayjs
        .utc(b.end_date)
        .add(1, "day")
        .format("YYYY-MM-DD");

      const src = Array.isArray(b.times) ? b.times : [];

      // Ambil shiftIds langsung dari API jika tersedia
      const shiftIdsFromApi = src
        .map((t) => t.shift_id ?? t.shift?.id)
        .filter(Boolean) as string[];

      // Bentuk jam harian dari shift/legacy times
      const dailyTimes: DailyTime[] = src
        .map((t) => {
          const st = t.start_time ?? t.shift?.start_time;
          const en = t.end_time ?? t.shift?.end_time;
          if (!st || !en) return null;
          return {
            start: dayjs.utc(st).format("HH:mm"),
            end: dayjs.utc(en).format("HH:mm"),
          };
        })
        .filter(Boolean) as DailyTime[];

      return {
        id: b.id,
        start: startYMD,
        end: endExclusiveYMD,
        allDay: true,
        color: b.color ?? randomColor(),
        // simpan shiftIds agar edit/duplicate akurat tanpa tebak jam
        extendedProps: {
          dailyTimes,
          shiftIds: shiftIdsFromApi.length ? shiftIdsFromApi : undefined,
        },
      };
    });
  }, [apiBlocks]);

  useEffect(() => setEvents(mappedEvents), [mappedEvents]);

  /* ============== Modal Create/Edit ============== */
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<{
    range: [Dayjs, Dayjs];
    shifts: { shift_id: string }[];
  }>();
  const [prefillRange, setPrefillRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [modalMonthOpen, setModalMonthOpen] = useState(false);
  const [formMonth] = Form.useForm<{
    sourceMonth: Dayjs;
    targetMonth: Dayjs;
  }>();
  const [editData, setEditData] = useState<{
    id: string;
    range: [Dayjs, Dayjs];
  } | null>(null);

  const openCreate = useCallback(() => {
    setPrefillRange(null);
    form.resetFields();
    form.setFieldsValue({ shifts: [{ shift_id: undefined as any }] });
    setOpen(true);
  }, [form]);

  const handleSelect = useCallback(
    (info: { start: Date; end: Date }) => {
      const s = dayjs(info.start);
      const e = dayjs(info.end).subtract(1, "day"); // FC end exclusive → form inclusive
      setPrefillRange([s, e]);
      form.resetFields();
      form.setFieldsValue({
        range: [s, e],
        shifts: [{ shift_id: undefined as any }],
      });
      setOpen(true);
    },
    [form]
  );

  /* ============== RENDER PILL (jam + tooltip) ============== */
  const eventContent = (arg: any) => {
    const e = arg.event;
    const times = (e.extendedProps?.dailyTimes || []) as DailyTime[];
    const full = times.map((t) => `${t.start}–${t.end}`).join(" • ");
    const MAX = 3;
    const shown = times.slice(0, MAX).map((t) => `${t.start}–${t.end}`);
    const more = Math.max(0, times.length - MAX);
    const bg = e.backgroundColor || e.extendedProps?.color || "#2a2b2f";

    return (
      <Tooltip title={full} mouseEnterDelay={0.15}>
        <div
          className="ev-pill"
          style={{ ["--ev-bg" as any]: bg } as React.CSSProperties}
        >
          <span className="ev-bullet" />
          <span className="ev-times">
            {shown.join(" • ")}
            {more > 0 ? ` • +${more}` : ""}
          </span>
        </div>
      </Tooltip>
    );
  };

  /* ============== CREATE / UPDATE (submit form) ============== */
  const onFinish = useCallback(
    async (values: {
      range: [Dayjs, Dayjs];
      shifts: { shift_id: string }[];
    }) => {
      const [s, e] = values.range || [];
      if (!s || !e) {
        message.warning("Pilih rentang tanggal.");
        return;
      }

      const shift_ids = (values.shifts || [])
        .map((x) => x?.shift_id)
        .filter(Boolean) as string[];
      if (shift_ids.length < 1) {
        message.warning("Minimal pilih satu shift.");
        return;
      }

      try {
        if (editData) {
          // ====== PUT (EDIT) ======
          const payload = {
            start: s.format("YYYY-MM-DD"),
            endExclusive: dayjs(e).add(1, "day").format("YYYY-MM-DD"),
            shift_ids,
          };

          await crudService.put(
            `/api/teacher/schedule/update/${editData.id}`,
            payload
          );

          // build dailyTimes untuk UI
          const dailyTimes = shift_ids
            .map((id) => shiftMap.get(id))
            .filter(Boolean)
            .map((sh: any) => ({
              start: dayjs.utc(sh.start_time).format("HH:mm"),
              end: dayjs.utc(sh.end_time).format("HH:mm"),
            }));

          setEvents((prev) =>
            prev.map((ev) =>
              ev.id === editData.id
                ? {
                    ...ev,
                    start: payload.start,
                    end: payload.endExclusive,
                    extendedProps: { dailyTimes, shiftIds: shift_ids },
                  }
                : ev
            )
          );

          message.success("Jadwal berhasil diperbarui.");
          setEditData(null);
        } else {
          // ====== POST (CREATE) ======
          const payload: SaveBlockPayload = {
            year: s.year(),
            month: s.month() + 1,
            block: {
              color: randomColor(),
              start_date: toUtcMidnight(s),
              end_date: toUtcMidnight(e),
              shift_ids,
            },
          };

          const newId = await saveScheduleBlock(payload);

          const dailyTimes = shift_ids
            .map((id) => shiftMap.get(id))
            .filter(Boolean)
            .map((sh: any) => ({
              start: dayjs.utc(sh.start_time).format("HH:mm"),
              end: dayjs.utc(sh.end_time).format("HH:mm"),
            }));

          setEvents((prev) => [
            ...prev,
            {
              id: newId,
              start: ymd(s),
              end: addDaysYMD(e, 1),
              allDay: true,
              color: payload.block.color || randomColor(),
              extendedProps: { dailyTimes, shiftIds: shift_ids },
            },
          ]);

          message.success("Jadwal berhasil ditambahkan.");
        }

        setOpen(false);
      } catch (err: any) {
        message.error(err?.message || "Terjadi kesalahan saat menyimpan.");
      }
    },
    [editData, shiftMap]
  );

  /* ============== UPDATE (drag & resize) ============== */
  async function patchBlockDates(
    id: string,
    startYMD: string,
    endExclusiveYMD: string
  ) {
    // endExclusive dikirim apa adanya; API akan mengonversi ke inclusive = endExclusive - 1 hari
    return crudService.patch(`/api/teacher/schedule/update/${id}`, {
      start: startYMD,
      endExclusive: endExclusiveYMD,
    });
  }

  const handleEventDrop = async (arg: any) => {
    if (savingId) return arg.revert();
    const id = arg.event.id;
    const startYMD = ymd(arg.event.start!);
    const endExclusiveYMD = arg.event.end
      ? ymd(arg.event.end)
      : addDaysYMD(arg.event.start!, 1);

    const prev = events;
    setSavingId(id);
    setEvents((p) =>
      p.map((e) =>
        e.id === id ? { ...e, start: startYMD, end: endExclusiveYMD } : e
      )
    );

    try {
      await patchBlockDates(id, startYMD, endExclusiveYMD);
    } catch (e: any) {
      message.error(e?.message || "Gagal memindah jadwal");
      setEvents(prev);
      arg.revert();
    } finally {
      setSavingId(null);
    }
  };

  const handleEventResize = async (arg: any) => {
    if (savingId) return arg.revert();
    const id = arg.event.id;
    const startYMD = ymd(arg.event.start!);
    const endExclusiveYMD = arg.event.end
      ? ymd(arg.event.end)
      : addDaysYMD(arg.event.start!, 1);

    const prev = events;
    setSavingId(id);
    setEvents((p) =>
      p.map((e) =>
        e.id === id ? { ...e, start: startYMD, end: endExclusiveYMD } : e
      )
    );

    try {
      await patchBlockDates(id, startYMD, endExclusiveYMD);
    } catch (e: any) {
      message.error(e?.message || "Gagal memperbarui durasi");
      setEvents(prev);
      arg.revert();
    } finally {
      setSavingId(null);
    }
  };

  /* ============== Context menu (Delete/Duplicate) ============== */
  const [ctx, setCtx] = useState<{
    visible: boolean;
    x: number;
    y: number;
    eventId?: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
  });

  const hideCtx = useCallback(
    () => setCtx((c) => ({ ...c, visible: false })),
    []
  );
  useEffect(() => {
    if (!ctx.visible) return;
    const onDocClick = () => hideCtx();
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && hideCtx();
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [ctx.visible, hideCtx]);

  async function deleteBlock(id: string) {
    const prev = events;
    setEvents((p) => p.filter((e) => e.id !== id)); // optimistic
    try {
      await crudService.delete(`/api/teacher/schedule/delete/${id}`, id);
      notification.success({ message: "Jadwal dihapus" });
    } catch (e: any) {
      message.error(e?.message || "Gagal menghapus jadwal");
      setEvents(prev); // rollback
    } finally {
      hideCtx();
    }
  }

  async function duplicateBlock(id: string) {
    const block = events.find((e) => e.id === id);
    if (!block) return;

    const s = dayjs(block.start);
    const e = dayjs(block.end).subtract(1, "day"); // end exclusive -> inclusive

    // pakai shiftIds jika tersedia; fallback resolve dari jam
    const dailyTimes = (block.extendedProps?.dailyTimes || []) as DailyTime[];
    const shift_ids =
      (block.extendedProps?.shiftIds as string[] | undefined) ??
      resolveShiftIdsFromDailyTimes(dailyTimes);

    if (shift_ids.length === 0) {
      message.warning("Tidak ada shift yang cocok untuk diduplikasi.");
      return;
    }

    const payload: SaveBlockPayload = {
      year: s.year(),
      month: s.month() + 1,
      block: {
        color: block.color ?? randomColor(),
        start_date: toUtcMidnight(s),
        end_date: toUtcMidnight(e),
        shift_ids,
      },
    };

    try {
      const newId = await saveScheduleBlock(payload);

      setEvents((prev) => [
        ...prev,
        {
          id: newId,
          start: ymd(s),
          end: addDaysYMD(e, 1),
          allDay: true,
          color: payload.block.color || randomColor(),
          extendedProps: { dailyTimes, shiftIds: shift_ids },
        },
      ]);
    } catch (err: any) {
      message.error(err?.message || "Gagal menduplikasi jadwal");
    } finally {
      hideCtx();
    }
  }

  const handleManualDuplicateMonth = async (values: {
    sourceMonth: Dayjs;
    targetMonth: Dayjs;
  }) => {
    const sourceMonth = values.sourceMonth.startOf("month");
    const targetMonth = values.targetMonth.startOf("month");

    const sourceMonthNumber = sourceMonth.month(); // 0-based
    const sourceYear = sourceMonth.year();

    const blocksToDuplicate = apiBlocks.filter((b) => {
      const blockStart = dayjs.utc(b.start_date);
      return (
        blockStart.month() === sourceMonthNumber &&
        blockStart.year() === sourceYear
      );
    });

    if (blocksToDuplicate.length === 0) {
      message.info("Tidak ada jadwal pada bulan sumber.");
      return;
    }

    try {
      for (const block of blocksToDuplicate) {
        const offsetDays = dayjs
          .utc(block.end_date)
          .diff(dayjs.utc(block.start_date), "day");

        const newStart = targetMonth.date(dayjs.utc(block.start_date).date());
        const newEnd = newStart.clone().add(offsetDays, "day");

        // Map ISO times dari API -> shift_ids
        const shift_ids = resolveShiftIdsFromIsoTimes(block.times || []);
        if (shift_ids.length === 0) {
          console.warn(
            "[duplicate month] Lewati block karena tidak ada shift yang cocok:",
            block.id
          );
          continue;
        }

        const payload: SaveBlockPayload = {
          year: newStart.year(),
          month: newStart.month() + 1,
          block: {
            color: block.color ?? randomColor(),
            start_date: toUtcMidnight(newStart),
            end_date: toUtcMidnight(newEnd),
            shift_ids,
          },
        };

        const newId = await saveScheduleBlock(payload);

        // Build dailyTimes dari shift terpilih
        const dailyTimes = shift_ids
          .map((sid) => shiftMap.get(sid))
          .filter(Boolean)
          .map((sh: any) => ({
            start: dayjs.utc(sh.start_time).format("HH:mm"),
            end: dayjs.utc(sh.end_time).format("HH:mm"),
          }));

        setEvents((prev) => [
          ...prev,
          {
            id: newId,
            start: ymd(newStart),
            end: addDaysYMD(newEnd, 1),
            allDay: true,
            color: block.color ?? randomColor(),
            extendedProps: { dailyTimes, shiftIds: shift_ids },
          },
        ]);
      }

      notification.success({
        message: `Jadwal bulan ${sourceMonth.format(
          "MMMM YYYY"
        )} berhasil diduplikasi ke ${targetMonth.format("MMMM YYYY")}`,
      });
      setModalMonthOpen(false);
    } catch (err: any) {
      message.error(err?.message || "Gagal menduplikasi jadwal");
    }
  };

  const eventDidMount = (info: any) => {
    const handler = (e: MouseEvent) => {
      e.preventDefault();
      setCtx({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        eventId: info.event.id,
      });
    };
    info.el.addEventListener("contextmenu", handler);
    return () => info.el.removeEventListener("contextmenu", handler);
  };

  return (
    <div style={{ position: "relative" }}>
      <Flex justify="end" align="middle" style={{ marginBottom: 12 }}>
        <Flex justify="end" gap={12}>
          <Button
            type="primary"
            onClick={openCreate}
            disabled={isLoadingSchedule || !!savingId}
          >
            Add Schedule
          </Button>
          <Button
            type="default"
            onClick={() => setModalMonthOpen(true)}
            disabled={isLoadingSchedule || !!savingId}
          >
            Duplicate Month
          </Button>
        </Flex>
      </Flex>

      <Card>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height="auto"
          headerToolbar={{ start: "title", end: "today prev,next" }}
          selectable
          selectMirror
          selectOverlap
          editable
          eventResizableFromStart
          events={events}
          eventDisplay="block"
          displayEventEnd={false}
          select={handleSelect}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          eventContent={eventContent}
          eventDidMount={eventDidMount}
          eventClick={(arg) => {
            const id = arg.event.id;
            const start = dayjs(arg.event.startStr);
            const end = dayjs(arg.event.endStr).subtract(1, "day"); // FC end exclusive

            setEditData({ id, range: [start, end] });

            // Prefill shifts saat edit:
            const shiftIds: string[] | undefined =
              arg.event.extendedProps?.shiftIds;
            const dailyTimes: DailyTime[] = (arg.event.extendedProps
              ?.dailyTimes || []) as DailyTime[];

            // Jika shiftIds ada, pakai itu; jika tidak ada, resolve dari jam
            const prefillShiftIds = shiftIds?.length
              ? shiftIds
              : resolveShiftIdsFromDailyTimes(dailyTimes);

            form.setFieldsValue({
              range: [start, end],
              shifts:
                prefillShiftIds.length > 0
                  ? prefillShiftIds.map((sid) => ({ shift_id: sid }))
                  : [{ shift_id: undefined as any }],
            });

            setOpen(true);
          }}
        />
      </Card>

      {/* Context menu */}
      {ctx.visible && (
        <div
          style={{
            position: "fixed",
            top: ctx.y,
            left: ctx.x,
            background: "#111827",
            color: "#fff",
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            padding: 6,
            zIndex: 9999,
            width: 180,
            userSelect: "none",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          onMouseLeave={hideCtx}
        >
          <div
            style={{ padding: "8px 10px", cursor: "pointer", borderRadius: 6 }}
            onClick={() => ctx.eventId && deleteBlock(ctx.eventId)}
          >
            Delete
          </div>
          <div
            style={{ padding: "8px 10px", cursor: "pointer", borderRadius: 6 }}
            onClick={() => ctx.eventId && duplicateBlock(ctx.eventId)}
          >
            Duplicate
          </div>
        </div>
      )}

      {/* Modal Create/Edit */}
      <Modal
        title={editData ? "Edit Schedule" : "Add Schedule"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okText="Save"
        cancelText="Cancel"
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
          initialValues={{ shifts: [{ shift_id: undefined as any }] }}
        >
          <Form.Item
            name="range"
            label="Range Date"
            rules={[{ required: true, message: "Pilih rentang tanggal" }]}
            initialValue={prefillRange || undefined}
          >
            <DatePicker.RangePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.List name="shifts">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...rest }) => {
                  const selectedId: string | undefined = form.getFieldValue([
                    "shifts",
                    name,
                    "shift_id",
                  ]);
                  const picked = selectedId ? shiftMap.get(selectedId) : null;

                  return (
                    <Row
                      key={key}
                      gutter={8}
                      align="middle"
                      style={{ marginBottom: 8 }}
                    >
                      <Col flex="auto">
                        <Form.Item
                          {...rest}
                          name={[name, "shift_id"]}
                          label={`Select Shift ${name + 1}`}
                          rules={[{ required: true, message: "Pilih shift" }]}
                          style={{ marginBottom: 6 }}
                        >
                          <Select
                            showSearch
                            placeholder="Pilih shift"
                            options={shiftOptions}
                            filterOption={(input, option) =>
                              ((option?.label as string) ?? "")
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                          />
                        </Form.Item>

                        {picked && (
                          <div style={{ fontSize: 12, color: "#666" }}>
                            Jam:{" "}
                            <Tag>
                              {fmtUtc(picked.start_time)}–
                              {fmtUtc(picked.end_time)}
                            </Tag>
                            {picked.title ? (
                              <>
                                {" "}
                                • Nama: <Tag>{picked.title}</Tag>
                              </>
                            ) : null}
                          </div>
                        )}
                      </Col>

                      <Col>
                        {fields.length > 1 && (
                          <Button
                            type="text"
                            danger
                            onClick={() => remove(name)}
                          >
                            Delete
                          </Button>
                        )}
                      </Col>
                    </Row>
                  );
                })}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    + Add Shift
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Divider style={{ margin: "8px 0 0" }} />
          <div style={{ fontSize: 12, color: "#888" }}>
            Tip: drag & select tanggal di kalender untuk auto‑fill range. Klik
            kanan event untuk delete/duplicate.
          </div>
        </Form>
      </Modal>

      {/* Modal Duplicate Month */}
      <Modal
        title="Duplicate Schedule Month"
        open={modalMonthOpen}
        onCancel={() => setModalMonthOpen(false)}
        onOk={() => formMonth.submit()}
        okText="Duplicate"
        cancelText="Cancel"
      >
        <Form
          form={formMonth}
          layout="vertical"
          onFinish={handleManualDuplicateMonth}
          initialValues={{
            sourceMonth: dayjs().startOf("month"),
            targetMonth: dayjs().add(1, "month").startOf("month"),
          }}
        >
          <Form.Item
            label="Source Month"
            name="sourceMonth"
            rules={[{ required: true, message: "Pilih bulan sumber" }]}
          >
            <DatePicker picker="month" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Target Month"
            name="targetMonth"
            rules={[{ required: true, message: "Pilih bulan tujuan" }]}
          >
            <DatePicker picker="month" style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Styles */}
      <style jsx global>{`
        .fc .fc-daygrid-event {
          color: #e5e7eb !important;
          border-radius: 8px !important;
          padding: 2px 8px !important;
        }
        .ev-pill {
          --ev-bg: #2a2b2f;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          font-weight: 700;
        }
        .ev-bullet {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: var(--ev-bg);
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.25) inset;
        }
        .ev-times {
          font-size: 12px;
          font-weight: 600;
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 6px;
          padding: 2px 6px;
        }
      `}</style>
    </div>
  );
}
