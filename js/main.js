import { getTopScores, nivelValido } from './scores.js';

window.addEventListener("DOMContentLoaded", async () => {
  const ranking = document.getElementById("ranking");
  const tabs = document.querySelectorAll('[data-nivel]');

  const params = new URLSearchParams(window.location.search);
  let nivel = nivelValido(params.get('nivel'));

  async function pintar() {
    tabs.forEach(b => b.classList.toggle('active', b.dataset.nivel === nivel));
    ranking.innerHTML = "<li>Cargando ranking...</li>";
    const data = await getTopScores(nivel);
    ranking.innerHTML = "";
    if (data.length === 0) {
      ranking.innerHTML = "<li>Sé el primero en este nivel 🏆</li>";
      return;
    }
    data.forEach(player => {
      const li = document.createElement("li");
      const marca = player.offline ? " (local)" : "";
      li.textContent = `${player.initials} — ${Number(player.time).toFixed(2)}s${marca}`;
      ranking.appendChild(li);
    });
  }

  tabs.forEach(b => b.addEventListener('click', () => {
    nivel = b.dataset.nivel;
    history.replaceState(null, '', `?nivel=${nivel}`);
    pintar();
  }));

  // El botón JUGAR hereda el nivel visible.
  document.getElementById('jugar')?.addEventListener('click', e => {
    e.preventDefault();
    window.location.href = `game.html?dificultad=${nivel}`;
  });

  pintar();
});
