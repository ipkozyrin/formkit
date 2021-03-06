const find = require('lodash/find');
const trim = require('lodash/trim');
const isPlainObject = require('lodash/isPlainObject');
const isEmpty = require('lodash/isEmpty');
const isNull = require('lodash/isNull');
const isNil = require('lodash/isNil');
const last = require('lodash/last');
const each = require('lodash/each');

import Field from '../Field';


export const FIELD_PATH_SEPARATOR = '.';


/**
 * Each all the fields and find certain field.
 * If cb returned true - finding will be stopped and found field will returned
 */
export function findFieldRecursively(
  fields: {[index: string]: object},
  cb: (field: Field, path: string) => boolean | Field | void
): Field | void {
  const recursive = (obj: {[index: string]: object}, rootPath: string): Field | void => {
    let foundField;

    find(obj, (item: object, name: string): any => {
      const itemPath: string = trim(`${rootPath}.${name}`, FIELD_PATH_SEPARATOR);

      if (item instanceof Field) {
        // it's a field
        const returnedValue: any = cb(item, itemPath);

        if (returnedValue) {
          foundField = item;

          return true;
        }

        return;
      }
      else if (isPlainObject(item)) {
        // it's a container
        foundField = recursive(item as {[index: string]: object}, itemPath);

        return;
      }
      else {
        throw new Error(`Wrong fields dict`);
      }
    });

    return foundField;
  };

  return recursive(fields, '');
}

export function eachFieldRecursively(
  fields: {[index: string]: object},
  cb: (field: Field, path: string) => void
): void {
  const recursive = (obj: {[index: string]: object}, rootPath: string): void => {
    for (let name of Object.keys(obj)) {
      const item: {[index: string]: any} | Field = obj[name];
      const itemPath: string = trim(`${rootPath}.${name}`, FIELD_PATH_SEPARATOR);

      if (item instanceof Field) {
        // it's a field
        cb(item, itemPath);
      }
      else if (isPlainObject(item)) {
        // it's a container
        recursive(item as {[index: string]: object}, itemPath);
      }
      else {
        throw new Error(`Wrong fields dict`);
      }
    }
  };

  recursive(fields, '');
}

export function eachFieldSchemaRecursively(
  rootObject: {[index: string]: any},
  cb: (item: {[index: string]: any}, path: string) => any
): void {
  eachRecursively(rootObject, (item: {[index: string]: any}, path: string): false | void => {
    if (!isPlainObject(item)) return false;

    // means field
    if (isEmpty(item) || isFieldSchema(item)) {
      cb(item, path);

      // don't go deeper
      return false;
    }
  });
}

export function isFieldSchema(comingSchema: object) {

  // TODO: упростить, может проверять интерфейс FieldSchema

  let isSchema = false;
  const filedParams = [
    'initial',
    'disabled',
    'defaultValue',
    'savedValue',
    'debounceTime',
  ];

  find(comingSchema, (value: any, name: string): any => {
    if (filedParams.includes(name)) {
      isSchema = true;

      return true;
    }
  });

  return isSchema;
}

/**
 * It works with common structures like
 *     {
 *       parent: {
 *         prop: 'value'
 *       }
 *     }
 *                        If it returns false it means don't go deeper.
 */
export function eachRecursively(
  rootObject: {[index: string]: any},
  cb: (item: any, path: string) => false | void
): void {
  const recursive = (obj: {[index: string]: any}, rootPath: string): void => {
    // TODO: remake to for of
    each(obj, (item: object, name: string): void => {
      const itemPath: string = trim(`${rootPath}.${name}`, FIELD_PATH_SEPARATOR);
      const cbResult: false | void = cb(item, itemPath);

      // don't go deeper
      if (cbResult === false) return;

      // go deeper
      return recursive(item, itemPath);
    });
  };

  return recursive(rootObject, '');
}

export function calculateDirty(editedValue: any, savedValue: any): boolean {
  // if edited value don't specified - it means field isn't dirty
  if (typeof editedValue === 'undefined') return false;

  // null, undefined and '' - the same, means dirty = false. 0 compares as a common value.
  if ((editedValue === '' || isNil(editedValue)) && (savedValue === '' || isNil(savedValue))) {
    return false;
  }
  else {
    // just compare current editedValue and saved value
    return editedValue !== savedValue;
  }
}

