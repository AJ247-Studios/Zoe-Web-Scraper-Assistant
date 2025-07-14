document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const outputEl = document.getElementById("output");
  const submitBtn = document.querySelector("button[onclick='submitData()']");
  const dropZone = document.getElementById("drop-zone");
  const fileInput = document.getElementById("fileInput");
  const themeToggle = document.getElementById("themeToggle");
  const urlInput = document.getElementById("url");
  const rawHtmlInput = document.getElementById("rawHtml");
  const instructionInput = document.getElementById("instruction");
  const modelSelect = document.getElementById("model");
  const modelDescEl = document.getElementById("model-description");
  const urlInputWrapper = document.getElementById("urlInputWrapper");
  const rawHtmlWrapper = document.getElementById("rawHtmlWrapper");

  // Model descriptions
  const modelDescriptions = {
    "nous-hermes": "🧠 Very good at following instructions. Ideal for product descriptions and structured outputs.",
    "mistral": "⚡ Fast, general-purpose model. Good for short, responsive tasks.",
    "llama3": "🧠🧠 Great for reasoning and modern use cases. Slightly slower but more accurate.",
    "openhermes": "🎨 Balanced summaries with a touch of creativity. Good for SEO/product listings."
  };

  // Functions
  function copyToClipboard() {
    navigator.clipboard.writeText(outputEl.value).then(() => alert("Copied to clipboard!"));
  }

  function downloadOutput() {
    const blob = new Blob([outputEl.value], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "output.txt";
    link.click();
  }

  async function submitData() {
    submitBtn.disabled = true;
    submitBtn.innerText = "⏳ Thinking...";
    outputEl.value = "";

    try {
      const inputType = document.querySelector('input[name="inputType"]:checked').value;
      let input_data = inputType === "url" ? urlInput.value.trim() : rawHtmlInput.value.trim();

      const instruction = instructionInput.value;
      const model = modelSelect.value;

      const res = await fetch("/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input_data, instruction, model })
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      outputEl.value = data.output;

    } catch (err) {
      outputEl.value = `❌ Error: ${err.message}`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerText = "Submit";
      autoExpandTextarea(outputEl);
    }
  }

  function updateModelDescription() {
    modelDescEl.innerText = modelDescriptions[modelSelect.value] || "";
  }

  function setInstruction(text) {
    instructionInput.value = text;
    localStorage.setItem("instruction", text);
  }

  // Toggle input mode UI and functionality
  function updateInputModeUI() {
    const checkedRadio = document.querySelector('input[name="inputType"]:checked');
    if (!checkedRadio) return;

    if (checkedRadio.value === "url") {
      urlInputWrapper.style.display = "block";
      urlInput.disabled = false;
      rawHtmlWrapper.style.display = "none";
      rawHtmlInput.disabled = true;
      rawHtmlInput.value = "";
    } else {
      urlInputWrapper.style.display = "none";
      urlInput.disabled = true;
      urlInput.value = "";
      rawHtmlWrapper.style.display = "block";
      rawHtmlInput.disabled = false;
    }

    // Update active styling on labels
    document.querySelectorAll(".input-mode-option").forEach(label => {
      const input = label.querySelector("input");
      if (input.checked) {
        label.classList.add("active");
      } else {
        label.classList.remove("active");
      }
    });
  }

  // Drag & drop HTML file load
  dropZone.addEventListener("dragover", e => e.preventDefault());

  dropZone.addEventListener("drop", async e => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === "text/html") {
      const text = await file.text();
      rawHtmlInput.value = text;
      alert("HTML file loaded into raw HTML textarea.");
      document.querySelector('input[name="inputType"][value="raw"]').checked = true;
      updateInputModeUI();
    } else {
      alert("Please drop a valid HTML file.");
    }
  });

  // File input change
  fileInput.addEventListener("change", async e => {
    const file = e.target.files[0];
    if (file && file.type === "text/html") {
      const text = await file.text();
      rawHtmlInput.value = text;
      alert("HTML file loaded into raw HTML textarea.");
      document.querySelector('input[name="inputType"][value="raw"]').checked = true;
      updateInputModeUI();
    } else {
      alert("Please select a valid HTML file.");
    }
  });

  // Listen for inputType radio changes
  document.querySelectorAll('input[name="inputType"]').forEach(radio => {
    radio.addEventListener("change", () => {
      updateInputModeUI();
    });
  });

  // Save inputs to localStorage on change
  urlInput.addEventListener("input", e => localStorage.setItem("url", e.target.value));
  rawHtmlInput.addEventListener("input", e => localStorage.setItem("rawHtml", e.target.value));
  instructionInput.addEventListener("input", e => localStorage.setItem("instruction", e.target.value));
  modelSelect.addEventListener("change", e => {
    localStorage.setItem("model", e.target.value);
    updateModelDescription();
  });

  // Restore saved inputs and theme on load
  if (localStorage.getItem("url")) urlInput.value = localStorage.getItem("url");
  if (localStorage.getItem("rawHtml")) rawHtmlInput.value = localStorage.getItem("rawHtml");
  if (localStorage.getItem("instruction")) instructionInput.value = localStorage.getItem("instruction");
  if (localStorage.getItem("model")) {
    modelSelect.value = localStorage.getItem("model");
    updateModelDescription();
  }
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  themeToggle.checked = savedTheme === "dark";

  // Auto-expand textarea
  function autoExpandTextarea(el) {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }
  outputEl.addEventListener("input", () => autoExpandTextarea(outputEl));

  // MutationObserver to detect programmatic changes and auto-expand
  const observer = new MutationObserver(() => autoExpandTextarea(outputEl));
  observer.observe(outputEl, { characterData: true, subtree: true });

  // Initial calls
  updateInputModeUI();
  updateModelDescription();
  autoExpandTextarea(outputEl);

  // Expose functions globally if needed (e.g., button onclick)
  window.copyToClipboard = copyToClipboard;
  window.downloadOutput = downloadOutput;
  window.submitData = submitData;
  window.setInstruction = setInstruction;
});

const toggleCheckbox = document.getElementById('themeToggle');
  toggleCheckbox.addEventListener('change', () => {
  const isDark = toggleCheckbox.checked;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  localStorage.setItem("theme", isDark ? 'dark' : 'light');
  });