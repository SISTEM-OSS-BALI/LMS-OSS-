import { authenticateRequest } from "@/app/lib/auth/authUtils";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);

  const body = await request.json()
  const { title, start_time, end_time } = body || {};

  if (user instanceof NextResponse) {
    return user;
  }


  try {
    const createShift = await prisma.shiftSchedule.create({
      data: {
        title,
        start_time: new Date(start_time),
        end_time: new Date(end_time),
      },
    });

    return NextResponse.json({
      status: 200,
      error: false,
      data: createShift,
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

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  try {
    const getShift = await prisma.shiftSchedule.findMany({});

    return NextResponse.json({
      status: 200,
      error: false,
      data: getShift,
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