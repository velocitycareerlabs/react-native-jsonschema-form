import React from 'react';
import PropTypes from 'prop-types';
import Icon from 'react-native-web-ui-components/Icon';
import { StyleSheet, Image, TouchableOpacity } from 'react-native';
import ImagePicker from 'react-native-image-picker';

const styles = StyleSheet.create({
  inputTextContainer: {
    justifyContent: 'flex-end',
    width: '100%',
    minHeight: 40,
    paddingVertical: 8,
    paddingRight: 12,
    marginBottom: 10,
  },
  emptyContainer: {
    alignItems: 'flex-end',
  },
  image: {
    width: 88,
    height: 88
  },
  icon: {
    color: '#007AFF',
    fontSize: 22,
    fontWeight: '400',
  }
});

const FileWidget = (props) => {
  const {
    hasError,
    theme,
    value,
    onChange,
    name,
  } = props;

  const options = {
    title: '',
    takePhotoButtonTitle: 'Take Photo',
    chooseFromLibraryButtonTitle: 'Add from gallery',
  };

  const showPicker = () => {
    ImagePicker.showImagePicker(options, (response) => {
      if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        // You can also display the image using data:
        // const source = { uri: 'data:image/jpeg;base64,' + response.data };
        onChange(response.uri, name);
      }
    });
  };

  return (
      <TouchableOpacity
          activeOpacity={1}
          onPress={showPicker}
          style={[
            styles.inputTextContainer,
            theme.input.regular.border,
            hasError ? theme.input.error.border : {},
            !value ? styles.emptyContainer : {}
          ]}
      >
        {value ? <Image style={styles.image} source={{uri: value}} /> :
            <Icon style={styles.icon} name="plus-circle" />
        }
      </TouchableOpacity>
  );
};

FileWidget.propTypes = {
  name: PropTypes.string.isRequired,
  theme: PropTypes.shape().isRequired,
  hasError: PropTypes.bool.isRequired,
};

export default FileWidget;
