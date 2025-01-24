import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import bcrypt from "bcrypt";
import { createData } from "@/app/lib/db/createData";
import { getData } from "@/app/lib/db/getData";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { username, email, password } = body;

  if (!username || !email || !password) {
    return NextResponse.json(
      { error: "Username, email and password are required" },
      { status: 400 }
    );
  }

  const existingUser = await getData("user", { where: { email } }, "findFirst");
  if (existingUser) {
    return NextResponse.json({ error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await createData("user", {
      username,
      email,
      password: hashedPassword,
    });
    return NextResponse.json({
      status: 200,
      error: false,
      data: user,
      message: "User created successfully",
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
