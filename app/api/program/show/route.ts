import { NextRequest, NextResponse } from "next/server";

import { getData } from "@/app/lib/db/getData";

export async function GET(request: NextRequest) {
  try {
    const getProgram = await prisma.program.findMany({
      select: {
        program_id: true,
        name: true,
      },
    });

    return NextResponse.json({ status: 200, error: false, data: getProgram });
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
