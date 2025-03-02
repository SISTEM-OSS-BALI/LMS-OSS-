import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const authenticateRequest = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { status: 401, message: "Unauthorized: You must be logged in" },
      { status: 401 }
    );
  }

  return session.user; 
};
