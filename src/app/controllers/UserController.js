import User from '../models/User';

class UserController {
  async store(req, res) {
    // Verifica se já existe usuário com o email
    const existingUser = await User.findOne({
      where: { email: req.body.email },
    });
    if (existingUser) {
      return res.status(400).json({ error: 'User (email) already exists.' });
    }
    // Cria usuário
    const { id, name, email, provider } = await User.create(req.body);
    return res.json({
      id,
      name,
      email,
      provider,
    });
  }
}

export default new UserController();
