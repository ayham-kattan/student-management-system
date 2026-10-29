jest.mock('../../src/cache/redis', () => ({
  client: { isReady: false, get: jest.fn(), set: jest.fn(), multi: jest.fn() },
}));

const { client } = require('../../src/cache/redis');
const cache = require('../../src/cache/studentCache');

describe('studentCache when Redis is unavailable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    client.isReady = false;
  });

  it('acts as a cache miss instead of failing', async () => {
    await expect(cache.getItem(1)).resolves.toBeNull();
    await expect(cache.getList({ page: 1, limit: 20, search: '', sortBy: 'studentId', sortOrder: 'desc' })).resolves.toBeNull();
    await expect(cache.invalidate(1)).resolves.toBeUndefined();
    expect(client.get).not.toHaveBeenCalled();
  });

  it('swallows Redis command errors', async () => {
    client.isReady = true;
    client.get.mockRejectedValue(new Error('READONLY'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(cache.getItem(1)).resolves.toBeNull();
    expect(console.error).toHaveBeenCalled();
  });
});
