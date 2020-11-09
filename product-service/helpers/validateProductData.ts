export const validateProductData = (data) => {
  let status = true;
  let message = [];
  if (!data.title) {
    status = false;
    message.push('title field is required');
  }
  if (!data.description) {
    status = false;
    message.push('description field is required');
  }
  if (!data.price) {
    status = false;
    message.push('price field is required');
  }
  return {
    status,
    message: message.join(', '),
  };
};
