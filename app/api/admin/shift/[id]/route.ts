import { authenticateRequest } from "@/app/lib/auth/authUtils";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await authenticateRequest(request);

  const body = await request.json();
  const { title, start_time, end_time } = body || {};

  if (user instanceof NextResponse) {
    return user;
  }

  try {
    const updateShift = await prisma.shiftSchedule.update({
      where: { id: params.id },
      data: {
        title,
        start_time: new Date(start_time),
        end_time: new Date(end_time),
      },
    });

    return NextResponse.json({
      status: 200,
      error: false,
      data: updateShift,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await authenticateRequest(request);
  if (user instanceof NextResponse) {
    return user;
  }

  try {
    const deletedShift = await prisma.shiftSchedule.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      status: 200,
      error: false,
      data: deletedShift,
    });
  } catch (error) {
    console.error("Error deleting shift:", error);
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
