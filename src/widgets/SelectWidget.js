import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import Icon from 'react-native-web-ui-components/Icon';
import {StyleSheet, Platform, Text, TouchableOpacity} from 'react-native';
import Picker from 'react-native-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import { isArray, isNaN, without } from 'lodash';
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
  icon: {
    fontSize: 12,
    fontWeight: '400',
    color: '#697079'
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
  } = props;

  useEffect(() => {
    return () => Picker.hide();
  }, []);

  const onChange = useOnChange({ ...props, parser });

  let values = uiSchema['ui:enum'] || schema.enum || [];
  if (isArray(uiSchema['ui:enumExcludes'])) {
    values = without(values, uiSchema['ui:enumExcludes']);
  }
  const labels = uiSchema['ui:enumNames'] || schema.enumNames || values;

  const onTogglePicker = () => {
    Picker.isPickerShow(status => {
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
        });

        Picker.show();
      }
    });
  };

  const onPickerConfirm = val => {
    onChange(val[0]);
  };

  const onSelect = (item) => {
    onChange(item.value);
  };

  return Platform.OS === 'ios' ?
      (
          <TouchableOpacity
              style={[
                styles.container,
                theme.input.regular.border,
                hasError ? theme.input.error.border : {}
              ]}
              onPress={onTogglePicker}
              activeOpacity={0.7}>
            <Text style={theme.input.regular.text}>
              {value}
            </Text>
            <Icon style={styles.icon} name="chevron-down" />
          </TouchableOpacity>
      ) :
      (
          <DropDownPicker
            items={labels.map(item => ({
              label: item,
              value: item
            }))}
            defaultValue={value}
            itemStyle={styles.item}
            style={[styles.picker, hasError ? theme.input.error.border : {}]}
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
  value: PropTypes.any, // eslint-disable-line
};

SelectWidget.defaultProps = {
  value: '',
};

export default SelectWidget;
