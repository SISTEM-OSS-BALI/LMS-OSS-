import { NextRequest, NextResponse } from "next/server";

import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { createData } from "@/app/lib/db/createData";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user; // Jika pengguna tidak terautentikasi
  }

  const body = await request.json();
  const { username, email, password, no_phone, region } = body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const color = ["#E57373", "#FFB64D", "#4EB6AB", "#4285F4", "#66BB6A"];

    const randomColor = color[Math.floor(Math.random() * color.length)];

    const createTeacher = await createData("user", {
      username,
      email,
      password: hashedPassword,
      no_phone,
      region,
      is_verified: true,
      color: randomColor,
      role: "TEACHER",
    });

    return NextResponse.json({
      status: 200,
      error: false,
      data: createTeacher,
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
  }
}
