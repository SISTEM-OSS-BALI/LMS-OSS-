import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  formatPhoneNumber,
  sendWhatsAppMessage,
} from "@/app/lib/utils/notificationHelper";
import prisma from "@/lib/prisma";
import { uploadBase64Image } from "@/app/lib/utils/uploadHelper";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);
dayjs.extend(utc);

const monthTranslation = {
  Januari: "January",
  Februari: "February",
  Maret: "March",
  April: "April",
  Mei: "May",
  Juni: "June",
  Juli: "July",
  Agustus: "August",
  September: "September",
  Oktober: "October",
  November: "November",
  Desember: "December",
};

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  try {
    const body = await request.json();
    const {
      teacher_id,
      meeting_id,
      date,
      time,
      method,
      platform,
      reason,
      option_reason,
      imageUrl,
    } = body;

    const apiKey = process.env.API_KEY_WATZAP!;
    const numberKey = process.env.NUMBER_KEY_WATZAP!;

    if (!teacher_id || !meeting_id || !reason || !option_reason) {
      return NextResponse.json(
        { status: 400, error: true, message: "Data tidak lengkap!" },
        { status: 400 }
      );
    }

    const monthRegex = new RegExp(Object.keys(monthTranslation).join("|"), "gi");
    const normalizedDateString = (() => {
      if (typeof date !== "string") {
        return date;
      }

      if (date.includes(",")) {
        const [, datePortion = date] = date.split(", ");
        return datePortion.replace(
          monthRegex,
          (m: string) => monthTranslation[m as keyof typeof monthTranslation]
        );
      }

      return date.replace(
        monthRegex,
        (m: string) => monthTranslation[m as keyof typeof monthTranslation]
      );
    })();

    const possibleFormats = [
      "DD MMMM YYYY",
      "DD MMM YYYY",
      "YYYY-MM-DD",
      "YYYY/MM/DD",
    ];

    let baseDate =
      typeof normalizedDateString === "string"
        ? dayjs(normalizedDateString, possibleFormats, true)
        : dayjs(normalizedDateString);

    if (!baseDate.isValid()) {
      baseDate = dayjs(normalizedDateString);
    }

    if (!baseDate.isValid()) {
      throw new Error("Format tanggal tidak valid");
    }

    const [hours, minutes] = time.split(":").map(Number);
    const dateTime = dayjs
      .utc(baseDate)
      .set("hour", hours)
      .set("minute", minutes);

    const getTeacher = await prisma.user.findUnique({
      where: {
        user_id: teacher_id,
      },
      select: {
        user_id: true,
        username: true,
      },
    });

    const getStudent = await prisma.user.findUnique({
      where: {
        user_id: user.user_id,
      },
      select: {
        user_id: true,
        username: true,
        program_id: true,
        name_group: true,
      },
    });

    const getAdmin = await prisma.user.findFirst({
      where: {
        role: "ADMIN",
      },
      select: {
        user_id: true,
        no_phone: true,
        username: true,
      },
    });

    const getProgram = await prisma.program.findUnique({
      where: {
        program_id: getStudent?.program_id ?? "",
      },
      select: {
        name: true,
        duration: true,
      },
    });

    const fileName = `reschedule-${Date.now()}.jpg`;
    const publicImageUrl = await uploadBase64Image(imageUrl, fileName);

    const createReschedule = await prisma.rescheduleMeeting.create({
      data: {
        teacher_id,
        meeting_id,
        teacher_name: getTeacher?.username ?? "",
        student_name: getStudent?.username ?? "",
        student_id: getStudent?.user_id ?? "",
        new_dateTime: dateTime.toDate(),
        new_startTime: dateTime.toDate(),
        program_name: getProgram?.name ?? "",
        new_endTime: dateTime.add(getProgram?.duration!, "minute").toDate(),
        new_platform: platform,
        new_method: method,
        reason,
        option_reason,
        imageUrl: publicImageUrl,
      },
    });

    const adminPhone = formatPhoneNumber(getAdmin?.no_phone || "");
    const adminName = getAdmin?.username || "";
    const studentName = getStudent?.username
      ? getStudent?.username
      : getStudent?.name_group;
    const teacherName = getTeacher?.username;
    const formattedDate = dayjs(dateTime).format("DD MMMM YYYY");

    await sendWhatsAppMessage(
      apiKey,
      numberKey,
      adminPhone,
      `📢 *Pengajuan Emergency Reschedule!*\n\nHalo *${adminName}*, ada pengajuan emergency reschedule yang memerlukan perhatian Anda.\n\n👨‍🎓 *Siswa:* ${studentName}\n👨‍🏫 *Guru:* ${teacherName}\n📅 *Tanggal Pengajuan:* ${formattedDate}\n📌 *Alasan:* ${reason}\n\nMohon segera cek dan verifikasi melalui sistem. Terima kasih! 🙏`
    );

    return NextResponse.json({
      status: 200,
      error: false,
      data: createReschedule,
      message: "Reschedule meeting berhasil diajukan.",
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    await prisma.$disconnect();
  }
}
