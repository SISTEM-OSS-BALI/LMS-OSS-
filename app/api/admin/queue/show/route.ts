import { NextRequest, NextResponse } from "next/server";

import { getData } from "@/app/lib/db/getData";
import { authenticateRequest } from "@/app/lib/auth/authUtils";

export async function GET(request: NextRequest) {
  const user = authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  try {
    const getMeetingWithTeacher = await getData(
      "meeting",
      {
        include: {
          teacher: {
            select: {
              user_id: true,
              username: true,
              count_program: true,
            },
          },
          student: {
            select: {
              user_id: true,
              username: true,
              program_id: true,
              count_program: true,
            },
          },
        },
      },
      "findMany"
    );

    return NextResponse.json({
      status: 200,
      error: false,
      data: getMeetingWithTeacher,
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
