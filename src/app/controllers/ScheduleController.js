import {
  startOfDay,
  endOfDay,
  parseISO,
  setHours,
  setMinutes,
  setSeconds,
  isEqual,
  isBefore,
} from 'date-fns';
import { Op } from 'sequelize';

import Appointment from '../models/Appointment';
import User from '../models/User';

export const workingHoursOfDay = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
];

class ScheduleController {
  async index(req, res) {
    const { date } = req.query;
    const parsedDate = parseISO(date);
    const busySchedule = await Appointment.findAll({
      where: {
        provider_id: req.userId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
        },
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
      order: ['date'],
    });
    const fullSchedule = workingHoursOfDay.map(time => {
      const [strHour, strMinute] = time.split(':');
      const hour = Number(strHour);
      const minute = Number(strMinute);
      const fullDate = setSeconds(
        setMinutes(setHours(parsedDate, hour), minute),
        0
      );
      const appointment = busySchedule.find(busyTime => {
        return isEqual(busyTime.getDataValue('date'), fullDate);
      });
      if (appointment) {
        return {
          time,
          name: appointment.user.getDataValue('name'),
          past: isBefore(fullDate, new Date()),
          available: false,
        };
      }
      return {
        time,
        past: isBefore(fullDate, new Date()),
        available: true,
      };
    });

    return res.json(fullSchedule);
  }
}

export default new ScheduleController();
