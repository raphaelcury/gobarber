import {
  fromUnixTime,
  startOfDay,
  endOfDay,
  isBefore,
  format,
  setHours,
  setMinutes,
} from 'date-fns';
import { Op } from 'sequelize';

import Appointment from '../models/Appointment';

import { workingHoursOfDay } from './ScheduleController';

class AvailableController {
  async index(req, res) {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'Date parameter is mandatory' });
    }
    const timeStamp = Number(date);
    const searchDate = fromUnixTime(timeStamp);
    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.params.id,
        date: {
          [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
        },
        canceled_at: null,
      },
    });
    const availabillity = workingHoursOfDay.map(time => {
      const [strHour, strMinute] = time.split(':');
      const hour = Number(strHour);
      const minute = Number(strMinute);
      const fullDate = setHours(
        setMinutes(startOfDay(searchDate), minute),
        hour
      );
      const now = new Date();
      const isInThePast = isBefore(fullDate, now);
      const allocatedTime = appointments.find(appointment => {
        return format(appointment.date, 'HH:mm') === time;
      });
      return { time, fullDate, available: !isInThePast && !allocatedTime };
    });
    return res.json({ availabillity });
  }
}

export default new AvailableController();
