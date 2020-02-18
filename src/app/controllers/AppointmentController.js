import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore } from 'date-fns';

import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';

class AppointmentController {
  async index(req, res) {
    try {
      const appointments = await Appointment.findAll({
        where: {
          user_id: req.userId,
          canceled_at: null,
        },
        attributes: ['id', 'date'],
        order: ['date'],
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

    // Procura user para validar se é provider
    try {
      const { provider_id, date } = req.body;
      const user = await User.findOne({ where: { id: provider_id } });
      // Se usuário não for encontrado
      if (!user) {
        return res
          .status(400)
          .json({ error: `User ${provider_id} does not exist` });
      }
      // Se usuário não for provider
      if (!user.provider) {
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
      return res.json(appointment);
    } catch (error) {
      return res.status(500).json(error);
    }
  }
}

export default new AppointmentController();
