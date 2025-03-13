import { deleteData } from "@/app/lib/db/deleteData";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function DELETE(
  request: NextRequest,
  { params }: { params: { teacher_id: string } }
) {
  const { teacher_id } = params;

  try {
    const deletedTeacher = await deleteData("user", {
      user_id: teacher_id,
    });

    return NextResponse.json({ status: 200, data: deletedTeacher });
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
