import _ from 'lodash';

import FormHandlers from './FormHandlers';


export default class FormBase {
  constructor(storage, config, events, log) {
    this.$storage = storage;
    this.$events = events;
    this.$config = config;
    this.$log = log;
    this.$handlers = new FormHandlers(this);

    // set initial form state
    var newFormState = this.$storage.generateNewFormState();
    this.$storage.setFormState(newFormState);

    this.__fields = {};
  }

  get fields() {return this.__fields}
  get values() {return this.$storage.values}
  get dirty() {return this.$storage.getFormState('dirty')}
  get touched() {return this.$storage.getFormState('touched')}
  get submitting() {return this.$storage.getFormState('submitting')}
  get valid() {return this.$storage.getFormState('valid')}
  get invalidMsgs() {return this.$storage.getFormState('invalidMsgs')}

  set values(newValues) {this._hardUpdateValues(newValues)}

  $getWholeStorageState() {
    return this.$storage.getWholeStorageState();
  }

  _hardUpdateValues(newValues) {
    _.each(newValues, (value, fieldName) => {
      if (this.fields[fieldName]) this.fields[fieldName].value = value;
    });
  }

}
