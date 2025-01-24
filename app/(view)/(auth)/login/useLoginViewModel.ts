import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { notification } from "antd";
import { crudService } from "@/app/lib/services/crudServices";

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  role: string;
  status: number;
}

export function useLoginViewModel() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const login = async (payload: LoginPayload) => {
    setLoading(true);
    try {
      const response: LoginResponse = await crudService.post(
        "/api/auth/login",
        payload
      );

      // Set token
      Cookies.set("token", response.token, { expires: 1 });

      // Handle role-based navigation
      switch (response.role) {
        case "TEACHER":
          router.push("/teacher/dashboard");
          break;
        case "STUDENT":
          router.push("/student/dashboard");
          break;
        case "ADMIN":
          router.push("/admin/dashboard");
          break;
        default:
          router.push("/");
          break;
      }

      notification.success({
        message: "Login Berhasil",
      });
    } catch (error: any) {
      notification.error({
        message: "Login Gagal",
        description: error.response?.data?.message || "Terjadi kesalahan",
      });
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
}
