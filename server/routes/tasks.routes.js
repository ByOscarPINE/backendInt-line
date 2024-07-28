import { Router } from "express";
import {
    login,
    getPacientes,
    registerPac,
    getTask,
    createTask,
    deleteTask,
    updateTask,
    register,
    getDiagnosticos,
    insertDiag,
    Diagnostic,
    getEnfermedad,
    getPaciente,
    getLogDiag,
    getSintomas
} from "../controllers/tasks.controllers.js";

const router = Router();


router.put('/register', register);

router.post('/login', login);

router.get('/pacientes', getPacientes);

router.put('/registerPac', registerPac);

router.put('/insertDiagnostico/:id', insertDiag);

router.get('/diagnosticos/:id', getDiagnosticos);

router.post('/getUser/:id', getPaciente);




router.get('/getInfoDg/:idpa/:iddi', getLogDiag);



router.get('/getSintomas', getSintomas);



router.post('/enfermedad', getEnfermedad);



router.get('/tasks/:id', getTask);

router.post('/tasks', createTask);

router.delete('/tasks/:id', deleteTask);

router.put('/tasks/:id', updateTask);


router.post('/diagEnf', Diagnostic);




export default router;