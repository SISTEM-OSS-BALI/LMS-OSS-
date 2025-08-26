import nodemailer from "nodemailer";

export async function sendExcelReport({
  to,
  subject,
  html,
  filePath = "",
  filename = "Laporan.xlsx",
  attachmentBuffer, // Buffer (optional)
}: {
  to: string | string[];
  subject: string;
  html: string;
  filePath?: string; // bisa kosong jika pakai buffer
  filename?: string;
  attachmentBuffer?: Buffer; // <-- ini kuncinya!
}) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  let attachments: any[] = [];

  if (attachmentBuffer) {
    attachments.push({
      filename,
      content: attachmentBuffer,
      contentType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  } else if (filePath) {
    // Jika pakai filePath di disk
    attachments.push({
      filename,
      path: filePath,
      contentType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  } else {
    throw new Error(
      "File laporan tidak ditemukan: attachmentBuffer/filePath kosong"
    );
  }

  await transporter.sendMail({
    from: `"OSS Bali" <${process.env.EMAIL_USERNAME}>`,
    to,
    subject,
    html,
    attachments,
  });
}
