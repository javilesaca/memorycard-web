import { saveScore } from './scores.js';
import { calcularTablero, DIFICULTAD } from './board.js';

document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const timeDisplay = document.getElementById('time');
    const formContainer = document.getElementById('score-form');
    const saveForm = document.getElementById('save-score-form');
    const initialsInput = document.getElementById('initials');
    const botones = document.querySelectorAll('[data-dificultad]');

    const ICONOS = ['🍒', '🍋', '🍇', '🍉', '⭐', '💎', '🔥', '⚡', '🎮', '👾', '🎲', '🎯', '🚀', '🌙', '🍀'];
    let nivelActual = 'normal';
    let icons = [];
    let cards = [];
    let totalParejas = 0;
    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let matched = 0;

    let startTime = null;
    let timerInterval = null;

    botones.forEach(btn => btn.addEventListener('click', () => {
      botones.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      nuevaPartida(btn.dataset.dificultad);
    }));

    // Dificultad inicial desde la URL (?dificultad=facil) o normal.
    const params = new URLSearchParams(window.location.search);
    const inicial = DIFICULTAD[params.get('dificultad')] ? params.get('dificultad') : 'normal';
    document.querySelector(`[data-dificultad="${inicial}"]`)?.classList.add('active');
    nuevaPartida(inicial);

    function nuevaPartida(nivel) {
      nivelActual = DIFICULTAD[nivel] ? nivel : 'normal';
      const { paresMin, paresMax } = DIFICULTAD[nivelActual];
      // Hueco real disponible (el tablero ocupa todo el ancho del contenedor
      // y ~65vh de alto; si el layout cambia, el grid se recalcula).
      const rect = board.getBoundingClientRect();
      const W = Math.max(280, rect.width || board.parentElement.clientWidth);
      const H = Math.max(320, window.innerHeight * 0.6);
      const { filas, columnas, pares } = calcularTablero(W, H, paresMin, paresMax);

      icons = ICONOS.slice(0, pares);
      cards = [...icons, ...icons];
      totalParejas = pares;
      matched = 0;
      clearInterval(timerInterval);
      startTime = null;
      timeDisplay.textContent = '0.00';
      formContainer.style.display = 'none';

      board.innerHTML = '';
      board.style.gridTemplateColumns = `repeat(${columnas}, 1fr)`;
      board.dataset.filas = filas;
      shuffle(cards);
      createBoard();
    }

    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }

    function createBoard() {
      cards.forEach(icon => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.icon = icon;
        card.innerHTML = '?';
        card.addEventListener('click', flipCard);
        board.appendChild(card);
      });
    }

    function flipCard() {
      if (lockBoard || this.classList.contains('flipped')) return;

      if (!startTime) {
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 100);
      }

      this.classList.add('flipped');
      this.innerHTML = this.dataset.icon;

      if (!firstCard) {
        firstCard = this;
        return;
      }

      secondCard = this;
      checkForMatch();
    }

    function checkForMatch() {
      const isMatch = firstCard.dataset.icon === secondCard.dataset.icon;

      if (isMatch) {
        matched += 1;
        resetTurn();
        if (matched === totalParejas) endGame();
      } else {
        lockBoard = true;
        setTimeout(() => {
          firstCard.classList.remove('flipped');
          secondCard.classList.remove('flipped');
          firstCard.innerHTML = '?';
          secondCard.innerHTML = '?';
          resetTurn();
        }, 1000);
      }
    }

    function resetTurn() {
      [firstCard, secondCard] = [null, null];
      lockBoard = false;
    }

    function updateTimer() {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      timeDisplay.textContent = elapsed;
    }

    function endGame() {
      clearInterval(timerInterval);
      formContainer.style.display = 'block';
    }

     // Guardar iniciales y tiempo
  saveForm.addEventListener('submit', async e => {
    e.preventDefault();
    const initials = initialsInput.value.toUpperCase();
    const score = parseFloat(timeDisplay.textContent);

    if (!/^[A-Z]{3}$/.test(initials)) {
      alert('Debes ingresar exactamente 3 letras (A-Z)');
      return;
    }

    await saveScore(initials, score, nivelActual);
    window.location.href = `index.html?nivel=${nivelActual}`;
  });
});
