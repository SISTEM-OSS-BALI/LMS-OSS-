"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, Button, Typography, message } from "antd";
import {
  AudioOutlined,
  StopOutlined,
  UploadOutlined,
  RedoOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface SpeakingMockTest {
  speaking_id: string;
  base_mock_test_id: string;
  prompt: string;
}

interface SpeakingMockTestProps {
  data: SpeakingMockTest;
  onSubmitAudio: (audioBlob: Blob, speaking_id: string) => void;
}

export default function SpeakingMockTestStudent({
  data,
  onSubmitAudio,
}: SpeakingMockTestProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  // 🔹 Meminta izin mikrofon sebelum mulai rekaman
  useEffect(() => {
    const requestPermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (error) {
        console.error("Izin mikrofon ditolak:", error);
        alert("Anda perlu memberikan izin mikrofon untuk merekam audio.");
      }
    };
    requestPermission();
  }, []);

  // 🔹 Mulai Rekaman
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Inisialisasi AudioContext untuk Safari & browser lain
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }
      await audioContextRef.current.resume();

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        setTimeout(() => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });
          const audioURL = URL.createObjectURL(audioBlob);
          setAudioBlob(audioBlob);
          setAudioURL(audioURL);
        }, 200); // Delay agar Safari tidak error
      };

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.start();
      setIsRecording(true);
      setAudioBlob(null); // Reset rekaman sebelumnya
      setAudioURL(null);
    } catch (error) {
      console.error("Gagal mengakses mikrofon:", error);
      alert("Gagal mengakses mikrofon. Pastikan izin telah diberikan.");
    }
  };

  // 🔹 Hentikan Rekaman
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // 🔹 Ulangi Rekaman
  const restartRecording = () => {
    setAudioBlob(null);
    setAudioURL(null);
    startRecording();
  };

  return (
    <Card
      style={{
        marginBottom: 16,
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#fff",
      }}
    >
      {/* Header */}
      <Title level={4} style={{ marginBottom: "12px" }}>
        Speaking Test
      </Title>

      {/* Prompt */}
      <Text strong>Question:</Text>
      <Card
        style={{
          backgroundColor: "#f9f9f9",
          borderRadius: "8px",
          padding: "15px",
          marginTop: "8px",
          borderLeft: "4px solid #1890ff",
        }}
      >
        <Text style={{ fontSize: "16px", fontWeight: "500", color: "#333" }}>
          {data.prompt}
        </Text>
      </Card>

      {/* Tombol Rekaman */}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        {!isRecording ? (
          <Button
            type="primary"
            icon={<AudioOutlined />}
            onClick={startRecording}
          >
            Start Recording
          </Button>
        ) : (
          <Button
            type="default"
            icon={<StopOutlined />}
            danger
            onClick={stopRecording}
          >
            Stop Recording
          </Button>
        )}
      </div>

      {/* Tampilkan Audio Saat Merekam */}
      {isRecording && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <Text strong style={{ color: "#ff4d4f" }}>
            Recording...
          </Text>
          <br />
          <audio controls autoPlay />
        </div>
      )}

      {/* Tampilkan Audio Setelah Rekaman Selesai */}
      {audioURL && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <audio controls src={audioURL} autoPlay={false} />
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              gap: "10px",
              justifyContent: "center",
            }}
          >
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => {
                if (audioBlob) {
                  onSubmitAudio(audioBlob, data.speaking_id);
                } else {
                  message.error("Audio belum direkam.");
                }
              }}
            >
              Submit Recording
            </Button>
            <Button
              type="default"
              icon={<RedoOutlined />}
              onClick={restartRecording}
            >
              Repeat Recording
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
