import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Form, notification } from "antd";
import { crudService } from "@/app/lib/services/crudServices";

interface LoginPayload {
  email: string;
  password: string;
}

export function useLoginViewModel() {
  const [loading, setLoading] = useState(false);
  const [loadingForgotPassword, setLoadingForgotPassword] = useState(false);
  const router = useRouter();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const login = async (payload: LoginPayload) => {
    setLoading(true);
    try {
      const response = await signIn("credentials", {
        redirect: false,
        email: payload.email,
        password: payload.password,
      });

      if (!response || response.error) {
        throw new Error(response?.error || "Login gagal, silakan coba lagi.");
      }

      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      // 🔹 Navigasi berdasarkan peran pengguna
      switch (session?.user?.role) {
        case "TEACHER":
          router.push("/teacher/dashboard/home");
          break;
        case "STUDENT":
          router.push("/student/dashboard/home");
          break;
        case "ADMIN":
          router.push("/admin/dashboard/home");
          break;
        default:
          router.push("/");
          break;
      }

      notification.success({ message: "Login Berhasil" });
    } catch (error: any) {
      notification.error({
        message: "Login Gagal",
        description: error.message || "Terjadi kesalahan",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendNotif = async (values: any) => {
    setLoadingForgotPassword(true);
    const payload = {
      email: values.email,
    };
    try {
      await crudService.post(
        "/api/student/profile/sendNotifResetPassword",
        payload
      );
      setLoadingForgotPassword(false);
      handleCloseModal();
      notification.success({
        message: "Berhasil",
        description: "Notifikasi berhasil dikirim cek email anda",
      });
    } catch (error) {
      setLoadingForgotPassword(false);
      notification.error({
        message: "Error",
        description: (error as Error).message || "Terjadi kesalahan",
      });
    }
  };

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  return {
    login,
    loading,
    sendNotif,
    handleOpenModal,
    handleCloseModal,
    isModalVisible,
    form,
    loadingForgotPassword,
  };
}
