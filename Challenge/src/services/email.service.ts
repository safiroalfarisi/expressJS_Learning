import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Use Gmail App Password
    }
});

export const sendWelcomeEmail = async (to: string, name: string) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: 'Welcome to the Team!',
        text: `Hello ${name}, welcome to our company!`
    });
};