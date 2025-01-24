import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const verifyJWT = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string) as {
      user_id: string;
      username: string;
      count_program: number;
      program_id: string;
      exp: number;
    };
  } catch (error) {
    throw new Error("Invalid token", { cause: error });
  }
};

export const authenticateRequest = (req: NextRequest) => {
  const authorization = req.headers.get("Authorization");

  if (!authorization) {
    return NextResponse.json(
      { status: 401, message: "Unauthorized: Token is required" },
      { status: 401 }
    );
  }

  const token = authorization.split(" ")[1];

  try {
    const user = verifyJWT(token);

    if (Date.now() >= user.exp * 1000) {
      const response = NextResponse.json(
        { status: 401, message: "Unauthorized: Token expired" },
        { status: 401 }
      );
      response.cookies.set("token", "", { expires: new Date(0) });
      return response;
    }

    return user;
  } catch (error) {
    const errorMessage = (error as Error).message;
    return NextResponse.json(
      { status: 401, message: `Unauthorized: ${errorMessage}` },
      { status: 401 }
    );
  }
};
