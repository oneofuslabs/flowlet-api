import crypto from 'crypto';

export const encrypt = (text: string, key: Buffer): string => {
  const iv = crypto.randomBytes(12); // 96-bit IV
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final()
  ]);

  const tag = cipher.getAuthTag();
  const result = Buffer.concat([iv, tag, encrypted]).toString('base64');

  return result;
};

export const decrypt = (encryptedBase64: string, key: Buffer): string => {
  const data = Buffer.from(encryptedBase64, 'base64');
  const iv = data.slice(0, 12);
  const tag = data.slice(12, 28);
  const encryptedText = data.slice(28);

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final()
  ]);

  return decrypted.toString('utf8');
};
