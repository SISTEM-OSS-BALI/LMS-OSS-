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
    const getMeetingById = await prisma.meeting.findMany({
      where: {
        teacher_id: user.user_id,
      },
      include: {
        student: {
          include: {
            program: true,
          },
        },
      },
    });

    return NextResponse.json({
      status: 200,
      error: false,
      data: getMeetingById,
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
