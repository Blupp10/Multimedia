// =========================================================
// Pocari Sweat — Landing Page Video Iklan
// =========================================================
const preview   = document.getElementById("previewVideo"); // video kecil di hero (muted, loop)
const fullVideo = document.getElementById("fullVideo");    // video di modal (dengan suara)
const player    = document.getElementById("player");
const nav       = document.getElementById("nav");

/* ---------- 1. Buka / tutup pemutar video penuh ---------- */
function openPlayer(startAt = 0) {
  player.classList.add("is-open");
  player.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
  preview.pause();

  const start = () => { fullVideo.currentTime = startAt; fullVideo.play(); };
  // preload="none" -> tunggu metadata dulu sebelum lompat ke detik tertentu
  if (fullVideo.readyState >= 1) start();
  else { fullVideo.addEventListener("loadedmetadata", start, { once: true }); fullVideo.load(); }
}

function closePlayer() {
  fullVideo.pause();
  player.classList.remove("is-open");
  player.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
  preview.play();
}

// Semua elemen ber-atribut data-play (tombol hero, kartu preview, kartu scene) membuka pemutar
document.querySelectorAll("[data-play]").forEach((el) => {
  el.addEventListener("click", () => openPlayer(Number(el.dataset.play)));
});
document.getElementById("playerClose").addEventListener("click", closePlayer);
player.addEventListener("click", (e) => { if (e.target === player) closePlayer(); }); // klik area gelap
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && player.classList.contains("is-open")) closePlayer(); });
fullVideo.addEventListener("ended", closePlayer);

/* ---------- 2. Navbar berubah solid setelah lewat hero ---------- */
window.addEventListener("scroll", () => {
  nav.classList.toggle("is-solid", window.scrollY > window.innerHeight - 100);
});

/* ---------- 3. Metadata otomatis dari file video ---------- */
function gcd(a, b) { return b ? gcd(b, a % b) : a; }

function fillAuto(id, text) {
  const el = document.getElementById(id);
  if (el) { el.textContent = text; el.classList.add("is-auto"); }
}

function onMeta() {
  const d = preview.duration;
  const mm = String(Math.floor(d / 60)).padStart(2, "0");
  const ss = String(Math.round(d % 60)).padStart(2, "0");
  fillAuto("m-duration", `${mm}:${ss} (${d.toFixed(2)} detik)`);
  document.getElementById("previewTime").textContent = `${mm}:${ss}`;

  const w = preview.videoWidth, h = preview.videoHeight;
  fillAuto("m-res", `${w} × ${h} px`);
  const g = gcd(w, h);
  fillAuto("m-ratio", `${w / g}:${h / g}`);
}
if (preview.readyState >= 1) onMeta();
else preview.addEventListener("loadedmetadata", onMeta);

// Ukuran file dibaca dari header HTTP (jalan saat sudah di-hosting / pakai local server)
fetch(preview.currentSrc || preview.src, { method: "HEAD" })
  .then((res) => {
    const bytes = Number(res.headers.get("content-length"));
    if (bytes) fillAuto("m-size", `${(bytes / 1024 / 1024).toFixed(1)} MB`);
  })
  .catch(() => {});

/* ---------- 4. Animasi muncul saat scroll ---------- */
const targets = document.querySelectorAll(".section h2, .section .lead, .about__text, .stat, .talent, .scene, .el, .meta__group, .refs li, .delivery > p");
targets.forEach((el) => el.classList.add("reveal"));
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
  });
}, { threshold: 0.15 });
targets.forEach((el) => io.observe(el));
