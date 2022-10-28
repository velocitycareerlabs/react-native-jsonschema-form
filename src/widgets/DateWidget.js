import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  StyleSheet, View,
  TouchableOpacity,
  Text,
  Keyboard,
  Platform,
  LayoutAnimation,
  PixelRatio,
} from 'react-native';
import { ViewPropTypes } from 'deprecated-react-native-prop-types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { noop, get } from 'lodash';
import {
  useOnChange,
  usePrevious,
} from '../utils';

const MIN_DATE = new Date(1900, 0);
const MAX_DATE = new Date(2100, 0);

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  buttonBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonTitle: {
    fontSize: 16,
    paddingVertical: 8,
  },
  rightPicker: {
    marginLeft: '-100%',
  },
  inputContainer: {
    justifyContent: 'center',
    width: '100%',
    height: 40 * PixelRatio.getFontScale(),
    paddingVertical: 8,
  },
  leftRow: {
    paddingRight: 8,
    paddingLeft: 32,
  },
  rightRow: {
    paddingLeft: 8,
    paddingRight: 32,
  },
});

const DATE_FORMAT = 'YYYY-MM-DD';

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
    leftRow,
  } = props;
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const onWrappedChange = useOnChange(props);
  const prevActiveField = usePrevious(activeField);

  const hidePicker = () => {
    const currentDate = value || date;
    const dateToSave = currentDate && moment(new Date(currentDate)).utc().format(DATE_FORMAT);
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
        const dateToSave = moment(new Date(selectedDate)).utc().format(DATE_FORMAT);
        setDate(selectedDate);
        onWrappedChange(dateToSave);
        if (onBlur) {
          onBlur();
        }
      }
    } else {
      const currentDate = selectedDate || date;
      const dateToSave = moment(new Date(currentDate)).utc().format(DATE_FORMAT);
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
          property: LayoutAnimation.Properties.opacity,
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

  const formattedValue = (value || date)
    ? moment(new Date(value || date)).utc().format(uiSchema['ui:dateFormat'] || 'DD MMM YYYY')
    : '';
  const placeholderStyle = theme.input[hasError ? 'error' : 'regular'].placeholder;
  const textStyle = inFocus ? get(theme, 'Datepicker.focused', {}) : {};
  const rightPicker = rightRow ? styles.rightPicker : {};

  const pickerValue = moment(new Date(value || date)).utc();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={togglePicker}
        style={[
          rightRow ? styles.rightRow : {},
          leftRow ? styles.leftRow : {},
        ]}
      >
        <View
          style={[
            theme.input.regular.border,
            hasError ? theme.input.error.border : {},
            styles.inputContainer,
            style,
          ]}
        >
          {placeholder
            ? <Text style={[theme.input.regular.text, placeholderStyle]}>{placeholder}</Text>
            : <Text style={[theme.input.regular.text, textStyle]}>{formattedValue}</Text>}
        </View>
      </TouchableOpacity>
      {show && (
        <View style={[
          styles.pickerContainer,
          rightPicker,
          theme.input.regular.border,
          hasError ? theme.input.error.border : {},
        ]}
        >
          {Platform.OS === 'ios'
            ? (
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
            )
            : null}
          <DateTimePicker
            testID="dateTimePicker"
            value={new Date(pickerValue)}
            minimumDate={uiSchema['ui:minDate'] || MIN_DATE}
            maximumDate={uiSchema['ui:maxDate'] || MAX_DATE}
            onChange={onChange}
            display={Platform.OS !== 'ios' ? 'default' : 'spinner'}
            themeVariant="light"
            timeZoneOffsetInMinutes={0}
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
  leftRow: PropTypes.bool,
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
