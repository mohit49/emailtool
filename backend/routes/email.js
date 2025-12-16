import express from 'express';
import { sendTestEmail } from '../services/emailService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Send test email
router.post('/send-test', authenticateToken, async (req, res) => {
  try {
    const { to, subject, html } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
    }

    await sendTestEmail(to, subject, html);

    res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Send test email error:', error);
    res.status(500).json({ error: 'Failed to send test email' });
  }
});

export default router;



