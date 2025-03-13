import { NextRequest, NextResponse } from "next/server";

import { getData } from "@/app/lib/db/getData";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  try {
    const getCertificate = await getData(
      "certificate",
      { where: { student_id: user.user_id } },
      "findFirst"
    );

    const getStudent = await getData(
      "user",
      { where: { user_id: user.user_id } },
      "findFirst"
    );

    const getProgram = await getData(
      "program",
      { where: { program_id: getStudent?.program_id } },
      "findFirst"
    );

    const programName = getProgram?.name;

    const mergedData = {
      ...getCertificate,
      program_name: programName,
      student_name: getStudent?.username,
    };

    return NextResponse.json({
      status: 200,
      error: false,
      data: mergedData,
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
