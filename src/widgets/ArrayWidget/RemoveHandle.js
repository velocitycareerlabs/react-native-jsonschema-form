import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, ViewPropTypes } from 'react-native';

const styles = StyleSheet.create({
  remove: {
    paddingLeft: 10,
    fontSize: 11,
    fontWeight: '600',
    ...Platform.select(
      {
        ios: {
          color: '#007AFF'
        }, 
        android: {
          color: '#7489A8',
          fontFamily: 'Roboto-Medium'
        }
      })
  },
  hidden: {
    opacity: 0,
    paddingTop: 0,
  },
  alignRight: {
    paddingTop: 0,
    width: '100%',
    textAlign: 'right',
  },
});

const RemoveHandle = ({
  theme,
  onRemovePress,
  titleOnly,
  removeLabel,
  removeStyle,
}) => {
  if (!titleOnly) {
    return (
      <Text
        auto
        type={theme.colors.primary}
        onPress={onRemovePress}
        style={[
          styles.remove,
          titleOnly ? styles.hidden : null,
          styles.alignRight,
          removeStyle,
        ]}
      >
        {removeLabel}
      </Text>
    );
  }
  return (
    <Text
      auto
      type={theme.colors.primary}
      style={[
        styles.remove,
        titleOnly ? styles.hidden : null,
      ]}
    >
      {removeLabel}
    </Text>
  );
};

RemoveHandle.propTypes = {
  theme: PropTypes.shape().isRequired,
  onRemovePress: PropTypes.func.isRequired,
  titleOnly: PropTypes.bool.isRequired,
  removeLabel: PropTypes.node.isRequired,
  removeStyle: ViewPropTypes.style,
};

RemoveHandle.defaultProps = {
  removeStyle: null,
};

export default RemoveHandle;
