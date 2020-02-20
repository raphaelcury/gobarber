import * as UserUtils from '../utils/UserUtils';

export default async (req, res, next) => {
  try {
    const checkProvider = await UserUtils.checkProvider(req.userId);
    if (checkProvider.result !== UserUtils.USER_IS_PROVIDER) {
      return res.status(400).json({ error: checkProvider.message });
    }
    return next();
  } catch (error) {
    return res.status(500).json({ error });
  }
};
