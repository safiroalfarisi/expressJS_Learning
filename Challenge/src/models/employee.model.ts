import { DataTypes, Model } from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../config/db.config';

// Define the attributes of our Employee
interface EmployeeAttributes {
  id: number;
  name: string;
  email: string;
  position: string;
}

// Some attributes are optional when creating an object (like 'id' which is auto-incremented)
interface EmployeeCreationAttributes extends Optional<EmployeeAttributes, 'id'> {}

class Employee extends Model<EmployeeAttributes, EmployeeCreationAttributes> implements EmployeeAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public position!: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Employee.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'employees',
  }
);

export default Employee;