import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format } from 'date-fns';
import ptBr from 'date-fns/locale/pt-BR';

import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';

import Notification from '../schemas/Notification';

import * as UserUtils from '../utils/UserUtils';

const pageSize = 20;

class AppointmentController {
  async index(req, res) {
    try {
      const { page = 1 } = req.query;
      const appointments = await Appointment.findAll({
        where: {
          user_id: req.userId,
          canceled_at: null,
        },
        attributes: ['id', 'date'],
        order: ['date'],
        limit: pageSize,
        offset: (page - 1) * pageSize,
        include: [
          {
            model: User,
            as: 'provider',
            attributes: ['id', 'name'],
            include: [
              { model: File, as: 'avatar', attributes: ['id', 'path', 'url'] },
            ],
          },
        ],
      });
      return res.json(appointments);
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    try {
      // abortEarly = false para mostrar todos os erros encontrados
      await schema.validate(req.body, { abortEarly: false });
    } catch (error) {
      return res.status(400).json({
        error: `Validation errors: ${JSON.stringify(error.errors)}`,
      });
    }

    try {
      const { provider_id, date } = req.body;
      if (parseInt(provider_id, 10) === req.userId) {
        return res
          .status(400)
          .json({ error: `User cannot create an appointment for himself` });
      }
      const checkProvider = await UserUtils.checkProvider(provider_id);
      if (checkProvider === UserUtils.ERROR_USER_NOT_FOUND) {
        return res
          .status(400)
          .json({ error: `User ${provider_id} does not exist` });
      }
      if (checkProvider === UserUtils.ERROR_USER_IS_NOT_PROVIDER) {
        return res
          .status(400)
          .json({ error: `User ${provider_id} is not a service provider` });
      }

      const hourStart = startOfHour(parseISO(date));

      // Verifica se data está no passado
      if (isBefore(hourStart, new Date())) {
        return res.status(400).json({ error: 'Date/time is in the past' });
      }

      // Verifica disponibilidade de data
      const existingAppointment = await Appointment.findOne({
        where: { provider_id, canceled_at: null, date: hourStart },
      });

      if (existingAppointment) {
        return res.status(400).json({ error: 'Date/time is not available' });
      }

      const appointment = await Appointment.create({
        user_id: req.userId,
        provider_id,
        date: hourStart,
      });

      // Notifica o provider
      const user = await User.findByPk(req.userId);
      const formattedDate = format(hourStart, 'dd/MM/yyyy (EEEE) HH:mm', {
        locale: ptBr,
      });

      await Notification.create({
        content: `Novo agendamento de ${user.name} para: ${formattedDate}`,
        userId: provider_id,
      });

      return res.json(appointment);
    } catch (error) {
      return res.status(500).json({ error });
    }
  }
}

export default new AppointmentController();
