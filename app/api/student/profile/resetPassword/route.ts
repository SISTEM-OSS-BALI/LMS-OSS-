import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import prisma from "@/lib/prisma";

dayjs.extend(utc);
dayjs.extend(timezone);

export async function PATCH(req: Request) {
  try {
    const { token, newPassword } = await req.json();
    console.log("Token Received:", token);
    console.log("New Password:", newPassword);

    // Cari token di database
    const resetTokenEntry = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }, // Ambil informasi user terkait
    });

    if (!resetTokenEntry) {
      return NextResponse.json(
        { message: "Token tidak valid" },
        { status: 400 }
      );
    }

    const tokenExpirationTime = dayjs.utc(resetTokenEntry.expires_at);
    const currentTimeUTC = dayjs.utc();

    if (currentTimeUTC.isAfter(tokenExpirationTime)) {
      return NextResponse.json(
        { message: "Token telah kedaluwarsa" },
        { status: 400 }
      );
    }

    // Cek apakah token yang dikirim cocok dengan yang ada di database

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password pengguna
    await prisma.user.update({
      where: { user_id: resetTokenEntry.user.user_id },
      data: { password: hashedPassword },
    });

    // Hapus token setelah digunakan
    await prisma.passwordResetToken.delete({
      where: { id: resetTokenEntry.id },
    });

    return NextResponse.json({ message: "Password berhasil diubah" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
