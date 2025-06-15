import { useHistoryViewModel } from "./useHistoryViewModel";
import { Skeleton, Card } from "antd";
import { HistoryMockTestComponent } from "@/app/components/HistoryMockComponent";
import { useEffect } from "react";

export default function HistoryComponent() {
  const {
    studentAnswerData,
    showScoreDataLoading,
    studentAnswerLoading,
    showScoreData,
  } = useHistoryViewModel();



  const {
    level = "",
    totalScore = 0,
    percentageScore = 0,
  } = showScoreData?.data || {};

  if (showScoreDataLoading || studentAnswerLoading) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "30px" }}>
        <Card
          style={{
            marginBottom: "20px",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <Skeleton active title={false} paragraph={{ rows: 1 }} />
        </Card>
        {[...Array(3)].map((_, index) => (
          <Card
            key={index}
            style={{ marginBottom: 20, padding: 20, borderRadius: 10 }}
          >
            <Skeleton active title paragraph={{ rows: 3 }} />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      <HistoryMockTestComponent
        data={studentAnswerData?.data || []}
        level={level}
        totalScore={totalScore}
        percentageScore={percentageScore}
      />
    </div>
  );
}
