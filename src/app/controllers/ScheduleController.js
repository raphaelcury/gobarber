import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';

import Appointment from '../models/Appointment';

import * as UserUtils from '../utils/UserUtils';

class ScheduleController {
  async index(req, res) {
    try {
      const checkUser = UserUtils.checkProvider(req.userId);
      if (checkUser === UserUtils.ERROR_USER_NOT_FOUND) {
        return res
          .status(400)
          .json({ error: `User ${req.userId} does not exist` });
      }
      if (checkUser === UserUtils.ERROR_USER_IS_NOT_PROVIDER) {
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
