import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";

export async function POST(request: NextRequest) {
  const user = authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user; // Jika pengguna tidak terautentikasi
  }

  const body = await request.json();
  const { student_id, sections } = body;

  try {
    let certificate = await prisma.certificate.findFirst({
      where: { student_id },
    });

    if (!certificate) {
      certificate = await prisma.certificate.create({
        data: {
          student_id,
          no_certificate: await generateCertificateNumber(),
          is_complated_meeting: true,
          is_complated_testimoni: false,
          overall: null,
          is_download: false,
        },
      });
    }

    await prisma.section.createMany({
      data: sections.map((section: any) => ({
        section_type: section.section_type,
        level: section.level,
        comment: section.comment,
        student_id: student_id,
        certificate_id: certificate.certificate_id,
      })),
    });

    await prisma.user.update({
      where: { user_id: student_id },
      data: {
        is_evaluation: true,
      },
    });

    return NextResponse.json({
      status: 200,
      error: false,
      message: "Certificate and Sections created successfully",
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
  }
}

// 🔹 4️⃣ Fungsi untuk membuat nomor sertifikat unik (bisa disesuaikan)
import prisma from "@/app/lib/prisma";

async function generateCertificateNumber() {
  const currentYear = new Date().getFullYear(); // Tahun saat ini (2024, 2025, dll.)

  // 🔹 1️⃣ Dapatkan nomor sertifikat terakhir dari database
  const lastCertificate = await prisma.certificate.findFirst({
    where: {
      no_certificate: {
        startsWith: `OSS.SERTIF/`, // Hanya cari yang memiliki format ini
      },
    },
    orderBy: {
      no_certificate: "desc", // Urutkan dari yang terbesar
    },
    select: {
      no_certificate: true,
    },
  });

  let newNumber = 1; // Default jika tidak ada sertifikat sebelumnya

  // 🔹 2️⃣ Jika ada sertifikat sebelumnya, ambil nomor terakhir & tambahkan 1
  if (lastCertificate) {
    const match = lastCertificate.no_certificate.match(
      /OSS\.SERTIF\/(\d+)\/EAP\/\d+/
    );

    if (match && match[1]) {
      newNumber = parseInt(match[1], 10) + 1; // Ambil angka & increment
    }
  }

  // 🔹 3️⃣ Format nomor sertifikat sesuai aturan
  return `OSS.SERTIF/${newNumber}/EAP/${currentYear}`;
}
