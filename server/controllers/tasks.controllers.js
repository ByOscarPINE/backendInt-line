import { pool } from "../db.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [result] = await pool.query(
      "INSERT INTO Usuario(Nombre_Usuario, Email, Contrasennia) VALUES (?, ?, ?)",
      [nombre, email, hashedPassword]
    );
    res.json({
      id: result.insertId,
      nombre,
      email,
      password: hashedPassword,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Ocurrió un error al registrar el usuario");
  }
}

export const login = async (req, res) => {
  try {
    
    const { email, password } = req.body;
    // Buscar el usuario por su email
    const [results] = await pool.query("SELECT * FROM Usuario WHERE Email = ?", [email]);
    const user = results[0];
    if (!user) {
      // Cambiar el mensaje para mejorar la seguridad
      return res.status(401).send("email");
    }

    const isMatch = await bcrypt.compare(password, user.Contrasennia);
    if (isMatch) {
      // Generar un token JWT para el usuario
      const token = jwt.sign({ id: user.id, nombre: user.Nombre_Usuario}, 'tuSecreto', { expiresIn: '1h' });
       // Asegúrate de usar tu propia clave secreta y configurar la expiración como desees
      res.json({ message: "Inicio de sesión exitoso", token });

    } else {
      res.status(401).send("contrasennia");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Ocurrió un error al intentar iniciar sesión");
  }
};

export const getPacientes = async (req, res) => {
  try {
    const [result] = await pool.query(
      "SELECT * FROM paciente"
      // ORDER BY createdAt ASC"
    );
    res.json(result);
  } catch (error) {
    res.status(500).send("Ocurrió un error al obtener las tareas");
    console.log(error);
  }
};

export const registerPac = async (req, res) => {
  try {
    const { nombres, apellido_paterno, apellido_materno, fecha_nacimiento, estado_nacimiento, municipio_nacimiento, localidad, agencia, barrio} = req.body;
    console.log(req.body)
    const createdAt = new Date();
    await pool.query(
      "INSERT INTO paciente(nombres, apellido_paterno, apellido_materno, fecha_nacimiento, estado_nacimiento, municipio_nacimiento, localidad, agencia, barrio, Fecha) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [nombres, apellido_paterno, apellido_materno, fecha_nacimiento, estado_nacimiento, municipio_nacimiento, localidad, agencia, barrio, createdAt]
    );
    return res.status(200).json({ message: 'Recurso actualizado correctamente.' });
  } catch (error) {
    res.status(500).send("Ocurrió un error al registrar el paciente");
    console.log(error);
  }
}

export const insertDiag = async (req, res) => {
  try {
    const {alergias, antecedentes, artritis, asma, diabetes, 
          epilepsia, estatura, gota, hipertension, neumonia, 
          obesidad, otros, peso, presion, pulso, temperatura, descripciones, nombre} = req.body;
          const Fecha = new Date();

    const id_p = await pool.query(
      'SELECT ID_Diagnostico_Paciente FROM Diagnostico WHERE ID_Diagnostico = (SELECT ID_Diagnostico FROM Paciente_Diagnostico WHERE ID_Paciente = ? ORDER BY ID_Diagnostico DESC LIMIT 1) LIMIT 1',
      [req.params.id]
    );

    var id_d;

    if (id_p[0][0] === undefined) {
      id_d = 1
    } else {
      id_d = id_p[0][0].ID_Diagnostico_Paciente + 1;
    }

    const result = await pool.query(
      'INSERT INTO Diagnostico (ID_Diagnostico_Paciente, Fecha, Peso, Estatura, Temperatura, Presion_Arterial, Pulso, Alergias, Antecedentes, Sintoma_1, Sintoma_2, Sintoma_3, Sintoma_4, Sintoma_5, Sintoma_6, Sintoma_7, Sintoma_8, Sintoma_9, Sintoma_10, Sintoma_11, Sintoma_12, Sintoma_13, Sintoma_14, Sintoma_15, Diabetes, Obesidad, Neumonia, Asma, Artritis, Gota, Epilepsia, Hipertension, Nombre_Diagnostico) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id_d, Fecha, peso, estatura, temperatura, presion, pulso, alergias, 
        antecedentes, descripciones[0], descripciones[1], descripciones[2], 
        descripciones[3], descripciones[4], descripciones[5], descripciones[6], descripciones[7], 
        descripciones[8], descripciones[9],descripciones[10], descripciones[11], descripciones[12], 
        descripciones[13], descripciones[14], diabetes, obesidad, neumonia, 
        asma, artritis, gota, epilepsia, hipertension, nombre]
    );

    const result2 = await pool.query(
      'INSERT INTO Paciente_Diagnostico (ID_Paciente, ID_Diagnostico) VALUES (?, ?)',
      [req.params.id, result[0].insertId]
    )

    //////////////////////// Enfermedades ////////////////////////

    // const descripciones1 = req.body.descripciones;

    // const placeholders = descripciones.map(() => '?').join(', ');

    //   const [result1] = await pool.query(
    //     `SELECT ID_Enfermedad, count(*) as repeticiones FROM Enfermedad_Sintoma WHERE ID_Sintoma IN ( SELECT ID_Sintoma FROM Sintoma WHERE Nombre IN (${placeholders})) GROUP BY ID_Enfermedad ORDER BY repeticiones DESC`,
    //     descripciones1
    //   );

    //   const totales = result1.map(obj => obj.ID_Enfermedad);

    //   const placeholdersT = totales.map(() => '?').join(', ');

    //   const [result3] = await pool.query(
    //     `SELECT ID_Enfermedad, count(*) as total FROM Enfermedad_Sintoma WHERE ID_Enfermedad IN (${placeholdersT}) GROUP BY ID_Enfermedad`,
    //     totales
    //   )

    //   var IdsEnfermedades = [];

    //   for(let index = 0; index < 5; index++) {
    //     var rest = result3[index].total - result1[index].repeticiones;
    //     IdsEnfermedades.push({ID_Enfermedad:result3[index].ID_Enfermedad, Porcentaje: rest});
    //   }
    //   IdsEnfermedades.sort((a, b) => a.Porcentaje - b.Porcentaje);


    //   const ids = IdsEnfermedades.map(obj => obj.ID_Enfermedad);
    //   const placeholders2 = ids.map(() => '?').join(', ');


    //   // const ids = result1.map(obj => obj.ID_Enfermedad);

    //   // const suma = result1.reduce((acc, obj) => acc + obj.repeticiones, 0);

    //   // const placeholders2 = result1.map(() => '?').join(', ');

    //   const [result4] = await pool.query (`SELECT Nombre, ID_Enfermedad FROM Enfermedad WHERE ID_Enfermedad IN (${placeholders2})`,
    //     ids
    //   )

    //   const result5 = await pool.query(
    //     'INSERT INTO Diagnostico_Enfermedad (ID_Diagnostico, ID_Enfermedad) VALUES (?, ?)',
    //     [
    //       result[0].insertId,
    //       result4[0].ID_Enfermedad,
    //     ]
    //   )

    // //   const combinedObj = result3.map(obj => ({
    // //     ...obj,
    // //     porcentaje: (result1.find(o => o.ID_Enfermedad === obj.ID_Enfermedad).repeticiones / suma * 100).toFixed(2),
    // //   }));

    // // for (
    // //   let index = 0; index < 1; index++) {
    // //   const result4 = await pool.query(
    // //     'INSERT INTO Diagnostico_Enfermedad (ID_Diagnostico, ID_Enfermedad, Porcentaje) VALUES (?, ?, ?)',
    // //     [
    // //       result[0].insertId,
    // //       combinedObj[index].ID_Enfermedad,
    // //       combinedObj[index].porcentaje
    // //     ]
    // //   )
    // // }

    // // res.json(result1)


    
    const descripciones1 = req.body.descripciones;

    const placeholders = descripciones.map(() => '?').join(', ');

      const [result1] = await pool.query(
        `SELECT ID_Enfermedad, count(*) as repeticiones FROM Enfermedad_Sintoma WHERE ID_Sintoma IN ( SELECT ID_Sintoma FROM Sintoma WHERE Nombre IN (${placeholders})) GROUP BY ID_Enfermedad ORDER BY repeticiones DESC LIMIT 1`,
        descripciones1
      );

      const ids = result1.map(obj => obj.ID_Enfermedad);

      const suma = result1.reduce((acc, obj) => acc + obj.repeticiones, 0);

      const placeholders2 = result1.map(() => '?').join(', ');

      const [result3] = await pool.query (`SELECT Nombre, ID_Enfermedad FROM Enfermedad WHERE ID_Enfermedad IN (${placeholders2})`,
        ids
      )

      const combinedObj = result3.map(obj => ({
        ...obj,
        porcentaje: (result1.find(o => o.ID_Enfermedad === obj.ID_Enfermedad).repeticiones / suma * 100).toFixed(2),
      }));

    for (
      let index = 0; index < combinedObj.length; index++) {
      const result4 = await pool.query(
        'INSERT INTO Diagnostico_Enfermedad (ID_Diagnostico, ID_Enfermedad, Porcentaje) VALUES (?, ?, ?)',
        [
          result[0].insertId,
          combinedObj[index].ID_Enfermedad,
          combinedObj[index].porcentaje
        ]
      )
    }
    res.json(id_d);
  } catch (error) {
    console.log(error)
    res.status(500).send('Ocurrio un error al insertar el diagnostico')
  }
}

