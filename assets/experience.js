/* ANIMATION STORYBOARD — a finite, causal activation, never an idle loop.
 *    0ms   energy provides the physical floor
 *  550ms   silicon starts; each subsequent layer follows at 550ms intervals
 * 3850ms   external safety, policy and capital constraints become visible
 * Scroll or the range control can set the same stage directly.
 * Reduced motion shows all layers immediately; explanations stay available.
 */
(function () {
  'use strict';
  const TIMING = { layerStep: 550 }; // milliseconds between enabling layers
  const SCENES = [
    ['ENERGY', 'Power makes compute possible. Start at the physical floor.'],
    ['SILICON', 'Chips turn power into computation. Hardware bounds what can run.'],
    ['COMPUTE', 'Networks and schedulers make chips work together. Coordination is a constraint of its own.'],
    ['TRAINING', 'Coordinated compute turns data into model weights. This happens before a live request.'],
    ['MODELS', 'The weights carry learned capability. Architecture and training shape what is possible.'],
    ['INFERENCE', 'Serving turns that capability into a response. Speed and cost now matter on every request.'],
    ['APPLICATIONS', 'A useful response becomes product value. A slow or unreliable service can erase the gain.'],
    ['EXTERNAL CONSTRAINTS', 'Safety, policy and capital bound the whole system. They are not extra runtime steps.']
  ];
  const slider = document.getElementById('boot-progress');
  const play = document.getElementById('boot-play');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let stage = 1;
  let timer = null;
  let manual = false;
  function showStage(next) {
    stage = Math.max(1, Math.min(8, next));
    slider.value = String(stage);
    slider.setAttribute('aria-valuetext', SCENES[stage - 1][0] + '; stage ' + stage + ' of 8');
    document.querySelectorAll('.scene-layer').forEach((row) => {
      const active = Number(row.dataset.stage) <= stage;
      row.classList.toggle('is-online', active);
      row.querySelector('.scene-state').textContent = active ? 'Online' : 'Waiting';
    });
    document.getElementById('scene-fields').classList.toggle('is-online', stage === 8);
    document.getElementById('scene-count').textContent = '0' + stage + ' / 08';
    document.getElementById('scene-kicker').textContent = '0' + stage + ' / ' + SCENES[stage - 1][0];
    document.getElementById('scene-explanation').textContent = SCENES[stage - 1][1];
  }
  function stop() { clearInterval(timer); timer = null; play.textContent = reducedMotion.matches ? 'Show full system' : 'Replay the sequence'; }
  slider.addEventListener('input', () => { manual = true; stop(); showStage(Number(slider.value)); });
  play.addEventListener('click', () => {
    manual = true;
    if (timer) { stop(); return; }
    if (reducedMotion.matches) { showStage(8); return; }
    showStage(1);
    play.textContent = 'Pause sequence';
    timer = setInterval(() => { showStage(stage + 1); if (stage === 8) stop(); }, TIMING.layerStep);
  });
  window.addEventListener('scroll', () => {
    if (manual || reducedMotion.matches) return;
    const opening = document.getElementById('opening');
    const progress = Math.min(1, window.scrollY / Math.max(280, opening.offsetHeight * .55));
    showStage(Math.max(stage, 1 + Math.floor(progress * 7)));
  }, { passive: true });
  reducedMotion.addEventListener('change', () => { stop(); if (reducedMotion.matches) showStage(8); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  if (reducedMotion.matches) play.textContent = 'Show full system';
  showStage(reducedMotion.matches ? 8 : 1);
})();
