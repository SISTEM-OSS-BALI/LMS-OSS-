import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { getData } from "@/app/lib/db/getData";
import {
  formatPhoneNumber,
  sendWhatsAppMessage,
} from "@/app/lib/utils/notificationHelper";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      username,
      email,
      password,
      no_phone,
      program_id,
      region,
      signature,
    } = body;

    const apiKey = process.env.API_KEY_WATZAP!;
    const numberKey = process.env.NUMBER_KEY_WATZAP!;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email, password is required" },
        { status: 400 }
      );
    }

    // Cek apakah user sudah ada
    const existingUser = await getData(
      "user",
      { where: { email } },
      "findFirst"
    );
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Gunakan prisma langsung tanpa memanggil transaksi async di luar fungsi prisma.$transaction
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        no_phone,
        program_id,
        region,
      },
    });

    if (program_id) {
      const program = await prisma.program.findUnique({
        where: { program_id },
      });
      await prisma.termsAgreement.create({
        data: {
          user_id: user.user_id,
          is_agreed: true,
          email: user.email,
          username: user.username,
          program_name: program?.name ?? "",
          agreed_at: new Date(),
          signature_url: signature,
        },
      });
    }

    const admin = await prisma.user.findFirst({
      where: {
        role: "ADMIN",
      },
    });

    // Format nomor WhatsApp admin
    const formattedPhoneNumber = formatPhoneNumber(admin?.no_phone || "");

    // Pesan WhatsApp profesional untuk admin
    const message = `📢 *Notifikasi Pendaftaran Pengguna Baru*

Halo Admin 👋, ada pendaftaran baru di platform:

📧 *Email*: ${user.email}
👤 *Nama*: ${user.username}
📱 *No. Telp*: ${user.no_phone || "-"}
🌍 *Region*: ${user.region || "-"}

Silakan cek dan lakukan verifikasi jika diperlukan. ✅`;

    await sendWhatsAppMessage(apiKey, numberKey, formattedPhoneNumber, message);

    // Simpan persetujuan Terms & Conditions di dalam transaksi

    return NextResponse.json({
      status: 200,
      error: false,
      data: user,
      message: "User registered and Terms & Conditions accepted successfully",
    });
  } catch (error) {
    console.error("Error accessing database:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
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
