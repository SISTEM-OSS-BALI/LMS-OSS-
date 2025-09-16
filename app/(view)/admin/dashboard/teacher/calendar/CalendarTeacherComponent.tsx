"use client";

import React, { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventContentArg } from "@fullcalendar/core";
import Title from "antd/es/typography/Title";
import { Card, Divider, Skeleton, Grid } from "antd";
import { useCalendarViewModel } from "./useCalendarViewModel";

type RegionKey = "Singaraja" | "Denpasar" | "Karangasem" | (string & {});

export default function CalendarTeacherComponent() {
  const { events, isLoading, isLoadingSchedule, regionColorMapping } =
    useCalendarViewModel();

  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  // Hindari re-render berat: memoize events
  const safeEvents = useMemo(() => events ?? [], [events]);

  // Renderer kartu event (month view)
  const renderEventContent = (arg: EventContentArg) => {
    const ext = arg.event.extendedProps as {
      teacherName?: string;
      roomName?: string;
      shiftStart?: string;
      shiftEnd?: string;
      region?: RegionKey;
    };

    const bg =
      regionColorMapping[ext?.region as keyof typeof regionColorMapping] ??
      "#999";

    return (
      <div
        style={{
          backgroundColor: bg,
          color: "#fff",
          padding: 6,
          borderRadius: 6,
          lineHeight: 1.2,
          boxShadow: "0 3px 6px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        {/* Room */}
        <div style={{ fontSize: 12, fontWeight: 700 }}>
          {ext?.roomName ?? "-"}
        </div>

        {/* Guru */}
        <div style={{ fontSize: 12, fontWeight: 600 }}>
          {ext?.teacherName ?? "Teacher"}
        </div>

        {/* Jam */}
        <div style={{ fontSize: 12 }}>
          {ext?.shiftStart && ext?.shiftEnd
            ? `${ext.shiftStart} – ${ext.shiftEnd}`
            : "-"}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: screens.xs ? 12 : 24 }}>
      <Title level={3} style={{ marginBottom: 8 }}>
        Kalender Guru
      </Title>
      <Divider style={{ margin: "8px 0 16px" }} />
      <Card
        style={{
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
          padding: 16,
        }}
        bodyStyle={{ padding: 0 }}
      >
        {isLoading || isLoadingSchedule ? (
          <div style={{ padding: 16 }}>
            <Skeleton active paragraph={{ rows: 8 }} />
          </div>
        ) : (
          <div
            style={{
              overflowX: "auto",
              overflowY: "hidden",
              minWidth: "100%",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {/* Lebar minimum agar bisa discroll horizontal di layar kecil */}
            <div style={{ minWidth: 1100 }}>
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                // timezone lokal agar tanggal tidak mundur/maju
                timeZone="local"
                // kita render jam sendiri
                displayEventTime={false}
                eventDisplay="block"
                // height otomatis mengikuti konten
                contentHeight="auto"
                // Supaya block terlihat clickable nantinya
                editable={false}
                selectable={false}
                // Data
                events={safeEvents}
                // Renderer custom: Room, Guru, Jam
                eventContent={renderEventContent}
                // Tata letak kalender
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: screens.md
                    ? "dayGridMonth,timeGridWeek,timeGridDay"
                    : "",
                }}
                // Estetika kecil
                dayMaxEventRows={3}
                showNonCurrentDates={false}
                locale="id"
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
