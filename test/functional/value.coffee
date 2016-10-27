formHelper = require('../../src/index').default

describe 'Functional. Get and set value.', ->
  beforeEach () ->
    this.form = formHelper()
    this.form.init({name: null})

  it 'set new value to field. initial = null', ->
    this.form.fields.name.handleChange('newValue')
    assert.equal(this.form.fields.name.value, 'newValue')
    assert.equal(this.form.fields.name.initialValue, null)

  it 'set new value to field. initial = initValue', ->
    this.form.init({name: 'initValue'})
    this.form.fields.name.handleChange('newValue')
    assert.equal(this.form.fields.name.value, 'newValue')
    assert.equal(this.form.fields.name.initialValue, 'initValue')

  it 'set new values to whore form', ->
    this.form.setValues({name: 'newValue'})
    assert.deepEqual(this.form.values, {name: 'newValue'})
    assert.deepEqual(this.form.initialValues, {name: null})
    assert.equal(this.form.fields.name.value, 'newValue')
    assert.equal(this.form.fields.name.initialValue, null)

  it 'getValues()', () ->
    this.form.setValues({name: 'newValue'})
    assert.deepEqual(this.form.getValues(), {name: 'newValue'})

  it 'form\'s values', () ->
    this.form.setValues({name: 'newValue'})
    assert.equal(this.form.values.name, 'newValue')
