import type { Request, Response } from 'express';
import Employee from '../models/employee.model';
import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import { sendWelcomeEmail } from '../services/email.service';

// 1. Get all employees (Read)
export const getAllEmployees = async (req: Request, res: Response) => {
    try {
        const employees = await Employee.findAll();
        res.status(200).json(employees);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Create an employee (Create)
export const createEmployee = async (req: Request, res: Response) => {
    try {
        const employee = await Employee.create(req.body);
        
        // --- ADD THIS LINE TO TRIGGER THE EMAIL ---
        await sendWelcomeEmail(employee.email, employee.name);
        
        res.status(201).json(employee);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Update an employee (Update)
export const updateEmployee = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        
        // Ensure req.body exists before destructuring
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

// 4. Delete an employee (Delete)
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



// --- IMPORT CSV ---
export const importEmployees = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: "Please upload a CSV file" });

        const results: any[] = [];
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                await Employee.bulkCreate(results); // Bulk insert into Postgres
                fs.unlinkSync(req.file!.path); // Delete file after processing
                res.status(200).json({ message: "Employees imported successfully" });
            });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// --- EXPORT CSV ---
export const exportEmployees = async (req: Request, res: Response) => {
    try {
        const employees = await Employee.findAll();
        let csvData = "name,email,position\n";
        employees.forEach(emp => {
            csvData += `${emp.name},${emp.email},${emp.position}\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=employees.csv');
        res.status(200).send(csvData);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

