import Constants from 'expo-constants';

const API_PORT = 3000;

function devApiUrl() {
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return host ? `http://${host}:${API_PORT}` : `http://localhost:${API_PORT}`;
}

export const API_URL = devApiUrl();
