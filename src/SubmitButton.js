import React from 'react';
import { StyleSheet, Button } from 'react-native';
import PropTypes from 'prop-types';
import { withTheme } from './Theme';

const styles = StyleSheet.create({
  button: {
    marginBottom: 5,
  },
});

const SubmitButton = ({ theme, text, onPress }) => (
  <Button
    auto
    className="Form__submitButton"
    flat={false}
    type={theme.colors.primary}
    onPress={onPress}
    nomargin
    style={styles.button}
    radius
  >
    {text}
  </Button>
);

SubmitButton.propTypes = {
  theme: PropTypes.shape().isRequired,
  onPress: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
};

export default withTheme('JsonSchemaFormSubmitButton')(SubmitButton);
