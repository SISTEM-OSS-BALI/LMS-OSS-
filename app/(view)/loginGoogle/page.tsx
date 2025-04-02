"use client";

const ConnectGoogleCalendarButton = () => {
  const handleConnect = () => {
    window.location.href = "/api/google";
  };

  return <button onClick={handleConnect}>Connect Google Calendar</button>;
};

export default ConnectGoogleCalendarButton;
