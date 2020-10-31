import data from './data';

export const getProducts: any = async () => {
  return Promise.resolve(data);
}

export const getProductItemById: any = async (id) => {
  const product = data.find(item => item.id === +id);
  return Promise.resolve(product);
}
