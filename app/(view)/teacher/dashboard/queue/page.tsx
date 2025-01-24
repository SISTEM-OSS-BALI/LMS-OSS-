"use client";

import { Badge, Button, DatePicker, Divider, Flex, Input, Space } from "antd";
import Title from "antd/es/typography/Title";
import { useQueueViewModel } from "./useQueueViewModel";
import { Meeting } from "@/app/model/meeting";
import Table, { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useEffect } from "react";
dayjs.extend(utc);

export default function Queue() {
  const {
    updateAbsentStatus,
    handleChangeDate,
    setSearchKeyword,
    searchKeyword,
    filteredData,
    showTimes
  } = useQueueViewModel();

  useEffect(() => {
    console.log(showTimes);
  }, [showTimes]);

  const cellRender = (currentDate: any) => {
    const formattedDate = dayjs(currentDate).format("YYYY-MM-DD");
    const isShowTime = showTimes.includes(formattedDate);

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



  const columns: ColumnsType<Meeting & { studentName?: string }> = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Waktu Mulai",
      dataIndex: "dateTime",
      key: "dateTime",
      render: (dateTime: string) => dayjs.utc(dateTime).format("HH:mm"),
    },
    {
      title: "Waktu Selesai",
      dataIndex: "dateTime", 
      key: "dateTime",
      render: (dateTime: string) =>
        dayjs.utc(dateTime).add(1, "hour").format("HH:mm"),
    },
    {
      title: "Metode",
      dataIndex: "method",
      key: "method",
    },
    {
      title: "Nama Siswa",
      dataIndex: "studentName",
      key: "studentName",
    },
    {
      title: "Absen",
      dataIndex: "absent",
      key: "absent",
      render: (text: any, record: Meeting) => (
        <Space>
          {record.absent ? (
            <Button
              disabled
              style={{
                cursor: "not-allowed",
                backgroundColor: "green",
                color: "white",
              }}
            >
              Hadir
            </Button>
          ) : (
            <Button
              onClick={() =>
                updateAbsentStatus(record.meeting_id, record.student_id, true)
              }
            >
              Hadir
            </Button>
          )}
          {!record.absent ? (
            <Button
              disabled
              style={{
                cursor: "not-allowed",
                backgroundColor: "red",
                color: "white",
              }}
            >
              Tidak Hadir
            </Button>
          ) : (
            <Button
              onClick={() =>
                updateAbsentStatus(record.meeting_id, record.student_id, false)
              }
            >
              Tidak Hadir
            </Button>
          )}
        </Space>
      ),
    },
    {
      title: "Modul",
      dataIndex: "module",
      key: "module",
      render: (module: any) => (module ? "Yes" : "No"),
    },
  ];

  return (
    <div>
      <Flex justify="space-between" gap={20}>
        <Title level={3}>Daftar Antrian Siswa</Title>
        <DatePicker
          placeholder="Pilih Tanggal"
          style={{ width: "20%" }}
          onChange={handleChangeDate}
          cellRender={cellRender}
        />
        <Input
          placeholder="Cari nama siswa"
          style={{ width: "50%" }}
          onChange={(e) => setSearchKeyword(e.target.value)}
          value={searchKeyword}
        />
      </Flex>
      <Divider />
      <Table columns={columns} dataSource={filteredData} />
    </div>
  );
}
