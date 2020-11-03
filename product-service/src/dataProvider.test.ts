import { getProductItemById } from './dataProvider';
import data from './data';

describe('test', () => {
  it('should work', () => {
    const product = data.find(item => item.id === 1);
    getProductItemById(1).then((data) => {
      expect(data).toBe(product);
    });
  });
});
