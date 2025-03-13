import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
import {
  formatPhoneNumber,
  sendWhatsAppMessage,
} from "@/app/lib/utils/notificationHelper";
import { authenticateRequest } from "@/app/lib/auth/authUtils";

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  const apiKey = process.env.API_KEY_WATZAP!;
  const numberKey = process.env.NUMBER_KEY_WATZAP!;

  try {
    // Ambil data user dari database
    const getUser = await prisma.user.findUnique({
      where: { user_id: user.user_id },
    });

    if (!getUser || !getUser.no_phone) {
      return NextResponse.json(
        { error: "User tidak ditemukan atau nomor telepon tidak tersedia" },
        { status: 404 }
      );
    }

    await prisma.passwordChangeToken.deleteMany({
      where: { user_id: user.user_id },
    });

    // Buat token unik untuk reset password
    const resetToken = randomBytes(32).toString("hex");
    const expiresAt = dayjs().utc().add(15, "minutes").toDate();

    // Simpan token ke database
    await prisma.passwordChangeToken.upsert({
      where: { user_id: getUser.user_id },
      update: { token: resetToken, expires_at: expiresAt },
      create: {
        user_id: getUser.user_id,
        token: resetToken,
        expires_at: expiresAt,
      },
    });

    // Link reset password
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/change-password?token=${resetToken}`;

    // Format nomor telepon agar sesuai dengan format internasional (misal: +62)
    const formattedPhone = formatPhoneNumber(getUser.no_phone);

    // Tambahkan emoji atau ikon WhatsApp ke dalam pesan agar lebih profesional
    const whatsappIcon = "🟢";
    const lockIcon = "🔒";
    const clockIcon = "⏳";
    const linkIcon = "🔗";

    // Kirim pesan WhatsApp
    await sendWhatsAppMessage(
      apiKey,
      numberKey,
      formattedPhone,
      `${whatsappIcon} *Ganti Password - One Step Solution (OSS)* ${whatsappIcon}

Halo, *${getUser.username}*!

Kami menerima permintaan untuk mengganti password akun Anda. Jika Anda tidak melakukan permintaan ini, abaikan pesan ini.

${lockIcon} *Keamanan Akun Anda*  
Untuk mengatur ulang password Anda, klik tautan berikut:

${linkIcon} *Ganti Password:*  
${resetLink}

${clockIcon} *Catatan:*  
Tautan ini hanya berlaku selama *30 menit*. Pastikan Anda segera mengganti password sebelum waktu habis.

Salam,  
*One Step Solution (OSS)*`
    );

    return NextResponse.json({
      message: "Link reset password telah dikirim ke WhatsApp",
    });
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
