# 🧠 MemoryCard Arcade (Web)

Juego de memoria estilo arcade jugable en el navegador: descubre todas las parejas en el menor tiempo posible y entra en el ranking con tus iniciales.

👉 **Demo viva:** https://javilesaca.pro/memoryCard/

## ✨ Qué incluye

- **Tablero responsive:** calcula filas × columnas según la pantalla (móvil, tablet, desktop) — siempre rectángulo lleno, sin huecos (`js/board.js`, con tests).
- **3 dificultades:** Fácil (10-12 cartas), Normal (16-20), Difícil (24-30).
- **Ranking por niveles** con Firebase Firestore + fallback a `localStorage` (la demo nunca se queda sin ranking).
- Efecto glow retro, sonidos arcade, temporizador centesimal.

## 🛠 Stack

HTML5 · CSS3 (Grid, `aspect-ratio`) · JavaScript ES6+ (módulos) · Firebase Firestore · Tests con `node --test`.

```bash
# Jugar en local
python3 -m http.server 8000
# → http://localhost:8000/

# Tests del tablero
node --test test/board.test.js
```

## 🔗 Proyecto hermano

Existe una versión **desktop en Java + JavaFX** (mismo juego, interfaz de escritorio con FXML, CSS y sonidos):
👉 https://github.com/javilesaca/memoryCard

Esta web es su hermana arcade para navegador: mismo juego, ranking online y sin instalación.

## 📄 Licencia

MIT — uso libre con atribución.
