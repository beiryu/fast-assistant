// Application constants

export const DEVICE_ID_KEY = 'device_id';

// Get or create device ID
export const getDeviceId = async (): Promise<string> => {
  const { dbService } = await import('./database');
  let deviceId = await dbService.getSetting(DEVICE_ID_KEY);
  
  if (!deviceId) {
    // Generate a simple device ID (in production, use a more robust method)
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    await dbService.saveSetting(DEVICE_ID_KEY, deviceId);
  }
  
  return deviceId;
};

// API Configuration
export const API_CONFIG = {
  TRANSLATION_TIMEOUT: 2000, // 2 seconds
  SYNC_BATCH_SIZE: 50,
  SYNC_RETRY_ATTEMPTS: 3,
  SYNC_RETRY_DELAYS: [1000, 4000, 16000], // Exponential backoff
};

