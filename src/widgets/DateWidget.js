import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  StyleSheet, View,
  Dimensions,
  TouchableOpacity,
  Text,
  Keyboard,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import StylePropType from 'react-native-web-ui-components/StylePropType';
import {
  useOnChange,
} from '../utils';
import {noop} from "lodash";

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 10,
  },
  pickerContainer: {
    // fullscreen picker
    marginLeft: -32,
    width: Math.round(Dimensions.get('window').width),
    backgroundColor: '#fff',
  },
  buttonBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonTitle: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inputTextContainer: {
    justifyContent: 'center',
    width: '100%',
    height: 40,
    paddingVertical: 8,
    paddingRight: 12,
  },
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
  } = props;
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const onWrappedChange = useOnChange(props);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    const dateToSave = moment(new Date(currentDate)).parseZone().format('MM/DD/YYYY');
    setDate(currentDate);
    onWrappedChange(dateToSave);
  };

  const showPicker = () => {
    Keyboard.dismiss();
    setShow(true);
    onFocus && onFocus();
  };

  const hidePicker = () => {
    setShow(false);
    onBlur && onBlur();
  };

  const onConfirm = () => {
    const dateToSave = moment(new Date(date)).parseZone().format('MM/DD/YYYY');
    onWrappedChange(dateToSave);
    setShow(false);
  };

  const formattedValue = (value || date) ?
      moment(new Date(value || date)).parseZone().format('MMM YYYY') :
      '';
  const placeholderStyle = theme.input[hasError ? 'error' : 'regular'].placeholder;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={showPicker}
        style={[
          styles.inputTextContainer,
          theme.input.regular.border,
          hasError ? theme.input.error.border : {},
          style,
        ]}
      >
        {placeholder ?
            <Text style={[theme.input.regular.text, placeholderStyle]}>{placeholder}</Text> :
            <Text style={theme.input.regular.text}>{formattedValue}</Text>
        }
      </TouchableOpacity>
      {show && (
        <View style={styles.pickerContainer}>
          <View style={[styles.buttonBlock, theme.input.regular.border]}>
            <TouchableOpacity onPress={hidePicker}>
              <Text style={styles.buttonTitle}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm}>
              <Text style={styles.buttonTitle}>
                Ok
              </Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            minimumDate={uiSchema['ui:minDate'] || null}
            maximumDate={uiSchema['ui:maxDate'] || null}
            onChange={onChange}
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
  style: StylePropType,
  placeholder: PropTypes.string,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
};

DateWidget.defaultProps = {
  value: '',
  placeholder: '',
  hasError: false,
  style: {},
  onBlur: noop,
  onFocus: noop,
};

export default DateWidget;
