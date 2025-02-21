import { useParams } from "next/navigation";
import { useBasePlacementDetailViewModel } from "./useBasePlacementDetailViewModel";
import MultipleChoiceTeacherPlacementDisplay from "@/app/components/MultipleChoiceTeacherPlacementDisplay";
import WritingPlacementTestDisplay from "@/app/components/WritingTeacherPlacementDisplay";
import ReadingPlacementTestDisplay from "@/app/components/ReadingTeacherPlacementDisplay";
import { Skeleton, Typography, Alert } from "antd";

const { Title } = Typography;

export default function BasePlacementDetailComponent() {
  const { basePlacementDetail, isLoading } = useBasePlacementDetailViewModel();
  const query = useParams();
  const base_id = query.base_id as string; // Pastikan base_id adalah string

  // Cek apakah semua data kosong
  const isDataEmpty =
    !basePlacementDetail?.data.multipleChoice.length &&
    !basePlacementDetail?.data.writing.length &&
    !basePlacementDetail?.data.trueFalse.length;

  return (
    <div style={{ padding: "20px" }}>
      <Title level={4}>Placement Test Detail</Title>

      {/* Skeleton Loading */}
      {isLoading ? (
        <>
          <Skeleton active />
          <Skeleton active />
          <Skeleton active />
        </>
      ) : isDataEmpty ? (
        // Alert jika tidak ada data
        <Alert
          message="Informasi"
          description="Tidak ada data Placement Test tersedia."
          type="info"
          showIcon
          style={{ marginTop: "16px" }}
        />
      ) : (
        <>
          {/* Render Multiple Choice jika tersedia */}
          {basePlacementDetail?.data.multipleChoice.length > 0 && (
            <MultipleChoiceTeacherPlacementDisplay
              data={basePlacementDetail.data.multipleChoice}
              onEdit={(id: string) => console.log("Edit:", id)}
              onDelete={(id: string) => console.log("Delete:", id)}
            />
          )}

          {/* Render Writing jika tersedia */}
          {basePlacementDetail?.data.writing.length > 0 && (
            <WritingPlacementTestDisplay
              data={basePlacementDetail.data.writing}
              onEdit={(id: string) => console.log("Edit:", id)}
              onDelete={(id: string) => console.log("Delete:", id)}
            />
          )}

          {/* Render Reading jika tersedia */}
          {basePlacementDetail?.data.trueFalse.length > 0 && (
            <ReadingPlacementTestDisplay
              data={basePlacementDetail.data.trueFalse}
              onEditPassage={(id: string) => console.log("Edit Passage:", id)}
              onEditQuestion={(id: string) => console.log("Edit Question:", id)}
              onDeleteQuestion={(id: string) =>
                console.log("Delete Question:", id)
              }
              onAddQuestion={(id: string) =>
                console.log("Add Question to:", id)
              }
            />
          )}
        </>
      )}
    </div>
  );
}
