import React from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet, Image, TouchableOpacity, Text, ViewPropTypes, View, Platform,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import Plus from './plus.svg';
import PlusAndroid from './plus-android.svg';

const styles = StyleSheet.create({
  inputTextContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    minHeight: 40,
    paddingVertical: 8,
    paddingRight: 12,
    marginBottom: 10,
  },
  withPlaceholder: {
    justifyContent: 'space-between',
  },
  image: {
    width: 88,
    height: 88,
  },
  icon: {
    color: '#007AFF',
    fontSize: 22,
    fontWeight: '400',
  },
});

const FileWidget = (props) => {
  const {
    hasError,
    theme,
    value,
    onChange,
    name,
    style,
    placeholder,
  } = props;

  const options = {
    title: '',
    takePhotoButtonTitle: 'Take Photo',
    chooseFromLibraryButtonTitle: 'Add from gallery',
  };

  const showPicker = () => {
    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        // You can also display the image using data:
        // const source = { uri: 'data:image/jpeg;base64,' + response.data };
        onChange(response.uri, name);
      }
    });
  };
  const placeholderStyle = theme.input[hasError ? 'error' : 'regular'].placeholder;

  const isIOS = Boolean(process.env.STORYBOOK_IS_IOS) || Platform.OS === 'ios';

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={showPicker}
      style={[
        styles.inputTextContainer,
        theme.input.regular.border,
        hasError ? theme.input.error.border : {},
        style,
        placeholder ? styles.withPlaceholder : {},
      ]}
    >
      {placeholder
        ? (
          <Text style={[theme.input.regular.text, placeholderStyle]}>
            {placeholder}
          </Text>
        )
        : null}
      {value ? <Image style={styles.image} source={{ uri: value }} />
        : (
          <View>
            {isIOS ? (<Plus width={24} height={24} />)
              : (<PlusAndroid width={24} height={24} />)}
          </View>
        )}
    </TouchableOpacity>
  );
};

FileWidget.propTypes = {
  name: PropTypes.string.isRequired,
  theme: PropTypes.shape().isRequired,
  hasError: PropTypes.bool.isRequired,
  style: ViewPropTypes.style,
  placeholder: PropTypes.string,
};

FileWidget.defaultProps = {
  placeholder: '',
  style: {},
};

export default FileWidget;
