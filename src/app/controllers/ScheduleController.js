import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';

import User from '../models/User';
import Appointment from '../models/Appointment';

class ScheduleController {
  async index(req, res) {
    // Procura user para validar se é provider
    try {
      const user = await User.findOne({ where: { id: req.userId } });
      // Se usuário não for encontrado
      if (!user) {
        return res
          .status(400)
          .json({ error: `User ${req.userId} does not exist` });
      }
      // Se usuário não for provider
      if (!user.provider) {
        return res
          .status(400)
          .json({ error: `User ${req.userId} is not a service provider` });
      }
      const { date } = req.query;
      const parsedDate = parseISO(date);
      const schedule = await Appointment.findAll({
        where: {
          provider_id: req.userId,
          date: {
            [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
          },
        },
        order: ['date'],
      });

      return res.json({ schedule });
    } catch (error) {
      return res.status(500).json({ error });
    }
  }
}

export default new ScheduleController();
