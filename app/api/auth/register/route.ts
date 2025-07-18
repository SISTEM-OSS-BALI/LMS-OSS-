import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { getData } from "@/app/lib/db/getData";
import {
  formatPhoneNumber,
  sendWhatsAppMessage,
} from "@/app/lib/utils/notificationHelper";
import { User } from "@prisma/client";

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
      name_group,
      type,
      members = [],
    } = body;


    if (!email || !password) {
      return NextResponse.json(
        { error: "Email, password is required" },
        { status: 400 }
      );
    }

    const existingUser = await getData(
      "user",
      { where: { email } },
      "findFirst"
    );
    if (existingUser) {
      return NextResponse.json(
        { error: "Pengguna dengan email ini sudah terdaftar" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let user: User;
    let userGroup = null;
    let finalProgramId = program_id;

    if (type === "GROUP") {
      const programGroup = await prisma.program.findFirst({
        where: { name: "Group Class" },
      });

      finalProgramId = programGroup?.program_id || program_id;

      // 1. Buat user utama terlebih dahulu
      user = await prisma.user.create({
        data: {
          email,
          name_group,
          password: hashedPassword,
          program_id: finalProgramId,
          type_student: "GROUP",
          region,
        },
      });

      // 2. Buat UserGroup beserta member

      members.map(async (member: User) => {
        const userGroup = await prisma.userGroup.create({
          data: {
            username: member.username ?? "-",
            no_phone: member.no_phone ?? "-",
            userUser_id: user.user_id,
          },
        });
      });
    } else {
      // Individual user
      user = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          no_phone,
          program_id,
          type_student: "INDIVIDUAL",
          region,
        },
      });
    }

    // Simpan terms agreement jika ada program_id
    if (finalProgramId) {
      const selectedProgram = await prisma.program.findUnique({
        where: { program_id: finalProgramId },
      });

      await prisma.termsAgreement.create({
        data: {
          user_id: user.user_id,
          is_agreed: true,
          email: user.email,
          username: type === "GROUP" ? name_group ?? "-" : user.username ?? "-",
          program_name: selectedProgram?.name ?? "-",
          agreed_at: new Date(),
          signature_url: signature,
        },
      });
    }

    // Kirim notifikasi WhatsApp ke admin
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    const formattedPhone = formatPhoneNumber(admin?.no_phone || "-");
    const waMessage = `📢 *Notifikasi Pendaftaran Pengguna Baru*

Halo Admin 👋, ada pendaftaran baru di platform:

📧 *Email*: ${user.email}
👤 *Nama*: ${user.username || "-"}
📱 *No. Telp*: ${user.no_phone || "-"}
🌍 *Region*: ${user.region || "-"}

Silakan cek dan lakukan verifikasi jika diperlukan. ✅`;

    await sendWhatsAppMessage(
      process.env.API_KEY_WATZAP!,
      process.env.NUMBER_KEY_WATZAP!,
      formattedPhone,
      waMessage
    );

    return NextResponse.json({
      status: 200,
      error: false,
      data: user,
      message:
        type === "GROUP"
          ? "Group registered and Terms & Conditions accepted successfully"
          : "User registered and Terms & Conditions accepted successfully",
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
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
