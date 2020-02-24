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

const workingHoursOfDay = [
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
];

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
