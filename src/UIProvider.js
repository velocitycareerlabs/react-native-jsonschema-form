import React from 'react';
import PropTypes from 'prop-types';
import { Provider as ThemeProvider } from './Theme';

export const UIProvider = ({ theme, children }) => (
  <ThemeProvider value={theme}>
    {children}
  </ThemeProvider>
);

UIProvider.propTypes = {
  theme: PropTypes.shape(),
  children: PropTypes.node,
};

UIProvider.defaultProps = {
  theme: {},
  children: null,
};
