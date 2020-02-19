import User from '../models/User';

export const USER_IS_PROVIDER = 0;
export const ERROR_USER_NOT_FOUND = 1;
export const ERROR_USER_IS_NOT_PROVIDER = 2;

export async function checkProvider(id) {
  const user = await User.findOne({ where: { id } });
  // Se usuário não for encontrado
  if (!user) {
    return ERROR_USER_NOT_FOUND;
  }
  // Se usuário não for provider
  if (!user.provider) {
    return ERROR_USER_IS_NOT_PROVIDER;
  }
  return USER_IS_PROVIDER;
}
