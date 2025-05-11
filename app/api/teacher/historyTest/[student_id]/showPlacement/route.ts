import { NextRequest, NextResponse } from "next/server";

import { getData } from "@/app/lib/db/getData";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import prisma from "@/lib/prisma";
dayjs.extend(utc);

export async function GET(
  request: NextRequest,
  { params }: { params: { student_id: string } }
) {
  const user = await authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  try {
    const getPlacement = await getData(
      "accessPlacementTest",
      {
        where: {
          user_id: params.student_id,
        },
        include: {
          placementTest: true,
        },
      },
      "findMany"
    );

    return NextResponse.json({ status: 200, error: false, data: getPlacement });
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
