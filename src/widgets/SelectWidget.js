import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import ModalDropdown from 'react-native-modal-dropdown';
import {
  StyleSheet, Platform, Text, TouchableOpacity, View,
} from 'react-native';
import { ViewPropTypes } from 'deprecated-react-native-prop-types';
import Picker from '@react-native-picker/picker';
import {
  isArray, isNaN, noop, without,
} from 'lodash';
import { Icon } from 'react-native-elements';
import { useOnChange } from '../utils';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    marginBottom: 10,
  },
  pickerContainer: {
    width: '100%',
    marginBottom: 10,
  },
  picker: {
    width: '100%',
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingLeft: 0,
    marginLeft: 0,
  },
  item: {
    fontSize: 15,
    lineHeight: 20,
    paddingLeft: 10,
    paddingVertical: 15,
  },
  dropdown: {
    width: '80%',
    elevation: 5,
    backgroundColor: '#FFFFFF',
  },
  icon: {
    fontSize: 12,
    fontWeight: '400',
    color: '#697079',
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
    hasError,
    style,
    placeholder,
    onFocus,
    onBlur,
  } = props;

  useEffect(() => () => Picker.hide(), []);

  const onChange = useOnChange({ ...props, parser });

  let values = uiSchema['ui:enum'] || schema.enum || [];
  if (isArray(uiSchema['ui:enumExcludes'])) {
    values = without(values, uiSchema['ui:enumExcludes']);
  }
  const labels = uiSchema['ui:enumNames'] || schema.enumNames || values;

  const onPickerConfirm = (val) => {
    onChange(val[0]);
    onBlur && onBlur();
  };

  const onPickerSelect = (val) => {
    onChange(val[0]);
  };

  const onTogglePicker = () => {
    Picker.isPickerShow((status) => {
      if (status) {
        Picker.hide();
      } else {
        Picker.init({
          pickerData: labels,
          selectedValue: [value || labels[0]],
          pickerCancelBtnText: '',
          pickerConfirmBtnText: 'Done',
          pickerConfirmBtnColor: [0, 122, 255, 1],
          pickerTitleText: '',
          pickerRowHeight: 40,
          onPickerConfirm,
          onPickerSelect,
        });

        Picker.show();
        onFocus && onFocus();
        onChange(value || labels[0]);
      }
    });
  };

  const onSelect = (index) => {
    onChange(labels[index]);
  };

  const placeholderStyle = theme.input[hasError ? 'error' : 'regular'].placeholder;

  const dropdownHeight = labels.length * 50;

  return Platform.OS === 'ios'
    ? (
      <TouchableOpacity
        style={[
          styles.container,
          theme.input.regular.border,
          hasError ? theme.input.error.border : {},
          style,
        ]}
        onPress={onTogglePicker}
        activeOpacity={0.7}
      >
        {placeholder
          ? (
            <Text style={[theme.input.regular.text, placeholderStyle]}>
              {placeholder}
            </Text>
          )
          : (
            <Text style={theme.input.regular.text}>
              {value}
            </Text>
          )}
        <Icon
          color="#697079"
          size={25}
          name="chevron-down"
          type="material-community"
        />
      </TouchableOpacity>
    )
    : (
      <ModalDropdown
        style={styles.pickerContainer}
        textStyle={[theme.input.regular.text]}
        dropdownTextStyle={[theme.input.regular.text, styles.item]}
        dropdownStyle={[styles.dropdown, { height: dropdownHeight > 200 ? 200 : dropdownHeight }]}
        options={labels}
        dropdownListProps={{}}
        onSelect={onSelect}
        renderSeparator={() => <View />}
      >
        <View style={[styles.picker,
          theme.input.regular.border, hasError ? theme.input.error.border : {}, style]}
        >
          {placeholder
            ? (
              <Text style={[theme.input.regular.text, placeholderStyle]}>
                {placeholder}
              </Text>
            )
            : (
              <Text style={theme.input.regular.text}>
                {value}
              </Text>
            )}
          <Icon
            color="#697079"
            size={25}
            name="chevron-down"
            type="material-community"
          />
        </View>
      </ModalDropdown>
    );
};

SelectWidget.propTypes = {
  theme: PropTypes.shape().isRequired,
  schema: PropTypes.shape().isRequired,
  uiSchema: PropTypes.shape().isRequired,
  hasError: PropTypes.bool.isRequired,
  value: PropTypes.any, // eslint-disable-line
  style: ViewPropTypes.style,
  placeholder: PropTypes.string,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
};

SelectWidget.defaultProps = {
  value: '',
  placeholder: '',
  style: {},
  onBlur: noop,
  onFocus: noop,
};

export default SelectWidget;
