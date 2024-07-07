import { pool } from "../db.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
  try {
    
    const { email, password } = req.body;
    // Buscar el usuario por su email
    const [results] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    const user = results[0];
    if (!user) {
      // Cambiar el mensaje para mejorar la seguridad
      return res.status(401).send("Email o contraseña incorrectos");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      // Generar un token JWT para el usuario
      const token = jwt.sign({ id: user.id,email: user.email}, 'tuSecreto', { expiresIn: '1h' });
       // Asegúrate de usar tu propia clave secreta y configurar la expiración como desees
      res.json({ message: "Inicio de sesión exitoso", token });

    } else {
      // Mantener el mensaje genérico para mejorar la seguridad
      res.status(401).send("Email o contraseña incorrectos");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Ocurrió un error al intentar iniciar sesión");
  }
};

export const getTasks = async (req, res) => {
  try {
    const [result] = await pool.query(
      "SELECT * FROM pacientes ORDER BY createAt ASC"
    );
    res.json(result);
  } catch (error) {
    res.status(500).send("Ocurrió un error al obtener las tareas");
  }
};

export const getTask = async (req, res) => {
  try {
    const [result] = await pool.query(
      `SELECT * FROM tasks WHERE id = ${req.params.id}`
    );
    if (result.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(result[0]);
  } catch (error) {
    res.status(500).send("Ocurrió un error al obtener la tarea");
  }
};

export const deleteTask = async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM pacientes WHERE id = ?", [
      req.params.id,
    ]);

    console.log(req.params.id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Task not fund" });
    }

    return res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar la tarea" });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const result = await pool.query("UPDATE tasks SET ? WHERE id = ?", [
      req.body,
      req.params.id,
    ]);
    res.json(result);
  } catch (error) {
    res.status(500).send("Ocurrió un error al actualizar la tarea");
  }
};

export const createTask = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    // Definir el número de rondas para el salting
    const saltRounds = 10;
    // Hashear la descripción
    const hashedDescripcion = await bcrypt.hash(descripcion, saltRounds);

    const [result] = await pool.query(
      "INSERT INTO tasks(nombre, descripcion) VALUES (?, ?)",
      [nombre, hashedDescripcion] // Usar la descripción hasheada
    );
    res.json({
      id: result.insertId,
      nombre,
      descripcion: hashedDescripcion, // Devolver la descripción hasheada (opcional)
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Ocurrió un error al crear la tarea");
  }
};

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [result] = await pool.query(
      "INSERT INTO usuarios(email, password) VALUES (?, ?)",
      [email, hashedPassword]
    );
    res.json({
      id: result.insertId,
      email,
      password: hashedPassword,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Ocurrió un error al registrar el usuario");
  }
}

export const registerPac = async (req, res) => {
  try {
    const { nombres, apellido_p, apellido_m, fecha_n, estado_n, municipio_n, localidad, agencia, barrio} = req.body;
    console.log(req.body)
    const [result] = await pool.query(
      "INSERT INTO pacientes(nombres, apellido_p, apellido_m, fecha_n, estado_n, municipio_n, localidad, agencia, barrio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [nombres, apellido_p, apellido_m, fecha_n, estado_n, municipio_n, localidad, agencia, barrio]
    );
    res.json({
      id: result.insertId,
      nombres,
      apellido_p,
      apellido_m,
      fecha_n,
      estado_n,
      municipio_n,
      localidad,
      agencia,
      barrio

    });
  } catch (error) {
    console.log(error);
  }
}

export const getDiagnosticos = async (req, res) => {
  try {
    const [result] = await pool.query(
      'SELECT * FROM diagnosticos WHERE id_p = ?',
      [req.params.id]
    );
    console.log(req.params.id)
    res.json(result);
  } catch (error) {
    res.status(500).send("Ocurrió un error al obtener los diagnosticos");
    console.log(error);
  }
}

export const insertDiag = async (req, res) => {
  try {
    const {diagnostico} = req.body;
    const {result} = await pool.query(
      'INSERT INTO diagnosticos (diagnostico, id_p VALUES ?, ?',
      [diagnostico, req.params.id]
    );
    res.json(result)
  } catch (error) {
    console.log(  error)
  }
}

export const Diagnostic = async (req, res) => {
  try {
    const [result] = await pool.query(
      'SELECT * FROM diagnosticos WHERE id_p = ?',
      [req.params.id]
    );
    res.json(result);
  } catch (error) {
    console.log(error);
  }
}

export const getEnfermedades = async (req, res) => {
  try {
    
    const descripciones = req.body.map(obj => obj.descripcion);
// Preparar los placeholders para la consulta SQL basados en el número de descripciones
    const placeholders = descripciones.map(() => '?').join(', ');// Ahora esperamos un arreglo de objetos // Para acumular los resultados de todas las consultas

      const [result] = await pool.query(
        `SELECT enfermedad_id, count(*) as repeticiones FROM enfermedad_sintoma WHERE sintoma_id IN ( SELECT sintoma_id FROM sintomas WHERE descripcion IN (${placeholders})) GROUP BY enfermedad_id ORDER BY repeticiones DESC LIMIT 1`,
        (descripciones)
      );

      const [result2] = await pool.query ('SELECT nombre FROM enfermedades WHERE enfermedad_id = ?',
        [result[0].enfermedad_id]
      )
      // Si hay resultados, los agregamos al arreglo de resultadosTotales
    res.json(result2[0].nombre); // Enviamos el arreglo acumulado como respuesta
  } catch (error) {
    console.log(error);
    res.status(500).send('Error interno del servidor');
  }
};

export const getPaciente = async (req, res) => {
  try {
    const [result] = await pool.query(
      'SELECT * FROM pacientes WHERE id = ?',
      [req.params.id]
    );
    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(result[0]);
  } catch (error) {
    res.status(500).send("Ocurrió un error al obtener el usuario");
    console.log(error)
  }
};