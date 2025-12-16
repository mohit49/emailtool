import express from 'express';
import { body, validationResult } from 'express-validator';
import Template from '../models/Template.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all templates for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const templates = await Template.find({ userId: req.user.userId })
      .sort({ updatedAt: -1 });
    res.json({ templates });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a single template
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const template = await Template.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ template });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new template
router.post('/', [
  authenticateToken,
  body('name').trim().notEmpty(),
  body('html').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, html } = req.body;

    const template = new Template({
      userId: req.user.userId,
      name,
      html,
    });

    await template.save();

    res.status(201).json({ template });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a template
router.put('/:id', [
  authenticateToken,
  body('name').optional().trim().notEmpty(),
  body('html').optional().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, html } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (html) updateData.html = html;

    const template = await Template.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ template });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a template
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const template = await Template.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;



