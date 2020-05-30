import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import User from '../models/User';
import File from '../models/File';
import authConfig from '../../config/auth';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation error.' });
    }

    const { email, password } = req.body;
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });
    if (!user) {
      // User not found
      return res.status(401).json({ error: 'User not found' }); // Unauthorized
    }
    if (!(await user.checkPassword(password))) {
      // Password does not match
      return res.status(401).json({ error: 'Wrong password' }); // Unauthorized
    }
    const { id, name, avatar } = user;
    return res.json({
      user: {
        id,
        name,
        email,
        avatar: {
          id: avatar.id,
          path: avatar.path,
          url: avatar.url,
        },
      },
      // payload = id
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
