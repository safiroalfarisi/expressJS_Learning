import type { Request, Response } from 'express';
import Employee from '../models/employee.model';
import fs from 'fs';
import csv from 'csv-parser';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import path from 'path';
import { sendWelcomeEmail } from '../services/email.service';

// 1. Get all employees 
export const getAllEmployees = async (req: Request, res: Response) => {
    try {
        const employees = await Employee.findAll();
        res.status(200).json(employees);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Create an employee 
export const createEmployee = async (req: Request, res: Response) => {
    try {
        // Pengecekan jika input banyak user (Bulk)
        if (Array.isArray(req.body)) {
            const emails = req.body.map(emp => emp.email);
            
            const existingEmployees = await Employee.findAll({
                where: { email: emails }
            });

            if (existingEmployees.length > 0) {
                const existingEmails = existingEmployees.map(e => e.email);
                return res.status(400).json({ 
                    message: "Beberapa email sudah terdaftar", 
                    duplicates: existingEmails 
                });
            }

            const employees = await Employee.bulkCreate(req.body);
            for (const emp of employees) {
                await sendWelcomeEmail(emp.email, emp.name);
            }
            return res.status(201).json(employees);
        }

        // Pengecekan untuk input single user
        const { email, name } = req.body;
        const existingEmployee = await Employee.findOne({ where: { email } });

        if (existingEmployee) {
            return res.status(400).json({ message: "Email sudah terdaftar" });
        }

        const employee = await Employee.create(req.body);
        await sendWelcomeEmail(employee.email, employee.name);
        res.status(201).json(employee);

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Update an employee 
export const updateEmployee = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        if (!req.body) {
            return res.status(400).json({ message: "Request body is missing" });
        }

        const employee = await Employee.findByPk(Number(id));
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const { name, email, position } = req.body;
        await employee.update({
            name: name || employee.name,
            email: email || employee.email,
            position: position || employee.position
        });

        res.status(200).json(employee);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Delete an employee 
export const deleteEmployee = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await Employee.destroy({
            where: { id: Number(id) }
        });
        
        if (deleted) {
            return res.status(200).json({ message: "Employee deleted successfully" });
        }
        res.status(404).json({ message: 'Employee not found' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// 5. IMPORT CSV 
export const importEmployees = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: "Silakan unggah file CSV" });

        const results: any[] = [];
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                try {
                    // ignoreDuplicates: true memastikan email yang sama tidak menyebabkan error crash
                    await Employee.bulkCreate(results, { 
                        ignoreDuplicates: true 
                    });

                    // Hapus file di folder uploads setelah selesai dibaca
                    fs.unlinkSync(req.file!.path); 
                    res.status(200).json({ message: "Import berhasil (Data duplikat dilewati secara otomatis)" });
                } catch (bulkError: any) {
                    if (fs.existsSync(req.file!.path)) fs.unlinkSync(req.file!.path);
                    res.status(500).json({ message: bulkError.message });
                }
            });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// 6. EXPORT (CSV, EXCEL, PDF)
export const exportEmployees = async (req: Request, res: Response) => {
    try {
        const format = req.query.format || 'csv';
        const employees = await Employee.findAll();

        if (format === 'csv') {
            let csvData = "name,email,position\n";
            employees.forEach(emp => {
                csvData += `${emp.name},${emp.email},${emp.position}\n`;
            });
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=employees.csv');
            return res.status(200).send(csvData);

        } else if (format === 'excel') {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Employees');
            worksheet.columns = [
                { header: 'Name', key: 'name', width: 25 },
                { header: 'Email', key: 'email', width: 35 },
                { header: 'Position', key: 'position', width: 20 }
            ];
            
            // Menambahkan data baris demi baris
            employees.forEach(emp => {
                worksheet.addRow({
                    name: emp.name,
                    email: emp.email,
                    position: emp.position
                });
            });
            
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=employees.xlsx');
            
            await workbook.xlsx.write(res);
            return res.end();

        } else if (format === 'pdf') {
            const doc = new PDFDocument({ margin: 30, size: 'A4' });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=employees.pdf');

            doc.pipe(res);

            // Judul PDF
            doc.fontSize(20).text('Employee List Report', { align: 'center' });
            doc.moveDown();

            // Header Tabel Manual
            const tableTop = 100;
            doc.fontSize(12).font('Helvetica-Bold');
            doc.text('Name', 50, tableTop);
            doc.text('Email', 200, tableTop);
            doc.text('Position', 400, tableTop);
            doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

            // Baris Data
            let yPos = tableTop + 30;
            doc.font('Helvetica').fontSize(10);
            
            employees.forEach(emp => {
                if (yPos > 750) { // Proteksi halaman penuh
                    doc.addPage();
                    yPos = 50;
                }
                doc.text(emp.name, 50, yPos);
                doc.text(emp.email, 200, yPos);
                doc.text(emp.position, 400, yPos);
                yPos += 20;
            });

            doc.end();
            return;
        }

        res.status(400).json({ message: "Format tidak didukung. Gunakan csv, excel, atau pdf." });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};