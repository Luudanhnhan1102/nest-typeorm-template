export const MockRedisService = {
  set: jest.fn().mockResolvedValue(true),
  get: jest.fn().mockResolvedValue(true),
  delete: jest.fn().mockResolvedValue(true),
};
