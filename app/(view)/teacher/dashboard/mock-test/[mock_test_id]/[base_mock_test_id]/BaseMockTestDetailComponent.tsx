import { useParams } from "next/navigation";
import { useBaseViewModel } from "./useBaseViewModel";
import ReadingMockTestComponent from "@/app/components/ReadingComponentMockTest";
import ListeningMockTestComponent from "@/app/components/ListeningMockTestComponent";
import SpeakingMockTestComponent from "@/app/components/SpeakingMockTestComponent";
import WritingMockTestComponent from "@/app/components/WritingComponentMockTest";
import { Skeleton, Alert } from "antd";

export default function BaseMockTestDetailComponent() {
  const query = useParams();
  const base_id = query.base_mock_test_id;
  const { baseDetailData, baseDetailDataLoading } = useBaseViewModel();

  // Skeleton Loading
  if (baseDetailDataLoading)
    return (
      <div style={{ padding: "20px" }}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );

  // Alert jika tidak ada data sama sekali
  if (!baseDetailData)
    return (
      <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
        <Alert
          message="No Data Available"
          description="The requested mock test data is not available."
          type="warning"
          showIcon
        />
      </div>
    );

  return (
    <div>
      {baseDetailData.data.type === "READING" ? (
        baseDetailData.data.reading ? (
          <ReadingMockTestComponent
            data={baseDetailData.data.reading}
            onAddQuestion={() => console.log("Add Question")}
            onDeleteQuestion={(id) => console.log("Delete Question:", id)}
            onEditPassage={(id) => console.log("Edit Passage:", id)}
            onEditQuestion={(id) => console.log("Edit Question:", id)}
          />
        ) : (
          <Alert
            message="No Reading Test Data"
            description="This mock test does not have any reading test data."
            type="info"
            showIcon
            style={{ marginBottom: "16px" }}
          />
        )
      ) : null}

      {baseDetailData.data.type === "LISTENING" ? (
        baseDetailData.data.listening ? (
          <ListeningMockTestComponent
            data={baseDetailData.data.listening}
            onAddQuestion={() => console.log("Add Question")}
            onDeleteQuestion={(id) => console.log("Delete Question:", id)}
            onEditAudio={(id) => console.log("Edit Audio:", id)}
            onEditQuestion={(id) => console.log("Edit Question:", id)}
          />
        ) : (
          <Alert
            message="No Listening Test Data"
            description="This mock test does not have any listening test data."
            type="info"
            showIcon
            style={{ marginBottom: "16px" }}
          />
        )
      ) : null}

      {baseDetailData.data.type === "SPEAKING" ? (
        baseDetailData.data.speaking ? (
          <SpeakingMockTestComponent
            data={baseDetailData.data.speaking}
            onEdit={(id) => console.log("Edit Speaking:", id)}
            onDelete={(id) => console.log("Delete Speaking:", id)}
          />
        ) : (
          <Alert
            message="No Speaking Test Data"
            description="This mock test does not have any speaking test data."
            type="info"
            showIcon
            style={{ marginBottom: "16px" }}
          />
        )
      ) : null}

      {baseDetailData.data.type === "WRITING" ? (
        baseDetailData.data.writing ? (
          <WritingMockTestComponent
            data={baseDetailData.data.writing}
            onAddQuestion={() => console.log("Add Question")}
            onDeleteQuestion={(id) => console.log("Delete Question:", id)}
            onEditPrompt={(id) => console.log("Edit Prompt:", id)}
            onEditQuestion={(id) => console.log("Edit Question:", id)}
          />
        ) : (
          <Alert
            message="No Writing Test Data"
            description="This mock test does not have any writing test data."
            type="info"
            showIcon
            style={{ marginBottom: "16px" }}
          />
        )
      ) : null}
    </div>
  );
}
