import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function PUT(
  request: NextRequest,
  { params }: { params: { teacher_id: string } }
) {
  const { teacher_id } = params;
  const { username, email, password, no_phone, region } = await request.json();

  try {
    const updateData: any = {
      username,
      no_phone,
      region,
    };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    if (email) {
      updateData.email = email;
    }

    const updatedTeacher = await prisma.user.update({
      where: { user_id: teacher_id },
      data: updateData,
    });

    return NextResponse.json({ status: 200, data: updatedTeacher });
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
