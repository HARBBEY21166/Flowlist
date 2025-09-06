export const LightColors = {
  background: '#f8f9fa',
  cardBackground: '#ffffff',
  text: '#212529',
  textSecondary: '#6c757d',
  primary: '#4361ee',
  border: '#dee2e6',
  success: '#28a745',
  warning: '#ffc107',
  danger: '#dc3545',
    texttest: '#212529',

};

export const DarkColors = {
  background: '#121212',
  cardBackground: '#1e1e1e',
  text: '#e9ecef',
  texttest: '#212529',
  textSecondary: '#adb5bd',
  primary: '#4361ee',
  border: '#343a40',
  success: '#38b000',
  warning: '#ffaa00',
  danger: '#ff6b6b',
};

export const getColors = (isDark: boolean) => {
  return isDark ? DarkColors : LightColors;
};