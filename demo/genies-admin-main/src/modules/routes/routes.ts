import { path } from './utils';

export const home = () => {
  return '/';
};

export const auth = (params = {}) => {
  return path(['auth'], params);
};

export const users = (params = {}) => {
  return path(['users'], params);
};

export const signUpNewUsers = () => {
  return path(['users', 'signup']);
};

export const reserveUsername = () => {
  return path(['users', 'reserve']);
};

export const batchReserveUsername = () => {
  return path(['users', 'reserve', 'batch']);
};

export const batchReserveUsernameTemplate = () => {
  return path(['static', 'template', 'reverse_username_template.csv']);
};

export const collections = (params = {}) => {
  return path(['collections'], params);
};

export const collectionsDetail = (id: string, params = {}) => {
  return path(['collections', id], params);
};

export const editionDetails = (id: string, params = {}) => {
  return path(['collections', 'edition', id], params);
};

export const drops = (params = {}) => {
  return path(['drops'], params);
};

export const dropsDetail = (id: string, params = {}) => {
  return path(['drops', id], params);
};

export const dropsEditionDetail = (id: string, params = {}) => {
  return path(['drops', 'edition', id], params);
};

export const createDrop = () => {
  return path(['drops', 'create-drop']);
};

export const createCollection = () => {
  return path(['collections', 'create-collection']);
};

export const createEdition = (id: string, params = {}) => {
  return path(['collections', 'create-edition', id], params);
};

export const experiences = (params = {}) => {
  return path(['experiences'], params);
};

export const experienceDetail = (id: string, params = {}) => {
  return path(['experiences', id], params);
};

export const things = (params = {}) => {
  return path(['things'], params);
};
export const thingDetail = (id: string, creatorId: string, params = {}) => {
  return path(['things', creatorId, id], params);
};

export const gears = (params = {}) => {
  return path(['gears'], params);
};

export const gearDetail = (id: string, params = {}) => {
  return path(['gears', id], params);
};

export const traits = (params = {}) => {
  return path(['traits'], params);
};

export const economy = (params = {}) => {
  return path(['economy'], params);
};

export const currencyProducts = (params = {}) => {
  return path(['currency'], params);
};

export const currencies = (params = {}) => {
  return path(['currencies'], params);
};

export const inventory = (params = {}) => {
  return path(['inventory'], params);
};

export const inventoryDefaultItems = (params = {}) => {
  return path(['inventory', 'default-items'], params);
};

export const inventoryMetadataStores = (params = {}) => {
  return path(['inventory', 'metadata-stores'], params);
};

export const inventoryModeration = (params = {}) => {
  return path(['inventory', 'moderation'], params);
};
