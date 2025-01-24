import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import {
  getCountProgram,
  getProgramId,
  getUserId,
  getUsername,
} from "./authServices";

export const useUserId = () => {
  const [userId, setUserId] = useState("");
  const token = Cookies.get("token");

  useEffect(() => {
    if (token) {
      setUserId(getUserId(token));
    }
  }, [token]);

  return userId;
};

export const useUsername = () => {
  const [username, setUsername] = useState("");
  const token = Cookies.get("token");

  useEffect(() => {
    if (token) {
      setUsername(getUsername(token));
    }
  }, [token]);

  return username;
};

export const useCount = () => {
  const [count, setCount] = useState("");
  const token = Cookies.get("token");

  useEffect(() => {
    if (token) {
      setCount(getCountProgram(token));
    }
  }, [token]);

  return count;
};

export const useProgramId = () => {
  const [programId, setProgramId] = useState("");
  const token = Cookies.get("token");

  useEffect(() => {
    if (token) {
      setProgramId(getProgramId(token));
    }
  }, [token]);

  return programId;
};
