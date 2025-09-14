import { authenticateRequest } from "@/app/lib/auth/authUtils";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await authenticateRequest(request);

  const body = await request.json();
  const { name } = body || {};

  if (user instanceof NextResponse) {
    return user;
  }

  try {
    const updateRoom = await prisma.room.update({
      where: { room_id: params.id },
      data: {
        name,
      },
    });

    return NextResponse.json({
      status: 200,
      error: false,
      data: updateRoom,
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
    const deletedRoom = await prisma.room.delete({
      where: { room_id: params.id },
    });

    return NextResponse.json({
      status: 200,
      error: false,
      data: deletedRoom,
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
