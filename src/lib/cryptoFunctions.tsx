const encryptionKey:string="Xg3/wo+z3LmuZunddzsN4Q==";
const encryptionIV:string="lhi7DPTm3CJjFkHMSQnTMw==";
async function generateKey() {
    const key = await window.crypto.subtle.generateKey(
        {
            name: "AES-CBC",
            length: 256, // AES-256 key
        },
        true, // extractable (can be exported)
        ["encrypt", "decrypt"] // key usages
    );
    return key;
}

async function storeKeyInLocalStorage(key:CryptoKey) {
    // Export the key to raw format
    const exportedKey = await window.crypto.subtle.exportKey('raw', key);

    // Convert the raw key to base64 format for storage
    const keyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));

    // Store the base64 key in localStorage
    localStorage.setItem(encryptionKey, keyBase64);

    // Generate an initialization vector (IV)
    const iv = window.crypto.getRandomValues(new Uint8Array(16));

    const ivBase64 = btoa(String.fromCharCode(...iv));

    localStorage.setItem(encryptionIV, ivBase64);
}

async function getKeyFromLocalStorage() {
    // Get the base64-encoded key from localStorage
    const keyBase64 = localStorage.getItem(encryptionKey);

    if (!keyBase64) {
        console.error('No k found');
        return null;
    }

    // Convert the base64 string back to a Uint8Array
    const keyRaw = Uint8Array.from(atob(keyBase64), c => c.charCodeAt(0));

    // Import the key as a CryptoKey object
    const key = await window.crypto.subtle.importKey(
        'raw',
        keyRaw,
        'AES-CBC', // Use the same algorithm as during key generation
        true, // The key can be used for encryption/decryption
        ['encrypt', 'decrypt'] // Usages for this key
    );

    return key;
}
 function getIVFromLocalStorage() {
    // Retrieve the encrypted data and IV from localStorage
    // const encryptedBase64 = localStorage.getItem('encryptedData');
    const ivBase64 = localStorage.getItem(encryptionIV);

    if (!ivBase64) {
        console.error('No I found');
        return null;
    }

    return Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));

}

// Encrypting Data
export async function encryptData(data:string) {

    // 2. Retrieve the key from localStorage
    var key = await getKeyFromLocalStorage();

    if(key == null){
        key = await generateKey();
        await storeKeyInLocalStorage(key);
    }

    // Convert the data to an ArrayBuffer
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);

    const iv = getIVFromLocalStorage();

    // Encrypt the data
  const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: "AES-CBC",
        iv: iv!, // Initialization vector
      },
      key!, // The encryption key
      encodedData // The data to encrypt
  );

    // Convert encrypted data and IV to base64 strings
    return btoa(String.fromCharCode(...new Uint8Array(encryptedData)))
}

export async function decryptData(encryptedBase64:string) {
    // 2. Retrieve the key from localStorage
    const key = await getKeyFromLocalStorage();
    const iv = getIVFromLocalStorage();

    var decryptedMessage = "";

    if(key == null || iv == null){
        return "";
    }

    // Convert the base64 strings back to Uint8Arrays
    const encryptedData = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

    try{
        // Decrypt the data
        const decryptedData = await window.crypto.subtle.decrypt(
            {
                name: "AES-CBC",
                iv: iv!,
            },
            key,
            encryptedData.buffer
        );

        // Convert the decrypted data back to a string
        const decoder = new TextDecoder();
        decryptedMessage = decoder.decode(decryptedData);

    }catch (e) {
       console.error("Unable to d")
    }

    return decryptedMessage;
}





