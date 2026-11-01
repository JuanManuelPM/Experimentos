/* Universal UI · estados de una capacidad.
   Un control solo se muestra como funcional si su estado es APPLIED o AVAILABLE. */
(function (UUI) {
  'use strict';
  const STATUS = Object.freeze({
    AVAILABLE: 'available',      // elementos reales encontrados; la modificación no está activa
    APPLIED: 'applied',          // activa y verificada contra el DOM real
    NOT_FOUND: 'not_found',      // ningún selector candidato coincide con la página actual
    INCOMPATIBLE: 'incompatible',// la app está en un estado donde no se puede aplicar (p. ej. tema claro)
    ERROR: 'error',              // se aplicó pero la verificación falló; se revirtió
  });
  const LABEL = {
    available: 'Disponible',
    applied: 'Aplicado',
    not_found: 'No encontrado',
    incompatible: 'Incompatible',
    error: 'Error',
  };
  // ¿Puede el usuario operar el control?
  function isOperable(status) {
    return status === STATUS.AVAILABLE || status === STATUS.APPLIED;
  }
  UUI.STATUS = STATUS;
  UUI.STATUS_LABEL = LABEL;
  UUI.isOperable = isOperable;
})(globalThis.UUI = globalThis.UUI || {});
