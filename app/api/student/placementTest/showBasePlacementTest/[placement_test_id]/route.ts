import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getData } from "@/app/lib/db/getData";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export async function GET(
  request: NextRequest,
  params: { params: { placement_test_id: string } }
) {
  const user = await authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  try {
    const getBasePlacementTest = await getData(
      "basePlacementTest",
      {
        where: {
          placementTestId: params.params.placement_test_id,
        },
        include: {
          multipleChoices: true, // Soal pilihan ganda
          trueFalseGroups: {
            include: {
              trueFalseQuestions: true, // Soal benar/salah dalam grup
            },
          },
          writingQuestions: true, // Soal writing
        },
      },
      "findMany"
    );

    // 🔹 **Mengelompokkan Data Sesuai Nama**
    const formattedData = getBasePlacementTest.map((baseTest: any) => {
      let filteredData = { ...baseTest };

      if (baseTest.name === "WRITING") {
        filteredData = {
          base_id: baseTest.base_id,
          name: baseTest.name,
          placementTestId: baseTest.placementTestId,
          writingQuestions: baseTest.writingQuestions, // Hanya writing questions
        };
      } else if (baseTest.name === "READING") {
        filteredData = {
          base_id: baseTest.base_id,
          name: baseTest.name,
          placementTestId: baseTest.placementTestId,
          trueFalseGroups: baseTest.trueFalseGroups, // Hanya true/false
        };
      } else if (baseTest.name === "MULTIPLE_CHOICE") {
        filteredData = {
          base_id: baseTest.base_id,
          name: baseTest.name,
          placementTestId: baseTest.placementTestId,
          multipleChoices: baseTest.multipleChoices, // Hanya multiple choice
        };
      }

      return filteredData;
    });

    return NextResponse.json({
      status: 200,
      error: false,
      data: formattedData,
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
  }
}
