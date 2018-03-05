formHelper = require('../../src/index')


describe 'Functional. nestedFields.', ->
  describe 'field saving.', ->
    beforeEach () ->
      this.form = formHelper.newForm()
      this.form.init(['nested.name'])

    it 'initial values', ->
      assert.equal(this.form.fields.nested.name.name, 'name')
      assert.equal(this.form.fields.nested.name.path, 'nested.name')
      assert.isUndefined(this.form.fields.nested.name.value)
      assert.isUndefined(this.form.fields.nested.name.savedValue)

    it 'user input', ->
      this.form.fields.nested.name.handleChange('newValue')
      assert.equal(this.form.fields.nested.name.value, 'newValue')
      assert.isUndefined(this.form.fields.nested.name.savedValue)
      assert.isTrue(this.form.fields.nested.name.dirty)
      assert.isTrue(this.form.fields.nested.name.touched)

      assert.deepEqual(this.form.values, {nested: {name: 'newValue'}})
      assert.isTrue(this.form.dirty)
      assert.isTrue(this.form.touched)

    it 'saved change', ->
      this.form.fields.nested.name.setSavedValue('savedValue')
      assert.equal(this.form.fields.nested.name.value, 'savedValue')
      assert.equal(this.form.fields.nested.name.savedValue, 'savedValue')

      assert.deepEqual(this.form.values, {nested: {name: 'savedValue'}})

    it 'validation', ->
      this.form.setValidateCb((errors) -> errors.nested.name = 'errorMsg')
      this.form.fields.nested.name.handleChange('newValue')

      assert.isFalse(this.form.fields.nested.name.valid)
      assert.equal(this.form.fields.nested.name.invalidMsg, 'errorMsg')
      assert.isFalse(this.form.valid)
      assert.deepEqual(this.form.invalidMessages, [{ path: 'nested.name', message: 'errorMsg' }])

    it 'events', ->
      this.fieldOnChangeHandler = sinon.spy()
      this.formOnChangeHandler = sinon.spy()
      this.form.fields.nested.name.onChange(this.fieldOnChangeHandler)
      this.form.onChange(this.formOnChangeHandler)

      this.form.fields.nested.name.handleChange('userValue')
      expect(this.fieldOnChangeHandler).to.have.been.calledOnce
      expect(this.fieldOnChangeHandler).to.have.been.calledWith({ fieldName: "nested.name", oldValue: undefined, value: "userValue" })
      expect(this.formOnChangeHandler).to.have.been.calledOnce
      expect(this.formOnChangeHandler).to.have.been.calledWith({'nested.name': 'userValue'})

    it 'saving', ->
      this.saveHandler = sinon.spy();
      this.form.fields.nested.name.onSave(this.saveHandler)
      this.form.fields.nested.name.handleChange('newValue')
      this.form.fields.nested.name._debouncedCall.flush()

      expect(this.saveHandler).to.have.been.calledOnce
      expect(this.saveHandler).to.have.been.calledWith('newValue')

  describe 'form saving.', ->
    beforeEach () ->
      this.form = formHelper.newForm()
      this.form.init(['nested.name'])
      this.formSaveHandler = sinon.spy();

    it 'saving', ->
      this.form.onSave(this.formSaveHandler)
      this.form.fields.nested.name.setValue('newValue')
      this.form.save()

      expect(this.formSaveHandler).to.have.been.calledOnce
      expect(this.formSaveHandler).to.have.been.calledWith({ nested: { name: "newValue" } })
