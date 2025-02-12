import { useState, useEffect, useRef } from "react";
import { FloatButton, Card, Avatar, Button, Input } from "antd";
import Icon, { MessageOutlined, SendOutlined } from "@ant-design/icons";
import { CloseIcon } from "./Icon";

interface Message {
  sender: "admin" | "user";
  text: string;
  options?: string[];
}

export default function CustomerServiceChat() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "admin",
      text: "Halo! Saya Admin Paling Kece OSS, ada pertanyaan seputar melakukan penjadwalan? 😊",
      options: [
        "Penjadwalan",
        "Pengajuan Reschedule",
        "Pengajuan Emergency",
        "Chat Admin",
      ],
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "user", text: inputMessage },
    ]);
    setInputMessage("");

    handleBotResponse(inputMessage);
  };

  const handleQuickReply = (text: string) => {
    setMessages((prevMessages) => [...prevMessages, { sender: "user", text }]);
    handleBotResponse(text);
  };

  const handleBotResponse = (userMessage: string) => {
    setIsTyping(true);

    setTimeout(() => {
      let botResponse: Message = { sender: "admin", text: "" };

      switch (userMessage) {
        case "Penjadwalan":
          botResponse = {
            sender: "admin",
            text: "Untuk penjadwalan, pastikan kamu memilih tanggal yang tersedia dan mengikuti panduan di halaman jadwal.",
            options: ["Cara memilih jadwal?", "Kembali ke menu awal"],
          };
          break;

        case "Pengajuan Reschedule":
          botResponse = {
            sender: "admin",
            text:
              "Kamu bisa memilih tanggal pertemuan sebelumnya untuk reschedule pada opsi 'Pilih Tanggal', lalu tekan tombol 'Reschedule'.\n\n" +
              "Setelah itu, isi formulir reschedule dan tekan tombol 'Reschedule' lagi untuk mengonfirmasi. \n\n" +
              "*Pastikan kamu melakukan reschedule setidaknya 12 jam sebelum pertemuan yang ingin dijadwalkan ulang.*",
            options: ["Saya mengerti", "Kembali ke menu awal"],
          };
          break;

        case "Pengajuan Emergency":
          botResponse = {
            sender: "admin",
            text: "Pengajuan Emergency adalah pengajuan yang bisa dilakukan ketika ingin mereschedule dengan alasan tertentu ketika pertemuan yang sudah di jadwalkan lebih dari 12 jam lalu. \n\n",
            options: [
              "Cara Pengajuan Emergency?",
              "Kembali ke menu awal",
            ],
          };
          break;

        case "Cara menghubungi admin?":
          botResponse = {
            sender: "admin",
            text:
              "📞 *Hubungi Admin:*\n\n" +
              "📌 *WhatsApp:* +62 812-3456-7890\n" +
              "📌 *Email:* support@ossbali.com\n\n" +
              "Admin siap membantu kamu! 😊",
            options: ["Kembali ke menu awal"],
          };
          break;

        case "Chat Admin":
          botResponse = {
            sender: "admin",
            text: "Silahkan hubungi nomor admin di: *+62 812-3456-7890* 📞",
            options: ["Terima kasih", "Kembali ke menu awal"],
          };
          break;

        case "Kembali ke menu awal":
          botResponse = {
            sender: "admin",
            text: "Halo! Saya Admin Paling Kece OSS, ada pertanyaan seputar melakukan penjadwalan? 😊",
            options: [
              "Penjadwalan",
              "Pengajuan Reschedule",
              "Pengajuan Emergency",
              "Chat Admin",
            ],
          };
          break;

        default:
          botResponse = {
            sender: "admin",
            text: "Mohon maaf, saya tidak mengerti. Bisa jelaskan lebih lanjut?",
            options: ["Kembali ke menu awal"],
          };
      }

      setMessages((prevMessages) => [...prevMessages, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      <FloatButton
        icon={<MessageOutlined />}
        type="primary"
        style={{ right: 24, bottom: 24 }}
        onClick={() => setIsChatOpen(true)}
      />

      {isChatOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            right: 24,
            width: 320,
            borderRadius: 10,
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
            backgroundColor: "white",
            zIndex: 1000,
            overflow: "hidden",
          }}
        >
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar src="/assets/images/admin_picture.jpg" size={40} />
                <div>
                  <strong style={{ color: "white" }}>Kak Dwi Hendra</strong>
                  <p style={{ fontSize: 12, margin: 0, color: "lightgray" }}>
                    Admin Paling Kece OSS Bali
                  </p>
                </div>
              </div>
            }
            extra={
              <Button
                type="text"
                onClick={() => setIsChatOpen(false)}
                style={{ color: "white" }}
              >
                <Icon component={CloseIcon} size={60} />
              </Button>
            }
            bordered={false}
            style={{
              borderRadius: "10px 10px 0 0",
              backgroundColor: "white",
              color: "white",
            }}
            headStyle={{ color: "white", backgroundColor: "#0a3848" }}
          >
            <div
              style={{
                maxHeight: 300,
                overflowY: "auto",
                padding: "5px 0",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  style={{
                    textAlign: message.sender === "user" ? "right" : "left",
                    marginBottom: 10,
                  }}
                >
                  <p
                    style={{
                      display: "inline-block",
                      padding: "8px 12px",
                      borderRadius: 10,
                      backgroundColor:
                        message.sender === "user" ? "#DCF8C6" : "#0a3848",
                      color: message.sender === "user" ? "black" : "white",
                      maxWidth: "80%",
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                      whiteSpace: "pre-wrap",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    {message.text}
                  </p>
                  {message.options &&
                    message.options.map((option, i) => (
                      <Button
                        key={i}
                        size="small"
                        style={{
                          marginTop: 5,
                          borderRadius: 8,
                          backgroundColor: "#0a3848",
                          color: "white",
                          width: "auto", 
                          maxWidth: "100%", 
                          whiteSpace: "normal", 
                          wordBreak: "break-word",
                          padding: "8px", 
                          textAlign: "center", 
                        }}
                        onClick={() => handleQuickReply(option)}
                      >
                        {option}
                      </Button>
                    ))}
                </div>
              ))}
              {isTyping && (
                <p style={{ color: "gray" }}>Admin sedang mengetik...</p>
              )}
              <div ref={messagesEndRef} />
            </div>
          </Card>
          <div
            style={{
              padding: "10px",
              borderTop: "1px solid #ddd",
              backgroundColor: "#fff",
            }}
          >
            <Input
              placeholder="Tulis pesan..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onPressEnter={handleSendMessage}
              suffix={
                <SendOutlined
                  onClick={handleSendMessage}
                  style={{ cursor: "pointer", color: "#0a3848" }}
                />
              }
            />
          </div>
        </div>
      )}
    </>
  );
}
