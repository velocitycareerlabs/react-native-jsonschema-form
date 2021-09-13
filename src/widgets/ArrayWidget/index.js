import React, { useState } from 'react';
import {
  map,
  each,
  last,
  times,
  isArray,
  isFunction,
  isEmpty
} from 'lodash';
import {Text, View, TouchableOpacity, StyleSheet, Platform} from 'react-native';
import { titleize } from 'underscore.string';
import {Icon} from 'react-native-elements';
import {
  getTitle,
  getComponent,
  FIELD_TITLE,
} from '../../utils';
import AddHandle from './AddHandle';
import OrderHandle from './OrderHandle';
import RemoveHandle from './RemoveHandle';
import Item from './Item';

/* eslint react/no-array-index-key: 0 */

const getItem = (schema) => {
  let newItem = '';
  if (schema.items.type === 'object') {
    newItem = {};
  } else if (schema.items.type === 'array') {
    newItem = [];
  }
  return newItem;
};

const formatTitle = title => titleize(title).replace(/ies$/, 'y').replace(/s$/, '');

const iterateUiSchema = (uiSchema, i) => {
  const widgetProps = uiSchema['ui:widgetProps'] || {};
  const titleProps = uiSchema['ui:titleProps'] || {};
  const errorProps = uiSchema['ui:errorProps'] || {};
  return {
    ...uiSchema,
    'ui:widgetProps': isArray(widgetProps) ? (widgetProps[i] || {}) : widgetProps,
    'ui:titleProps': isArray(titleProps) ? (titleProps[i] || {}) : titleProps,
    'ui:errorProps': isArray(errorProps) ? (errorProps[i] || {}) : errorProps,
  };
};

const adjustUiSchema = (possibleUiSchema, i, props) => {
  let uiSchema = possibleUiSchema;
  if (isFunction(possibleUiSchema['ui:iterate'])) {
    uiSchema = possibleUiSchema['ui:iterate'](i, props);
  }
  const adjustedUiSchema = iterateUiSchema(uiSchema, i);
  each(uiSchema, (uis, key) => {
    if (!/^ui:/.test(key)) {
      adjustedUiSchema[key] = iterateUiSchema(uis, i);
    }
  });
  return adjustedUiSchema;
};

const getProps = (props) => {
  const {
    name,
    schema,
    fields,
    uiSchema,
    value: originalValue,
  } = props;

  const value = isArray(originalValue) ? originalValue : [];

  const title = getTitle(uiSchema['ui:title'] || FIELD_TITLE, {
    name,
    value,
    key: last(name.split('.')),
  });
  const itemTitle = getTitle(uiSchema['ui:itemTitle'] || FIELD_TITLE, {
    name,
    value,
    key: last(name.split('.')),
  });

  const propertySchema = schema.items;
  const propertyUiSchema = uiSchema.items;
  const PropertyField = getComponent(propertySchema.type, 'Field', fields);
  const options = uiSchema['ui:options'] || {};

  const extraProps = {
    value,
    title,
    propertySchema,
    propertyUiSchema,
    PropertyField,
    axis: options.axis || 'y',
    minimumNumberOfItems: (
      options.minimumNumberOfItems === undefined
      || options.minimumNumberOfItems === null
    ) ? 0 : options.minimumNumberOfItems,
    addLabel: options.addLabel || `Add ${formatTitle(title)}`,
    removeLabel: options.removeLabel || 'Remove',
    orderLabel: options.orderLabel,
    removeStyle: options.removeStyle,
    orderStyle: options.orderStyle,
    addable: options.addable !== false,
    removable: options.removable !== false,
    orderable: options.orderable !== false,
    AddComponent: options.AddComponent || AddHandle,
    OrderComponent: options.OrderComponent || OrderHandle,
    RemoveComponent: options.RemoveComponent || RemoveHandle,
    ItemComponent: options.ItemComponent || Item,
    itemTitle: formatTitle(itemTitle)
  };
  return { ...props, ...extraProps };
};

