import * as _ from 'lodash';
import FieldEventData from './interfaces/FieldEventData';
import Storage from './Storage';
import FieldState from './interfaces/FieldState';
import FormEventData from './interfaces/FormEventData';
import FormStorage from './FormStorage';


export type FieldEventName = 'change' | 'storage' | 'saveStart' | 'saveEnd';
export type FieldStateName = 'defaultValue' | 'dirty' | 'disabled' | 'editedValue' | 'focused'
  | 'initial' | 'invalidMsg' | 'touched' | 'savedValue' | 'saving';


export default class FieldStorage {
  private readonly storage: Storage;
  private readonly formStorage: FormStorage;

  constructor(storage: Storage, formStorage: FormStorage) {
    this.storage = storage;
    this.formStorage = formStorage;
  }

  initState(pathToField: string, initialState: FieldState): void {
    const newState = {
      ...this.storage.generateNewFieldState(),
      ...initialState,
    };

    this.setStateSilent(pathToField, newState);
  }

  /**
   * get current value
   * @param {string} pathToField - path to your field
   * @return {*}
   */
  getCombinedValue(pathToField: string): any {
    return this.storage.getCombinedValue(pathToField);
  }

  getState(pathToField: string, stateName: FieldStateName): any {
    return this.storage.getFieldState(pathToField, stateName);
  }

  getWholeState(pathToField: string): FieldState {
    return this.storage.getWholeFieldState(pathToField);
  }

  setStateSilent(pathToField: string, partlyState: FieldState): void {
    this.storage.setFieldState(pathToField, partlyState);
  }

  emitStorageEvent(pathToField: string, newState: FieldState, prevState: FieldState): void {
    if (_.isEqual(prevState, newState)) return;

    const fieldEventdata: FieldEventData = {
      field: pathToField,
      target: 'field',
      event: 'storage',
      state: newState,
      prevState,
    };

    this.emit(pathToField, 'storage', fieldEventdata);

    // const formEventData: FormEventData = {
    //   target: 'form',
    //   event: 'storage',
    //   state: newState,
    //   prevState,
    // };
    // // emit form event
    // this.storage.events.emit('storage', formEventData);
    //
    this.formStorage.emitStorageEvent(newState, prevState);
  }

  on(pathToField: string, eventName: FieldEventName, cb: (data: FieldEventData) => void): void {
    this.storage.events.on(`${pathToField}.${eventName}`, cb);
  }

  emit(pathToField: string, eventName: FieldEventName, data: FieldEventData): void {
    this.storage.events.emit(`${pathToField}.${eventName}`, data);
  }

  off(pathToField: string, eventName: FieldEventName, cb: (data: FieldEventData) => void): void {
    this.storage.events.off(`${pathToField}.${eventName}`, cb);
  }

  /**
   * Field means unsaved if its value not equal to previously saved value.
   * @param {string} pathToField - path to your field
   * @return {boolean} - true if field unsaved
   */
  isFieldUnsaved(pathToField: string): boolean {
    const savedValue = this.getState(pathToField, 'savedValue');
    const editedValue = this.getState(pathToField, 'editedValue');

    return savedValue !== editedValue;
  }

}
