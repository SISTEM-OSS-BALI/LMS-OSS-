import { NextResponse, NextRequest } from "next/server";
import prisma from "@/app/lib/prisma";
import bcrypt from "bcrypt";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export async function PUT(request: NextRequest) {
  try {
    const { oldPassword, newPassword, token } = await request.json();

    if (!token && (!oldPassword || !newPassword)) {
      return NextResponse.json(
        { error: "Permintaan tidak valid" },
        { status: 400 }
      );
    }

    // 🔹 Jika menggunakan token reset password
    if (token) {
      const resetRecord = await prisma.passwordChangeToken.findUnique({
        where: { token },
        include: { user: true },
      });

      const tokenExpirationTime = dayjs.utc(resetRecord?.expires_at);
      const currentTimeUTC = dayjs.utc();

       if (currentTimeUTC.isAfter(tokenExpirationTime)) {
         return NextResponse.json(
           { message: "Token telah kedaluwarsa" },
           { status: 400 }
         );
       }

      // 🔹 Hash password baru
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // 🔹 Perbarui password di database
      await prisma.user.update({
        where: { user_id: resetRecord?.user_id },
        data: { password: hashedNewPassword },
      });

      // 🔹 Hapus token agar tidak bisa digunakan lagi
      await prisma.passwordChangeToken.delete({ where: { token } });

      return NextResponse.json({ message: "Password berhasil diperbarui" });
    }

    // 🔹 Jika pengguna mengubah password menggunakan password lama
    const user = await prisma.user.findUnique({
      where: { user_id: request.headers.get("user_id") as string },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // 🔹 Cek apakah password lama benar
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Password lama salah!" },
        { status: 400 }
      );
    }

    // 🔹 Hash password baru
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 🔹 Update password di database
    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json({ message: "Password berhasil diperbarui" });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