export function getFieldName(pathToField: string): string {
  const split: Array<string> = pathToField.split('.');
  const lastItem: string | undefined = last(split);

  if (typeof lastItem === 'undefined') return pathToField;

  return lastItem;
}


// //// not tested

export function isPromise(unknown: any) {
  return typeof unknown === 'object' && unknown.then;
}

export function resolvePromise(value: any): Promise<any> {
  if (!value) return Promise.resolve();
  if (isPromise(value)) return value;

  return Promise.resolve();
}

export function parseValue(rawValue: any): any {

  // TODO: does it really need ???

  if (typeof rawValue === 'undefined') {
    return;
  }
  if (isNull(rawValue)) {
    return null;
  }
  else if (rawValue === 'true') {
    return true;
  }
  else if (rawValue === 'false') {
    return false;
  }
  else if (rawValue === 'null') {
    return null;
  }
  else if (rawValue === 'NaN') {
    return NaN;
  }
  else if (rawValue === '') {
    return '';
  }
  // it is for - 2. strings
  else if (typeof rawValue === 'string' && rawValue.match(/^\d+\.$/)) {
    // TODO: why not number ????
    return rawValue;
  }
  else if (typeof rawValue === 'boolean' || isPlainObject(rawValue) || Array.isArray(rawValue)) {
    return rawValue;
  }

  // const toNumber = _.toNumber(rawValue);
  //
  // if (!_.isNaN(toNumber)) {
  //   // it's number
  //   return toNumber;
  // }

  // string
  return rawValue;
}


// /**
//  * It works with common structures like
//  *     {
//  *       parent: {
//  *         prop: 'value'
//  *       }
//  *     }
//  * @param rootObject
//  * @param {function} cb - callback like (items, pathToItem) => {}.
//  *                        If it returns false it means don't go deeper.
//  */
// export function findRecursively(
//   rootObject: {[index: string]: any},
//   cb: (item: any, path: string) => boolean | object | void
// ): object | void {
//   const recursive = (obj, rootPath) => _.find(obj, (item, name) => {
//     const itemPath = _.trim(`${rootPath}.${name}`, FIELD_PATH_SEPARATOR);
//     const cbResult = cb(item, itemPath);
//
//     if (_.isUndefined(cbResult)) {
//       // go deeper
//       return recursive(item, itemPath);
//     }
//     else if (cbResult === false) {
//       // don't go deeper
//       return undefined;
//     }
//     else {
//       // found - stop search
//       return cbResult;
//     }
//   });
//
//   return recursive(rootObject, '');
// }



// /**
//  * It works with structure like this:
//  *     {
//  *       parent: {
//  *         // this will be pass to callback: cb({fieldProp: 'value'}, 'parent.field')
//  *         field: {
//  *           fieldProp: 'value'
//  *         }
//  *       }
//  *     }
//  * @param rootObject
//  * @param cb
//  */
// findFieldLikeStructureRecursively(rootObject, cb) {
//   const isContainer = (item) => {
//     let container = true;
//     _.find(item, (field) => {
//       if (!_.isPlainObject(field)) {
//         container = false;
//
//         return true;
//       }
//     });
//
//     return container;
//   };
//
//   const recursive = (obj, rootPath) => _.find(obj, (item, name) => {
//     const itemPath = _.trim(`${rootPath}.${name}`, '.');
//
//     if (_.isPlainObject(item) && isContainer(item)) {
//       return recursive(item, itemPath);
//     }
//     else {
//       // it's field
//       return cb(item, itemPath);
//     }
//   });
//
//   return recursive(rootObject, '');
// },

// parseValidateCbReturn(cbReturn) {
//   const invalidMsg = (_.isString(cbReturn) && cbReturn !== '') ? cbReturn : undefined;
//   let result;
//   if (cbReturn === true) {
//     result = true;
//   }
//   else if (invalidMsg) {
//     result = invalidMsg;
//   }
//   else {
//     result = false;
//   }
//
//   return {
//     valid: cbReturn === true,
//     invalidMsg,
//     result,
//   };
// },
