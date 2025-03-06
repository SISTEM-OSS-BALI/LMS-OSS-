import { fetcher } from "@/app/lib/utils/fetcher";
import { User } from "@prisma/client";
import useSWR from "swr";

interface UserResponse {
  data: User;
}

export const useProfileViewModel = () => {
  const { data: profileData, isLoading } = useSWR<UserResponse>(
    "/api/student/detail",
    fetcher
  );
  return {
    profileData,
    isLoading
  };
};
