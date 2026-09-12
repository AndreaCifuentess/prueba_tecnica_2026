const express = require('express');
const prisma = require('../config/prisma');
const { authenticate } = require('../auth/auth');

const router = express.Router();


router.use(authenticate);

// Obtener todas las notas
router.get('/', async (req, res) => {
  try {
    const notes = await prisma.note.findMany();
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las notas' });
  }
});

// Crear nueva nota con valores por defecto
router.post('/', async (req, res) => {
  try {
    const newNote = await prisma.note.create({
      data: {
        title: 'Nueva Nota',
        text: '',
        status: 'PENDIENTE',
        posX: 100,
        posY: 100
      }
    });
    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la nota' });
  }
});

// Actualizar nota (texto, estado o posiciones X, Y al arrastrar)
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, text, status, posX, posY } = req.body;

  try {
    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(text !== undefined && { text }),
        ...(status !== undefined && { status }),
        ...(posX !== undefined && { posX }),
        ...(posY !== undefined && { posY })
      }
    });
    res.json(updatedNote);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar la nota' });
  }
});

// Eliminar nota
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.note.delete({ where: { id } });
    res.json({ message: 'Nota eliminada correctamente' });
  } catch (error) {
    res.status(400).json({ error: 'Error al eliminar la nota' });
  }
});

module.exports = router;