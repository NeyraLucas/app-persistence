import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../../environments/environment';

/**
 * AesService — cifrado/descifrado simétrico AES-256-CBC.
 *
 * Formato del payload que espera el backend (AesCipherUtil.java):
 *   Base64( IV[16 bytes] || ciphertext )
 *
 * - El IV es aleatorio por cada llamada a `encrypt()` (nunca fijo).
 * - La secretKey debe coincidir EXACTAMENTE con `app.security.aes.key`
 *   en el application.properties de API 1 (32 caracteres UTF-8 → AES-256).
 * - El algoritmo es AES/CBC/PKCS5Padding (en CryptoJS: mode.CBC + pad.Pkcs7).
 */
@Injectable({
  providedIn: 'root',
})
export class AesService {
  private readonly secretKey: CryptoJS.lib.WordArray = CryptoJS.enc.Utf8.parse(
    environment.aesSecretKey,
  );

  /**
   * Cifra `plainText` con AES-256-CBC y un IV aleatorio de 16 bytes.
   *
   * @param plainText - Texto en claro a cifrar (p. ej. el secreto de la transacción).
   * @returns Base64(IV || ciphertext) — string listo para enviar al backend.
   */
  encrypt(plainText: string): string {
    const iv = CryptoJS.lib.WordArray.random(16);

    const encrypted = CryptoJS.AES.encrypt(plainText, this.secretKey, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    // Concatenar IV + ciphertext en un único WordArray y codificar a Base64.
    const combined = iv.clone().concat(encrypted.ciphertext);
    return combined.toString(CryptoJS.enc.Base64);
  }

  /**
   * Descifra un string con formato Base64(IV || ciphertext).
   * Se incluye por simetría y para facilitar debugging; el front
   * normalmente no descifra datos en producción.
   *
   * @param base64CipherWithIv - Base64(IV[16 bytes] || ciphertext).
   * @returns Texto en claro original.
   */
  decrypt(base64CipherWithIv: string): string {
    const combined = CryptoJS.enc.Base64.parse(base64CipherWithIv);

    const iv = CryptoJS.lib.WordArray.create(combined.words.slice(0, 4), 16);
    const cipherText = CryptoJS.lib.WordArray.create(
      combined.words.slice(4),
      combined.sigBytes - 16,
    );

    const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext: cipherText });

    const decrypted = CryptoJS.AES.decrypt(cipherParams, this.secretKey, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}
