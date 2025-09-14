import { crudService } from "@/app/lib/services/crudServices";
import { fetcher } from "@/app/lib/utils/fetcher";
import { Form, message, notification } from "antd";
import { useState } from "react";
import useSWR from "swr";

export type RoomRow = {
  room_id: string;
  name: string;
};

export type RoomFormValues = {
  name: string;
};

export type RoomCreatePayload = {
  name: string;
};

interface Room {
  room_id: string;
  name: string;
}

interface RoomResponse {
  data: Room[];
}

export default function useRoomViewModel() {
  const { data: roomData, mutate: mutateRoom } = useSWR<RoomResponse>(
    "/api/admin/room",
    fetcher
  );
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<RoomFormValues>();
  const [editingRow, setEditingRow] = useState<RoomRow | null>(null);
  const [open, setOpen] = useState(false);
  const openEdit = (row: RoomRow) => {
    setEditingRow(row);
    form.setFieldsValue({
      name: row.name ?? "",
    });
    setOpen(true);
  };

  const handleDelete = async (row: RoomRow) => {
    try {
      await crudService.delete(`/api/admin/room/${row.room_id}`, row.room_id);
      await mutateRoom();
      notification.success({ message: "Room dihapus." });
    } catch (e: any) {
      console.error(e);
      message.error(e?.message || "Gagal menghapus shift.");
    }
  };

  const handleFinish = async (values: RoomFormValues) => {
    setSubmitting(true);
    try {
      if (editingRow) {
        // === UPDATE ke API ===
        await crudService.put(`/api/admin/room/${editingRow.room_id}`, {
          name: values.name,
        });
        await mutateRoom(); // refresh data dari server
        notification.success({ message: "Room berhasil diperbarui." });
      } else {
        // === CREATE ke API ===
        const payload: RoomCreatePayload = {
          name: values.name,
        };
        await crudService.post("/api/admin/room", payload);
        await mutateRoom();
        notification.success({ message: "Room berhasil disimpan." });
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

  const openCreate = () => {
    setEditingRow(null);
    form.resetFields();
    setOpen(true);
  };

  return {
    form,
    editingRow,
    setEditingRow,
    open,
    setOpen,
    openEdit,
    handleDelete,
    handleFinish,
    roomData,
    openCreate,
    submitting,
  };
}
