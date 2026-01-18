import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Use your 16-character App Password here
    }
});

export const sendWelcomeEmail = async (to: string, name: string) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject: 'Welcome to the Team!',
            text: `Hello ${name}, welcome to our company!`
        });
        console.log('✅ Email sent successfully:', info.messageId);
    } catch (error) {
        console.error('❌ Email sending failed:', error);
    }
};