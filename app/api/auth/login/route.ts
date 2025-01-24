import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { getData } from "@/app/lib/db/getData";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }
  try {
    const user = await getData(
      "user",
      {
        where: {
          email,
        },
      },
      "findFirst"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        username: user.username,
        program_id: user.program_id,
        count_program: user.count_program,
        
      },
      process.env.JWT_SECRET as string
    );

    return NextResponse.json({
      token,
      role: user.role as Role,
      message: "Login successfully",
      status: 200,
      error: false,
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