const useOnAdd = ({
  name,
  meta,
  value,
  schema,
  onChange,
  minimumNumberOfItems,
}) => () => {
  let nextValue;
  let nextMeta = meta;
  if (value.length < minimumNumberOfItems) {
    nextValue = value.concat(times(minimumNumberOfItems - value.length + 1, () => getItem(schema)));
    if (meta) {
      nextMeta = nextMeta.concat(times(minimumNumberOfItems - value.length + 1, () => ({})));
    }
  } else {
    nextValue = value.concat([getItem(schema)]);
    if (meta) {
      nextMeta = nextMeta.concat([{}]);
    }
  }
  onChange(nextValue, name, {
    nextMeta: nextMeta || false,
  });
};

const useOnRemove = ({
  name,
  value,
  onChange,
  reorder,
  errors,
  meta,
}) => (index) => {
  const nextValue = (isArray(value) ? value : []).filter((v, i) => (i !== index));
  let nextMeta = (isArray(meta) ? meta : []);
  if (nextMeta) {
    nextMeta = nextMeta.filter((v, i) => (i !== index));
  }
  let nextErrors = (isArray(errors) ? errors : []);
  if (nextErrors) {
    nextErrors = nextErrors.filter((v, i) => (i !== index));
  }
  onChange(nextValue, name, {
    nextMeta: nextMeta || false,
    nextErrors: nextErrors || false,
  });
  setTimeout(reorder);
};

const useReorder = ({ review, setState }) => () => setState({
  refs: [],
  positions: [],
  review: review + 1,
  dragging: null,
});

const onChangeText = (props, val, index) => {
  const nextValue = isEmpty(props.value) ? [val] : map(props.value, (item, key) => index === key ? val : item);
  props.onChange(nextValue, props.name)
}

const ArrayWidget = (props) => {
  const [state, setState] = useState({
    refs: [],
    positions: [],
    review: 0,
    dragging: null,
  });

  const params = getProps({ ...props, ...state });
  const reorder = useReorder({ ...params, setState });

  const onAdd = useOnAdd(params);
  const onRemove = useOnRemove({ ...params, reorder });

  const {
    meta,
    review,
    name,
    value,
    title,
    widgets,
    schema,
    uiSchema,
    errors,
    propertyUiSchema,
    ItemComponent,
    theme
  } = params;

  const { LabelWidget } = widgets;
  const hasError = isArray(errors) && errors.length > 0 && !errors.hidden;
  const hasTitle = uiSchema['ui:title'] !== false;
  const toggleable = !!uiSchema['ui:toggleable'];

  const addComponent = (
      <TouchableOpacity style={styles.icon} activeOpacity={1} onPress={onAdd}>
        <Icon
            color="#FFF"
            size={16}
            name="plus"
            type="material-community"
        />
      </TouchableOpacity>
  );

  return (
    <React.Fragment>
      {(hasTitle || toggleable) && !isEmpty(value) ? (
          <View style={styles.labelContainer}>
            <LabelWidget
                {...params}
                toggleable={toggleable}
                hasTitle={hasTitle}
                hasError={hasError}
                auto
                {...(uiSchema['ui:titleProps'] || {})}
            >
              {title}
            </LabelWidget>
            {addComponent}
          </View>
      ) : null}
      {isEmpty(value) ?
          (
              <View
                  style={[
                    styles.inputTextContainer,
                    theme.input.regular.border
                  ]}
              >
                {hasTitle ?
                    (
                        <Text style={[theme.input.regular.text, theme.input.regular.placeholder]}>
                          {title}
                        </Text>
                    ) :
                    null}
                {addComponent}
              </View>
          ) : null}
      {times(value.length, (index) => {
        const itemUiSchema = adjustUiSchema(propertyUiSchema, index, params);
        return (
          <ItemComponent
            {...params}
            onRemove={onRemove}
            key={`${review}.${name}.${index}`}
            propertyName={`${name}.${index}`}
            propertyValue={value[index]}
            propertyMeta={(meta && meta[index]) || getItem(schema) || {}}
            propertyErrors={errors && errors[index]}
            propertyUiSchema={itemUiSchema}
            index={index}
            onChangeText={(val) => onChangeText(params, val, index)}
      />
        );
      })}
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  labelContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  inputTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: 60,
    paddingVertical: 8,
  },
  icon: {
    height: 20,
    width: 20,
    borderRadius: 10,
    fontWeight: '400',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({ios: {backgroundColor: '#000000'}, android: {backgroundColor: '#7489A8'}})
  }
});

export default ArrayWidget;
