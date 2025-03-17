import { useEffect, useState } from 'react';
import { useRescheduleViewModel } from './UseRescheduleViewModel';
import { Card, List, Typography, Button, Image, Row, Col, Tag, Flex, Pagination, Skeleton, Grid } from 'antd';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

const { useBreakpoint } = Grid;
dayjs.extend(utc);
const { Title, Text } = Typography;

export default function RescheduleApprovalComponent() {
  const { mergedData, handleApproveReschedule, loadingState, isLoadingReschedule } = useRescheduleViewModel();
  const [showHistory, setShowHistory] = useState(false);
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const screens = useBreakpoint();

  const optionReasonMapping: Record<string, string> = {
    NATURAL_DISASTERS: 'Bencana Alam',
    GRIEF: 'Duka',
    SICK: 'Sakit',
  };

  const filteredData = showHistory ? mergedData?.filter((item) => item.is_deleted === true) || [] : mergedData?.filter((item) => item.is_deleted === false) || [];

  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div style={{ padding: screens.xs ? '12px' : '24px' }}>
      <Flex
        justify='space-between'
        align='center'
        wrap='wrap'
        style={{ marginBottom: '24px' }}
      >
        <Title
          level={screens.xs ? 5 : 3}
          style={{ marginBlock: 0 }}
        >
          {showHistory ? 'Riwayat Reschedule' : 'Pengajuan Emergency Pertemuan'}
        </Title>
        <Button
          onClick={() => setShowHistory(!showHistory)}
          type='primary'
          size={screens.xs ? 'small' : 'middle'}
        >
          {showHistory ? 'Kembali ke Pengajuan' : 'Riwayat Pengajuan'}
        </Button>
      </Flex>

      {isLoadingReschedule ? (
        <Skeleton
          active
          paragraph={{ rows: screens.xs ? 2 : 4 }}
        />
      ) : (
        <List
          dataSource={paginatedData}
          renderItem={(item) => (
            <Card
              style={{
                marginBottom: 16,
                borderRadius: '10px',
                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
                padding: screens.xs ? '12px' : '16px',
              }}
              title={
                <Flex
                  justify='space-between'
                  align='center'
                >
                  <Title
                    level={screens.xs ? 5 : 4}
                    style={{ margin: 0 }}
                  >
                    {item.program_name} - {item.student_name}
                  </Title>
                  <Tag
                    color={item.status === 'PENDING' ? 'orange' : item.status === 'APPROVED' ? 'green' : 'red'}
                    style={{ fontSize: '12px', padding: '4px 8px' }}
                  >
                    {item.status}
                  </Tag>
                </Flex>
              }
              extra={<Text type='secondary'>{dayjs(item.createdAt).format('DD MMM YYYY')}</Text>}
            >
              <Row
                gutter={[12, 12]}
                justify='center'
                style={{ justifyContent: 'center' }}
              >
                {/* Meeting Sebelumnya - TIDAK DITAMPILKAN di RIWAYAT */}
                {!showHistory && (
                  <Col
                    xs={24}
                    sm={12}
                    md={8}
                  >
                    <Card
                      bordered
                      style={{ borderRadius: '8px', padding: '12px' }}
                    >
                      <Title
                        level={5}
                        style={{ marginBottom: 8, color: '#1890ff' }}
                      >
                        Meeting Sebelumnya
                      </Title>
                      <Text>
                        <strong>Guru:</strong> {item.teacher_name}
                      </Text>
                      <br />
                      <Text>
                        <strong>Tanggal:</strong> {dayjs.utc(item.dateTime).format('DD MMM YYYY, HH:mm')}
                      </Text>
                      <br />
                      <Text>
                        <strong>Metode:</strong> {item.method || '-'}
                      </Text>
                      <br />
                      <Text>
                        <strong>Platform:</strong> {item.platform || '-'}
                      </Text>
                    </Card>
                  </Col>
                )}

                {/* Meeting yang Diajukan */}
                <Col
                  xs={24}
                  sm={12}
                  md={showHistory ? 12 : 8}
                >
                  <Card
                    bordered
                    style={{ borderRadius: '8px', padding: '12px' }}
                  >
                    <Title
                      level={5}
                      style={{ marginBottom: 8, color: '#52c41a' }}
                    >
                      Meeting yang Diajukan
                    </Title>
                    <Text>
                      <strong>Guru:</strong> {item.teacher_name}
                    </Text>
                    <br />
                    <Text>
                      <strong>Tanggal:</strong> {dayjs.utc(item.new_dateTime).format('DD MMM YYYY, HH:mm')}
                    </Text>
                    <br />
                    <Text>
                      <strong>Metode:</strong> {item.new_method || '-'}
                    </Text>
                    <br />
                    <Text>
                      <strong>Platform:</strong> {item.new_platform || '-'}
                    </Text>
                  </Card>
                </Col>

                {/* Keterangan & Bukti */}
                <Col
                  xs={24}
                  sm={12}
                  md={showHistory ? 12 : 8}
                >
                  <Card
                    bordered
                    style={{ borderRadius: '8px', padding: '12px' }}
                  >
                    <Row
                      gutter={[12, 12]}
                      justify='space-between'
                    >
                      <Col span={12}>
                        <Title
                          level={5}
                          style={{ marginBottom: 8, color: '#fa8c16' }}
                        >
                          Keterangan
                        </Title>
                        <Text>
                          <strong>Alasan:</strong> {item.reason}
                        </Text>
                        <br />
                        <Text>
                          <strong>Keterangan:</strong> {optionReasonMapping[item.option_reason] || 'Tidak Diketahui'}
                        </Text>
                      </Col>

                      <Col
                        span={12}
                        style={{ textAlign: 'center' }}
                      >
                        <Title
                          level={5}
                          style={{ marginBottom: 8, color: '#fa541c' }}
                        >
                          Bukti
                        </Title>
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt='Bukti'
                            width={80}
                            height={70}
                            style={{ borderRadius: '5px' }}
                          />
                        ) : (
                          <Text type='secondary'>Tidak ada bukti</Text>
                        )}
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>

              {/* Tombol Aksi - Tidak ditampilkan untuk Riwayat */}
              {!showHistory && (
                <Flex
                  justify='end'
                  style={{ marginTop: 16 }}
                >
                  <Button
                    type='primary'
                    size={screens.xs ? 'small' : 'middle'}
                    loading={loadingState[item.reschedule_meeting_id] === 'APPROVED'}
                    onClick={() => handleApproveReschedule(item.reschedule_meeting_id, true)}
                    style={{ marginRight: 8 }}
                  >
                    Verifikasi
                  </Button>
                  <Button
                    type='default'
                    danger
                    size={screens.xs ? 'small' : 'middle'}
                    loading={loadingState[item.reschedule_meeting_id] === 'REJECTED'}
                    onClick={() => handleApproveReschedule(item.reschedule_meeting_id, false)}
                  >
                    Tolak
                  </Button>
                </Flex>
              )}
            </Card>
          )}
        />
      )}

      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={filteredData.length}
        onChange={setCurrentPage}
        showSizeChanger
        style={{ textAlign: 'center', marginTop: '16px' }}
      />
    </div>
  );
}
