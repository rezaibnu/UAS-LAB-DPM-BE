import express, { Request, Response } from 'express';
import { GameRental } from '../models/GameRental';
import authenticateToken from '../middleware/authenticateToken';

const router = express.Router();

interface AuthRequest extends Request {
  userId?: string;
}

router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;

  try {
    const records = await GameRental.find({ userId });
    res.json(records);
  } catch (err) {
    console.error('Error fetching game rental records:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, genre, harga, dateAdded } = req.body;
  const userId = req.userId;

  if (!name || !genre || !harga || !dateAdded) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }

  try {
    const newRecord = new GameRental({ name, genre, harga, dateAdded, userId });
    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (err) {
    console.error('Error saving game rental record:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, genre, harga, dateAdded } = req.body;
  const userId = req.userId;

  if (!name || !genre || !harga || !dateAdded) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }

  try {
    const updatedRecord = await GameRental.findOneAndUpdate(
      { _id: id, userId },
      { name, genre, harga, dateAdded },
      { new: true }
    );

    if (!updatedRecord) {
      res.status(404).json({ error: 'Record not found or unauthorized' });
      return;
    }

    res.json(updatedRecord);
  } catch (err) {
    console.error('Error updating game rental record:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const record = await GameRental.findOneAndDelete({ _id: id, userId });
    if (!record) {
      res.status(404).json({ error: 'Record not found or unauthorized' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting game rental record:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;