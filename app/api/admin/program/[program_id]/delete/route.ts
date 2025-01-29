import { deleteData } from "@/app/lib/db/deleteData";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { program_id: string } }
) {
  const { program_id } = params;

  try {
    const deletedTeacher = await deleteData("program", {
      program_id: program_id,
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
