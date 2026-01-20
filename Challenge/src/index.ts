import express from 'express';
import type { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import sequelize from './config/db.config';
import employeeRoutes from './routes/employee.route';
import { initReportJob } from './services/cron.service'; // Added import
import { register, login } from './controllers/auth.controller';

// Initialize environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.post('/api/register', register);
app.post('/api/login', login);
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

    // Sync models with database
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized.');

    // Challenge Task: Initialize Cron Jobs before the server starts listening
    initReportJob();
    console.log('✅ Scheduled tasks (Cron Jobs) initialized.');

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1); 
  }
};

startServer();