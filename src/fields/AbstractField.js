import React from 'react';
import { StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';
import {last, isArray, isString, noop} from 'lodash';
import {
  getComponent,
  getTitle,
  FIELD_TITLE,
  toPath,
} from '../utils';
import ArrayWidget from '../widgets/ArrayWidget';

const styles = StyleSheet.create({
  field: {},
  fieldInline: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  container: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  containerWithLabel: {
    height: 60,
  },
  leftRow: {
    paddingRight: 8,
    paddingLeft: 32
  },
  rightRow: {
    paddingLeft: 8,
  },
  fullRow: {
    paddingHorizontal: 32
  }
});

class AbstractField extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      inFocus: false
    };
  }

  static propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    update: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape(),
    ]).isRequired,
    schema: PropTypes.shape().isRequired,
    uiSchema: PropTypes.shape().isRequired,
    clearCache: PropTypes.bool.isRequired,
    widgets: PropTypes.shape().isRequired,
    required: PropTypes.shape().isRequired,
    noTitle: PropTypes.bool,
    titleOnly: PropTypes.bool,
    zIndex: PropTypes.number,
    meta: PropTypes.any, // eslint-disable-line
    errors: PropTypes.any, // eslint-disable-line
    value: PropTypes.any, // eslint-disable-line
    onFocus: PropTypes.func,
    activeField: PropTypes.string.isRequired,
  };

  static defaultProps = {
    noTitle: false,
    titleOnly: false,
    errors: {},
    value: undefined,
    zIndex: 0,
    onFocus: noop,
  };

  shouldComponentUpdate(nextProps, nextState) {
    const { clearCache, update, name, activeField } = nextProps;
    const { inFocus } = nextState;
    return (
        name === '' ||
        clearCache ||
        update === 'all' ||
        update[name] ||
        inFocus !== this.state.inFocus ||
        this.props.activeField !== activeField ||
        false
    );
  }

  getDefaultWidget() { // eslint-disable-line
    throw new Error('Abstract field cannot be used.');
  }

  renderErrors() {
    const { widgets, uiSchema, errors, schema } = this.props;

    const { ErrorWidget } = widgets;
    const leftRow = uiSchema['ui:leftRow'] ? styles.leftRow : {};
    const rightRow = uiSchema['ui:rightRow'] ? styles.rightRow : {};
    const fullRow = schema.format === 'date-time' ? styles.fullRow : {};

    return errors.filter(isString).map((error, i) => (
      <ErrorWidget
        uiSchema={uiSchema}
        key={error}
        first={i === 0}
        last={i === errors.length - 1}
        auto={uiSchema['ui:inline']}
        style={{...leftRow, ...rightRow, ...fullRow}}
        {...(uiSchema['ui:errorProps'] || {})}
      >
        {error}
      </ErrorWidget>
    ));
  }

  renderTitle(hasError, params) {
    const {
      id,
      name,
      widgets,
      schema,
      uiSchema,
      noTitle,
      required,
    } = this.props;
    const { inFocus } = this.state;
    if (!inFocus && !params.value) {
      return null;
    }
    const hasTitle = !(
      noTitle
      || uiSchema['ui:noLabel']
      || uiSchema['ui:title'] === false
      || schema.type === 'object'
      || this.cache === ArrayWidget
    );
    if (!uiSchema['ui:toggleable'] && !hasTitle) {
      return null;
    }
    const { LabelWidget } = widgets;
    let title = getTitle(uiSchema['ui:title'] || FIELD_TITLE, params);
    if (required[toPath(name, '[]')]) {
      title += '*';
    }
    const leftRow = uiSchema['ui:leftRow'] ? styles.leftRow : {};
    const rightRow = uiSchema['ui:rightRow'] ? styles.rightRow : {};
    const fullRow = schema.format === 'date-time' ? styles.fullRow : {};

    return (
      <LabelWidget
        {...this.props}
        className={`${id}-title ${id}-title-${name.replace(/\./g, '-')}`}
        toggleable={!!uiSchema['ui:toggleable']}
        hasTitle={hasTitle}
        hasError={hasError}
        auto={uiSchema['ui:inline']}
        style={{...leftRow, ...rightRow, ...fullRow}}
        {...(uiSchema['ui:titleProps'] || {})}
      >
        {title}
      </LabelWidget>
    );
  }

  getPlaceholder(params) {
    const {
      name,
      schema,
      uiSchema,
      noTitle,
      required,
      value,
    } = this.props;
    const { inFocus } = this.state;
    if (inFocus || value) {
      return '';
    }
    const hasTitle = !(
        noTitle
        || uiSchema['ui:title'] === false
        || schema.type === 'object'
        || this.cache === ArrayWidget
    );
    if (!uiSchema['ui:toggleable'] && !hasTitle) {
      return '';
    }
    let title = getTitle(uiSchema['ui:title'] || FIELD_TITLE, params);
    if (required[toPath(name, '[]')]) {
      title += '*';
    }
    return title;
  }

  onFocus = () => {
    const {onFocus} = this.props;
    if (onFocus) {
      onFocus();
    }
    this.setState(() => ({inFocus: true}));
  };

  onBlur = () => {
    this.setState(() => ({inFocus: false}));
  };

  render() {
    const {
      id,
      name,
      meta,
      schema,
      uiSchema,
      widgets,
      errors,
      value,
      titleOnly,
      zIndex,
      clearCache,
      activeField,
    } = this.props;
    const { inFocus } = this.state;

    if (clearCache) {
      this.cache = null;
    }
    if (!this.cache) {
      if (this.getWidget) {
        this.cache = this.getWidget(this.props);
      }
      if (!this.cache) {
        this.cache = getComponent(uiSchema['ui:widget'], 'Widget', widgets);
      }
      if (!this.cache) {
        this.cache = this.getDefaultWidget(this.props);
      }
    }
    const Widget = this.cache;
    const hasError = (
      schema.type !== 'object'
      && (schema.type !== 'array' || Widget.hideable === false)
      && isArray(errors)
      && errors.length > 0
      && (!errors.hidden || Widget.hideable === false)
    );
    if (hasError && errors.lastValue === undefined) {
      errors.lastValue = value;
    }
    if (Widget.custom) {
      return <Widget {...this.props} hasError={hasError} />;
    }

    const containerProps = uiSchema['ui:containerProps'] || {};
    if (uiSchema['ui:widget'] === 'hidden') {
      if (!hasError) {
        return null;
      }
      // Show errors for hidden fields
      return (
        <View {...containerProps}>
          {this.renderErrors()}
        </View>
      );
    }
    const key = last(name.split('.'));
    const params = {
      key,
      name,
      value,
    };
    const placeholder = this.getPlaceholder(params);
    return (
      <View
        {...containerProps}
        style={[
          styles.container,
          uiSchema['ui:inline'] ? styles.fieldInline : styles.field,
          containerProps.style || {},
          { zIndex },
        ]}
      >
        {this.renderTitle(hasError, params)}
        {!titleOnly || schema.type === 'object' || schema.type === 'array' ? (
          <React.Fragment>
            <Widget
              {...this.props}
              style={!inFocus && !value ? styles.containerWithLabel : null}
              auto={uiSchema['ui:inline']}
              hasError={hasError}
              placeholder={placeholder}
              disabled={!!(meta && meta['ui:disabled'])}
              readonly={!!uiSchema['ui:readonly']}
              onFocus={this.onFocus}
              onBlur={this.onBlur}
              rightRow={uiSchema['ui:rightRow']}
              leftRow={uiSchema['ui:leftRow']}
              {...(uiSchema['ui:widgetProps'] || {})}
              activeField={activeField}
              inFocus={activeField === name && inFocus}
            />
            {hasError ? this.renderErrors() : null}
          </React.Fragment>
        ) : null}
      </View>
    );
  }
}

export default AbstractField;
