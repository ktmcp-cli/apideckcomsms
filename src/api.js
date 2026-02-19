import axios from 'axios';
import { getConfig } from './config.js';

const APIDECK_BASE_URL = 'https://unify.apideck.com';

function createClient() {
  const apiKey = getConfig('apiKey');
  const appId = getConfig('appId');
  const consumerId = getConfig('consumerId') || 'default-consumer';

  if (!apiKey || !appId) {
    throw new Error('API key and App ID not configured. Run: apideckcomsms config set --api-key <key> --app-id <id>');
  }

  return axios.create({
    baseURL: APIDECK_BASE_URL,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'X-APIDECK-APP-ID': appId,
      'X-APIDECK-CONSUMER-ID': consumerId,
      'Content-Type': 'application/json'
    }
  });
}

function handleApiError(error) {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    if (status === 401) {
      throw new Error('Authentication failed. Check your API key.');
    } else if (status === 403) {
      throw new Error('Access forbidden. Check your API permissions.');
    } else if (status === 404) {
      throw new Error('Resource not found.');
    } else if (status === 429) {
      throw new Error('Rate limit exceeded. Please wait before retrying.');
    } else {
      const message = data?.message || data?.error || JSON.stringify(data);
      throw new Error(`API Error (${status}): ${message}`);
    }
  } else if (error.request) {
    throw new Error('No response from Apideck API. Check your internet connection.');
  } else {
    throw error;
  }
}

export async function listMessages(params = {}) {
  const client = createClient();
  try {
    const response = await client.get('/sms/messages', { params });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getMessage(messageId) {
  const client = createClient();
  try {
    const response = await client.get(`/sms/messages/${messageId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function sendMessage(messageData) {
  const client = createClient();
  try {
    const response = await client.post('/sms/messages', messageData);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function updateMessage(messageId, updates) {
  const client = createClient();
  try {
    const response = await client.patch(`/sms/messages/${messageId}`, updates);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function deleteMessage(messageId) {
  const client = createClient();
  try {
    const response = await client.delete(`/sms/messages/${messageId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}
