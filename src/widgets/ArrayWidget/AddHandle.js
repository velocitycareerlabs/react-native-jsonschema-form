import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-native-web-ui-components/Button';
import { get } from 'lodash';

const AddHandle = ({ theme, onPress, addLabel }) => (
  <Button
      auto
      small
      flat={false}
      style={get(theme, 'button.arrayWidget.button', {})}
      textStyle={get(theme, 'button.arrayWidget.text', {})}
      type="arrayWidget"
      onPress={onPress}
  >
    {addLabel}
  </Button>
);

AddHandle.propTypes = {
  theme: PropTypes.shape().isRequired,
  onPress: PropTypes.func.isRequired,
  addLabel: PropTypes.string.isRequired,
};

export default AddHandle;
