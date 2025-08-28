import CryptoJS from 'crypto-js'

export function calculateMD5(data) {
  return CryptoJS.MD5(data).toString()
}

/**
 * Deobfuscate the outer layer encryption (reverse of backend obfuscation)
 */
export function deobfuscateResponse(obfuscatedData) {
  // Reverse character substitution
  const reverseSubstitutions = {
    'Q': 'A', 'W': 'B', 'E': 'C', 'R': 'D', 'T': 'E',
    'Y': 'F', 'U': 'G', 'I': 'H', 'O': 'I', 'P': 'J',
    'A': 'K', 'S': 'L', 'D': 'M', 'F': 'N', 'G': 'O',
    'H': 'P', 'J': 'Q', 'K': 'R', 'L': 'S', 'Z': 'T',
    'X': 'U', 'C': 'V', 'V': 'W', 'B': 'X', 'N': 'Y',
    'M': 'Z',
    '9': '0', '8': '1', '7': '2', '6': '3', '5': '4',
    '4': '5', '3': '6', '2': '7', '1': '8', '0': '9',
    '-': '+', '_': '/', '.': '='
  }
  
  // Reverse the substitution
  let desubstituted = ''
  for (let i = 0; i < obfuscatedData.length; i++) {
    const char = obfuscatedData[i]
    desubstituted += reverseSubstitutions[char] || char
  }
  
  // Decode from base64
  try {
    return atob(desubstituted)
  } catch (e) {
    console.error('Failed to decode base64:', e)
    throw new Error('Failed to deobfuscate response')
  }
}

export function generateToken(key) {
  return {
    token: calculateMD5(key + "185Hcomic3PAPP7R"),
    tokenParam: `${key},1.8.0`
  }
}

export function decryptData(key, cipherText) {
  const predefinedKeyTemplates = ["185Hcomic3PAPP7R", "18comicAPPContent"]
  
  for (const template of predefinedKeyTemplates) {
    try {
      const dynamicKey = calculateMD5(key + template)
      const decryptedData = CryptoJS.AES.decrypt(
        cipherText,
        CryptoJS.enc.Utf8.parse(dynamicKey),
        {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7
        }
      )
      const decryptedText = decryptedData.toString(CryptoJS.enc.Utf8)
      return JSON.parse(decryptedText)
    } catch (error) {
      continue
    }
  }
  throw new Error("Decryption failed with all key templates")
}