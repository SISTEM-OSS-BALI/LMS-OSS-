import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getData } from "@/app/lib/db/getData";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

// Buat union type untuk nama section
type SectionName = "MULTIPLE_CHOICE" | "READING" | "WRITING";

// Tipe dasar hasil format data
type FormattedSection =
  | {
      base_id: string;
      name: "MULTIPLE_CHOICE";
      placementTestId: string;
      multipleChoices: any[];
    }
  | {
      base_id: string;
      name: "READING";
      placementTestId: string;
      trueFalseGroups: any[];
    }
  | {
      base_id: string;
      name: "WRITING";
      placementTestId: string;
      writingQuestions: any[];
    };

export async function GET(
  request: NextRequest,
  { params }: { params: { placement_test_id: string } }
) {
  const user = await authenticateRequest(request);
  if (user instanceof NextResponse) return user;

  try {
    const getBasePlacementTest = await getData(
      "basePlacementTest",
      {
        where: {
          placementTestId: params.placement_test_id,
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

    // Format & filter data
    const formattedData: FormattedSection[] = getBasePlacementTest.map(
      (baseTest: any) => {
        if (baseTest.name === "WRITING") {
          return {
            base_id: baseTest.base_id,
            name: "WRITING",
            placementTestId: baseTest.placementTestId,
            writingQuestions: baseTest.writingQuestions,
          };
        } else if (baseTest.name === "READING") {
          return {
            base_id: baseTest.base_id,
            name: "READING",
            placementTestId: baseTest.placementTestId,
            trueFalseGroups: baseTest.trueFalseGroups,
          };
        } else {
          return {
            base_id: baseTest.base_id,
            name: "MULTIPLE_CHOICE",
            placementTestId: baseTest.placementTestId,
            multipleChoices: baseTest.multipleChoices,
          };
        }
      }
    );

    // Sort agar WRITING selalu terakhir
    const order: Record<SectionName, number> = {
      MULTIPLE_CHOICE: 1,
      READING: 2,
      WRITING: 3,
    };

    const sortedData = formattedData.sort(
      (a, b) => order[a.name] - order[b.name]
    );

    return NextResponse.json({
      status: 200,
      error: false,
      data: sortedData,
    });
  } catch (error) {
    console.error("Error accessing database:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
