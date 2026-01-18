import { Router } from 'express';
import { upload } from '../middleware/upload.middleware';
import { 
    getAllEmployees, 
    createEmployee, 
    updateEmployee, 
    deleteEmployee,
    importEmployees,
    exportEmployees 
} from '../controllers/employee.controller';

const router = Router();

// Standard CRUD routes
router.get('/', getAllEmployees);
router.post('/', createEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

// Challenge Task: Import/Export routes
router.post('/import', upload.single('file'), importEmployees);
router.get('/export', exportEmployees);

export default router; 