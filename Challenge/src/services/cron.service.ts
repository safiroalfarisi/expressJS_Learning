import cron from 'node-cron';
import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';
import Employee from '../models/employee.model';
import { Stream } from 'stream';

export const initReportJob = () => {
    // Penjadwalan: Setiap 5 menit sekali
    cron.schedule('*/5 * * * *', async () => {
        console.log('⏳ Menjalankan tugas: Mengirim laporan karyawan ke email...');

        try {
            // 1. Ambil data dari database
            const employees = await Employee.findAll();

            // 2. Generate PDF di dalam Memory (Buffer)
            const doc = new PDFDocument({ margin: 30, size: 'A4' });
            const chunks: any[] = [];
            const pdfStream = new Stream.PassThrough();

            doc.pipe(pdfStream);

            // Tulis konten PDF
            doc.fontSize(20).text('Laporan Karyawan Otomatis', { align: 'center' });
            doc.moveDown();
            doc.fontSize(10).text(`Dibuat pada: ${new Date().toLocaleString()}`);
            doc.moveDown();

            employees.forEach((emp, index) => {
                doc.text(`${index + 1}. ${emp.name} - ${emp.email} (${emp.position})`);
                doc.moveDown(0.5);
            });

            doc.end();

            // Konversi stream ke buffer untuk attachment email
            pdfStream.on('data', (chunk) => chunks.push(chunk));
            pdfStream.on('end', async () => {
                const pdfBuffer = Buffer.concat(chunks);

                // 3. Konfigurasi Transporter Email (Gunakan ENV untuk keamanan)
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER, // Ganti dengan email Anda
                        pass: process.env.EMAIL_PASS, // Ganti dengan App Password Gmail Anda
                    },
                });

                // 4. Kirim Email
                await transporter.sendMail({
                    from: '"Sistem HR" <no-reply@perusahaan.com>',
                    to: 'alfarisiharaya@gmail.com', // Email tujuan
                    subject: 'Laporan List Karyawan (Setiap 5 Menit)',
                    text: 'Halo, berikut adalah laporan daftar karyawan terbaru yang dibuat secara otomatis.',
                    attachments: [
                        {
                            filename: 'Laporan_Karyawan.pdf',
                            content: pdfBuffer,
                        },
                    ],
                });

                console.log('✅ Laporan berhasil dikirim ke email!');
            });

        } catch (error) {
            console.error('❌ Gagal menjalankan Cron Job:', error);
        }
    });
};