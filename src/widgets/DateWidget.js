import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  StyleSheet, View,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  useOnChange,
} from '../utils';

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
    borderBottomColor: 'rgba(118, 118, 128, 0.2)',
    borderBottomWidth: 1,
  },
  buttonTitle: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inputTextContainer: {
    justifyContent: 'flex-end',
    width: '100%',
    height: 40,
    paddingVertical: 8,
    paddingRight: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(118, 118, 128, 0.2)',
  },
  errorBorder: {
    borderBottomColor: '#FF3825',
  },
});

const DateWidget = (props) => {
  const {
    uiSchema,
    value,
    hasError,
    theme,
  } = props;
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const onWrappedChange = useOnChange(props);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
  };

  const showPicker = () => {
    setShow(true);
  };

  const hidePicker = () => {
    setShow(false);
  };

  const onConfirm = () => {
    const dateToSave = moment(new Date(date)).parseZone().format('MM/DD/YYYY');
    onWrappedChange(dateToSave);
    setShow(false);
  };

  const formattedValue = value ? moment(new Date(value)).parseZone().format('MMM YYYY') : '';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={showPicker}
        style={{
          ...styles.inputTextContainer,
          ...(hasError ? styles.errorBorder : {}),
        }}
      >
        <Text style={theme.input.regular.text}>{formattedValue}</Text>
      </TouchableOpacity>
      {show && (
        <View style={styles.pickerContainer}>
          <View style={styles.buttonBlock}>
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
            onBlur={() => console.log('onBlur')}
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
};

DateWidget.defaultProps = {
  value: '',
  hasError: false,
};

export default DateWidget;
