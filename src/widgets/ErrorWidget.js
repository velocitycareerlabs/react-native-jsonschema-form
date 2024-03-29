import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View } from 'react-native';
import { withTheme } from '../Theme';

const styles = StyleSheet.create({
  regular: {
    marginTop: -5,
    fontSize: 12,
  },
  auto: {
    marginTop: 0,
    marginBottom: 0,
  },
  container: {
    marginTop: 10,
  },
  first: {
    marginTop: -10,
  },
  last: {
    marginBottom: 10,
  },
});

const ErrorWidget = ({
  theme,
  children,
  last,
  first,
  auto,
  ...props
}) => {
  const style = [
    styles.regular,
    { color: StyleSheet.flatten(theme.input.error.border).borderColor },
    props.style, // eslint-disable-line
  ];
  if (first) {
    style.push(styles.first);
  }
  if (last) {
    style.push(styles.last);
  }
  return (
    <View style={styles.container}>
      <Text style={[style, auto ? styles.auto : null]}>
        {children}
      </Text>
    </View>

  );
};

ErrorWidget.propTypes = {
  theme: PropTypes.shape().isRequired,
  last: PropTypes.bool,
  first: PropTypes.bool,
  children: PropTypes.node,
  auto: PropTypes.bool,
};

ErrorWidget.defaultProps = {
  last: true,
  first: true,
  children: null,
  auto: false,
};

export default withTheme('ErrorWidget')(ErrorWidget);
