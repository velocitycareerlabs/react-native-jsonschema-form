import React from 'react';
import {Button} from 'react-native';
import PropTypes from 'prop-types';
import { withTheme } from './Theme';

const CancelButton = ({ text, onPress }) => (
  <Button
    auto
    flat={false}
    type="white"
    onPress={onPress}
    radius
  >
    {text}
  </Button>
);

CancelButton.propTypes = {
  onPress: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
};

export default withTheme('JsonSchemaFormCancelButton')(CancelButton);
