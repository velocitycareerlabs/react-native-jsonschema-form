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
import { titleize } from 'underscore.string';
import Screen from 'react-native-web-ui-components/Screen';
import Icon from 'react-native-web-ui-components/Icon';
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

const uiTitleRegex = /\.ui_/;

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

  const screenType = Screen.getType();
  const title = getTitle(uiSchema['ui:title'] || FIELD_TITLE, {
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
    screenType,
    propertySchema,
    propertyUiSchema,
    PropertyField,
    axis: options.axis || 'y',
    minimumNumberOfItems: (
      options.minimumNumberOfItems === undefined
      || options.minimumNumberOfItems === null
    ) ? 1 : options.minimumNumberOfItems,
    addLabel: options.addLabel || `Add ${formatTitle(title)}`,
    removeLabel: options.removeLabel || 'Remove',
    orderLabel: options.orderLabel || <Icon name="th" />,
    removeStyle: options.removeStyle,
    orderStyle: options.orderStyle,
    addable: options.addable !== false,
    removable: options.removable !== false,
    orderable: options.orderable !== false,
    AddComponent: options.AddComponent || AddHandle,
    OrderComponent: options.OrderComponent || OrderHandle,
    RemoveComponent: options.RemoveComponent || RemoveHandle,
    ItemComponent: options.ItemComponent || Item,
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
    addLabel,
    addable,
    widgets,
    schema,
    uiSchema,
    errors,
    screenType,
    propertyUiSchema,
    minimumNumberOfItems,
    AddComponent,
    ItemComponent,
  } = params;

  const { LabelWidget } = widgets;
  const hasError = isArray(errors) && errors.length > 0 && !errors.hidden;
  const hasTitle = uiSchema['ui:title'] !== false;
  const toggleable = !!uiSchema['ui:toggleable'];
  const missingItems = Math.max(0, minimumNumberOfItems - value.length);

  return (
    <React.Fragment>
      {hasTitle || toggleable ? (
        <LabelWidget
          {...params}
          toggleable={toggleable}
          hasTitle={hasTitle}
          hasError={hasError}
          auto={uiSchema['ui:inline']}
          {...(uiSchema['ui:titleProps'] || {})}
        >
          {title}
        </LabelWidget>
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
            noTitle={screenType !== 'xs' && itemUiSchema['ui:noTitle'] !== false}
            onChangeText={(val) => onChangeText(params, val, index)}
      />
        );
      })}
      {times(missingItems, (index) => {
        const itemUiSchema = adjustUiSchema(propertyUiSchema, value.length + index, params);
        return (
          <ItemComponent
            {...params}
            onRemove={onRemove}
            key={`${review}.${name}.${value.length + index}`}
            propertyName={`${name}.${value.length + index}`}
            propertyValue={getItem(schema)}
            propertyMeta={getItem(schema) || {}}
            propertyErrors={errors && errors[index]}
            propertyUiSchema={itemUiSchema}
            index={index}
            noTitle={screenType !== 'xs' && itemUiSchema['ui:noTitle'] !== false}
            onChangeText={(val) => onChangeText(params, val, index)}
          />
        );
      })}
      {addable && !uiTitleRegex.test(name) ? (
        <AddComponent {...params} onPress={onAdd} addLabel={addLabel} />
      ) : null}
    </React.Fragment>
  );
};

export default ArrayWidget;
