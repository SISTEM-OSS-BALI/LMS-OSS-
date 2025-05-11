import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { updateData } from "@/app/lib/db/updateData";
import { uploadBase64Image } from "@/app/lib/utils/uploadHelper";

export async function PUT(request: NextRequest) {
  const user = await authenticateRequest(request);

  const body = await request.json();
  const { imageUrl } = body;

  if (user instanceof NextResponse) {
    return user;
  }

  const fileName = `profile-${Date.now()}.jpg`;
  const publicImageUrl = await uploadBase64Image(imageUrl, fileName);

  try {
    await updateData("user", { user_id: user.user_id }, { imageUrl: publicImageUrl });

    return NextResponse.json({ status: 200, error: false, data: "Success" });
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
