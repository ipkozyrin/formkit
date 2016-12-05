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

    const cb = (value) => {
      if (this.$onSaveCallback) this.$onSaveCallback(value);
      this.$form.$handleFieldSave(this.$pathToField, value);
    };

    if (force) {
      // cancelling
      this._debouncedCb.cancel();
      // save without debounce
      cb(this.$fieldState.getValue());
    }
    else {
      this._debouncedCb(cb, this.$fieldState.getValue());
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
    this.$form.$$handleFieldStateChange('dirty', newValue);
  }

}
