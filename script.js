// ============================================================
// script.js — AI Image Generator (Hugging Face)
// ============================================================

// ── DOM References ────────────────────────────────────────────
const promptInput = document.getElementById("promptInput");
const generateBtn = document.getElementById("generateBtn");
const loader = document.getElementById("loader");
const errorBanner = document.getElementById("errorBanner");
const errorText = document.getElementById("errorText");
const result = document.getElementById("result");
const resultImage = document.getElementById("resultImage");
const resultPrompt = document.getElementById("resultPrompt");
const gallery = document.getElementById("gallery");
const galleryGrid = document.getElementById("galleryGrid");
const galleryCount = document.getElementById("galleryCount");

// ── Store past generations ────────────────────────────────────
let generationHistory = [];

// ============================================================
// CORE: Generate Image via Hugging Face API
// ============================================================
async function generateImage(prompt) {
  if (!CONFIG.IMAGE_API_KEY || CONFIG.IMAGE_API_KEY === "YOUR_KEY_HERE") {
    throw new Error("Hugging Face API token is missing.");
  }

  const response = await fetch(CONFIG.IMAGE_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CONFIG.IMAGE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: prompt }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    if (response.status === 401 || response.status === 403) {
      throw new Error("Invalid or expired API token.");
    }
    if (response.status === 503) {
      throw new Error(errorData?.error || "Model loading. Try again.");
    }
    throw new Error(errorData?.error || `API error: ${response.status}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

// ============================================================
// UI HELPERS
// ============================================================
function setLoading(isLoading) {
  if (isLoading) {
    loader.classList.add("visible");
    result.classList.remove("visible");
    generateBtn.disabled = true;
    promptInput.disabled = true;
  } else {
    loader.classList.remove("visible");
    generateBtn.disabled = false;
    promptInput.disabled = false;
  }
}

function showError(message) {
  errorText.textContent = `ERR: ${message}`;
  errorBanner.classList.add("visible");
  result.classList.remove("visible");
  setTimeout(() => { errorBanner.classList.remove("visible"); }, 8000);
}

function hideError() {
  errorBanner.classList.remove("visible");
}

function showResult(imageUrl, prompt) {
  resultImage.src = imageUrl;
  resultPrompt.textContent = `"${prompt}"`;
  result.classList.add("visible");
  result.scrollIntoView({ behavior: "smooth", block: "start" });
}

function addToGallery(imageUrl, prompt) {
  generationHistory.unshift({ imageUrl, prompt });
  gallery.classList.add("visible");
  galleryCount.textContent = `${generationHistory.length} RECORDS`;

  const item = document.createElement("div");
  item.className = "gallery__item";
  item.onclick = () => {
    showResult(imageUrl, prompt);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const img = document.createElement("img");
  img.src = imageUrl;
  img.alt = prompt;
  img.loading = "lazy";

  const overlay = document.createElement("div");
  overlay.className = "gallery__item-overlay";
  
  const p = document.createElement("span");
  p.className = "gallery__item-prompt";
  p.textContent = prompt;

  overlay.appendChild(p);
  item.appendChild(img);
  item.appendChild(overlay);
  galleryGrid.prepend(item);
}

// ============================================================
// EVENT HANDLERS
// ============================================================
async function handleGenerate() {
  const prompt = promptInput.value.trim();

  if (!prompt) {
    promptInput.focus();
    promptInput.placeholder = "Enter text to proceed.";
    setTimeout(() => { promptInput.placeholder = "Describe your vision precisely..."; }, 2000);
    return;
  }

  hideError();
  setLoading(true);

  try {
    const imageUrl = await generateImage(prompt);
    showResult(imageUrl, prompt);
    addToGallery(imageUrl, prompt);
    promptInput.value = "";
  } catch (error) {
    showError(error.message);
    console.error("Image generation error:", error);
  } finally {
    setLoading(false);
  }
}

function useChip(chipElement) {
  promptInput.value = chipElement.textContent.trim();
  handleGenerate();
}

function downloadImage() {
  const src = resultImage.src;
  if (!src) return;
  const link = document.createElement("a");
  link.href = src;
  link.download = `image-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

promptInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    handleGenerate();
  }
});

window.addEventListener("DOMContentLoaded", () => {
  promptInput.focus();
});
