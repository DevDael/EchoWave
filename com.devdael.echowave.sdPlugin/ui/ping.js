(() => {
  const target = document.querySelector("#target");
  const theme = document.querySelector("#theme");
  const displayMode = document.querySelector("#display-mode");
  const language = document.querySelector("#language");
  const validation = document.querySelector("#validation");
  const attribution = document.querySelector("#attribution");
  const translations = {
    en: {
      tagline: "Visual network echo",
      targetLabel: "Target",
      targetHelp: "IPv4, IPv6, hostname, or URL. Only the host is used.",
      targetPlaceholder: "192.168.1.25 or example.com",
      themeLabel: "Visual theme",
      darkGroup: "Signature and dark",
      lightGroup: "Light themes",
      displayModeLabel: "Button display",
      displayModeVisual: "Animated theme",
      displayModeIcon: "Custom icon + live text",
      displayModeHelp: "Choose an icon in Stream Deck and leave its Title field empty. For existing keys, use the T menu to set Middle, 10 px, Regular. Remove the icon before returning to an animated theme.",
      languageLabel: "Language",
      languageAuto: "Automatic (Stream Deck)",
      languageEnglish: "English",
      languageSpanish: "Spanish",
      languageHelp: "Automatic follows the language selected in Stream Deck.",
      useLabel: "Use",
      useHelp: "Tap to ping. Hold briefly and release; the saved metrics will advance automatically.",
      attributionPrefix: "Hexaza visuals by",
      attributionSuffix: ". Used with permission in free EchoWave."
    },
    es: {
      tagline: "Eco visual de red",
      targetLabel: "Destino",
      targetHelp: "IPv4, IPv6, hostname o URL. Solo se utiliza el host.",
      targetPlaceholder: "192.168.1.25 o ejemplo.com",
      themeLabel: "Tema visual",
      darkGroup: "Identidad y oscuros",
      lightGroup: "Temas claros",
      displayModeLabel: "Visualización del botón",
      displayModeVisual: "Tema animado",
      displayModeIcon: "Icono personalizado + texto dinámico",
      displayModeHelp: "Elige un icono en Stream Deck y deja vacío su campo Título. En teclas existentes, usa el menú T: Centrado, 10 px y Regular. Quita el icono antes de volver a un tema animado.",
      languageLabel: "Idioma",
      languageAuto: "Automático (Stream Deck)",
      languageEnglish: "Inglés",
      languageSpanish: "Español",
      languageHelp: "Automático sigue el idioma seleccionado en Stream Deck.",
      useLabel: "Uso",
      useHelp: "Pulsa para hacer ping. Mantén brevemente y suelta para recorrer automáticamente las métricas guardadas.",
      attributionPrefix: "Diseño visual Hexaza de",
      attributionSuffix: ". Usado con permiso en EchoWave gratuito."
    }
  };
  let socket;
  let context;
  let actionUuid;
  let applicationLanguage = "en";
  let lastResult;

  function settings() {
    const value = { target: target.value.trim(), theme: theme.value, language: language.value, displayMode: displayMode.value };
    if (lastResult) value.lastResult = lastResult;
    return value;
  }

  function displayValidation(value) {
    validation.textContent = value || "";
    validation.dataset.invalid = value ? "true" : "false";
  }

  function persist() {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ event: "setSettings", context, payload: settings() }));
  }

  function validate() {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ event: "sendToPlugin", action: actionUuid, context, payload: { type: "validate", target: target.value, language: language.value } }));
  }

  function applyTranslations(language) {
    const strings = translations[language] || translations.en;
    document.querySelector("#tagline").textContent = strings.tagline;
    document.querySelector("#target-label").textContent = strings.targetLabel;
    document.querySelector("#target-help").textContent = strings.targetHelp;
    target.placeholder = strings.targetPlaceholder;
    document.querySelector("#theme-label").textContent = strings.themeLabel;
    document.querySelector("#themes-dark").label = strings.darkGroup;
    document.querySelector("#themes-light").label = strings.lightGroup;
    document.querySelector("#display-mode-label").textContent = strings.displayModeLabel;
    document.querySelector("#display-mode-visual").textContent = strings.displayModeVisual;
    document.querySelector("#display-mode-icon").textContent = strings.displayModeIcon;
    document.querySelector("#display-mode-help").textContent = strings.displayModeHelp;
    document.querySelector("#language-label").textContent = strings.languageLabel;
    document.querySelector("#language-auto").textContent = strings.languageAuto;
    document.querySelector("#language-en").textContent = strings.languageEnglish;
    document.querySelector("#language-es").textContent = strings.languageSpanish;
    document.querySelector("#language-help").textContent = strings.languageHelp;
    document.querySelector("#use-label").textContent = strings.useLabel;
    document.querySelector("#use-help").textContent = strings.useHelp;
    document.querySelector("#attribution-prefix").textContent = strings.attributionPrefix;
    document.querySelector("#attribution-suffix").textContent = strings.attributionSuffix;
    document.documentElement.lang = language;
  }

  function updateDisplayMode() {
    theme.disabled = displayMode.value === "custom-icon";
    attribution.hidden = theme.value !== "hexaza" || displayMode.value !== "visual";
  }

  function selectedLocale() {
    return language.value === "auto" ? applicationLanguage : language.value;
  }

  window.connectElgatoStreamDeckSocket = (port, uuid, event, info, actionInfo) => {
    context = uuid;
    const action = JSON.parse(actionInfo);
    actionUuid = action.action;
    const application = JSON.parse(info);
    applicationLanguage = application.application?.language === "es" ? "es" : "en";
    target.value = typeof action.payload.settings.target === "string" ? action.payload.settings.target : "";
    const savedTheme = action.payload.settings.theme;
    lastResult = action.payload.settings.lastResult;
    const normalizedTheme = savedTheme === "aurora-light" ? "aurora-dark" : savedTheme === "glass-light" ? "glass-dark" : savedTheme;
    theme.value = [...theme.options].some((option) => option.value === normalizedTheme) ? normalizedTheme : "echo-wave";
    displayMode.value = action.payload.settings.displayMode === "custom-icon" ? "custom-icon" : "visual";
    updateDisplayMode();
    language.value = ["auto", "en", "es"].includes(action.payload.settings.language) ? action.payload.settings.language : "auto";
    applyTranslations(selectedLocale());
    socket = new WebSocket(`ws://127.0.0.1:${port}`);
    socket.onopen = () => {
      socket.send(JSON.stringify({ event, uuid }));
      validate();
    };
    socket.onmessage = ({ data }) => {
      const message = JSON.parse(data);
      if (message.event === "didReceiveSettings") {
        lastResult = message.payload?.settings?.lastResult;
      }
      if (message.event === "sendToPropertyInspector" && message.payload?.type === "validation") {
        displayValidation(message.payload.message);
      }
    };
  };

  target.addEventListener("input", () => { lastResult = undefined; displayValidation(""); persist(); validate(); });
  theme.addEventListener("change", () => { updateDisplayMode(); persist(); });
  displayMode.addEventListener("change", () => { updateDisplayMode(); persist(); });
  language.addEventListener("change", () => { applyTranslations(selectedLocale()); displayValidation(""); persist(); validate(); });
})();
