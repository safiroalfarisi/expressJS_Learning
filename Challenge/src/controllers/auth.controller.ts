// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Employee from '../models/employee.model';

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, position, password, role } = req.body;
        
        // Hash password sebelum disimpan
        const hashedPassword = await bcrypt.hash(password, 10);

        const employee = await Employee.create({
            name,
            email,
            position,
            password: hashedPassword,
            role: role || 'staff'
        });

        res.status(201).json({ message: "Registrasi berhasil", employee: { email: employee.email, role: employee.role } });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // 1. Cari data karyawan berdasarkan email
        const employee = await Employee.findOne({ where: { email } });

        // 2. Validasi keberadaan user dan kecocokan password
        if (!employee || !employee.password) {
            return res.status(401).json({ message: "Email atau password salah" });
        }

        const isPasswordValid = await bcrypt.compare(password, employee.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Email atau password salah" });
        }

        // 3. Buat JWT Token
        const token = jwt.sign(
            { id: employee.id, email: employee.email, role: employee.role },
            process.env.JWT_SECRET || 'secret_key_anda',
            { expiresIn: '1h' }
        );

        // 4. KIRIM RESPON (Penting agar tidak buffering)
        return res.status(200).json({ 
            message: "Login berhasil", 
            token,
            user: { name: employee.name, role: employee.role } 
        });

    } catch (error: any) {
        // Mengirimkan error jika terjadi kegagalan server
        return res.status(500).json({ message: error.message });
    }
};