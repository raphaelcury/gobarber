import * as Yup from 'yup';
import {
  startOfHour,
  parseISO,
  isBefore,
  format,
  differenceInMinutes,
} from 'date-fns';
import ptBr from 'date-fns/locale/pt-BR';

import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';

import Notification from '../schemas/Notification';

import Mail from '../../tools/Mail';

import * as UserUtils from '../utils/UserUtils';

const PAGE_SIZE = 20;
const MIN_HOURS_TO_CANCEL = 2; // Diferença mínima em horas para cancelamento
const MIN_TO_CANCEL = MIN_HOURS_TO_CANCEL * 60;

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
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
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
      if (checkProvider.result !== UserUtils.USER_IS_PROVIDER) {
        return res.status(400).json({ error: checkProvider.message });
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

  async delete(req, res) {
    try {
      const appointment = await Appointment.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: 'provider',
            attributes: ['name', 'email'],
          },
        ],
      });
      if (!appointment) {
        return res.status(400).json({ error: 'Appointment does not exist' });
      }
      if (appointment.user_id !== req.userId) {
        return res
          .status(401)
          .json({ error: 'You are not allowed to cancel this appointment' });
      }
      const dateDifference = differenceInMinutes(appointment.date, new Date());
      if (dateDifference < MIN_TO_CANCEL) {
        return res.status(400).json({
          error: `You can only cancel an appointment ${MIN_HOURS_TO_CANCEL} hours before it`,
        });
      }

      appointment.canceled_at = new Date();
      await appointment.save();
      await Mail.sendMail({
        to: `${appointment.provider.name} <${appointment.provider.email}>`,
        subject: 'Agendamento cancelado',
        text: 'Um agendamento foi cancelado',
      });
      return res.json(appointment);
    } catch (error) {
      return res.status(500).json({ error });
    }
  }
}

export default new AppointmentController();
