const express = require('express');
const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const { authenticate, isAdmin } = require('../auth/auth');

const router = express.Router();


router.use(authenticate, isAdmin);

function toPublicUser(user) {
  const { id, name, email, role, active, createdAt } = user;
  return { id, name, email, role, active, createdAt };
}

// listar todos los usuarios
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
    res.json(users.map(toPublicUser));
  } catch (error) {
    console.error('ERROR AL LISTAR USUARIOS:', error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
});

// crear un nuevo usuario
router.post('/', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios' });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Ya existe un usuario con ese correo' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: role === 'ADMIN' ? 'ADMIN' : 'USER',
        active: true,
      },
    });

    res.status(201).json(toPublicUser(user));
  } catch (error) {
    console.error('ERROR AL CREAR USUARIO:', error);
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
});

//editar
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, role, password, active } = req.body;

  try {
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Si se le va a quitar el rol de admin o se va a desactivar, verificar
    // que quede al menos otro admin activo en el sistema.
    const losingAdminRole = target.role === 'ADMIN' && role === 'USER';
    const gettingDeactivated = target.role === 'ADMIN' && active === false;

    if (losingAdminRole || gettingDeactivated) {
      const otherActiveAdmins = await prisma.user.count({
        where: { role: 'ADMIN', active: true, NOT: { id } },
      });
      if (otherActiveAdmins === 0) {
        return res.status(400).json({ error: 'Debe existir siempre al menos un administrador activo' });
      }
    }

    const data = {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(role !== undefined && { role }),
      ...(active !== undefined && { active }),
    };

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({ where: { id }, data });
    res.json(toPublicUser(updated));
  } catch (error) {
    console.error('ERROR AL ACTUALIZAR USUARIO:', error);
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
});

module.exports = router;