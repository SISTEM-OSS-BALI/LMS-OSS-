import { NextRequest, NextResponse } from "next/server";

import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { deleteData } from "@/app/lib/db/deleteData";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { consultant_id: string } }
) {
  const user = await authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  const consultant_id = params.consultant_id;

  try {
    await deleteData("consultant", {
      consultant_id: consultant_id,
    });

    return NextResponse.json({
      status: 200,
      error: false,
      data: "Consultant deleted successfully",
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
