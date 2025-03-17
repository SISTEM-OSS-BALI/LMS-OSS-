import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import Title from 'antd/es/typography/Title';
import { Card, Divider, Skeleton, Grid } from 'antd';
import { useCalendarViewModel } from './useCalendarViewModel';

dayjs.extend(utc);

export default function CalendarTeacherComponent() {
  const { events, isLoading, regionColorMapping, showScheduleTeacherAll, dataTeacher, isLoadingSchedule } = useCalendarViewModel();

  const { useBreakpoint } = Grid;

  // Function to render event content with custom styles
  const renderEventContent = (eventInfo: any) => {
    const { teacherName, startTime, endTime, region } = eventInfo.event.extendedProps;
    const regionColor = regionColorMapping[region as keyof typeof regionColorMapping];

    return (
      <div
        style={{
          backgroundColor: regionColor,
          color: '#fff',
          padding: '4px',
          textAlign: 'center',
          boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        <strong style={{ fontSize: '14px' }}>{`${startTime} - ${endTime}`}</strong>
        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{teacherName}</div>
      </div>
    );
  };

  const screens = useBreakpoint();

  return (
    <div style={{ padding: screens.xs ? '12px' : '24px' }}>
      <Title level={3}>Kalender Guru</Title>
      <Divider />
      <Card
        style={{
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          padding: '20px',
        }}
      >
        {isLoading || isLoadingSchedule ? (
          <Skeleton
            active
            paragraph={{ rows: 8 }}
          />
        ) : (
          <div
            style={{
              overflowX: 'auto',
              overflowY: 'hidden',
              minWidth: '100%',
              touchAction: 'pan-x', // Ensures only horizontal scroll is active
              WebkitOverflowScrolling: 'touch', // Helps smooth scrolling on iOS
              display: 'flex',
            }}
          >
            {/* Adjust the calendar width for horizontal scrolling */}
            <div style={{ minWidth: '1200px', pointerEvents: 'auto' }}>
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView='dayGridMonth'
                editable
                selectable
                showNonCurrentDates={false}
                events={events}
                contentHeight='auto'
                eventContent={renderEventContent}
                locale='id'
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
