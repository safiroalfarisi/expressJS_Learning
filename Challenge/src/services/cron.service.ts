import cron from 'node-cron';
import Employee from '../models/employee.model';

export const initCronJobs = () => {
    // Standard Cron: '*/5 * * * *' runs every 5 minutes
    cron.schedule('*/1 * * * *', async () => {
        try {
            const count = await Employee.count();
            const timestamp = new Date().toLocaleTimeString();
            
            console.log(`--------------------------------------------------`);
            console.log(`[CRON REPORT] Time: ${timestamp}`);
            console.log(`[CRON REPORT] Total employees in database: ${count}`);
            console.log(`--------------------------------------------------`);
            
        } catch (error) {
            console.error('[CRON ERROR]: Failed to fetch employee count', error);
        }
    });
};