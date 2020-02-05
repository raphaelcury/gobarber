import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import authConfig from '../../config/auth';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  const [, token] = authHeader.split(' ');

  try {
    // Versão assíncrona utilizada pois é mais eficiente
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);
    // Seta id na req para ser usado na req sem necessidade de passar pela URL
    req.userId = decoded.id;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid Token' });
  }
};
