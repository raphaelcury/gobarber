import * as UserUtils from '../utils/UserUtils';

export default async (req, res, next) => {
  try {
    const checkUser = await UserUtils.checkProvider(req.userId);
    if (checkUser === UserUtils.ERROR_USER_NOT_FOUND) {
      return res
        .status(400)
        .json({ error: `User ${req.userId} does not exist` });
    }
    if (checkUser === UserUtils.ERROR_USER_IS_NOT_PROVIDER) {
      return res
        .status(400)
        .json({ error: `User ${req.userId} is not a service provider` });
    }
    return next();
  } catch (error) {
    return res.status(500).json({ error });
  }
};
