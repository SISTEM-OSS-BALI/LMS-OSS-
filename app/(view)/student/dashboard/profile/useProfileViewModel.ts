import { useAuth } from "@/app/lib/auth/authServices";
import { crudService } from "@/app/lib/services/crudServices";
import { fetcher } from "@/app/lib/utils/fetcher";
import { Program, User } from "@prisma/client";
import { notification } from "antd";
import { signIn, useSession } from "next-auth/react";

import { useState } from "react";
import useSWR from "swr";

interface UserResponse {
  data: User;
}

interface ProgramResponse {
  data: Program[];
}

export const useProfileViewModel = () => {
  const { program_id } = useAuth();
  const { data: session, update } = useSession();
  const {
    data: profileData,
    isLoading,
    mutate,
  } = useSWR<UserResponse>("/api/student/detail", fetcher);
  const { data: programData } = useSWR<ProgramResponse>(
    "/api/admin/program/show",
    fetcher
  );
  const filterProgram = programData?.data?.find(
    (program) => program.program_id === program_id
  );

  const [loading, setLoading] = useState(false);
  const [loadingChangePassword, setLoadingChangePassword] = useState(false);

  // Pastikan mergedData memiliki nilai yang valid
  const mergedData: User & { program?: Program } = {
    user_id: profileData?.data?.user_id ?? "", // Pastikan selalu string
    username: profileData?.data?.username ?? "Tidak Diketahui",
    email: profileData?.data?.email ?? "Tidak Ada Email",
    password: profileData?.data?.password ?? "",
    no_phone: profileData?.data?.no_phone ?? null,
    program_id: profileData?.data?.program_id ?? null,
    imageUrl: profileData?.data?.imageUrl ?? null,
    count_program: profileData?.data?.count_program ?? 0,
    joined_at: profileData?.data?.joined_at ?? new Date(),
    region: profileData?.data?.region ?? null,
    color: profileData?.data?.color ?? null,
    level: profileData?.data?.level ?? null,
    is_active: profileData?.data?.is_active ?? true,
    start_date: profileData?.data?.start_date ?? null,
    end_date: profileData?.data?.end_date ?? null,
    is_completed: profileData?.data?.is_completed ?? false,
    is_evaluation: profileData?.data?.is_evaluation ?? null,
    is_verified: profileData?.data?.is_verified ?? false,
    target: profileData?.data?.target ?? null,
    role: profileData?.data?.role ?? "STUDENT",
    createdAt: profileData?.data?.createdAt ?? new Date(),
    consultant_id: profileData?.data?.consultant_id ?? null,

    // Tambahkan program jika ditemukan
    program: filterProgram ?? undefined,
  };

  const handleUpdate = async (updatedData: Partial<User>) => {
    setLoading(true);
    try {
      await crudService.put("/api/student/profile/update", updatedData);

      notification.success({
        message: "Berhasil",
        description: "Profil berhasil diperbarui",
      });
      await update({ username: updatedData.username });
      mutate();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      notification.error({
        message: "Error",
        description: (error as Error).message || "Terjadi kesalahan",
      });
    }
  };

  const handleUpdateAvatar = async (imageUrl: string) => {
    setLoadingChangePassword(true);

    try {
      // Kirim permintaan update avatar ke API
      const response = await crudService.put(
        "/api/student/profile/updateAvatar",
        { imageUrl }
      );

      if (!response) throw new Error("Gagal mengunggah avatar");

      notification.success({
        message: "Berhasil",
        description: "Avatar berhasil diperbarui",
      });

      // 🔹 Perbarui sesi NextAuth TANPA logout
      await update({ imageUrl }); // Auto-refresh session!

      mutate(); // Optional: refresh SWR data
      setLoadingChangePassword(false);
    } catch (error) {
      setLoading(false);
      notification.error({
        message: "Error",
        description:
          (error as Error).message ||
          "Terjadi kesalahan saat mengunggah avatar",
      });
    }
  };

  const handleSendNotif = async () => {
    setLoading(true);
    try {
      await crudService.post(
        "/api/student/profile/sendNotifChangePassword",
        {}
      );

      setLoading(false);

      notification.success({
        message: "Berhasil",
        description: "Notifikasi berhasil dikirim cek WhatsApp anda",
      });
    } catch (error) {
      setLoading(false);
      notification.error({
        message: "Error",
        description: (error as Error).message || "Terjadi kesalahan",
      });
    }
  };
  return {
    mergedData,
    isLoading,
    handleUpdate,
    handleUpdateAvatar,
    loading,
    handleSendNotif,
    loadingChangePassword,
  };
};
