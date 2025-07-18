import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendResetEmail } from "@/app/lib/utils/sendEmail";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import prisma from "@/lib/prisma";

dayjs.extend(utc);
dayjs.extend(timezone);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { message: "Email tidak ditemukan!" },
        { status: 404 }
      );
    }

    // Hapus token lama jika ada
    await prisma.passwordResetToken.deleteMany({
      where: { user_id: user.user_id },
    });

    // Generate token unik
    const resetToken = crypto.randomBytes(32).toString("hex");

    const expiresAt = dayjs().utc().add(15, "minutes").toDate();

    // Simpan token di database
    await prisma.passwordResetToken.create({
      data: {
        user_id: user.user_id,
        token: resetToken,
        expires_at: expiresAt,
      },
    });

    // Kirim email dengan token reset
    await sendResetEmail(email, resetToken, user.username ?? "");

    return NextResponse.json({
      message: "Cek email Anda untuk reset password",
    });
  } catch (error) {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
