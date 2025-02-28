import { isInt, isPositive, registerDecorator, ValidationOptions } from 'class-validator';
import { isNumber } from 'lodash';

export function IsDBIdNumber(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'isDBIdNumber',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return isNumber(value) && isPositive(value) && isInt(value);
        },
        defaultMessage() {
          return `$property must be a DB id number`;
        },
      },
    });
  };
}
