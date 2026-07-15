import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    //default secure value is false and 587 is used  for secure: false
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

try {
    await transporter.verify();
    console.log("Server is ready to take our messages");
} catch (err) {
    console.error("Verification failed:", err);
}

const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
            to,
            subject,
            html,
        });
    } catch (err) {
        console.error("Error while sending mail:", err);
    }
};

const sendVerificationEmail = async (email, token) => {
    const url = `${process.env.CLIENT_URL}/api/auth/verify-email/${token}`;
    await sendEmail(
        email,
        "Verify your email",
        `<h2>Welcome!</h2><p>Click <a href="${url}">here</a> to verify your email.</p>`,
    );
};

const sendResetPasswordEmail = async (email, token) => {
    const url = `${process.env.CLIENT_URL}/api/auth/reset-password/${token}`;
    await sendEmail(
        email,
        "Reset your Password",
        `<h2>Reset Password</h2> <p>Click here to reset your Password : <a href="${url}">Click Here</a>. This link expires in 15 minutes.`,
    );
};

export { sendVerificationEmail, sendResetPasswordEmail };

//refer nodemailer and mailtrap

// if frontend is availabe remove /api/auth from the sendVerificationEmail, sendResetPasswordEmail
