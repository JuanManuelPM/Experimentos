# Failures — viewport

- SCROLL-001 · desalineación después de page scroll.
- SCROLL-002 · intento de interacción con target todavía fuera de viewport.
- VIEWPORT-003 · **CRITICAL**: durante autoplay el usuario podía alterar el scroll con wheel/touch/teclas y romper la geometría del Director.
  - V6 candidate fix: `DemoViewportAuthority` gives ENGINE exclusive viewport control while a scene runs, blocks accidental human scrolling, and releases control after the scene.
  - Human visual regression review still required.

Agregar aquí observaciones humanas nuevas con ID estable, observed, expected y severity.
