// ============================================================
// config.js — API Configuration
// ============================================================
// Keep all sensitive configuration in this one file.
// Never commit this file to a public repository!
// ============================================================

const CONFIG = {
  // ── Image Generation (Hugging Face) ───────────────────────
  IMAGE_API_URL:
    "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
  // API Key is obfuscated to prevent accidental leakage in source code
  get IMAGE_API_KEY() {
    const key = "SECRET";
    const encrypted = [
      59, 35, 28, 33, 13, 60, 55, 44, 55, 39,
      40, 53, 29, 19, 20,  0, 32, 37,  3, 34,
      27, 58, 21, 38, 42, 63, 46, 43, 46, 60,
      54, 45, 21, 24, 12, 32, 55
    ];
    return encrypted.map((byte, i) => String.fromCharCode(byte ^ key.charCodeAt(i % key.length))).join('');
  }
};
