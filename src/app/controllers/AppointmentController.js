import * as Yup from 'yup';

import Appointment from '../models/Appointment';
import User from '../models/User';

class AppointmentController {
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

      const user_id = req.userId;
      const appointment = await Appointment.create({
        user_id,
        provider_id,
        date,
      });
      return res.json(appointment);
    } catch (error) {
      return res.status(500).json(error);
    }
  }
}

export default new AppointmentController();
