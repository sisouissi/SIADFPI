// services/cryptoService.ts

// Helper function to convert buffer to Base64
const bufferToBase64 = (buffer: ArrayBuffer): string => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
};

// Helper function to convert Base64 to buffer
const base64ToBuffer = (b64: string): ArrayBuffer => {
  const byteString = atob(b64);
  const byteArray = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    byteArray[i] = byteString.charCodeAt(i);
  }
  return byteArray.buffer;
};

// Derives a key from a password and salt using PBKDF2
const getKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
};

interface EncryptedPayload {
    salt: string; // base64
    iv: string;   // base64
    data: string; // base64
}

/**
 * Encrypts a string using a password.
 * @param data The string to encrypt.
 * @param password The password to use for encryption.
 * @returns A promise that resolves to a JSON string containing the encrypted data and metadata.
 */
export const encryptData = async (data: string, password: string): Promise<string> => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getKey(password, salt);
  const enc = new TextEncoder();

  const encryptedContent = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    enc.encode(data)
  );
  
  const payload: EncryptedPayload = {
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
    data: bufferToBase64(encryptedContent),
  };

  return JSON.stringify(payload);
};

/**
 * Decrypts data using a password.
 * @param encryptedJson The JSON string payload from encryptData.
 * @param password The password to use for decryption.
 * @returns A promise that resolves to the decrypted string.
 */
export const decryptData = async (encryptedJson: string, password: string): Promise<string> => {
  try {
    const payload: EncryptedPayload = JSON.parse(encryptedJson);
    const salt = base64ToBuffer(payload.salt);
    const iv = base64ToBuffer(payload.iv);
    const data = base64ToBuffer(payload.data);
    const key = await getKey(password, new Uint8Array(salt));
    
    const decryptedContent = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      data
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedContent);
  } catch (e) {
    console.error('Decryption failed:', e);
    throw new Error('Le déchiffrement a échoué. Le mot de passe est probablement incorrect ou le fichier est corrompu.');
  }
};
