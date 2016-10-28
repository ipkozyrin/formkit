import _ from 'lodash';

import FieldState from './FieldState';

export default class FieldBase {
  constructor(form, fieldName) {
    this.$form = form;
    this.$pathToField = fieldName;
    this.$fieldState = new FieldState(this.$form, this, this.$pathToField);

    this.$onChangeCallback = null;
    this.$onSaveCallback = null;

    this.$debounceTime = 1000;

    this._debouncedCb = _.debounce((cb, value) => {
      cb(value);
    }, this.$debounceTime);
  }

  $startSave(force) {
    // don't save invalid value
    if (!this.$fieldState.getState('valid')) return;

    if (force) {
      // cancelling
      this._debouncedCb.cancel();
      // save without debounce
      if (this.$onSaveCallback) this.$onSaveCallback(this.$fieldState.getValue());
    }
    else {
      if (this.$onSaveCallback) this._debouncedCb(this.$onSaveCallback, this.$fieldState.getValue());
    }
  }

  $updateDirty() {
    var value = this.$fieldState.getValue();
    var initialValue = this.$fieldState.getInitialValue();
    var newValue;

    if (value === '' && (initialValue === '' || _.isNil(initialValue))) {
      // 0 compares as common value.
      newValue = false;
    }
    else {
      // just compare initial value and value
      newValue = value !== initialValue;
    }

    this.$fieldState.setStateValue('dirty', newValue);
    this.$form.$$handleAnyFieldsStateChange('dirty', newValue);
  }

}