(() => {
  const target = document.querySelector("#target");
  const theme = document.querySelector("#theme");
  const displayMode = document.querySelector("#display-mode");
  const language = document.querySelector("#language");
  const validation = document.querySelector("#validation");
  const attribution = document.querySelector("#attribution");
  const translations = {
    en: {
      tagline: "Web service check", targetLabel: "HTTP/HTTPS URL", targetHelp: "The complete URL, including path and query, is requested. Do not enter secrets.",
      themeLabel: "Visual theme", languageLabel: "Language", auto: "Automatic (Stream Deck)", english: "English", spanish: "Spanish",
      displayModeLabel: "Button display", displayModeVisual: "Animated theme", displayModeIcon: "Custom icon + live text",
      displayModeHelp: "Choose an icon in Stream Deck and leave its Title field empty. For existing keys, use the T menu to set Middle, 10 px, Regular. Remove the icon before returning to an animated theme.",
      useLabel: "Use", useHelp: "Tap to send a GET request. Hold and release to review HTTP status, response time, protocol and time.",
      privacy: "GET; 8-second timeout; redirects are reported, not followed. The URL and last result stay in local Stream Deck settings.",
      attributionPrefix: "Hexaza visuals by", attributionSuffix: ". Used with permission in free EchoWave."
    },
    es: {
      tagline: "Comprobación de servicio web", targetLabel: "URL HTTP/HTTPS", targetHelp: "Se solicita la URL completa, incluida la ruta y los parámetros. No introduzcas secretos.",
      themeLabel: "Tema visual", languageLabel: "Idioma", auto: "Automático (Stream Deck)", english: "Inglés", spanish: "Español",
      displayModeLabel: "Visualización del botón", displayModeVisual: "Tema animado", displayModeIcon: "Icono personalizado + texto dinámico",
      displayModeHelp: "Elige un icono en Stream Deck y deja vacío su campo Título. En teclas existentes, usa el menú T: Centrado, 10 px y Regular. Quita el icono antes de volver a un tema animado.",
      useLabel: "Uso", useHelp: "Pulsa para enviar GET. Mantén y suelta para ver el estado HTTP, tiempo de respuesta, protocolo y hora.",
      privacy: "GET; límite de 8 segundos; se informa la redirección sin seguirla. La URL y el último resultado quedan en la configuración local de Stream Deck.",
      attributionPrefix: "Diseño visual Hexaza de", attributionSuffix: ". Usado con permiso en EchoWave gratuito."
    }
  };
  const httpGuideTranslations = {
    en: {
      "http-guide-summary": "What do HTTP 200, 404 and 503 mean?",
      "http-guide-intro": "An HTTP number means the server answered. It does not prove that the page or service works as intended.",
      "http-guide-groups": "Status groups",
      "http-class-2xx": "The request succeeded.",
      "http-class-3xx": "Redirect or cache response. EchoWave does not follow redirects.",
      "http-class-4xx": "The server rejected the request or resource.",
      "http-class-5xx": "The server or gateway could not complete the request.",
      "http-guide-common": "Common codes",
      "http-code-200": "OK: the GET request succeeded.",
      "http-code-204": "Success, with no response body.",
      "http-code-301-302": "Permanent / temporary redirect.",
      "http-code-400": "Bad request.",
      "http-code-401-403": "Authentication required / access forbidden.",
      "http-code-404": "The requested URL path was not found.",
      "http-code-429": "Too many requests; rate limited.",
      "http-code-500": "Internal server error.",
      "http-code-502-504": "Bad gateway response / gateway timeout.",
      "http-code-503": "Service temporarily unavailable.",
      "http-guide-no-response": "TIMEOUT, DNS ERROR and TLS ERROR are not HTTP codes: no HTTP response was received. HTTP 404 or 503 means a server did reply."
    },
    es: {
      "http-guide-summary": "¿Qué significan HTTP 200, 404 y 503?",
      "http-guide-intro": "Un número HTTP indica que respondió un servidor. No confirma que la página o el servicio funcionen como esperas.",
      "http-guide-groups": "Grupos de estados",
      "http-class-2xx": "La solicitud se completó correctamente.",
      "http-class-3xx": "Redirección o respuesta de caché. EchoWave no sigue redirecciones.",
      "http-class-4xx": "Hubo un problema con la solicitud, el acceso o el recurso.",
      "http-class-5xx": "El servidor o intermediario no completó la solicitud.",
      "http-guide-common": "Códigos frecuentes",
      "http-code-200": "OK: la solicitud GET se completó.",
      "http-code-204": "Éxito, sin contenido en la respuesta.",
      "http-code-301-302": "Redirección permanente / temporal.",
      "http-code-400": "Solicitud incorrecta.",
      "http-code-401-403": "Se requiere autenticación / acceso prohibido.",
      "http-code-404": "No se encontró la ruta solicitada.",
      "http-code-429": "Demasiadas solicitudes; se alcanzó el límite.",
      "http-code-500": "Error interno del servidor.",
      "http-code-502-504": "Respuesta incorrecta del servidor de origen / tiempo agotado en el intermediario.",
      "http-code-503": "Servicio temporalmente no disponible.",
      "http-guide-no-response": "TIMEOUT, DNS ERROR y TLS ERROR no son códigos HTTP: no se recibió respuesta HTTP. Con HTTP 404 o 503 sí respondió un servidor."
    }
  };
  let socket;
  let context;
  let actionUuid;
  let applicationLanguage = "en";
  let lastResult;

  function selectedLocale() { return language.value === "auto" ? applicationLanguage : language.value; }
  function translate() {
    const copy = translations[selectedLocale()] || translations.en;
    for (const [id, value] of Object.entries({
      tagline: copy.tagline, "target-label": copy.targetLabel, "target-help": copy.targetHelp,
      "theme-label": copy.themeLabel, "language-label": copy.languageLabel, "language-auto": copy.auto,
      "display-mode-label": copy.displayModeLabel, "display-mode-visual": copy.displayModeVisual,
      "display-mode-icon": copy.displayModeIcon, "display-mode-help": copy.displayModeHelp,
      "language-en": copy.english, "language-es": copy.spanish, "use-label": copy.useLabel,
      "use-help": copy.useHelp, privacy: copy.privacy,
      "attribution-prefix": copy.attributionPrefix, "attribution-suffix": copy.attributionSuffix
    })) document.getElementById(id).textContent = value;
    for (const [id, value] of Object.entries(httpGuideTranslations[selectedLocale()] || httpGuideTranslations.en)) {
      document.getElementById(id).textContent = value;
    }
    document.documentElement.lang = selectedLocale();
  }
  function persist() {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    const settings = { target: target.value.trim(), theme: theme.value, language: language.value, displayMode: displayMode.value };
    if (lastResult) settings.lastResult = lastResult;
    socket.send(JSON.stringify({ event: "setSettings", context, payload: settings }));
  }
  function updateDisplayMode() {
    theme.disabled = displayMode.value === "custom-icon";
    attribution.hidden = theme.value !== "hexaza" || displayMode.value !== "visual";
  }
  function validate() {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ event: "sendToPlugin", action: actionUuid, context, payload: { type: "validate", target: target.value, language: language.value } }));
  }
  window.connectElgatoStreamDeckSocket = (port, uuid, event, info, actionInfo) => {
    context = uuid;
    const action = JSON.parse(actionInfo);
    actionUuid = action.action;
    applicationLanguage = JSON.parse(info).application?.language === "es" ? "es" : "en";
    const settings = action.payload.settings;
    target.value = typeof settings.target === "string" ? settings.target : "";
    theme.value = ["echo-wave", "terminal", "neon", "hexaza", "sonar", "blueprint-light"].includes(settings.theme) ? settings.theme : "echo-wave";
    displayMode.value = settings.displayMode === "custom-icon" ? "custom-icon" : "visual";
    updateDisplayMode();
    language.value = ["auto", "en", "es"].includes(settings.language) ? settings.language : "auto";
    lastResult = settings.lastResult;
    translate();
    socket = new WebSocket(`ws://127.0.0.1:${port}`);
    socket.onopen = () => { socket.send(JSON.stringify({ event, uuid })); validate(); };
    socket.onmessage = ({ data }) => {
      const message = JSON.parse(data);
      if (message.event === "didReceiveSettings") lastResult = message.payload?.settings?.lastResult;
      if (message.event === "sendToPropertyInspector" && message.payload?.type === "validation") {
        validation.textContent = message.payload.message || "";
        validation.dataset.invalid = message.payload.message ? "true" : "false";
      }
    };
  };
  target.addEventListener("input", () => { lastResult = undefined; validation.textContent = ""; persist(); validate(); });
  theme.addEventListener("change", () => { updateDisplayMode(); persist(); });
  displayMode.addEventListener("change", () => { updateDisplayMode(); persist(); });
  language.addEventListener("change", () => { translate(); persist(); validate(); });
})();
