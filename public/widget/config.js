export let currentConfig = {
  primaryColor: '#2563eb',
  preamble: "You are a helpful customer support agent. Be concise and friendly in your responses."
};

export const updateConfig = (newConfig) => {
  console.log('Updating widget config:', newConfig);
  Object.assign(currentConfig, newConfig);
  return currentConfig;
};