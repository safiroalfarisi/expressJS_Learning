import express from 'express';
import type { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import sequelize from './config/db.config';
import employeeRoutes from './routes/employee.route';

// Initialize environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware (replaces express.json() and urlencoded from your old project)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/employees', employeeRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the Employee Data Management API');
});

// Database Connection and Server Start
const startServer = async () => {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL database successfully.');

    // Sync models with database (creates table if it doesn't exist)
    // Use { alter: true } during development to update tables automatically
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized.');

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1); // Stop the app if DB connection fails
  }
};

startServer();