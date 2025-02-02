import { fetcher } from "@/app/lib/utils/fetcher";
import { User } from "@/app/model/user";
import { PlacementTest } from "@prisma/client";
import { useState } from "react";
import useSWR from "swr";

interface PlacementTestResponse {
  data: PlacementTest[];
}

interface UserResponse {
  data: User[];
}

export const usePlacementTestViewModel = () => {
  const { data: dataPlacementTest, error } = useSWR<PlacementTestResponse>(
    "/api/teacher/placementTest/show",
    fetcher
  );

  return {
    dataPlacementTest,
  };
};
