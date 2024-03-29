import React, { isValidElement, cloneElement } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet, Platform, Keyboard, View, Text,
} from 'react-native';
import { ViewPropTypes } from 'deprecated-react-native-prop-types';
import {
  set,
  get,
  each,
  noop,
  cloneDeep,
  isString,
  isArray,
  isError,
  isPlainObject,
} from 'lodash';
import { withTheme } from './Theme';
import {
  toPath,
  expand,
  getMetas,
  getValues,
  getErrors,
  getRequired,
  getRequiredAndNotHiddenFields,
  getStructure,
  getExceptions,
  normalized,
} from './utils';
import fields from './fields';
import defaultWidgets from './widgets';
import FormEvent from './FormEvent';
import DefaultCancelButton from './CancelButton';
import DefaultSubmitButton from './SubmitButton';

export { UIProvider } from './UIProvider';

export {
  FIELD_KEY,
  FIELD_NAME,
  FIELD_VALUE,
  FIELD_TITLE,
} from './utils';

const emptyObject = {};

const emptySchema = {
  type: 'object',
  properties: [],
};

const formStyle = StyleSheet.create({
  form: {
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: 'white',
    borderRadius: 14,
    shadowColor: '#FF2D55',
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: {
      height: 0,
      width: 0,
    },
    marginBottom: 25,
    ...Platform.select({
      android: {
        borderRadius: 4,
        elevation: 3,
      },
    }),
  },
  error: {
    color: '#FF2D55',
  },
  buttonsBlock: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 25,
    marginTop: 25,
  },
  buttonLeft: {
    marginRight: 5,
  },
  buttonRight: {
    marginLeft: 5,
  },
});

const defaultReject = (err) => { throw err; };

const addToObject = obj => (v, k) => Object.assign(obj, { [k]: v });

const addToArray = arr => v => arr.push(v);

