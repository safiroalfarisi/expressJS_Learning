import { Router } from 'express';
import { 
    getAllEmployees, 
    createEmployee, 
    updateEmployee, 
    deleteEmployee 
} from '../controllers/employee.controller';

const router = Router();

router.get('/', getAllEmployees);
router.post('/', createEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

export default router;