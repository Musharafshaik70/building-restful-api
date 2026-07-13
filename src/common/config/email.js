import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.example.com",
    port: 587,
    secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
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

const sendMail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: '"Example Team" <team@example.com>', // sender address
            to: "alice@example.com, bob@example.com", // list of recipients
            subject: "Hello", // subject line
            text: "Hello world?", // plain text body
            html: "<b>Hello world?</b>", // HTML body
        });
    } catch (err) {
        console.error("Error while sending mail:", err);
    }
};



export { sendMail, sendVerificationEmail };

//raw code copied from nodemailer.
//one change to wrap the sending process in sendMail function
