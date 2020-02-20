import User from '../models/User';

export const USER_IS_PROVIDER = 0;
export const ERROR_USER_NOT_FOUND = 1;
export const ERROR_USER_IS_NOT_PROVIDER = 2;

const providerMessageFunctions = [
  id => `User ${id} is provider`,
  id => `User ${id} does not exist`,
  id => `User ${id} is not a provider`,
];

class CheckProviderResult {
  constructor(id, result) {
    this.id = id;
    this.result = result;
    this.message = providerMessageFunctions[result](id);
  }
}

export async function checkProvider(id) {
  const user = await User.findOne({ where: { id } });
  // Se usuário não for encontrado
  if (!user) {
    return new CheckProviderResult(id, ERROR_USER_NOT_FOUND);
  }
  // Se usuário não for provider
  if (!user.provider) {
    return new CheckProviderResult(id, ERROR_USER_IS_NOT_PROVIDER);
  }
  return new CheckProviderResult(id, USER_IS_PROVIDER);
}
