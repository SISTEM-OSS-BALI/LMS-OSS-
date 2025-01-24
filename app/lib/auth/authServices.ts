import { JwtPayload } from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

interface MyTokenPayload extends JwtPayload {
  user_id: string;
  username: string
}

export const login = (): boolean => {
  const token = Cookies.get("token");
  return !!token;
};

export const getUsername = (token: string) => {
  const decoded = jwtDecode<MyTokenPayload>(token);
  return decoded.username;
};



export const getUserId = (token: string) => {
  const decoded = jwtDecode<MyTokenPayload>(token);
  return decoded.user_id;
};

export const getCountProgram = (token: string) => {
  const decoded = jwtDecode<MyTokenPayload>(token);
  return decoded.count_program;
}

export const getProgramId = (token: string) => {
  const decoded = jwtDecode<MyTokenPayload>(token);
  return decoded.program_id;
}


