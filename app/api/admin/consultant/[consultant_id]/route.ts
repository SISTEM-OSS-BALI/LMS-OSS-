import { NextRequest, NextResponse } from "next/server";

import { getData } from "@/app/lib/db/getData";
import { authenticateRequest } from "@/app/lib/auth/authUtils";

export async function GET(
  request: NextRequest,
  { params }: { params: { consultant_id: string } }
) {
  const user = authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  const consultant_id = params.consultant_id;

  try {
    const getProgram = await getData(
      "consultant",
      {
        where: {
          consultant_id: consultant_id,
        },
        include: {
          students: {
            select: {
              user_id: true,
              username: true,
              imageUrl: true,
              region: true,
              program_id: true,
              level: true,
              count_program: true,
            },
          },
        },
      },
      "findUnique"
    );

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
