function getApiUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();

  if (!configuredUrl) {
    throw new Error('VITE_API_URL deve estar definida para iniciar a aplicação.');
  }

  let apiUrl: URL;

  try {
    apiUrl = new URL(configuredUrl);
  } catch {
    throw new Error('VITE_API_URL deve conter uma URL válida.');
  }

  if (!['http:', 'https:'].includes(apiUrl.protocol)) {
    throw new Error('VITE_API_URL deve usar o protocolo HTTP ou HTTPS.');
  }

  return apiUrl.toString().replace(/\/$/, '');
}

export const env = {
  apiUrl: getApiUrl(),
};