class JsonSchemaForm extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    schema: PropTypes.shape(),
    uiSchema: PropTypes.shape(),
    metaSchema: PropTypes.shape(),
    errorSchema: PropTypes.shape(),
    formData: PropTypes.shape(),
    children: PropTypes.node,
    onRef: PropTypes.func,
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func,
    onSuccess: PropTypes.func,
    onError: PropTypes.func,
    onInit: PropTypes.func,
    buttonPosition: PropTypes.oneOf(['left', 'right', 'center']),
    cancelButton: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    CancelButton: PropTypes.elementType,
    submitButton: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    SubmitButton: PropTypes.elementType,
    scroller: PropTypes.shape(),
    widgets: PropTypes.shape(),
    filterEmptyValues: PropTypes.bool,
    insideClickRegex: PropTypes.instanceOf(RegExp),
    customSubmitButton: PropTypes.node,
    customFormStyles: ViewPropTypes.style,
  };

  static defaultProps = {
    name: null,
    formData: emptyObject,
    schema: emptySchema,
    uiSchema: emptyObject,
    metaSchema: undefined,
    errorSchema: emptyObject,
    children: null,
    onRef: noop,
    onChange: noop,
    onSubmit: noop,
    onCancel: noop,
    onSuccess: noop,
    onError: noop,
    onInit: noop,
    buttonPosition: 'right',
    cancelButton: true,
    CancelButton: DefaultCancelButton,
    submitButton: true,
    SubmitButton: DefaultSubmitButton,
    scroller: null,
    widgets: emptyObject,
    filterEmptyValues: false,
    insideClickRegex: undefined,
    customSubmitButton: null,
    customFormStyles: {},
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const state = {
      clearCache: false,
    };
    let clear = false;
    let {
      metas,
      values,
      errors,
      schema,
      uiSchema,
    } = prevState;

    // If the schema or uiSchema is different, we recalculate everything
    const { schemaProp, uiSchemaProp } = prevState;
    if (nextProps.schema !== schemaProp || nextProps.uiSchema !== uiSchemaProp) {
      clear = true;
      const structure = getStructure(nextProps.schema, nextProps.uiSchema);
      schema = structure.schema;
      uiSchema = structure.uiSchema;
      state.schema = schema;
      state.uiSchema = uiSchema;
      state.update = 'all';
      state.clearCache = true;
      state.schemaProp = nextProps.schema;
      state.uiSchemaProp = nextProps.uiSchema;
      state.required = getRequired(schema);
    }

    // Check for formData updates
    if (clear || nextProps.formData !== prevState.formDataProp) {
      values = getValues(cloneDeep(nextProps.formData), schema);
      state.values = values;
      state.update = 'all';
      state.formDataProp = nextProps.formData;
    }

    // Check for errorSchema updates
    if (clear || nextProps.errorSchema !== prevState.errorSchemaProp) {
      errors = getErrors(cloneDeep(nextProps.errorSchema), schema);
      state.errors = errors;
      state.update = 'all';
      state.errorSchemaProp = nextProps.errorSchema;
    }

    // Check for metaSchema updates
    if (clear || nextProps.metaSchema !== prevState.metaSchemaProp) {
      metas = getMetas(cloneDeep(nextProps.metaSchema || values), schema, uiSchema);
      state.metas = metas;
      state.update = 'all';
      state.metaSchemaProp = nextProps.metaSchema;
    }

    return state;
  }

  constructor(props) {
    super(props);

    const {
      name,
      onRef,
      widgets,
      formData,
      schema,
      uiSchema,
      metaSchema,
      errorSchema,
      insideClickRegex,
      onInit,
    } = props;

    this.id = `Form__${name || Math.random().toString(36).substr(2, 9)}`;
    this.fieldRegex = insideClickRegex || new RegExp(`(${this.id}-field|react-datepicker)`);
    this.mountSteps = [];
    this.widgets = Object.assign({}, defaultWidgets, widgets);

    const structure = getStructure(schema, uiSchema);
    const values = getValues(cloneDeep(formData), structure.schema);
    const errors = getErrors(cloneDeep(errorSchema), structure.schema);
    const metas = getMetas(cloneDeep(metaSchema || values), structure.schema, structure.uiSchema);
    const required = getRequired(structure.schema);
    const requiredAndNotHiddenFields = getRequiredAndNotHiddenFields(required, structure.uiSchema);

    if (onInit) {
      onInit({ values });
    }

    this.state = {
      values,
      errors,
      metas,
      required,
      requiredAndNotHiddenFields,
      schema: structure.schema,
      uiSchema: structure.uiSchema,
      formDataProp: formData,
      schemaProp: schema,
      uiSchemaProp: uiSchema,
      errorSchemaProp: errorSchema,
      metaSchemaProp: metaSchema,
      update: {},
      clearCache: false,
      activeField: '',
    };

    onRef(this);
  }

  componentDidMount() {
    if (Platform.OS === 'web') {
      window.addEventListener('click', this.clickListener);
    }
    this.mounted = true;
    this.onMount();
  }

  componentWillUnmount() {
    this.mounted = false;
    if (Platform.OS === 'web') {
      window.removeEventListener('click', this.clickListener);
    }
  }

  onMount(handler) {
    if (handler) {
      this.mountSteps.push(handler);
    }
    if (this.mounted) {
      const fn = this.mountSteps.shift();
      if (fn) {
        fn.call(this);
      }
    }
  }

  onChange = (value, name, params = {}) => {
    const {
      update = [],
      nextErrors = false,
      nextMeta = false,
      silent = false,
    } = params;

    const { metas, values, errors } = this.state;
    const { onChange } = this.props;

    const event = new FormEvent('change', {
      name,
      value,
      values,
      metas,
      nextMeta,
      nextErrors,
      silent,
      path: toPath(name),
      update: [name].concat(update),
    });

    this.setState({
      isSubmitError: false,
    });

    this.run(onChange(event), () => {
      if (!event.isDefaultPrevented()) {
        const { path } = event.params;
        set(event.params.values, path, event.params.value);
        if (event.params.nextMeta !== false) {
          set(metas, path, event.params.nextMeta);
        }
        if (event.params.nextErrors !== false) {
          set(errors, path, event.params.nextErrors);
        }
        const error = get(errors, path);
        if (error) {
          if (normalized(error.lastValue) !== normalized(event.params.value)) {
            error.hidden = true;
          } else {
            error.hidden = false;
          }
        }
        this.onMount(() => this.setState({
          metas: { ...metas },
          errors: { ...errors },
          values: { ...event.params.values },
          update: expand(event.params.update),
        }));
      }
    });
  };

  reset = () => {
    const { schema, uiSchema, formData } = this.props;

    this.setState({
      values: getValues(cloneDeep(formData), getStructure(schema, uiSchema).schema),
      update: 'all',
    });
  }

  clearAll = () => {
    const { schema, uiSchema } = this.props;

    this.setState({
      values: getValues({}, getStructure(schema, uiSchema).schema),
      update: 'all',
    });
  }

  onCancel = () => {
    const { values } = this.state;
    const { onCancel } = this.props;
    const event = new FormEvent('cancel', { values });
    this.run(onCancel(event));
  };

  onSubmit = () => {
    this.setState(() => ({ activeField: '' }));
    if (Platform.OS !== 'web') {
      Keyboard.dismiss();
    }
    setTimeout(() => {
      const {
        uiSchema, metas, values, requiredAndNotHiddenFields,
      } = this.state;
      const { onSubmit, filterEmptyValues } = this.props;
      let nextValues = this.filterDisabled(values, metas);
      if (filterEmptyValues) {
        nextValues = this.filterEmpty(nextValues);
      }

      // eslint-disable-next-line max-len
      const isAllRequiredFieldsFilled = Object.keys(requiredAndNotHiddenFields || {}).reduce((acc, key) => {
        const value = key.split('.').reduce((subAcc, subKey) => (
          {
            values: (subAcc.values || {})[subKey],
            visibilityValues: (subAcc.visibilityValues || {})[subKey],
          }),
        { values: nextValues, visibilityValues: uiSchema });
        const isNotAllVisibleFieldFilled = !(value.values ?? true) && (value.visibilityValues || {})['ui:widget'] !== 'hidden';

        if (isNotAllVisibleFieldFilled) {
          return false;
        }
        return acc;
      }, true);

      if (!isAllRequiredFieldsFilled) {
        this.setState({
          isSubmitError: true,
        });
        return;
      }

      const event = new FormEvent('submit', { values: nextValues });
      this.run(onSubmit(event), (response) => {
        if (!event.isDefaultPrevented()) {
          this.onSuccess(response);
        }
      }, (errorSchema) => {
        if (!event.isDefaultPrevented()) {
          this.onError(errorSchema);
        }
      });
    }, Platform.OS !== 'web' ? 50 : 0);
  };

  onSuccess = (response) => {
    const { schema, values } = this.state;
    const { onSuccess } = this.props;
    const event = new FormEvent('success', {
      values,
      response,
      update: 'all',
    });
    this.run(onSuccess(event), () => {
      if (!event.isDefaultPrevented()) {
        this.onMount(() => this.setState({
          errors: getErrors({}, schema),
          values: event.params.values,
          update: expand(event.params.update),
        }));
      }
    });
  };

  onError = (err) => {
    const { schema } = this.state;
    const { onError } = this.props;
    let errorSchema = err;
    if (isError(errorSchema)) {
      errorSchema = { Error: [err.message] };
    }
    const errors = getErrors(errorSchema || {}, schema);
    const exceptions = getExceptions(errorSchema, errors);
    const event = new FormEvent('error', {
      errors,
      exceptions,
      update: 'all',
    });
    this.run(onError(event), () => {
      if (!event.isDefaultPrevented()) {
        this.onMount(() => this.setState({
          errors: event.params.errors,
          update: expand(event.params.update),
        }));
      }
    });
  };

  cancel = () => this.onCancel();

  submit = () => this.onSubmit();

  run = (maybePromise, resolveHandler, rejectHandler) => {
    const self = this;
    const resolve = resolveHandler || noop;
    const reject = rejectHandler || defaultReject;
    if (maybePromise && maybePromise.then) {
      return maybePromise
        .then((...args) => resolve.call(self, ...args))
        .catch((...args) => reject.call(self, ...args));
    }
    return resolve.call(self, maybePromise);
  };

  setField = (name) => {
    this.setState(() => ({ activeField: name }));
  };

  filterEmpty(values, path = '', type = 'object') {
    const self = this;
    const { required } = self.state;
    const filteredValues = type === 'object' ? {} : [];
    const add = type === 'object' ? addToObject(filteredValues) : addToArray(filteredValues);
    each(values, (v, k) => {
      let empty = false;
      const name = path ? `${path}.${k}` : k;
      let value = v;
      if (isArray(v)) {
        value = self.filterEmpty(v, name, 'array');
        empty = value.length === 0;
      } else if (isPlainObject(v)) {
        value = self.filterEmpty(v, name, 'object');
        empty = Object.keys(value).length === 0;
      } else {
        empty = value === '' || value === undefined || value === null;
      }
      if (required[toPath(name, '[]')] || !empty) {
        add(value, k);
      }
    });
    return filteredValues;
  }

  filterDisabled(values, metas, path = '', type = 'object') {
    const self = this;
    const filteredValues = type === 'object' ? {} : [];
    const add = type === 'object' ? addToObject(filteredValues) : addToArray(filteredValues);
    each(values, (v, k) => {
      const disabled = !!(metas && metas[k] && metas[k]['ui:disabled']);
      if (!disabled) {
        const name = path ? `${path}.${k}` : k;
        let value = v;
        if (isArray(v)) {
          value = self.filterDisabled(v, (metas && metas[k]) || [], name, 'array');
        } else if (isPlainObject(v)) {
          value = self.filterDisabled(v, (metas && metas[k]) || {}, name, 'object');
        }
        add(value, k);
      }
    });
    return filteredValues;
  }

  render() {
    const {
      event,
      schema,
      uiSchema,
      metas,
      values,
      errors,
      update,
      required,
      clearCache,
      activeField,
      isSubmitError,
    } = this.state;

    const {
      children,
      cancelButton,
      CancelButton,
      submitButton,
      SubmitButton,
      customSubmitButton,
      customFormStyles,
    } = this.props;

    const { ObjectField } = fields;
    return (
      <React.Fragment>
        <View style={[formStyle.form, customFormStyles]}>
          <ObjectField
            {...this.props}
            name=""
            id={this.id}
            event={event}
            schema={schema}
            uiSchema={uiSchema}
            meta={metas}
            metas={metas}
            value={values}
            values={values}
            errors={errors}
            update={update}
            required={required}
            fields={fields}
            widgets={this.widgets}
            onChange={this.onChange}
            onSubmit={this.onSubmit}
            renderId={Math.random()}
            clearCache={clearCache}
            setField={this.setField}
            activeField={activeField}
          />
        </View>
        {!!isSubmitError && <Text style={formStyle.error}>Please fill all required fields.</Text>}
        {children || (submitButton === false && cancelButton === false) ? children : (
          <View style={formStyle.buttonsBlock}>
            {cancelButton ? (
              <CancelButton
                onPress={this.onCancel}
                style={formStyle.buttonLeft}
                text={isString(cancelButton) ? cancelButton : 'Cancel'}
              />
            ) : null}
            {submitButton && !customSubmitButton ? (
              <SubmitButton
                style={formStyle.buttonRight}
                onPress={this.onSubmit}
                text={isString(submitButton) ? submitButton : 'Submit'}
              />
            ) : null}
            {isValidElement(customSubmitButton)
              ? cloneElement(customSubmitButton, { onPress: this.onSubmit })
              : null}
          </View>
        )}
      </React.Fragment>
    );
  }
}

export const Form = withTheme('JsonSchemaForm')(JsonSchemaForm);
