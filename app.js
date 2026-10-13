"use strict";
const byId = id => document.getElementById(id);
const event = Object.freeze({ name: "Los 15 de Melani", date: "2026-12-26T21:30:00-03:00", venue: "Salón Malva Negra", maps: "https://maps.app.goo.gl/EmF2VvnEGyT7nSCq6", alias: "leandrososa.885", whatsapp: "5493541680176", price: 15000 });
const money = value => "$" + value.toLocaleString("es-AR");
const formatCount = (adults, children) => { const n = adults + children; return `${n} ${n === 1 ? "persona" : "personas"}`; };

function updateCountdown() {
  const remaining = Math.max(0, Math.floor((Date.parse(event.date) - Date.now()) / 1000));
  const parts = [Math.floor(remaining / 86400), Math.floor(remaining / 3600) % 24, Math.floor(remaining / 60) % 60, remaining % 60];
  ["days", "hours", "minutes", "seconds"].forEach((id, i) => { byId(id).textContent = String(parts[i]).padStart(2, "0"); });
  if (!remaining) byId("event-status").textContent = "¡Llegó la fecha de celebrar!";
}
updateCountdown();
setInterval(updateCountdown, 1000);

byId("calendar-toggle").addEventListener("click", () => {
  const open = byId("calendar-toggle").getAttribute("aria-expanded") !== "true";
  byId("calendar-toggle").setAttribute("aria-expanded", String(open));
  byId("calendar-options").hidden = !open;
});
byId("google-calendar").href = "https://calendar.google.com/calendar/render?" + new URLSearchParams({ action: "TEMPLATE", text: event.name, dates: "20261227T003000Z/20261227T003000Z", details: `Celebramos los 15 de Melani. Cómo llegar: ${event.maps}`, location: event.venue, ctz: "America/Argentina/Buenos_Aires" });

byId("copy-alias").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(event.alias);
    byId("copy-status").textContent = "¡Alias copiado! Ya podés pegarlo en tu banco.";
    byId("copy-alias").querySelector("span").textContent = "Copiado";
    setTimeout(() => { byId("copy-alias").querySelector("span").textContent = "Copiar"; }, 3500);
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(byId("alias"));
    selection.removeAllRanges(); selection.addRange(range);
    byId("copy-status").textContent = "Alias seleccionado. Copialo con la opción Copiar de tu dispositivo.";
  }
});

function getGuests() {
  return { adults: Number(byId("adults").value), children: Number(byId("children").value) };
}
function validCount(n) { return Number.isInteger(n) && n >= 0 && n <= 100; }
function updateTotal() {
  const { adults, children } = getGuests();
  const valid = validCount(adults) && validCount(children) && byId("adults").value !== "" && byId("children").value !== "";
  byId("total").textContent = valid ? money(adults * event.price) : "—";
  byId("guest-summary").textContent = valid ? formatCount(adults, children) : "Revisá las cantidades";
  byId("form-error").textContent = "";
  document.querySelectorAll("[data-step]").forEach(button => {
    const input = byId(button.dataset.for), count = Number(input.value);
    button.disabled = Number(button.dataset.step) < 0 ? count <= 0 : count >= 100;
  });
}
document.querySelectorAll("[data-step]").forEach(button => button.addEventListener("click", () => {
  const input = byId(button.dataset.for);
  input.value = Math.max(0, Math.min(100, Math.trunc(Number(input.value) || 0) + Number(button.dataset.step)));
  updateTotal();
}));
["adults", "children"].forEach(id => byId(id).addEventListener("input", updateTotal));
byId("guest-name").addEventListener("input", () => byId("guest-name").setCustomValidity(""));
updateTotal();

