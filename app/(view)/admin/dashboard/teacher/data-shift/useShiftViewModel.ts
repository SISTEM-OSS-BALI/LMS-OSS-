import { fetcher } from "@/app/lib/utils/fetcher";
import { ShiftSchedule } from "@prisma/client";
import useSWR from "swr";
dayjs.extend(utc);
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import { useMemo, useState } from "react";
import { Form, message, notification } from "antd";
import { crudService } from "@/app/lib/services/crudServices";

const timeFormat = "HH:mm";
const DUMMY_DATE = "1970-01-01"; // jam harian disimpan sebagai tanggal dummy UTC

// ===== Types =====
export type ShiftFormValues = {
  title: string;
  time_range: [Dayjs, Dayjs];
};

export type ShiftCreatePayload = {
  title: string;
  start_time: string; // ISO UTC 1970-01-01THH:mm:00Z
  end_time: string; // ISO UTC 1970-01-01THH:mm:00Z
};

export type ShiftRow = {
  id: string;
  title?: string;
  start_time: string; // ISO
  end_time: string; // ISO
};

interface ShiftResponse {
  data: ShiftSchedule[];
}
export default function useShiftViewModel() {
  const { data: shiftData, mutate: mutateShift } = useSWR<ShiftResponse>(
    "/api/admin/shift",
    fetcher
  );

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<ShiftFormValues>();
  const [editingRow, setEditingRow] = useState<ShiftRow | null>(null);

  // ===== Data dari hook =====
  const rows = useMemo<ShiftRow[]>(
    () =>
      Array.isArray(shiftData?.data)
        ? shiftData.data.map((row: any) => ({
            ...row,
            start_time:
              typeof row.start_time === "string"
                ? row.start_time
                : row.start_time?.toISOString(),
            end_time:
              typeof row.end_time === "string"
                ? row.end_time
                : row.end_time?.toISOString(),
          }))
        : [],
    [shiftData]
  );

  // ===== Helpers =====
  const formatTimeLocal = (iso?: string) => {
    if (!iso) return "-";
    return dayjs.utc(iso).format(timeFormat);
  };

  const computeDurationLabel = (startISO?: string, endISO?: string) => {
    if (!startISO || !endISO) return "-";
    const s = dayjs(startISO);
    let e = dayjs(endISO);
    if (e.isBefore(s)) e = e.add(1, "day"); // handle cross-midnight
    const minutes = e.diff(s, "minute");
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}j ${m}m`;
  };

  // ===== Modal Handlers (Create & Edit pakai satu modal) =====
  const openCreate = () => {
    setEditingRow(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (row: ShiftRow) => {
    setEditingRow(row);
    form.setFieldsValue({
      title: row.title ?? "",
      time_range: [dayjs.utc(row.start_time), dayjs.utc(row.end_time)],
    });
    setOpen(true);
  };

  const handleFinish = async (values: ShiftFormValues) => {
    const [start, end] = values.time_range || [];
    if (!start || !end) {
      message.warning("Isi rentang jam shift.");
      return;
    }

    const startStr = dayjs
      .utc(`${DUMMY_DATE} ${start.format(timeFormat)}`)
      .toISOString();
    const endStr = dayjs
      .utc(`${DUMMY_DATE} ${end.format(timeFormat)}`)
      .toISOString();

    setSubmitting(true);
    try {
      if (editingRow) {
        // === UPDATE ke API ===
        await crudService.put(`/api/admin/shift/${editingRow.id}`, {
          title: values.title || "Shift",
          start_time: startStr,
          end_time: endStr,
        });
        await mutateShift(); // refresh data dari server
        notification.success({ message: "Shift berhasil diperbarui." });
      } else {
        // === CREATE ke API ===
        const payload: ShiftCreatePayload = {
          title: values.title || "Shift",
          start_time: startStr,
          end_time: endStr,
        };
        await crudService.post("/api/admin/shift", payload);
        await mutateShift(); // <-- penting: revalidate setelah tambah
        notification.success({ message: "Shift berhasil disimpan." });
      }

      form.resetFields();
      setOpen(false);
      setEditingRow(null);
    } catch (e: any) {
      console.error(e);
      message.error(e?.message || "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (row: ShiftRow) => {
    try {
      await crudService.delete(`/api/admin/shift/${row.id}`, row.id);
      await mutateShift();
      notification.success({ message: "Shift dihapus." });
    } catch (e: any) {
      console.error(e);
      message.error(e?.message || "Gagal menghapus shift.");
    }
  };
  return {
    shiftData,
    mutateShift,
    rows,
    formatTimeLocal,
    computeDurationLabel,
    open,
    setOpen,
    submitting,
    form,
    editingRow,
    openCreate,
    openEdit,
    handleFinish,
    handleDelete,
    setEditingRow,
  };
}
