import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text } from 'react-native';
import { ViewPropTypes } from 'deprecated-react-native-prop-types';
import { pick, omit } from 'lodash';
import { useTheme } from '../Theme';
import { viewStyleKeys } from '../utils';

const styles = StyleSheet.create({
  error: {
    color: '#EE2D68',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '100%',
  },
  labelContainer: {
    paddingTop: 10,
    paddingBottom: 5,
  },
  labelText: {
    fontWeight: 'bold',
  },
  checkbox: {
    height: 20,
    marginRight: 5,
  },
  checkboxIcon: {
    fontSize: 20,
    height: 20,
    lineHeight: 20,
  },
  fullWidth: {
    width: '100%',
  },
});

const LabelWidget = (preProps) => {
  const props = useTheme('LabelWidget', preProps);

  const {
    onPress,
    children,
    theme,
    themeTextStyle,
    style,
    hasError,
    label,
    auto,
    hasTitle,
  } = props;
  const currentContainerStyle = [
    styles.container,
    auto ? null : styles.fullWidth,
  ];
  const currentTextStyle = [];
  if (label) {
    currentContainerStyle.push(styles.labelContainer);
    currentTextStyle.push(styles.labelText);
  }
  if (hasError) {
    currentTextStyle.push({ color: StyleSheet.flatten(theme.input.error.border).borderColor });
  } else {
    currentTextStyle.push(themeTextStyle.text);
  }
  const css = StyleSheet.flatten(style || {});

  return (
    <View style={[currentContainerStyle, pick(css, viewStyleKeys)]}>
      {hasTitle ? (
        <Text onPress={onPress} style={[currentTextStyle, omit(css, viewStyleKeys)]}>
          {children}
        </Text>
      ) : null}
    </View>
  );
};

LabelWidget.propTypes = {
  theme: PropTypes.shape().isRequired,
  themeTextStyle: PropTypes.shape().isRequired,
  hasError: PropTypes.bool.isRequired,
  hasTitle: PropTypes.bool.isRequired,
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  style: ViewPropTypes.style,
  label: PropTypes.bool,
  auto: PropTypes.bool,
  meta: PropTypes.any, // eslint-disable-line
  onPress: PropTypes.func,
};

LabelWidget.defaultProps = {
  style: null,
  label: false,
  auto: false,
  children: null,
  onPress: undefined,
};

export default LabelWidget;
