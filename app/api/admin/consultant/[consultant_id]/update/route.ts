import { NextRequest, NextResponse } from "next/server";

import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { updateData } from "@/app/lib/db/updateData";

export async function PUT(
  request: NextRequest,
  { params }: { params: { consultant_id: string } }
) {
  const user = await authenticateRequest(request);
  const body = await request.json();
  const { name, no_phone } = body;

  if (user instanceof NextResponse) {
    return user;
  }

  const consultant_id = params.consultant_id;

  try {
    await updateData(
      "consultant",
      {
        consultant_id: consultant_id,
      },
      {
        name,
        no_phone,
      }
    );

    return NextResponse.json({
      status: 200,
      error: false,
      data: "Consultant updated successfully",
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
