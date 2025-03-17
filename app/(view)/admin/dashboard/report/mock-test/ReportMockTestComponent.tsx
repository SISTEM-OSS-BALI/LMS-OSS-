'use client';

import { useState } from 'react';
import { Card, Table, Typography, Tag, Skeleton, Space, Row, Col, Button } from 'antd';
import { UserOutlined, CalendarOutlined, PhoneOutlined, BankOutlined, CloseOutlined, DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { useReportMockViewModel } from './useReportMockViewModel';

const { Title, Text } = Typography;

export default function ReportMockTestComponent() {
  const { mockReportData, isLoadingMockReport } = useReportMockViewModel();
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  // 🔹 Ambil daftar unik Mock Test dari data
  const mockTests = mockReportData?.data?.reduce((acc: any, item: any) => {
    const testId = item.session.mockTest.mock_test_id;
    if (!acc.some((p: any) => p.mockTest.mock_test_id === testId)) {
      acc.push(item.session);
    }
    return acc;
  }, []);

  // 🔹 Filter peserta berdasarkan test yang dipilih
  const filteredParticipants = mockReportData?.data?.filter((item: any) => item.session.mockTest.mock_test_id === selectedTest);

  // 🔹 Fungsi untuk mengunduh Excel
  const handleDownloadExcel = () => {
    if (!selectedTest) return;

    const selectedTestData = mockTests.find((p: any) => p.mockTest.mock_test_id === selectedTest);

    if (!selectedTestData) return;

    const testName = selectedTestData.mockTest.name || 'MockTest';
    const sessionDate = new Date(selectedTestData.sessionDate).toLocaleDateString().replace(/\//g, '-');
    const fileName = `MockTest_${testName}_Sesi_${sessionDate}.xlsx`;

    const data = filteredParticipants?.map((participant: any) => ({
      Nama: participant.name,
      Grade: participant.grade,
      'No. HP': participant.phone,
      Institusi: participant.institution,
      'Total Skor': participant.ScoreFreeMockTest?.[0]?.totalScore || '0',
      Persentase: participant.ScoreFreeMockTest?.[0]?.percentageScore ? `${participant.ScoreFreeMockTest[0].percentageScore}%` : '0',
      Level: participant.ScoreFreeMockTest?.[0]?.level || 'BASIC',
    }));

    if (!data) return;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Participants');

    XLSX.writeFile(wb, fileName);
  };

  // 🔹 Skeleton untuk tampilan loading
  const SkeletonTable = () => (
    <Card
      bordered={false}
      style={{
        borderRadius: '12px',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Row gutter={[16, 16]}>
        {[...Array(3)].map((_, index) => (
          <Col
            span={24}
            key={index}
          >
            <Skeleton active />
          </Col>
        ))}
      </Row>
    </Card>
  );

  // 🔹 Konfigurasi kolom tabel partisipan
  const participantColumns = [
    {
      title: 'Nama',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <UserOutlined />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
    },
    {
      title: 'No. HP',
      dataIndex: 'phone',
      key: 'phone',
      render: (text: string) => (
        <Space>
          <PhoneOutlined />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Institusi',
      dataIndex: 'institution',
      key: 'institution',
      render: (text: string) => (
        <Space>
          <BankOutlined />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Total Skor',
      dataIndex: 'ScoreFreeMockTest',
      key: 'score',
      render: (scoreArray: { totalScore: number }[]) => {
        const score = scoreArray?.[0]?.totalScore;
        return <Text strong>{score !== undefined ? score : '-'}</Text>;
      },
    },
    {
      title: 'Persentase',
      dataIndex: 'ScoreFreeMockTest',
      key: 'percentage',
      render: (scoreArray: { percentageScore: number }[]) => {
        const percentage = scoreArray?.[0]?.percentageScore;
        return <Text>{percentage !== undefined ? `${percentage}%` : '-'}</Text>;
      },
    },
    {
      title: 'Level',
      dataIndex: 'ScoreFreeMockTest',
      key: 'level',
      render: (scoreArray: { level: string }[]) => {
        const level = (scoreArray?.[0]?.level || 'BASIC') as keyof typeof levelColors;
        const levelColors = {
          BASIC: 'red',
          INTERMEDIATE: 'orange',
          ADVANCED: 'green',
        };
        return <Tag color={levelColors[level]}>{level}</Tag>;
      },
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Title
        level={2}
        style={{ textAlign: 'center', marginBottom: '20px' }}
      >
        Laporan Mock Test
      </Title>

      {isLoadingMockReport ? (
        <SkeletonTable />
      ) : (
        <>
          {/* 🔹 Daftar Mock Test */}
          <Row gutter={[16, 16]}>
            {mockTests?.map((session: any) => (
              <Col
                key={session.mockTest.mock_test_id}
                xs={24}
                sm={12}
                md={8}
              >
                <Card
                  bordered={false}
                  style={{
                    borderRadius: '12px',
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                    transition: '0.3s',
                    background: selectedTest === session.mockTest.mock_test_id ? '#e6f7ff' : 'white',
                  }}
                  onClick={() => setSelectedTest(session.mockTest.mock_test_id)}
                >
                  <Title level={4}>{session.mockTest.name || 'Unknown Mock Test'}</Title>
                  <Space>
                    <CalendarOutlined />
                    <Text>{new Date(session.sessionDate).toLocaleDateString()}</Text>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>

          {/* 🔹 Tampilkan peserta jika ada test yang dipilih */}
          {selectedTest && (
            <Card
              bordered={false}
              style={{
                marginTop: '20px',
                borderRadius: '12px',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              {/* 🔹 Header Card dengan Tombol Close dan Download */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                }}
              >
                <Button
                  type='primary'
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadExcel}
                >
                  Download Excel
                </Button>
                <Button
                  type='text'
                  shape='circle'
                  icon={<CloseOutlined />}
                  onClick={() => setSelectedTest(null)}
                  style={{ fontSize: '16px', color: 'red' }}
                />
              </div>

              <Table
                columns={participantColumns}
                dataSource={filteredParticipants}
                rowKey='participant_id'
                pagination={{ pageSize: 10 }}
                scroll={{ x: 'max-content' }} // Horizontal scrolling on mobile
              />
            </Card>
          )}
        </>
      )}
    </div>
  );
}
