import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  StyleSheet, View,
  TouchableOpacity,
  Text,
  Keyboard,
  Platform,
  ViewPropTypes,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  useOnChange,
  usePrevious
} from '../utils';
import {noop, get} from "lodash";
import { LayoutAnimation } from 'react-native';

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    marginBottom: 10
  },
  buttonBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonTitle: {
    fontSize: 16,
    paddingHorizontal: 24,
    paddingVertical: 8
  },
  rightPicker: {
    marginLeft: '-100%'
  },
  inputContainer: {
    justifyContent: 'center',
    width: '100%',
    height: 40,
    paddingVertical: 8
  },
  leftRow: {
    paddingRight: 8,
    paddingLeft: 32
  },
  rightRow: {
    paddingLeft: 8,
    paddingRight: 32
  },
  fullRow: {
    paddingHorizontal: 24
  }
});

const DateWidget = (props) => {
  const {
    uiSchema,
    value,
    hasError,
    theme,
    style,
    placeholder,
    onFocus,
    onBlur,
    activeField,
    name,
    inFocus,
    rightRow,
    leftRow
  } = props;
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const onWrappedChange = useOnChange(props);
  const prevActiveField = usePrevious(activeField);

  const hidePicker = () => {
    const currentDate = value || date;
    const dateToSave = currentDate && moment(new Date(currentDate)).format('MM/DD/YYYY');
    onWrappedChange(dateToSave);
    if (onBlur) {
      onBlur();
    }
  };

  useEffect(() => {
    if (activeField !== name && prevActiveField === name) {
      setShow(false);
      hidePicker();
    }
  }, [activeField, prevActiveField, name]);

  const onChange = (event, selectedDate) => {
    if (Platform.OS !== 'ios') {
      if (selectedDate === undefined) {
        onCancel();
      } else {
        setShow(false);
        const dateToSave = moment(new Date(selectedDate)).format('MM/DD/YYYY');
        setDate(selectedDate);
        onWrappedChange(dateToSave);
        if (onBlur) {
          onBlur();
        }
      }
    } else {
      const currentDate = selectedDate || date;
      const dateToSave = moment(new Date(currentDate)).format('MM/DD/YYYY');
      setDate(currentDate);
      onWrappedChange(dateToSave);
    }
  };

  const togglePicker = () => {
    setShow(!show);
    if (show) {
      hidePicker();
    } else {
      LayoutAnimation.configureNext({
        duration: 250,
        create: {
            type: LayoutAnimation.Types.linear,
            property: LayoutAnimation.Properties.opacity
        },     
      });

      Keyboard.dismiss();
      setDate(new Date());
      if (onFocus) {
        onFocus();
      }
    }
  };

  const onCancel = () => {
    setShow(false);
    setDate('');
    onWrappedChange('');
    if (onBlur) {
      onBlur();
    }
  };

  const formattedValue = (value || date) ?
      moment(new Date(value || date)).format(uiSchema['ui:dateFormat'] || 'MMM YYYY') :
      '';
  const placeholderStyle = theme.input[hasError ? 'error' : 'regular'].placeholder;
  const textStyle = inFocus ? get(theme, 'Datepicker.focused', {}) : {};
  const rightPicker = rightRow ? styles.rightPicker : {};

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={togglePicker}
        style={[
          rightRow ? styles.rightRow : styles.fullRow,
          leftRow ? styles.leftRow : {}
        ]}
      >
        <View
            style={[
                theme.input.regular.border,
                hasError ? theme.input.error.border : {},
                styles.inputContainer,
                style
            ]}
        >
          {placeholder ?
              <Text style={[theme.input.regular.text, placeholderStyle]}>{placeholder}</Text> :
              <Text style={[theme.input.regular.text, textStyle]}>{formattedValue}</Text>
          }
        </View>
      </TouchableOpacity>
      {show && (
        <View style={[styles.pickerContainer, rightPicker]}>
          {Platform.OS === 'ios' ?
              <View style={[styles.buttonBlock, theme.input.regular.border]}>
                <TouchableOpacity onPress={onCancel}>
                  <Text style={[styles.buttonTitle, theme.Datepicker.buttons]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={togglePicker}>
                  <Text style={[styles.buttonTitle, theme.Datepicker.buttons]}>
                    Ok
                  </Text>
                </TouchableOpacity>
              </View>
              : null}
          <DateTimePicker
            testID="dateTimePicker"
            value={new Date(value || date)}
            minimumDate={uiSchema['ui:minDate'] || null}
            maximumDate={uiSchema['ui:maxDate'] || null}
            onChange={onChange}
            display={Platform.OS !== 'ios' ? 'default' : 'spinner'}
            themeVariant="light"
          />
        </View>
      )}
    </View>
  );
};

DateWidget.propTypes = {
  theme: PropTypes.shape().isRequired,
  uiSchema: PropTypes.shape().isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  hasError: PropTypes.bool,
  style: ViewPropTypes.style,
  placeholder: PropTypes.string,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  activeField: PropTypes.string.isRequired,
  inFocus: PropTypes.bool.isRequired,
  rightRow: PropTypes.bool,
  leftRow: PropTypes.bool
};

DateWidget.defaultProps = {
  value: '',
  placeholder: '',
  hasError: false,
  rightRow: false,
  leftRow: false,
  style: {},
  onBlur: noop,
  onFocus: noop,
};

export default DateWidget;
