import React from 'react';
import PropTypes from 'prop-types';
import {StyleSheet} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { isArray, isNaN, without } from 'lodash';
import StylePropType from 'react-native-web-ui-components/StylePropType';
import { useOnChange } from '../utils';

const styles = StyleSheet.create({
  picker: {
    width: '100%',
    height: 40,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    paddingLeft: 0,
    marginLeft: 0,
  },
  item: {
    justifyContent: 'flex-start',
    paddingLeft: 0,
    marginLeft: 0,
  },
  pickerContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dropdown: {
    width: '100%',
    elevation: 5,
    backgroundColor: '#FFFFFF',
  },
  label: {
    marginLeft: 0,
  },
});

const parser = ({ schema }) => (value) => {
  let parsedValue = value;
  if (schema.type === 'number' || schema.type === 'integer') {
    parsedValue = parseFloat(value);
    if (isNaN(parsedValue)) {
      parsedValue = null;
    }
  } else if (schema.type === 'boolean') {
    parsedValue = value;
  }
  return parsedValue;
};

const SelectWidget = (props) => {
  const {
    schema,
    uiSchema,
    value,
    theme,
  } = props;

  const onChange = useOnChange({ ...props, parser });

  let values = uiSchema['ui:enum'] || schema.enum || [];
  if (isArray(uiSchema['ui:enumExcludes'])) {
    values = without(values, uiSchema['ui:enumExcludes']);
  }
  const labels = uiSchema['ui:enumNames'] || schema.enumNames || values;

  const onSelect = (item) => {
    onChange(item.value);
  };

  return (
      <DropDownPicker
          items={labels.map(item => ({
            label: item,
            value: item
          }))}
          defaultValue={value}
          itemStyle={styles.item}
          style={styles.picker}
          containerStyle={styles.pickerContainer}
          dropDownStyle={styles.dropdown}
          labelStyle={[theme.input.regular.text, styles.label]}
          selectedtLabelStyle={styles.label}
          activeLabelStyle={styles.label}
          activeItemStyle={styles.label}
          onChangeItem={onSelect}
          placeholder=""
      />
  );
};

SelectWidget.propTypes = {
  theme: PropTypes.shape().isRequired,
  schema: PropTypes.shape().isRequired,
  uiSchema: PropTypes.shape().isRequired,
  hasError: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  readonly: PropTypes.bool,
  disabled: PropTypes.bool,
  auto: PropTypes.bool,
  style: StylePropType,
  value: PropTypes.any, // eslint-disable-line
};

SelectWidget.defaultProps = {
  value: '',
  placeholder: '',
  readonly: false,
  disabled: false,
  auto: false,
  style: null,
};

export default SelectWidget;
