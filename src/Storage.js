import _ from 'lodash';
import { extendDeep } from './helpers';

export default class Storage {
  constructor() {
    this._store = {
      formState: {},
      fieldsState: {},
      userInputs: {},
      outerValues: {},

      // name: value or parent.name: value

      // fieldsValue: {},
      // fieldsInitialValue: {},
    };
  }

  generateNewFormState() {
    return {
      invalidMsgs: {},
      dirty: false,
      touched: false,
      submitting: false,
      valid: true,
    };
  }

  generateNewFieldState(name) {
    return {
      name: name,
      dirty: false,
      touched: false,
      valid: true,
      invalidMsg: undefined,
      //validateRule: null,
      saving: false,
      disabled: false,
      focused: false,
    };
  }

  getWholeStorageState() {
    return _.cloneDeep(this._store);
  }

  // combined values
  get values() {
    return _.defaultsDeep(_.cloneDeep(this._store.userInputs), this._store.outerValues);
  }

  getUserInput(pathToField) {
    return _.cloneDeep(_.get(this._store.userInputs, pathToField));
  }
  getOuterValue(pathToField) {
    return _.cloneDeep(_.get(this._store.outerValues, pathToField));
  }
  getValue(pathToField) {
    const value = _.get(this._store.userInputs, pathToField);
    if (!_.isUndefined(value)) return _.cloneDeep(value);
    // else returns outer value
    return _.get(this._store.outerValues, pathToField);
  }

  setUserInput(pathToField, newValue) {
    _.set(this._store.userInputs, pathToField, newValue);
  }
  setOuterValue(pathToField, newValue) {
    _.set(this._store.outerValues, pathToField, newValue);
  }


  getFormState(stateName) {
    return _.cloneDeep(_.get(this._store, `formState.${stateName}`));
  }
  getFieldState(pathToField, stateName) {
    return _.cloneDeep(_.get(this._store.fieldsState, `${pathToField}.${stateName}`));
  }

  /**
   * Set form's state. Only primitive, not container or array
   * @param stateName
   * @param newValue
   */
  setFormState(stateName, newValue) {
    _.set(this._store, `formState.${stateName}`, newValue);
  }


  /**
   * Set field's state - primitive value, not container or array
   * @param pathToField
   * @param newState
   */
  setFieldState(pathToField, newState) {
    //_.set(this._store, `fieldsState.${pathToField}.${stateName}`, newValue);
    if (_.isUndefined(this._store.fieldsState[pathToField])) {
      this._store.fieldsState[pathToField] = {};
    }
    extendDeep(this._store.fieldsState[pathToField], newState);
  }

}
