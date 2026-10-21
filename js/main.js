const P = [
  ["Фотоомоложение Lumecca", "от 1 800 ₽"],
  ["Morpheus8", "по консультации"],
  ["Нитевой лифтинг", "по консультации"],
  ["Плазмолифтинг", "по консультации"],
  ["СМАС-лифтинг", "по консультации"],
  ["Гидропилинг", "по консультации"],
  ["Омоложение губ", "по консультации"],
  ["Комбо против целлюлита", "по консультации"],
  ["Уход для зоны вокруг глаз", "по консультации"],
];
const $ = (s) => document.querySelector(s);
const stage = $("#stage"), stepper = $("#stepper"), chat = $("#chat"), admin = $("#admin");
const st = { proc: null, day: null, time: null };
const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() + i + 1); return d; });
const dn = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
const fmt = (d) => `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
const slots = ["09:30", "11:00", "12:30", "14:00", "15:30", "17:00", "18:30", "20:00"];
const taken = (d, t) => ((d.getDate() * 7 + t.charCodeAt(1) + t.charCodeAt(3)) % 5) === 0;

function setStep(n) { [...stepper.children].forEach((li, i) => { li.className = i < n ? "done" : i === n ? "on" : ""; }); }
function say(text, me) { const m = document.createElement("div"); m.className = "m " + (me ? "me" : "bot"); m.textContent = text; chat.appendChild(m); chat.scrollTop = chat.scrollHeight; }

function s1() {
  setStep(0);
  stage.innerHTML = `<h2 class="h">Выберите процедуру</h2><div class="grid">${P.map((p, i) => `<button class="proc" data-i="${i}"><b>${p[0]}</b><span>${p[1]}</span></button>`).join("")}</div>`;
  stage.querySelectorAll(".proc").forEach((b) => b.onclick = () => { st.proc = P[b.dataset.i]; say(`Хочу записаться: ${st.proc[0]}`, true); setTimeout(() => say("Отлично! Выберите удобный день и время."), 350); s2(); });
}
function s2() {
  setStep(1);
  stage.innerHTML = `<h2 class="h">Когда вам удобно?</h2><div class="days">${days.map((d, i) => `<button class="day" data-i="${i}">${dn[d.getDay()]}<small>${fmt(d)}</small></button>`).join("")}</div><div class="slots" id="slots"></div><p class="muted small">Время в макете примерное: в рабочей версии свободные окна берутся из вашего расписания.</p>`;
  const pick = (i) => {
    st.day = days[i];
    stage.querySelectorAll(".day").forEach((x, j) => x.classList.toggle("on", j === i));
    $("#slots").innerHTML = slots.map((t) => `<button class="slot" ${taken(st.day, t) ? "disabled" : ""}>${t}</button>`).join("");
    $("#slots").querySelectorAll(".slot:not([disabled])").forEach((b) => b.onclick = () => { st.time = b.textContent; say(`${fmt(st.day)} в ${st.time}`, true); setTimeout(() => say("Почти готово: как вас зовут и какой номер телефона?"), 350); s3(); });
  };
  stage.querySelectorAll(".day").forEach((b) => b.onclick = () => pick(+b.dataset.i));
  pick(0);
}
function s3() {
  setStep(2);
  stage.innerHTML = `<div class="sum"><b>${st.proc[0]}</b><br>${fmt(st.day)}, ${st.time}</div>
  <form id="f"><div class="field"><label>Имя</label><input id="n" required maxlength="30" placeholder="Анна"></div>
  <div class="field"><label>Телефон</label><input id="p" required inputmode="tel" placeholder="+7 ___ ___-__-__"></div>
  <button class="btn">Записаться</button><button type="button" class="btn ghost" id="back">Назад</button></form>`;
  $("#back").onclick = s2;
  $("#f").onsubmit = (e) => { e.preventDefault(); done($("#n").value.trim(), $("#p").value.trim()); };
}
function done(n, p) {
  setStep(3);
  stage.innerHTML = `<div class="ok"><h2>Вы записаны, ${n.replace(/</g, "")}!</h2><p>${st.proc[0]}, ${fmt(st.day)} в ${st.time}. Накануне напомним сообщением.</p><p class="muted small">Это демо: заявка никуда не отправлена.</p><button class="btn" id="again">Записать ещё раз</button></div>`;
  $("#again").onclick = () => { st.proc = st.day = st.time = null; s1(); };
  say(`${n}, ${p}`, true);
  setTimeout(() => say(`Готово, ${n}! Записал вас: ${st.proc[0]}, ${fmt(st.day)} в ${st.time}. Напомню накануне. Если планы изменятся, нажмите «Перенести».`), 400);
  const req = document.createElement("div"); req.className = "req";
  req.innerHTML = `<b>Новая заявка</b><br>${n.replace(/</g, "")}, ${p.replace(/</g, "")}<br>${st.proc[0]}<br>${fmt(st.day)}, ${st.time}`;
  if (admin.querySelector(".muted")) admin.innerHTML = "";
  admin.prepend(req);
}
s1();
