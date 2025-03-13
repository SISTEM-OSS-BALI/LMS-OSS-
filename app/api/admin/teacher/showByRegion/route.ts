import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getData } from "@/app/lib/db/getData";
import { authenticateRequest } from "@/app/lib/auth/authUtils";

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user; // Jika pengguna tidak terautentikasi
  }

  try {
    // Ambil region pengguna
    const studentData = await getData(
      "user",
      {
        where: {
          user_id: user.user_id,
        },
        select: {
          region: true,
        },
      },
      "findUnique"
    );

    if (!studentData || !studentData.region) {
      return NextResponse.json(
        {
          status: 404,
          error: true,
          message: "User region not found",
        },
        { status: 404 }
      );
    }

    const getTeacher = await getData(
      "user",
      {
        where: {
          role: "TEACHER",
          region: studentData.region,
        },
        select: {
          user_id: true,
          username: true,
          email: true,
          color: true,
          imageUrl: true,
        },
      },
      "findMany"
    );

    return NextResponse.json({ status: 200, error: false, data: getTeacher });
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
