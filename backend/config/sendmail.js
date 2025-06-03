import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // hoặc cấu hình SMTP khác
  auth: {
    user: process.env.EMAIL_USER, // email của bạn (gmail)
    pass: process.env.EMAIL_PASSWORD, // mật khẩu app (hoặc mật khẩu email)
  },
});

/**
 * Gửi email
 * @param {string} to - email người nhận
 * @param {string} subject - tiêu đề email
 * @param {string} html - nội dung email (có thể là html)
 */
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("sendEmail error:", error);
    throw new Error("Email sending failed");
  }
};

export default sendEmail;
