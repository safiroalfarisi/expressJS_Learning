// src/models/employee.model.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.config';

interface EmployeeAttributes {
  id: number;
  name: string;
  email: string;
  position: string;
  password?: string; // Tambahkan ini
  role: string;     // Tambahkan ini (admin/staff)
}

class Employee extends Model<EmployeeAttributes, any> implements EmployeeAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public position!: string;
  public password?: string;
  public role!: string;
}

Employee.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    position: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: true }, // Biarkan null jika tidak bisa login
    role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'staff' }, // Default adalah staff
  },
  { sequelize, tableName: 'employees' }
);

export default Employee;