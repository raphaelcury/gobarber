import jwt from 'jsonwebtoken';

import User from '../models/User';
import authConfig from '../../config/auth';

class SessionController {
  async store(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // User not found
      return res.status(401).json({ error: 'User not found' }); // Unauthorized
    }
    if (!(await user.checkPassword(password))) {
      // User not found
      return res.status(401).json({ error: 'Wrong password' }); // Unauthorized
    }
    const { id, name } = user;
    return res.json({
      user: {
        id,
        name,
        email,
      },
      // payload = id
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
