import * as _ from 'lodash';

export class Helpers {
  static tryParseJsonString(value: any): any {
    try {
      return JSON.parse(value);
    } catch (err) {
      return value;
    }
  }

  static tryTransformBooleanString = (value?: string | boolean) => {
    if (typeof value === 'boolean') {
      return value;
    }
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }
    return Boolean(value);
  };

  static isNullOrUndefined(oj: any) {
    return oj === undefined || oj === null;
  }

  static getEnumKeys<T extends string | number>(e: Record<string, T>): string[] {
    return _.difference(_.keys(e), _.map(_.filter(_.values(e), _.isNumber), _.toString));
  }

  static getEnumValues<T extends string | number>(e: Record<string, T>): T[] {
    return _.values(_.pick(e, Helpers.getEnumKeys(e)));
  }

  static getArrayStringConfig(value: string) {
    return value.split(',');
  }
}
