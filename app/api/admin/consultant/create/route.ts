import { NextRequest, NextResponse } from "next/server";

import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { createData } from "@/app/lib/db/createData";

export async function POST(request: NextRequest) {
  const user = authenticateRequest(request);
  const body = await request.json();
  const { name, no_phone } = body;

  if (user instanceof NextResponse) {
    return user;
  }

  try {
    await createData("consultant", {
      name,
      no_phone,
    });

    return NextResponse.json({
      status: 200,
      error: false,
      data: "Consultant created successfully",
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
