import { Router } from "express";
import {
    getTasks,
    getTask,
    createTask,
    deleteTask,
    updateTask,
    login,
    register,
    registerPac,
    getDiagnosticos,
    insertDiag,
    Diagnostic,
    getEnfermedades,
    getPaciente
} from "../controllers/tasks.controllers.js";

const router = Router();


router.post('/login', login);



router.get('/tasks', getTasks);

router.get('/tasks/:id', getTask);

router.post('/tasks', createTask);

router.delete('/tasks/:id', deleteTask);

router.put('/tasks/:id', updateTask);



router.get('/register', register);

router.post('/registerPac', registerPac);

router.get('/diagnosticos/:id', getDiagnosticos);

router.put('/insertDiagnostico/:id', insertDiag);

router.post('/diagEnf', Diagnostic);

router.post('/enfermedades', getEnfermedades);

router.post('/getUser/:id', getPaciente)


export default router;