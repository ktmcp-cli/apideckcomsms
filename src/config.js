import Conf from 'conf';

const config = new Conf({
  projectName: 'apideckcomsms-cli',
  schema: {
    apiKey: {
      type: 'string',
      default: ''
    },
    appId: {
      type: 'string',
      default: ''
    },
    consumerId: {
      type: 'string',
      default: ''
    }
  }
});

export function getConfig(key) {
  return config.get(key);
}

export function setConfig(key, value) {
  config.set(key, value);
}

export function getAllConfig() {
  return config.store;
}

export function clearConfig() {
  config.clear();
}

export function isConfigured() {
  const apiKey = config.get('apiKey');
  const appId = config.get('appId');
  return !!(apiKey && appId);
}

export default config;
