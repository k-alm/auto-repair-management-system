import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from "node:crypto";
import { env } from "@/config/env";

export function createOpaqueToken() {
  return { token: randomBytes(32).toString("base64url"), authorizationId: randomUUID() };
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

const encryptionKey = () => createHash("sha256").update(env.JWT_SECRET).digest();

export function encryptPayload(payload: object) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(payload)), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString("base64");
}

export function decryptPayload<T>(encrypted: string): T {
  const data = Buffer.from(encrypted, "base64");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), data.subarray(0, 12));
  decipher.setAuthTag(data.subarray(12, 28));
  return JSON.parse(
    Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString(),
  ) as T;
}
