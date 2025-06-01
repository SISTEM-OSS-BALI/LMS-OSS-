import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import prisma from "@/lib/prisma";
export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
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
