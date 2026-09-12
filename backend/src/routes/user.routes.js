const express = require('express');
const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const { authenticate, isAdmin } = require('../middlewares/auth');

const router = express.Router();


router.use(authenticate, isAdmin);


router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Crear nuevo usuario
router.post('/', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword, role, active: true }
    });
    res.status(201).json({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role });
  } catch (error) {
    res.status(400).json({ error: 'El correo electrónico ya se encuentra registrado' });
  }
});

// Actualizar usuario + Regla de conservación de al menos un Admin activo
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { role, active, name, email } = req.body;

  try {
    const userToUpdate = await prisma.user.findUnique({ where: { id } });
    if (!userToUpdate) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Al menos un administrador activo
    if (userToUpdate.role === 'ADMIN' && (active === false || role === 'USER')) {
      const activeAdminsCount = await prisma.user.count({
        where: { role: 'ADMIN', active: true }
      });

      if (activeAdminsCount <= 1) {
        return res.status(400).json({
          error: 'Debe conservarse al menos un administrador activo en el sistema.'
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(role !== undefined && { role }),
        ...(active !== undefined && { active })
      }
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar el usuario' });
  }
});

module.exports = router;