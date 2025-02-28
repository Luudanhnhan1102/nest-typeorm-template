import { ERole } from 'src/modules/users/users.constants';
import { Helpers } from './helpers';

describe('helpers', () => {
  describe('tryParseJsonString', () => {
    it('should return the parsed JSON if the string is valid', () => {
      expect(Helpers.tryParseJsonString('{"key": "value"}')).toEqual({ key: 'value' });
    });
    it('should return the original value if the string is not valid', () => {
      expect(Helpers.tryParseJsonString('invalid')).toEqual('invalid');
    });
  });

  describe('isNullOrUndefined', () => {
    it('should return true if value is undefined', () => {
      expect(Helpers.isNullOrUndefined(undefined)).toBe(true);
    });
    it('should return true if value is null', () => {
      expect(Helpers.isNullOrUndefined(null)).toBe(true);
    });
    it('should return false if value is not undefined or null', () => {
      expect(Helpers.isNullOrUndefined('test')).toBe(false);
    });
  });

  describe('tryTransformBooleanString', () => {
    it('should return true if value is true', () => {
      expect(Helpers.tryTransformBooleanString('true')).toBe(true);
    });
    it('should return false if value is false', () => {
      expect(Helpers.tryTransformBooleanString('false')).toBe(false);
    });
    it('should return true if value is true boolean', () => {
      expect(Helpers.tryTransformBooleanString(true)).toBe(true);
    });
    it('should return false if value is false boolean', () => {
      expect(Helpers.tryTransformBooleanString(false)).toBe(false);
    });
  });

  describe('getEnumKeys', () => {
    it('should return all keys of the enum', () => {
      expect(Helpers.getEnumKeys(ERole)).toEqual(['admin', 'user']);
    });
  });

  describe('getEnumValues', () => {
    it('should return all values of the enum', () => {
      expect(Helpers.getEnumValues(ERole)).toEqual([ERole.admin, ERole.user]);
    });
  });

  describe('getArrayStringConfig', () => {
    it('should return an array of strings', () => {
      expect(Helpers.getArrayStringConfig('a,b,c')).toEqual(['a', 'b', 'c']);
    });
  });
});
