import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getData } from "@/app/lib/db/getData";
import { authenticateRequest } from "@/app/lib/auth/authUtils";

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  try {
    const allSchedules = await prisma.scheduleMonth.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        teacher: {
          select: {
            user_id: true,
            username: true,
            email: true,
            region: true,
          },
        },
        blocks: {
          orderBy: {
            start_date: "asc",
          },
          include: {
            times: true,
          },
        },
      },
    });

    return NextResponse.json({
      status: 200,
      error: false,
      data: allSchedules,
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
