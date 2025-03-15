import { Card, Skeleton, Row, Col, Button, Space, Flex, Modal, Form, Input, Alert, Image } from 'antd';
import { useMockTestViewModel } from './useMockTestViewModel';
import { EditOutlined, DeleteOutlined, PlusCircleFilled, QrcodeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react';
import { useRef } from 'react';

export default function MockTestComponent() {
  const {
    mockTestData,
    mockTestDataLoading,
    handleCancelModal,
    handleOpenModal,
    isModalVisible,
    form,
    handleEdit,
    handleSubmit,
    selectedMockTest,
    loading,
    handleDelete,
    handleGenerateQRCode,
    handleCancelOpenModalQr,
    qrModalVisible,
    handleOpenModalQr,
  } = useMockTestViewModel();

  return (
    <div style={{ padding: '20px' }}>
      <Flex justify='end'>
        <Button
          type='primary'
          icon={<PlusCircleFilled />}
          onClick={handleOpenModal}
          style={{ marginBottom: '10px' }}
        >
          Tambah Data
        </Button>
      </Flex>

      {!mockTestDataLoading && (!mockTestData || mockTestData?.data.length === 0) && (
        <Alert
          message='Tidak ada data tersedia'
          description="Silakan tambahkan data baru menggunakan tombol 'Tambah Data'."
          type='warning'
          showIcon
          style={{
            marginTop: '20px',
            marginBottom: '20px',
            borderRadius: '8px',
          }}
        />
      )}

      {/* Kontainer Scroll Horizontal */}
      <div
        style={{
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          paddingBottom: '10px',
          width: '100%', // Pastikan container mengambil seluruh lebar
        }}
      >
        <Row
          gutter={[16, 16]}
          style={{
            display: 'flex',
            flexWrap: 'nowrap', // Cegah wrapping
            minWidth: 'max-content', // Mencegah konten terpotong
          }}
        >
          {mockTestDataLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <Col
                  key={index}
                  style={{ flex: '0 0 auto', width: '250px' }}
                >
                  <Skeleton
                    active
                    loading={true}
                  />
                </Col>
              ))
            : mockTestData?.data.map((item) => (
                <Col
                  key={item.mock_test_id}
                  style={{ flex: '0 0 auto', width: '250px' }}
                >
                  <Card
                    bordered={false}
                    style={{
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      borderRadius: '10px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <Space
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        display: 'flex',
                        gap: 8,
                      }}
                    >
                      <Button
                        type='primary'
                        shape='circle'
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(item.mock_test_id)}
                      />
                      <Button
                        type='default'
                        shape='circle'
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => handleDelete(item.mock_test_id)}
                      />
                      <Button
                        type='default'
                        shape='circle'
                        icon={<QrcodeOutlined />}
                        onClick={() => handleGenerateQRCode(item.mock_test_id)}
                      />
                    </Space>

                    <h3 style={{ marginBottom: '20px', marginTop: '20px' }}>{item.name}</h3>

                    <Link
                      href={`/teacher/dashboard/mock-test/${item.mock_test_id}`}
                      passHref
                    >
                      <Button
                        type='link'
                        style={{ padding: 0 }}
                      >
                        Detail
                      </Button>
                    </Link>
                  </Card>
                </Col>
              ))}
        </Row>
      </div>
    </div>
  );
}
