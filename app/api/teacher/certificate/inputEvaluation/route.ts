import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (user instanceof NextResponse) return user;

  const body = await request.json();
  const { student_id, sections, type, user_group_id } = body;


  try {
    let certificate;

    if (type === "GROUP") {
      // 1. Cari certificate grup (hanya satu certificate per group)
      let certificate = await prisma.certificate.findFirst({
        where: {
          user_group_id: user_group_id,
          type_student: "GROUP",
        },
      });

      // 2. Jika belum ada certificate, buat dulu
      if (!certificate) {
        certificate = await prisma.certificate.create({
          data: {
            user_group_id: user_group_id,
            type_student: "GROUP",
            student_id: student_id, // optional, untuk konsistensi
            no_certificate: await generateCertificateNumber(),
            is_complated_meeting: true,
            is_complated_testimoni: false,
            is_download: false,
          },
        });
      }

      // 3. Buat section untuk anggota yang sedang input
      await prisma.section.createMany({
        data: sections.map((section: any) => ({
          section_type: section.section_type,
          level: section.level,
          comment: section.comment,
          student_id: student_id, // anggota yang sedang input
          user_group_id: user_group_id,
          type_student: "GROUP",
          certificate_id: certificate!.certificate_id,
        })),
      });

      // 4. Ambil seluruh anggota grup (relasi UserGroupMembers, semua userUser_id)
      const groupMembers = await prisma.userGroup.findMany({
        where: { userUser_id: student_id },
        select: { user_group_id: true, userUser_id: true },
      });


      // 5. Ambil semua Section GROUP pada certificate ini, user_group_id ini
      const allCertificate = await prisma.certificate.findMany({
        where: {
          student_id: student_id,
        },
        select: { user_group_id: true },
      });

      const allMembersEvaluated = groupMembers.every((member) =>
        allCertificate.some(
          (certificate) => certificate.user_group_id === member.user_group_id
        )
      );

      if (allMembersEvaluated) {
       await prisma.user.updateMany({
         where: {
           user_id: {
             in: groupMembers.map((member) => member.userUser_id ?? ""),
           },
         },
         data: { is_evaluation: true },
       });
      }

    } else {
      // INDIVIDUAL
      certificate = await prisma.certificate.findFirst({
        where: { student_id },
      });

      if (!certificate) {
        certificate = await prisma.certificate.create({
          data: {
            student_id,
            type_student: "INDIVIDUAL",
            no_certificate: await generateCertificateNumber(),
            is_complated_meeting: true,
            is_complated_testimoni: false,
            is_download: false,
          },
        });
      }

      await prisma.section.createMany({
        data: sections.map((section: any) => ({
          section_type: section.section_type,
          level: section.level,
          comment: section.comment,
          type_student: type,
          student_id: student_id,
          certificate_id: certificate!.certificate_id,
        })),
      });

      // Langsung update
      await prisma.user.update({
        where: { user_id: student_id },
        data: {
          is_evaluation: true,
        },
      });
    }

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

async function generateCertificateNumber() {
  const currentYear = new Date().getFullYear();

  const lastCertificate = await prisma.certificate.findFirst({
    where: {
      no_certificate: {
        startsWith: `OSS.SERTIF/`,
      },
    },
    orderBy: {
      no_certificate: "desc",
    },
    select: {
      no_certificate: true,
    },
  });

  let newNumber = 237;

  if (lastCertificate) {
    const match = lastCertificate.no_certificate.match(
      /OSS\.SERTIF\/(\d+)\/EAP\/\d+/
    );

    if (match && match[1]) {
      newNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `OSS.SERTIF/${newNumber}/EAP/${currentYear}`;
}
