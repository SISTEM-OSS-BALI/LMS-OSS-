import { NextRequest, NextResponse } from "next/server";

import { authenticateRequest } from "@/app/lib/auth/authUtils";

export async function GET(request: NextRequest) {
  const user = authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const lastChecked = searchParams.get("lastChecked");
  const lastCheckedNumber = Number(lastChecked);
  const lastCheckedDate = !isNaN(lastCheckedNumber)
    ? new Date(lastCheckedNumber)
    : new Date(0);

  try {
    const getTeacherAbsanceCount = await prisma.teacherAbsence.count({
      where: {
        createdAt: {
          gt: lastCheckedDate,
        },
      },
    });

    return NextResponse.json({
      status: 200,
      error: false,
      data: getTeacherAbsanceCount,
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
