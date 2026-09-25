# RPG Mobile — Prototype

Jogo 2D mobile independente, estruturado para evolução incremental sem concentrar as mecânicas em um único arquivo.

## Estrutura
- `src/main.js` — inicialização e game loop
- `src/core/` — configuração e estado compartilhado
- `src/player/` — movimento, combate e regeneração do jogador
- `src/mobs/` — spawn e máquina de estados da IA
- `src/items/` — drops, morte e sacola de recuperação
- `src/input/` — joystick, teclado e proteção de gestos mobile
- `src/rendering/` — Canvas e HUD

## Gameplay atual
Mundo 2D amplo com câmera, encontros de mobs, combate, drops, sacola persistente no local da morte e regeneração pós-combate.

O jogador regenera 1 HP/s após 5 s fora de combate. Mobs possuem território, limite de perseguição, cooldown entre ataques, retorno ao ponto de origem e regeneração após o combate.

Os valores de balanceamento ficam centralizados em `src/core/config.js` para facilitar skills, atributos, equipamentos e tipos diferentes de inimigos futuramente.


<!-- vercel-git-connected: 2026-09-25 -->