function buildMessage(name, adults, children) {
  return `¡Hola! Quiero confirmar mi asistencia a los 15 de Melani.\n\nNombre: ${name}\nPersonas de 12 años o más: ${adults}\nMenores de 12 años: ${children}\nTotal a transferir: ${money(adults * event.price)}.\n\n${adults ? "Enviaré el comprobante de la transferencia en este chat." : "Todos los asistentes son menores de 12 años."}`;
}
byId("rsvp-form").addEventListener("submit", e => {
  e.preventDefault();
  const name = byId("guest-name").value.trim();
  const { adults, children } = getGuests();
  if (name.length < 2) {
    byId("guest-name").setCustomValidity("Escribí tu nombre y apellido.");
    byId("guest-name").reportValidity(); return;
  }
  if (!validCount(adults) || !validCount(children) || adults + children < 1) {
    byId("form-error").textContent = "Indicá al menos una persona. Usá cantidades enteras entre 0 y 100.";
    byId("adults").focus(); return;
  }
  const message = buildMessage(name, adults, children);
  byId("message-preview").textContent = message;
  byId("receipt-note").textContent = adults ? "Al abrir WhatsApp, adjuntá el comprobante y enviá el mensaje al 3541 680176." : "No hay importe a transferir. Enviá el mensaje al 3541 680176 para confirmar.";
  byId("whatsapp-link").href = `https://wa.me/${event.whatsapp}?text=${encodeURIComponent(message)}`;
  byId("guest-dialog").close();
  byId("rsvp-dialog").showModal();
});
document.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", () => byId(button.dataset.close).close()));
document.querySelectorAll("dialog").forEach(dialog => dialog.addEventListener("click", e => {
  const box = dialog.getBoundingClientRect();
  if (e.target === dialog && (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom)) dialog.close();
}));
let musicApiPromise, musicPlayer;
function loadMusicApi() {
  if (window.YT?.Player) return Promise.resolve();
  if (!musicApiPromise) musicApiPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Music unavailable")), 12000);
    window.onYouTubeIframeAPIReady = () => { clearTimeout(timeout); resolve(); };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.onerror = () => { clearTimeout(timeout); reject(new Error("Music unavailable")); };
    document.head.append(script);
  });
  return musicApiPromise;
}
function musicUnavailable() {
  byId("music-player").hidden = true;
  byId("music-status").textContent = "YouTube no pudo reproducir la canción aquí. Podés escucharla desde el enlace de abajo.";
}
byId("music-open").addEventListener("click", async () => {
  if (byId("music-dialog").open) { byId("music-dialog").close(); return; }
  byId("music-dialog").show();
  byId("music-status").textContent = "Preparando la música…";
  byId("music-player").hidden = false;
  try {
    await loadMusicApi();
    if (!byId("music-dialog").open) return;
    const holder = document.createElement("div");
    byId("music-player").replaceChildren(holder);
    musicPlayer = new YT.Player(holder, {
      host: "https://www.youtube-nocookie.com", videoId: "IpPIK4T068s", width: "312", height: "200",
      playerVars: { autoplay: 1, playsinline: 1, controls: 1, loop: 1, playlist: "IpPIK4T068s", origin: location.origin },
      events: {
        onReady: e => { e.target.getIframe().title = "Test Drive — reproductor de YouTube"; byId("music-status").textContent = ""; e.target.setVolume(45); e.target.playVideo(); },
        onError: musicUnavailable,
        onAutoplayBlocked: () => { byId("music-status").textContent = "Tocá reproducir para escuchar la canción."; }
      }
    });
  } catch { musicUnavailable(); }
});
byId("music-dialog").addEventListener("close", () => {
  if (musicPlayer) { musicPlayer.destroy(); musicPlayer = null; }
  byId("music-player").replaceChildren();
});

byId("open-rsvp").addEventListener("click", () => byId("guest-dialog").showModal());
byId("edit-guests").addEventListener("click", () => {
  byId("rsvp-dialog").close();
  byId("guest-dialog").showModal();
});

// Keep the document readable when JavaScript is unavailable.
const cover = byId("cover");
const invitation = byId("invitation-content");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
if (!location.hash) {
  cover.hidden = false;
  invitation.inert = true;
  document.body.classList.add("covered");
}
byId("open-invitation").addEventListener("click", () => {
  byId("open-invitation").disabled = true;
  cover.classList.add("opening");
  const delay = reducedMotion.matches ? 0 : 750;
  setTimeout(() => {
    cover.classList.add("opened");
    invitation.inert = false;
    document.body.classList.remove("covered");
    byId("hero-title").focus({preventScroll: true});
    window.scrollTo({top: 0, behavior: "instant"});
    setTimeout(() => { cover.hidden = true; }, reducedMotion.matches ? 0 : 700);
  }, delay);
});
