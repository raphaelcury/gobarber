import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';

import Appointment from '../models/Appointment';

class ScheduleController {
  async index(req, res) {
    try {
      const { date } = req.query;
      const parsedDate = parseISO(date);
      const schedule = await Appointment.findAll({
        where: {
          provider_id: req.userId,
          canceled_at: null,
          date: {
            [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
          },
        },
        order: ['date'],
      });

      return res.json(schedule);
    } catch (error) {
      return res.status(500).json({ error });
    }
  }
}

export default new ScheduleController();
