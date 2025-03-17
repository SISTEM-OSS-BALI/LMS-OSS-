'use client';

import { Table, Button, Modal, Form, Input, message, Space, Flex, Card, Skeleton, Spin, Grid } from 'antd';
import { useConsultantViewModel } from './useConsultantViewModel';
import Icon from '@ant-design/icons';
import { AddIcon, DeleteIcon, DetailsIcon, EditIcon } from '@/app/components/Icon';
import Title from 'antd/es/typography/Title';

const { useBreakpoint } = Grid;
const { confirm } = Modal;

export default function ConsultantComponent() {
  const { consultantData, handleDetail, handleEdit, handleDelete, isModalVisible, selectedConsultant, setSelectedConsultant, form, isLoadingConsultant, handleOpenModal, handleCancelModal, handleSubmit, loading } = useConsultantViewModel();

  const screens = useBreakpoint();

  const showDeleteConfirm = (consultantId: string) => {
    confirm({
      title: 'Apakah Anda yakin ingin menghapus konsultan ini?',
      content: 'Tindakan ini tidak dapat dibatalkan.',
      okText: 'Ya, Hapus',
      okType: 'danger',
      cancelText: 'Batal',
      onOk() {
        handleDelete(consultantId);
      },
    });
  };

  // 🔹 Table Columns
  const columns = [
    {
      title: 'No',
      dataIndex: 'no',
      key: 'no',
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Nama',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'No Telpon',
      dataIndex: 'no_phone',
      key: 'no_phone',
    },
    {
      title: 'Aksi',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size={screens.xs ? 'small' : 'middle'}>
          <Button
            type='primary'
            onClick={() => handleEdit(record)}
          >
            <Icon component={EditIcon} />
          </Button>
          <Button
            type='default'
            danger
            onClick={() => showDeleteConfirm(record.consultant_id)}
          >
            <Icon component={DeleteIcon} />
          </Button>
          <Button
            type='primary'
            onClick={() => handleDetail(record.consultant_id)}
          >
            <Icon component={DetailsIcon} />
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: screens.xs ? '10px' : '20px' }}>
      <Flex
        justify='space-between'
        wrap={screens.xs ? 'wrap' : 'nowrap'}
      >
        <Title level={screens.xs ? 4 : 3}>Daftar Konsultan</Title>
        <Button
          type='primary'
          onClick={handleOpenModal}
        >
          <Icon component={AddIcon} />
          Tambah Konsultan
        </Button>
      </Flex>

      <Card style={{ marginTop: '20px' }}>
        {isLoadingConsultant ? (
          <Skeleton
            active
            paragraph={{ rows: 6 }}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={consultantData?.data}
            rowKey='consultant_id'
            size={screens.xs ? 'small' : 'middle'}
            scroll={screens.xs ? { x: true } : undefined}
          />
        )}
      </Card>

      <Modal
        title={selectedConsultant ? 'Edit Konsultan' : 'Tambah Konsultan'}
        open={isModalVisible}
        onCancel={handleCancelModal}
        footer={null}
      >
        <Spin spinning={isLoadingConsultant}>
          <Form
            form={form}
            layout='vertical'
            onFinish={handleSubmit}
          >
            <Form.Item
              label='Nama'
              name='name'
              rules={[{ required: true, message: 'Masukan Nama Konsultan' }]}
            >
              <Input placeholder='Masukan Nama' />
            </Form.Item>
            <Form.Item
              label='No Telpon'
              name='no_phone'
              rules={[{ required: true, message: 'Masukan No Telpon Konsultan' }]}
            >
              <Input placeholder='Masukan No Telpon' />
            </Form.Item>
            <Form.Item>
              <Button
                type='primary'
                htmlType='submit'
                loading={loading}
                style={{ width: '100%' }}
              >
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
}
