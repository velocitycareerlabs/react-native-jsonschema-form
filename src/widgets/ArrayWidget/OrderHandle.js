import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, ViewPropTypes } from 'react-native';
import Div from '../../Div';

const styles = StyleSheet.create({
  order: {
    fontSize: 15,
    textAlign: 'center',
    paddingRight: 10,
    paddingTop: 11,
    lineHeight: 23,
  },
  hidden: {
    opacity: 0,
    paddingTop: 0,
  },
  xs: {
    paddingTop: 0,
  },
});

const OrderHandle = ({
  theme,
  handle,
  panHandlers,
  titleOnly,
  orderLabel,
  orderStyle,
}) => (
  <View {...(panHandlers || {})}>
    <Div className={handle}>
      <Text
        className={handle}
        auto
        type={theme.colors.text}
        style={[
          styles.order,
          styles.xs,
          titleOnly ? styles.hidden : null,
          orderStyle,
        ]}
      >
        {orderLabel}
      </Text>
    </Div>
  </View>
);

OrderHandle.propTypes = {
  theme: PropTypes.shape().isRequired,
  handle: PropTypes.string.isRequired,
  titleOnly: PropTypes.bool.isRequired,
  panHandlers: PropTypes.shape(),
  orderLabel: PropTypes.node.isRequired,
  orderStyle: ViewPropTypes.style,
};

OrderHandle.defaultProps = {
  panHandlers: null,
  orderStyle: null,
};

export default OrderHandle;
