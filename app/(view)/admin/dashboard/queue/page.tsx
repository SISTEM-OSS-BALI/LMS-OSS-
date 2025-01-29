"use client";

import { Table, Divider, Spin, Tag, Flex, DatePicker, Badge } from "antd";
import { useMemo } from "react";
import { useQueueViewModel } from "./useQueueViewModel";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Loading from "@/app/components/Loading";
import CustomAlert from "@/app/components/CustomAlert";
dayjs.extend(utc);

export default function QueuePage() {
  const { queueData, queueError, handleChangeDate, showTimes } =
    useQueueViewModel();
  const isLoading = !queueData && !queueError;

  const groupedData = useMemo(() => {
    if (!queueData?.data || !Array.isArray(queueData.data)) return {};
    return queueData.data.reduce((acc: Record<string, any[]>, item: any) => {
      const teacherName = item.teacher?.username || "Unknown Teacher";
      if (!acc[teacherName]) {
        acc[teacherName] = [];
      }
      acc[teacherName].push(item);
      return acc;
    }, {});
  }, [queueData]);

  if (isLoading) {
    return <Loading />;
  }

  const cellRender = (currentDate: any) => {
    const formattedDate = dayjs(currentDate).format("YYYY-MM-DD");
    const isShowTime = showTimes.includes(formattedDate);
    console.log(showTimes);

    return (
      <div className="ant-picker-cell-inner">
        {currentDate.date()}
        {isShowTime && (
          <Badge
            status="success"
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              transform: "translate(50%, -50%)",
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <Flex justify="space-between" align="center">
        <h1
          style={{ textAlign: "start", fontSize: "24px", marginBottom: "20px" }}
        >
          Jadwal Pertemuan
        </h1>
        <DatePicker
          placeholder="Pilih Tanggal"
          style={{ width: "20%" }}
          onChange={handleChangeDate}
          cellRender={cellRender}
        />
      </Flex>
      <Divider />
      {Object.keys(groupedData).length === 0 && (
        <CustomAlert type="info" message="Tidak ada jadwal untuk hari ini." />
      )}
      {Object.keys(groupedData).map((teacherName) => (
        <div
          key={teacherName}
          style={{
            marginBottom: "30px",
            border: "1px solid #f0f0f0",
            borderRadius: "8px",
            padding: "15px",
            backgroundColor: "#fafafa",
          }}
        >
          <h2
            style={{
              backgroundColor: "#1890ff",
              color: "#fff",
              padding: "10px",
              borderRadius: "5px",
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            {teacherName}
          </h2>
          {groupedData[teacherName].length === 0 ? (
            <p style={{ textAlign: "center" }}>
              Tidak ada jadwal untuk guru ini.
            </p>
          ) : (
            <Table
              dataSource={groupedData[teacherName]}
              rowKey="meeting_id"
              pagination={false}
              bordered
              style={{ borderRadius: "5px", overflow: "hidden" }}
            >
              <Table.Column
                title="No"
                key="no"
                render={(_, __, index) => index + 1}
              />
              <Table.Column
                title="Nama Siswa"
                dataIndex={["student", "username"]}
                key="studentName"
              />
              <Table.Column title="Metode" dataIndex="method" key="method" />
              <Table.Column
                title="Kehadiran"
                dataIndex="absent"
                key="absent"
                render={(absent: boolean | null) => {
                  if (absent === null)
                    return <Tag color="gray">Belum Diisi</Tag>;
                  return absent ? (
                    <Tag color="green">Hadir</Tag>
                  ) : (
                    <Tag color="red">Tidak Hadir</Tag>
                  );
                }}
              />
              <Table.Column
                title="Jam Pertemuan"
                dataIndex="dateTime"
                key="time"
                render={(text: string) => dayjs.utc(text).format("HH:mm")}
              />
            </Table>
          )}
        </div>
      ))}
    </div>
  );
}
