export const validateProductData = (data) => {
  let status = true;
  let message = [];
  if (!data.title) {
    status = false;
    message.push('title field is required');
  }
  if (!data.price) {
    status = false;
    message.push('price field is required');
  }
  if (data.price < 0) {
    status = false;
    message.push('price can\'t be negative ');
  }
  if (!data.count) {
    status = false;
    message.push('count field is required');
  }
  return {
    status,
    message: message.join(', '),
  };
};
