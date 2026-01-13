import type { Request, Response } from 'express';
import Employee from '../models/employee.model';

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