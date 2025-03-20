'use client';

import { useState } from 'react';
import { Suspense } from 'react';
import Loading from '@/app/components/Loading';
import { useAuth } from '@/app/lib/auth/authServices';
import { Typography, Card, Row, Col, Modal, Skeleton, Descriptions } from 'antd';
import { VideoCameraOutlined, HomeOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useDashboardViewModel } from './useDashboardViewModel';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import locale from 'dayjs/locale/id'; 
dayjs.extend(utc);
dayjs.locale(locale);

interface Meeting {
  meeting_id: string;
  method: string;
  startTime: string;
  endTime: string;
}

const { Title, Text } = Typography;

export default function DashboardComponent() {
  const { username } = useAuth();
  const { meetingData, isLoadingMeeting } = useDashboardViewModel();

  // State untuk menyimpan detail event yang diklik
  const [selectedEvent, setSelectedEvent] = useState<Meeting | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Format data API ke event FullCalendar
  const events = meetingData?.data.map((meeting) => ({
    id: meeting.meeting_id,
    title: `Meeting (${meeting.method})`, // Menampilkan metode meeting
    start: dayjs.utc(meeting.startTime).toDate(),
    end: dayjs.utc(meeting.endTime).toDate(),
    backgroundColor: meeting.method === 'ONLINE' ? '#1890ff' : '#52c41a', // Warna event (online biru, offline hijau)
    borderColor: 'transparent', // Hapus border event agar lebih clean
    extendedProps: { ...meeting }, // Simpan semua detail di event
  }));

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event.extendedProps as Meeting);
    setIsModalVisible(true);
  };

  return (
    <div style={{ margin: '0 auto' }}>
      <Row justify='center'>
        <Col
          xs={24}
          sm={20}
          md={16}
          lg={12}
        >
          <Card
            bordered={false}
            style={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              background: '#f0f2f5',
            }}
          >
            <Title
              level={3}
              style={{
                textAlign: 'center',
                marginBottom: '16px',
                color: '#333',
              }}
            >
              Selamat Datang, {username}!
            </Title>
            <Text
              style={{
                display: 'block',
                textAlign: 'center',
                marginBottom: '24px',
                fontSize: '16px',
                color: '#666',
              }}
            >
              Jangan lupa untuk selalu mengikuti jadwal meeting Anda.
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Skeleton Loading */}
      {isLoadingMeeting ? (
        <Row
          justify='center'
          style={{ marginTop: '32px' }}
        >
          <Col
            xs={24}
            sm={22}
            md={20}
            lg={18}
          >
            <Card
              bordered={false}
              style={{ borderRadius: '12px', padding: '16px' }}
            >
              <Skeleton
                active
                paragraph={{ rows: 4 }}
              />
            </Card>
          </Col>
        </Row>
      ) : (
        <Row
          justify='center'
          style={{ marginTop: '32px' }}
        >
          <Col
            xs={24}
            sm={22}
            md={20}
            lg={18}
          >
            <Card
              bordered={false}
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                padding: '16px',
                overflow: 'hidden',
              }}
            >
              {/* Wrapper tambahan untuk scroll horizontal */}
              <div
                style={{
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  minWidth: '100%',
                  touchAction: 'pan-x', // Memastikan hanya scroll horizontal yang aktif
                  WebkitOverflowScrolling: 'touch', // Membantu scrolling smooth di iOS
                  display: 'flex',
                }}
              >
                {/* Membuat area FullCalendar lebih lebar agar bisa di-scroll */}
                <div style={{ minWidth: '1200px', pointerEvents: 'auto' }}>
                  <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView='dayGridMonth'
                    headerToolbar={{
                      left: 'prev,next today',
                      center: 'title',
                      right: 'dayGridMonth,listWeek',
                    }}
                    events={events}
                    contentHeight='auto'
                    fixedWeekCount={false}
                    displayEventTime={false}
                    eventDisplay='block'
                    eventClick={handleEventClick}
                  />
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Modal Detail Meeting */}
      <Modal
        title='Detail Meeting'
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width='50%' // Ukuran modal lebih luas untuk tampilan rapi
      >
        {selectedEvent ? (
          <Descriptions
            bordered
            column={1}
            size='middle'
          >
            <Descriptions.Item label='Metode Meeting'>
              {selectedEvent.method === 'ONLINE' ? (
                <>
                  <VideoCameraOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                  Online Meeting
                </>
              ) : (
                <>
                  <HomeOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                  Offline Meeting
                </>
              )}
            </Descriptions.Item>
            <Descriptions.Item label='Waktu Mulai'>
              <ClockCircleOutlined style={{ marginRight: 8 }} />
              {dayjs.utc(selectedEvent.startTime).format(' HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label='Waktu Berakhir'>
              <ClockCircleOutlined style={{ marginRight: 8 }} />
              {dayjs.utc(selectedEvent.endTime).format(' HH:mm')}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Skeleton active />
        )}
      </Modal>
    </div>
  );
}
