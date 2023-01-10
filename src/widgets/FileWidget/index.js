/* eslint-disable no-console */
import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  View,
  Platform,
  ActionSheetIOS,
  PermissionsAndroid,
} from 'react-native';
import { ViewPropTypes } from 'deprecated-react-native-prop-types';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RBSheet from 'react-native-raw-bottom-sheet';
import Plus from './plus.svg';
import PlusAndroid from './plus-android.svg';
import PhotoAndroid from './photo-android.svg';
import GalleryAndroid from './gallery-android.svg';

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
  container: {
    height: 59,
    justifyContent: 'center',
  },
  containerWithIcon: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  text: {
    textAlignVertical: 'center',
    letterSpacing: 0.2,
    fontSize: 14,
    marginHorizontal: 16,
  },
  icon: {
    marginHorizontal: 16,
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

  const refRBSheet = useRef();

  const isIOS = Boolean(process.env.STORYBOOK_IS_IOS) || Platform.OS === 'ios';

  const requestCameraPermission = async () => {
    if (!isIOS) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs camera permission',
          },
        );
        // If CAMERA Permission is granted
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else return true;
  };

  const requestExternalWritePermission = async () => {
    if (!isIOS) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'External Storage Write Permission',
            message: 'App needs write permission',
          },
        );
        // If WRITE_EXTERNAL_STORAGE Permission is granted
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        // eslint-disable-next-line no-alert
        alert('Write permission err', err);
      }
      return false;
    } return true;
  };

  const onImageReceive = (response) => {
    const isAssetsWrapped = response
        && Object.prototype.hasOwnProperty.call(response, 'assets')
        && Array.isArray(response.assets)
        && response.assets[0];

    const uri = isAssetsWrapped ? response.assets[0].uri : response.uri;

    console.log('Response = ', uri);

    if (response.didCancel) {
      console.log('User cancelled image picker');
      return;
    } if (response.errorCode === 'camera_unavailable') {
      console.log('Camera not available on device');
      return;
    } if (response.errorCode === 'permission') {
      console.log('Permission not satisfied');
      return;
    } if (response.errorCode === 'others') {
      console.log(response.errorMessage);
      return;
    }
    onChange(uri, name);
  };

  const onCameraTap = async () => {
    const isCameraPermitted = await requestCameraPermission();
    const isStoragePermitted = await requestExternalWritePermission();
    if (isCameraPermitted && isStoragePermitted) {
      if (!isIOS) {
        refRBSheet.current.close();
      }

      const options = {
        mediaType: 'photo',
        quality: 1,
        saveToPhotos: true,
      };
      launchCamera(options, onImageReceive);
    }
  };

  const onImageTap = () => {
    if (!isIOS) {
      refRBSheet.current.close();
    }

    const options = {
      mediaType: 'photo',
      quality: 1,
      selectionLimit: 1,
    };
    launchImageLibrary(options, onImageReceive);
  };

  const showPicker = () => {
    if (isIOS) {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take photo', 'Add from gallery'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            onCameraTap();
          } else if (buttonIndex === 2) {
            onImageTap();
          }
        },
      );
    } else {
      refRBSheet.current.open();
    }
  };
  const placeholderStyle = theme.input[hasError ? 'error' : 'regular'].placeholder;

  return (
    <>
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
      <RBSheet
        ref={refRBSheet}
        closeOnDragDown={false}
        closeOnPressMask={false}
        height={124}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onCameraTap}
          style={[
            styles.container,
            {
              backgroundColor: '#FFFFFF',
            },
            styles.containerWithIcon,
          ]}
        >
          <View style={[styles.icon]}>
            <PhotoAndroid />
          </View>
          <Text style={[styles.text, { color: '#000000' }]}>
            Take photo
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onImageTap}
          style={[
            styles.container,
            {
              backgroundColor: '#FFFFFF',
            },
            styles.containerWithIcon,
          ]}
        >
          <View style={[styles.icon]}>
            <GalleryAndroid />
          </View>
          <Text style={[styles.text, { color: '#000000' }]}>
            Add from gallery
          </Text>
        </TouchableOpacity>
      </RBSheet>
    </>

  );
};

FileWidget.propTypes = {
  name: PropTypes.string.isRequired,
  theme: PropTypes.shape().isRequired,
  hasError: PropTypes.bool.isRequired,
  style: ViewPropTypes.style,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

FileWidget.defaultProps = {
  placeholder: '',
  style: {},
  value: '',
};

export default FileWidget;
