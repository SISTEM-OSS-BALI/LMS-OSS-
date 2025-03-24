import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import prisma from "@/lib/prisma";
import {
  formatPhoneNumber,
  sendWhatsAppMessage,
} from "@/app/lib/utils/notificationHelper";

export async function PATCH(request: NextRequest) {
  const user = await authenticateRequest(request);
  const body = await request.json();
  const { user_id, is_approved } = body;

  if (user instanceof NextResponse) {
    return user;
  }

  const apiKey = process.env.API_KEY_WATZAP!;
  const numberKey = process.env.NUMBER_KEY_WATZAP!;

  try {
    await prisma.termsAgreement.updateMany({
      where: {
        user_id: user_id,
      },
      data: {
        is_approved: is_approved,
      },
    });

    await prisma.user.update({
      where: {
        user_id: user_id,
      },
      data: {
        is_verified: true,
      },
    });

    const user = await prisma.user.findUnique({
      where: {
        user_id: user_id,
      },
    });

    const no_tlp = formatPhoneNumber(user?.no_phone ?? "");

    if (is_approved) {
      await sendWhatsAppMessage(
        apiKey,
        numberKey,
        no_tlp,
        `✅ *Akun Kamu Telah Diaktivasi!*\n\nSelamat datang! 🎉 Akun kamu telah berhasil diaktivasi dan kini kamu dapat mengakses platform kami sepenuhnya.\n\nJika kamu mengalami kendala atau memiliki pertanyaan, jangan ragu untuk menghubungi admin. 🙌`
      );
    } else {
      await sendWhatsAppMessage(
        apiKey,
        numberKey,
        no_tlp,
        `⚠️ *Akun Kamu Belum Diaktivasi*\n\nSaat ini akun kamu belum dapat digunakan karena belum disetujui oleh admin.\n\nSilakan hubungi admin untuk informasi lebih lanjut. 📞`
      );
    }

    return NextResponse.json({
      status: 200,
      error: false,
      data: "success",
    });
  } catch (error) {
    console.error("Error accessing database:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