export const getDiagnosticos = async (req, res) => {
  try {

    const [result] = await pool.query(
      'SELECT ID_Diagnostico FROM Paciente_Diagnostico WHERE ID_Paciente = ?',
      [req.params.id]
    )

    const descripciones = result.map(obj => obj.ID_Diagnostico);
    const placeholders = descripciones.map(() => '?').join(', ');

    const [result2] = await pool.query(
      `SELECT * FROM Diagnostico WHERE ID_Diagnostico IN (${placeholders})`,
      descripciones
    );

    const combinedObj = [
      [...result2],
      [ 
        {ID_Paciente: req.params.id}
      ]
    ];
    
    res.json(combinedObj);
  } catch (error) {
    res.status(500).send("Ocurrió un error al obtener los diagnosticos");
    console.log(error);
  }
}

export const getPaciente = async (req, res) => {
  try {
    const [result] = await pool.query(
      'SELECT * FROM paciente WHERE id_paciente = ?',
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

export const getLogDiag = async (req, res) => {
  try {

    const [idfd] = await pool.query(
      'SELECT ID_Diagnostico FROM Paciente_Diagnostico WHERE ID_Paciente = ?',
      [req.params.idpa]
    )

    const descripciones = idfd.map(obj => obj.ID_Diagnostico);
    const placeholders = descripciones.map(() => '?').join(', ');

    const [result] = await pool.query(
      `SELECT * FROM Diagnostico WHERE ID_Diagnostico IN (${placeholders}) AND ID_Diagnostico_Paciente = ?`,
      [...descripciones, req.params.iddi]
    )

    const [result2] = await pool.query(
      'SELECT * FROM paciente WHERE id_paciente = ?',
      [req.params.idpa]
    )

    const result3 = await pool.query(
      'SELECT * FROM Diagnostico_Enfermedad WHERE ID_Diagnostico = ?',
      result[0].ID_Diagnostico
    )

    const IDEnfermedades = result3[0].map(obj => obj.ID_Enfermedad)

    const placeholders2 = IDEnfermedades.map(() => '?').join(', ');

    const result4 = await pool.query(
      `SELECT * FROM Enfermedad WHERE ID_Enfermedad IN (${placeholders2})`,
      IDEnfermedades 
    )

    const result5 = await pool.query(
      `SELECT * FROM Enfermedad_Tratamiento WHERE ID_Enfermedad IN (${placeholders2})`,
      IDEnfermedades
    )

    const IDTratamientos = result5[0].map(obj => obj.ID_Tratamiento)

    const placeholders3 = IDTratamientos.map(() => '?').join(', ');

    const result6 = await pool.query(
      `SELECT * FROM Tratamiento WHERE ID_Tratamiento IN (${placeholders3})`,
      IDTratamientos
    )

        const combinedObj = {
      ...result[0],
      ...result2[0],
      ID_Paciente: req.params.idpa,
      Enfermedad: result4[0][0].Nombre,
      Porcentaje: result3[0][0].Porcentaje,
      Tratamiento: result6[0]
    };

    res.json(combinedObj);

  } catch (error) {
    console.log(error)
  }
}

export const getSintomas = async (req, res) => {
  try {
    const [result] = await pool.query(
      'SELECT * FROM Sintoma'
    );
    res.json(result)
  } catch (error) {
    console.log(error)
  }
}



// export const getTasks = async (req, res) => {
//   try {
//     const [result] = await pool.query(
//       "SELECT * FROM pacientes ORDER BY createdAt ASC"
//     );
//     res.json(result);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send("Ocurrió un error al obtener las tareas");
//   }
// };

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

export const getEnfermedad = async (req, res) => {
  try {
    
    // const descripciones = req.body.descripciones;

    // const descripciones = req.body.map(obj => obj.descripciones);

    const descripciones1 = req.body.descripciones;

    const placeholders = descripciones1.map(() => '?').join(', ');

      const [result1] = await pool.query(
        `SELECT ID_Enfermedad, count(*) as repeticiones FROM Enfermedad_Sintoma WHERE ID_Sintoma IN ( SELECT ID_Sintoma FROM Sintoma WHERE Nombre IN (${placeholders})) GROUP BY ID_Enfermedad ORDER BY repeticiones DESC`,
        descripciones1
      );

      const totales = result1.map(obj => obj.ID_Enfermedad);

      const placeholdersT = totales.map(() => '?').join(', ');

      const [result3] = await pool.query(
        `SELECT ID_Enfermedad, count(*) as total FROM Enfermedad_Sintoma WHERE ID_Enfermedad IN (${placeholdersT}) GROUP BY ID_Enfermedad`,
        totales
      )

      var IdsEnfermedades = [];

      for(let index = 0; index < 5; index++) {
        var rest = result3[index].total - result1[index].repeticiones;
        IdsEnfermedades.push({ID_Enfermedad:result3[index].ID_Enfermedad, Porcentaje: rest});
      }
      IdsEnfermedades.sort((a, b) => a.Porcentaje - b.Porcentaje);


      const ids = IdsEnfermedades.map(obj => obj.ID_Enfermedad);
      const placeholders2 = ids.map(() => '?').join(', ');


      // const ids = result1.map(obj => obj.ID_Enfermedad);

      // const suma = result1.reduce((acc, obj) => acc + obj.repeticiones, 0);

      // const placeholders2 = result1.map(() => '?').join(', ');

      const [result4] = await pool.query (`SELECT Nombre, ID_Enfermedad FROM Enfermedad WHERE ID_Enfermedad IN (${placeholders2})`,
        ids
      )

      const combinedObj = result4.map(obj => ({
        ...obj,
        porcentaje: IdsEnfermedades.find(o => o.ID_Enfermedad === obj.ID_Enfermedad).Porcentaje
      }));

      res.json(combinedObj)

    //   const ids = result1.map(obj => obj.ID_Enfermedad);

    //   const suma = result1.reduce((acc, obj) => acc + obj.repeticiones, 0);

    //   const placeholders2 = result1.map(() => '?').join(', ');

    //   const [result3] = await pool.query (`SELECT Nombre, ID_Enfermedad FROM Enfermedad WHERE ID_Enfermedad IN (${placeholders2})`,
    //     ids
    //   )

    //   const combinedObj = result3.map(obj => ({
    //     ...obj,
    //     porcentaje: (result1.find(o => o.ID_Enfermedad === obj.ID_Enfermedad).repeticiones / suma * 100).toFixed(2),
    //   }));

    // for (
    //   let index = 0; index < combinedObj.length; index++) {
    //   const result4 = await pool.query(
    //     'INSERT INTO Diagnostico_Enfermedad (ID_Diagnostico, ID_Enfermedad, Porcentaje) VALUES (?, ?, ?)',
    //     [
    //       combinedObj[index].ID_Enfermedad,
    //       combinedObj[index].porcentaje
    //     ]
    //   )
    // }

    // res.json(result1[0])
  } catch (error) {
    console.log(error);
    res.status(500).send('Error interno del servidor');
  }
};