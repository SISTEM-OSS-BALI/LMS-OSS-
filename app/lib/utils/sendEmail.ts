import nodemailer from "nodemailer";

export async function sendResetEmail(
  email: string,
  token: string,
  name: string
) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  const emailHTML = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background-color: #ffffff; border: 1px solid #ddd;">
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://onestepsolutionbali.com/wp-content/uploads/2022/10/Logo-OSS_Gold-3-2-300x263.png" alt="OSS Bali" style="max-width: 150px;">
    </div>
    
    <h2 style="color: #2d89e5; text-align: center;">Reset Password Anda</h2>
    <p style="font-size: 16px; color: #555;">Halo, ${name}</p>
    <p style="font-size: 16px; color: #555;">
      Anda telah meminta untuk mereset password akun Anda di <strong> LMS One Step Solution (OSS) Bali</strong>. 
      Klik tombol di bawah untuk mengatur ulang password Anda:
    </p>

    <div style="text-align: center; margin: 20px 0;">
      <a href="${resetLink}" style="background-color: #2d89e5; color: #fff; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-size: 16px;">
        Reset Password
      </a>
    </div>

    <p style="font-size: 14px; color: #777;">
      Jika Anda tidak meminta reset password, abaikan email ini. Link ini berlaku selama <strong>15 menit</strong>.
    </p>

    <hr style="border: 1px solid #ddd; margin: 20px 0;">

    <div style="text-align: center; font-size: 12px; color: #888;">
      <p>&copy; 2025 One Step Solution (OSS) Bali. Semua Hak Dilindungi.</p>
      <p><a href="https://onestepsolutionbali.com" style="color: #2d89e5; text-decoration: none;">Kunjungi Website Kami</a></p>
    </div>
  </div>
  `;

  await transporter.sendMail({
    from: `"One Step Solution (OSS) Bali" <${process.env.EMAIL_USERNAME}>`,
    to: email,
    subject: "Reset Password Anda - One Step Solution Bali",
    html: emailHTML,
  });
}
