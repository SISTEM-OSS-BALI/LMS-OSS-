import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { notification } from "antd";

interface LoginPayload {
  email: string;
  password: string;
}

export function useLoginViewModel() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

  return { login, loading };
}
