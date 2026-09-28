/* The Rewrite: authored paths, local learning evidence, and a private project rail. */
(function () {
  'use strict';

  const STORAGE_KEY = 'therewrite.learning.v1';
  const LAYERS = ['energy', 'silicon', 'compute', 'training', 'model', 'inference', 'application', 'security', 'economics', 'policy'];
  const OPTIONS = {
    lens: [['builder', 'Builder'], ['systems', 'Systems'], ['ml', 'ML'], ['policy', 'Policy']],
    depth: [['beginner', 'Beginner · explain the terms'], ['operator', 'Operator · show the tradeoffs'], ['expert', 'Expert · challenge the assumptions']],
    pace: [['quick', '~5 minutes · the essential path'], ['guided', '~10 minutes · pause and apply']],
    format: [['trace', 'Trace a request'], ['read', 'Read the explanation']]
  };
  const LAB_FIELDS = [
    ['thesis', 'Project thesis', 'What will you build, and why does it matter?'],
    ['user', 'Target user', 'One specific person and their job to be done.'],
    ['bottleneck', 'Current bottleneck', 'What most limits a useful outcome today?'],
    ['assumptions', 'Assumptions to test', 'What are you treating as true?'],
    ['risks', 'Risks', 'What could fail or cause harm?'],
    ['next', 'Next action', 'One small test you can run.']
  ];
  const defaults = () => ({
    version: 1,
    profile: { lens: 'builder', depth: 'beginner', pace: 'quick', format: 'trace', knowledge: '', submitted: false },
    answers: {}, attempts: {}, trace: 0, detours: 0,
    lab: { thesis: '', user: '', bottleneck: '', assumptions: '', risks: '', next: '', pins: [] }
  });
  let storageAvailable = true;
  let storageMessage = 'Saved on this device. No account or cloud sync.';
  let state = loadState();
  let saveTimer;

  function validOption(key, value) { return OPTIONS[key].some(option => option[0] === value); }
  function loadState() {
    const clean = defaults();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return clean;
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== 1 || typeof parsed !== 'object') return clean;
      if (parsed.profile && typeof parsed.profile === 'object') {
        Object.keys(OPTIONS).forEach(key => {
          if (validOption(key, parsed.profile[key])) clean.profile[key] = parsed.profile[key];
        });
        if (['reuse', 'retrain', 'unsure'].includes(parsed.profile.knowledge)) clean.profile.knowledge = parsed.profile.knowledge;
        clean.profile.submitted = parsed.profile.submitted === true && !!clean.profile.knowledge;
      }
      ['prior', 'queue'].forEach(id => {
        const choices = id === 'prior' ? ['training', 'inference', 'application'] : ['queue', 'training', 'tokens'];
        if (parsed.attempts && Number.isInteger(parsed.attempts[id]) && parsed.attempts[id] > 0) clean.attempts[id] = Math.min(parsed.attempts[id], 999);
        if (clean.attempts[id] && parsed.answers && choices.includes(parsed.answers[id])) clean.answers[id] = parsed.answers[id];
      });
      if (Number.isInteger(parsed.trace)) clean.trace = Math.max(0, Math.min(3, parsed.trace));
      if (Number.isInteger(parsed.detours)) clean.detours = Math.max(0, Math.min(2, parsed.detours));
      if (parsed.lab && typeof parsed.lab === 'object') {
        LAB_FIELDS.forEach(([key]) => {
          if (typeof parsed.lab[key] === 'string') clean.lab[key] = parsed.lab[key].slice(0, 1400);
        });
        if (Array.isArray(parsed.lab.pins)) {
          const seen = new Set();
          clean.lab.pins = parsed.lab.pins.filter(pin => {
            if (!pin || !LAYERS.includes(pin.id) || seen.has(pin.id) || typeof pin.title !== 'string') return false;
            seen.add(pin.id);
            return true;
          }).slice(0, 10).map(pin => ({ id: pin.id, title: pin.title.slice(0, 90), note: typeof pin.note === 'string' ? pin.note.slice(0, 300) : '' }));
        }
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        storageMessage = 'Unreadable saved data was ignored. Your next edit starts a fresh local record.';
      } else {
        storageAvailable = false;
        storageMessage = 'Device storage is unavailable. Keep this tab open or export your Lab Thread.';
      }
    }
    return clean;
  }
  function save() {
    clearTimeout(saveTimer);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      storageAvailable = true;
      storageMessage = 'Saved on this device. No account or cloud sync.';
    } catch (_) {
      storageAvailable = false;
      storageMessage = 'Device storage is unavailable. Keep this tab open or export your Lab Thread.';
    }
    const status = document.getElementById('lab-storage-status');
    if (status) status.textContent = storageMessage;
  }
  function el(tag, className, text, attributes) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    if (attributes) Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  }
  function button(text, handler, className) {
    const node = el('button', className || 'learning-button', text, { type: 'button' });
    node.addEventListener('click', handler);
    return node;
  }
  function selectField(key, labelText) {
    const wrap = el('label', 'learning-field', null, { for: 'profile-' + key });
    wrap.append(el('span', 'learning-field-label', labelText, { id: 'profile-label-' + key }));
    const select = el('select', '', null, { name: key, id: 'profile-' + key, 'aria-labelledby': 'profile-label-' + key });
    OPTIONS[key].forEach(([value, title]) => select.append(el('option', '', title, { value })));
    select.value = state.profile[key];
    wrap.append(select);
    return wrap;
  }
  function stackLink(id, label) {
    return button(label || 'Locate in The Living Stack ↗', () => {
      document.dispatchEvent(new CustomEvent('stack:select', { detail: { id } }));
    }, 'learning-text-button');
  }
  function moveTo(node) {
    node.setAttribute('tabindex', '-1');
    node.focus({ preventScroll: true });
    node.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  function eyebrow(text) { return el('p', 'learning-eyebrow', text); }
  function renderDiagnostic() {
    const section = document.getElementById('diagnostic');
    if (!section) return;
    section.classList.add('learning-section');
    section.replaceChildren();
    section.append(eyebrow('YOUR WAY THROUGH'), el('h2', '', 'Same system. Your starting point.'));
    section.append(el('p', 'learning-intro', 'Choose the problem you care about. A short check adjusts the starting explanation; your choices change the example, depth, pace, and format.'));
    const form = el('form', 'diagnostic-form');
    const fields = el('div', 'diagnostic-fields');
    fields.append(selectField('lens', 'Your lens'), selectField('depth', 'Depth'), selectField('pace', 'Pace'), selectField('format', 'Start with'));
    form.append(fields);
    const check = el('fieldset', 'learning-question');
    check.append(el('legend', '', 'A person sends a prompt to an already deployed model. What usually happens?'));
    [['reuse', 'The service uses the model’s existing learned weights.'], ['retrain', 'The service trains the model again for this prompt.'], ['unsure', 'I’m not sure yet.']].forEach(([value, label]) => {
      const item = el('label', 'learning-choice');
      const radio = el('input', '', null, { type: 'radio', name: 'knowledge', value, required: '' });
      radio.checked = state.profile.knowledge === value;
      item.append(radio, el('span', '', label));
      check.append(item);
    });
    form.append(check);
    const submit = el('button', 'learning-button learning-primary', state.profile.submitted ? 'Update my path' : 'Set my path', { type: 'submit' });
    form.append(submit, el('p', 'learning-fine', 'An authored route based on your selections. No AI assessment or inferred profile.'));
    const result = el('div', 'path-result', null, { 'aria-live': 'polite', 'aria-atomic': 'true' });
    function showRecommendation() {
      result.replaceChildren();
      if (!state.profile.submitted) return;
      const p = state.profile;
      const knows = p.knowledge === 'reuse';
      result.append(el('h3', '', 'Your route: ' + OPTIONS.lens.find(item => item[0] === p.lens)[1] + ' / ' + p.depth));
      result.append(el('p', '', (knows ? 'You distinguished using a model from training one. ' : 'We’ll start with the difference between training and using a model. ') +
        'Your ' + (p.lens === 'ml' ? 'ML' : p.lens) + ' lens sets the example; ' +
        p.depth + ' depth sets the technical detail. ' + (p.pace === 'quick' ? 'The short path keeps one example and two checks.' : 'The guided path adds prediction pauses and a project exercise.') +
        (p.format === 'trace' ? ' Start by stepping through the request.' : ' Start with a written explanation, then inspect the trace.')));
      result.append(button('Begin lesson 1 →', () => moveTo(document.getElementById('lesson')), 'learning-button learning-primary'));
    }
    form.addEventListener('submit', event => {
      event.preventDefault();
      const data = new FormData(form);
      Object.keys(OPTIONS).forEach(key => { state.profile[key] = data.get(key); });
      state.profile.knowledge = data.get('knowledge');
      state.profile.submitted = true;
      save();
      showRecommendation();
      renderLesson();
      submit.textContent = 'Update my path';
      moveTo(result);
    });
    section.append(form, result);
    showRecommendation();
  }

  const LENSES = {
    builder: {
      title: 'A useful answer is a system outcome.',
      scene: 'You are building a tutor that helps a learner debug a small project. The learner asks, “Why won’t my light turn on?” The product needs to return a useful next step while the learner still cares.',
      stake: 'Your question: which constraint prevents this learner from making progress?',
      prompt: 'For your product, choose one user-visible failure. Is the next experiment about capability, response time, cost, or safety?',
      next: 'Time one complete user task. Record where the person waits and whether the answer helps them take the next step.'
    },
    systems: {
      title: 'One request reveals the whole service.',
      scene: 'You operate a shared inference service. A prompt arrives during a traffic spike. The model is already deployed, but requests wait for accelerator capacity before generating a response.',
      stake: 'Your question: where does waiting accumulate, and which resource is actually saturated?',
      prompt: 'Draw the service boundary. Which queue, resource measurement, and timeout would you inspect first?',
      next: 'Separate queue time from generation time in one request trace before proposing more compute.'
    },
    ml: {
      title: 'Learned capability meets a serving budget.',
      scene: 'You have a trained model that performs well on an evaluation set. Now a user sends a real prompt. Your serving system must load and execute those learned weights within a latency and memory budget.',
      stake: 'Your question: is the failure in learned capability, evaluation coverage, or the way the model is served?',
      prompt: 'Name one evaluation for answer quality and one measurement for serving performance. What would make you change weights instead of infrastructure?',
      next: 'Compare a quality failure with a latency failure using the same input. Decide which one could justify a model change.'
    },
    policy: {
      title: 'A constraint can cross every layer.',
      scene: 'A public service wants to deploy an assistant. A resident sends a prompt containing personal information. Before the answer can be useful, the team must choose an appropriate processing location and data retention policy.',
      stake: 'Your question: which obligation changes the architecture, and who can show it is met?',
      prompt: 'Name one data or deployment constraint. Trace how it changes the serving choice and the user’s experience.',
      next: 'Map where one request is processed and retained. Identify who owns the evidence for the claimed boundary.'
    }
  };
  const DEPTHS = {
    beginner: 'Training is the earlier process that changes a model’s learned numbers, called weights. Inference uses those numbers to produce an output. Compute means the processors doing that work; energy powers the physical equipment. A new prompt usually changes the input, not the learned weights.',
    operator: 'Separate model quality from service behavior. Training updates weights; serving executes a chosen model version. At runtime, request queues, context length, memory capacity, batching, and output length shape latency and cost. Instrument the request before choosing a remedy.',
    expert: 'Treat this as a dependency graph, not a serial pipeline through ten layers. Prefill and token-by-token decoding can have different limits; queueing, memory bandwidth, parallelism, and utilization can dominate at different loads. A faster kernel does not necessarily improve end-to-end tail latency. Validate the workload and service objective first.'
  };
  const TRACE = [
    { title: '01 · The application accepts a prompt', id: 'application', body: 'The interface gathers the input and the relevant context. Product rules decide what is allowed, what data to send, and how the answer will be used.', fact: 'Runtime event: a new request enters the system.' },
    { title: '02 · The serving system schedules work', id: 'inference', body: 'A server checks available capacity and schedules the request. A queue may form before the model starts generating. More traffic can make the user wait even when the model has not changed.', fact: 'Runtime event: scheduling and queueing.' },
    { title: '03 · Compute executes existing weights', id: 'compute', body: 'Processors run the deployed model on the input, then generate output. Silicon and power support that computation. The weights were produced by an earlier training process; this ordinary request does not retrain them.', fact: 'Runtime event: inference. Prior dependency: training.' },
    { title: '04 · An answer reaches the person', id: 'application', body: 'The application presents the response, handles failures, and lets the person act. Useful output depends on task quality as well as speed. Safety rules, cost limits, and deployment policies can shape the whole route.', fact: 'Runtime event: an observable product outcome.' }
  ];
  function renderTrace() {
    const wrap = el('section', 'request-trace', null, { 'aria-label': 'Worked example: follow one request' });
    wrap.append(el('h3', '', 'Follow one request'));
    const controls = el('div', 'trace-controls', null, { role: 'group', 'aria-label': 'Request steps' });
    const detail = el('div', 'trace-detail', null, { 'aria-live': 'polite', 'aria-atomic': 'true' });
    const steps = TRACE.map((step, index) => {
      const control = button(step.title, () => { state.trace = index; save(); update(); }, 'trace-step');
      controls.append(control);
      return control;
    });
    const next = button('Next step →', () => { state.trace = (state.trace + 1) % TRACE.length; save(); update(); }, 'learning-text-button');
    function update() {
      const step = TRACE[state.trace];
      steps.forEach((control, index) => {
        control.setAttribute('aria-pressed', String(index === state.trace));
        control.classList.toggle('is-current', index === state.trace);
      });
      detail.replaceChildren(el('p', 'trace-fact', step.fact), el('h4', '', step.title), el('p', '', step.body), stackLink(step.id));
      next.textContent = state.trace === 3 ? 'Trace again ↺' : 'Next step →';
    }
    wrap.append(controls, detail, next);
    const dependency = el('div', 'trace-dependency');
    dependency.append(el('strong', '', 'Earlier, not on every request'), el('p', '', 'Training produced the deployed weights. Power, chips, and infrastructure enable both training and inference. Security, economics, and policy act across the system. They are dependencies and constraints, not extra request-processing steps.'));
    dependency.append(stackLink('training', 'Inspect the training dependency ↗'));
    wrap.append(dependency);
    update();
    return wrap;
  }

  const QUESTIONS = [
    { id: 'prior', title: 'Which is a prior dependency rather than a step repeated for every ordinary prompt?',
      options: [['training', 'Training the deployed model’s weights'], ['inference', 'Running inference with those weights'], ['application', 'Receiving the prompt in the application']],
      correct: 'training', success: 'Yes. Training created the weights earlier. Ordinary inference reuses them; online learning or an explicit fine-tuning workflow would be a different setup.',
      retry: 'Follow the time boundary: which work created the model before this person sent the prompt? The prompt is received and inference runs now.' },
    { id: 'queue', title: 'A response takes 3 seconds: 2.2 seconds waiting for capacity, 0.6 seconds generating, and 0.2 seconds elsewhere. What should you investigate first?',
      options: [['tokens', 'Make token generation twice as fast'], ['training', 'Retrain the model with more examples'], ['queue', 'Find why requests wait for serving capacity']],
      correct: 'queue', success: 'Yes. Queueing dominates this illustrative trace. Even halving generation saves only 0.3 seconds. Inspect load, scheduling, and capacity before choosing a fix.',
      retry: 'Compare each share of the 3 seconds. Which one is largest? Investigate that cause before deciding whether to change the model or add resources.' }
  ];
  function mastered() { return QUESTIONS.every(question => state.answers[question.id] === question.correct); }
  function renderQuestion(question) {
    const form = el('form', 'recall-question');
    const fieldset = el('fieldset', 'learning-question');
    fieldset.append(el('legend', '', question.title));
    question.options.forEach(([value, title]) => {
      const label = el('label', 'learning-choice');
      const input = el('input', '', null, { type: 'radio', name: question.id, value, required: '' });
      input.checked = state.answers[question.id] === value;
      label.append(input, el('span', '', title));
      fieldset.append(label);
    });
    const submit = el('button', 'learning-button', 'Check my answer', { type: 'submit' });
    const feedback = el('p', 'recall-feedback', null, { 'aria-live': 'polite', 'aria-atomic': 'true' });
    function updateFeedback() {
      if (!state.answers[question.id]) return;
      const correct = state.answers[question.id] === question.correct;
      feedback.textContent = (correct ? 'Correct. ' : 'Try again. ') + (correct ? question.success : question.retry);
      feedback.dataset.correct = String(correct);
      submit.textContent = correct ? 'Check again' : 'Try this answer';
    }
    form.addEventListener('submit', event => {
      event.preventDefault();
      state.answers[question.id] = new FormData(form).get(question.id);
      state.attempts[question.id] = (state.attempts[question.id] || 0) + 1;
      save();
      updateFeedback();
      updateMastery();
    });
    form.append(fieldset, submit, feedback);
    updateFeedback();
    return form;
  }
  function updateMastery() {
    const roadmapStatus = document.getElementById('module-one-status');
    if (roadmapStatus) roadmapStatus.textContent = mastered() ? 'Checks passed' : Object.keys(state.answers).length ? 'In progress' : 'Interactive lesson';
    const node = document.getElementById('lesson-evidence');
    if (!node) return;
    const count = QUESTIONS.filter(q => state.answers[q.id] === q.correct).length;
    node.textContent = mastered()
      ? 'Both checks passed. You identified the training boundary and used a latency trace to choose an investigation. Now apply that reasoning to your project.'
      : count + ' of 2 checks passed. Submit your answers to test the two ideas; reading alone does not complete this lesson.';
    node.classList.toggle('is-complete', mastered());
  }

  const DETOURS = {
    weights: { title: 'What are weights?', short: 'A model’s weights are learned numerical settings. Training adjusts them using examples and an optimization process. During ordinary inference, the settings stay fixed while the input changes.', deep: 'Context is different from weights. Adding a document or a conversation to the prompt can change the answer without changing the trained model. Fine-tuning changes weights; retrieval usually changes the information supplied at inference time.', returnNote: 'Return with one distinction: changing the prompt is not the same as training the model.' },
    queue: { title: 'Why does a queue form?', short: 'Requests arrive while a limited number of processors are busy. Waiting work forms a queue. That wait contributes to latency even before the model begins producing an answer.', deep: 'Near capacity, small changes in arrivals or service time can cause large changes in waiting. Batching can improve throughput but also add waiting. Measure the arrival pattern and the latency target before selecting a scheduling policy.', returnNote: 'Return with one measurement: separate time spent waiting from time spent computing.' },
    constraint: { title: 'How does a bottleneck move?', short: 'A bottleneck is the constraint that currently limits the outcome you care about. Improving it may expose another limit. If waiting disappears, answer quality or cost may become the next thing to address.', deep: 'The limiting resource depends on workload and goal. A service can be memory-limited for one request shape and compute-limited for another. A product can meet its latency target yet still fail because people cannot use the answer.', returnNote: 'Return with one habit: state the outcome before naming the bottleneck.' }
  };
  let detourDialog;
  let detourTrigger;
  let detourScroll = 0;
  function makeDetourDialog() {
    const dialog = el('dialog', 'detour-dialog', null, { 'aria-labelledby': 'detour-title' });
    dialog.addEventListener('close', () => {
      if (detourTrigger && detourTrigger.isConnected) {
        detourTrigger.focus({ preventScroll: true });
        window.scrollTo({ top: detourScroll, behavior: 'instant' });
      }
    });
    document.body.append(dialog);
    return dialog;
  }
  function openDetour(key, trigger) {
    const status = document.getElementById('detour-status');
    if (state.detours >= 2) {
      status.textContent = 'Two detours are enough for this lesson. Return to the request trace, finish the two checks, and record your next action. You can still explore every layer in The Living Stack.';
      moveTo(status);
      return;
    }
    if (!detourDialog) detourDialog = makeDetourDialog();
    if (detourDialog.open) return;
    detourTrigger = trigger;
    detourScroll = window.scrollY;
    state.detours += 1;
    save();
    status.textContent = state.detours + ' of 2 detours used. Each is one explanation and one optional deeper step.';
    const topic = DETOURS[key];
    const returnButton = button('Return to my exact place →', () => detourDialog.close(), 'learning-button learning-primary');
    const deep = el('div', 'detour-deeper');
    const deeperButton = button('One step deeper', () => {
      deep.replaceChildren(el('h3', '', 'One step deeper'), el('p', '', topic.deep), el('p', 'learning-fine', 'This is the end of this detour. Bring the distinction back to the lesson.'));
      deeperButton.remove();
      returnButton.focus();
    }, 'learning-text-button');
    detourDialog.replaceChildren(eyebrow('BOUNDED DETOUR · ' + state.detours + ' / 2'), el('h2', '', topic.title, { id: 'detour-title' }), el('p', '', topic.short), deeperButton, deep, el('p', 'detour-return-note', topic.returnNote), returnButton);
    detourDialog.showModal();
    deeperButton.focus();
  }
  function renderLesson() {
    const section = document.getElementById('lesson');
    if (!section) return;
    section.classList.add('learning-section');
    section.replaceChildren();
    const profile = state.profile;
    const lens = LENSES[profile.lens];
    section.append(eyebrow('01 / 12 · THE GREAT TRANSITION · ' + (profile.pace === 'quick' ? '~5 MINUTES' : '~10 MINUTES')));
    section.append(el('h2', '', lens.title), el('p', 'learning-intro', lens.scene), el('p', 'lesson-stake', lens.stake));
    const route = el('p', 'learning-fine', profile.submitted ? 'Your path: ' + profile.lens + ' · ' + profile.depth + ' · ' + (profile.format === 'trace' ? 'request trace first' : 'explanation first') + '. ' : 'Starting with the builder / beginner path. ');
    route.append(el('a', '', 'Adjust your path', { href: '#diagnostic' }));
    section.append(route);
    if (profile.submitted && profile.knowledge !== 'reuse') {
      section.append(el('p', 'lesson-primer', 'Start here: the model was trained before this request. Sending a prompt normally uses what it already learned. It does not train a new model. Keep that time boundary in mind as you follow the request.'));
    }
    const reading = el('div', 'lesson-reading');
    reading.append(el('h3', '', 'Capability is only one part of the answer.'), el('p', '', DEPTHS[profile.depth]));
    reading.append(el('p', '', 'A useful AI product coordinates those pieces around a person’s task. A better model can help, but it cannot by itself remove a long queue, fix missing context, or choose a responsible deployment boundary.'));
    const trace = renderTrace();
    if (profile.format === 'trace') section.append(trace, reading);
    else section.append(reading, trace);
    if (profile.pace === 'guided') {
      const pause = el('div', 'lesson-pause');
      pause.append(eyebrow('PAUSE & PREDICT'), el('h3', '', 'The traffic doubles. The model stays the same.'), el('p', '', 'Before the check below, predict what could change for the person waiting. Then separate what you would measure from what you would change. A measurement is evidence; a proposed fix is still a hypothesis.'));
      section.append(pause);
    }
    const detours = el('div', 'lesson-detours');
    detours.append(el('h3', '', 'A little context, then back to the lesson.'));
    const detourButtons = el('div', 'detour-links');
    Object.entries(DETOURS).forEach(([key, topic]) => {
      const control = button(topic.title + ' ↗', () => openDetour(key, control), 'learning-text-button');
      detourButtons.append(control);
    });
    detours.append(detourButtons, el('p', 'learning-fine', state.detours + ' of 2 detours used. Each is one explanation and one optional deeper step.', { id: 'detour-status', 'aria-live': 'polite' }));
    section.append(detours);
    const recall = el('section', 'lesson-recall', null, { 'aria-labelledby': 'recall-title' });
    recall.append(eyebrow('TEST YOUR REASONING'), el('h3', '', 'Test the two ideas.', { id: 'recall-title' }));
    QUESTIONS.forEach(question => recall.append(renderQuestion(question)));
    recall.append(el('p', 'lesson-evidence', null, { id: 'lesson-evidence', 'aria-live': 'polite' }));
    section.append(recall);
    const apply = el('section', 'lesson-application');
    apply.append(eyebrow('CARRY IT INTO YOUR LAB'), el('h3', '', 'Name the constraint. Choose a test.'), el('p', '', lens.prompt));
    if (profile.pace === 'guided') apply.append(el('p', '', 'Write the user and the desired outcome first. List one assumption that could make your explanation wrong. Keep the test small enough to produce evidence before you build the whole system.'));
    const action = button('Use this suggested next action', () => {
      const existing = state.lab.next.trim();
      if (existing && existing !== lens.next) {
        applyStatus.textContent = 'Your existing next action is kept. Suggested action: ' + lens.next;
        openLab('next');
        return;
      }
      state.lab.next = lens.next;
      const input = document.getElementById('lab-next');
      if (input) input.value = state.lab.next;
      save();
      applyStatus.textContent = 'Added to your Lab Thread. Edit it to fit your project.';
      openLab('next');
    });
    const applyStatus = el('p', 'learning-fine', '', { 'aria-live': 'polite' });
    apply.append(el('p', 'suggested-action', lens.next), action, applyStatus);
    section.append(apply);
    section.append(el('p', 'lesson-continuity', 'Next: inspect the physical constraints below. The remaining modules are authored previews; this is the complete interactive lesson currently available.'));
    const restart = el('div', 'lesson-restart');
    restart.append(button('Start a fresh lesson pass', () => {
      state.answers = {};
      state.attempts = {};
      state.trace = 0;
      state.detours = 0;
      save();
      renderLesson();
      moveTo(section);
    }, 'learning-text-button'), el('p', 'learning-fine', 'Resets the two checks and the detour budget. Keeps your path and Lab Thread.'));
    section.append(restart);
    updateMastery();
  }

  function openLab(field) {
    const details = document.querySelector('#lab-thread details');
    if (details) details.open = true;
    const target = document.getElementById('lab-' + field);
    if (target) { target.focus(); target.scrollIntoView({ block: 'nearest' }); }
  }
  function renderPins() {
    const list = document.getElementById('lab-pins');
    if (!list) return;
    list.replaceChildren();
    if (!state.lab.pins.length) list.append(el('p', 'learning-fine', 'Pin a concept from The Living Stack to keep it beside your project.'));
    state.lab.pins.forEach(pin => {
      const item = el('li', 'lab-pin');
      item.append(stackLink(pin.id, pin.title + ' ↗'));
      if (pin.note) item.append(el('p', '', pin.note));
      item.append(button('Remove ' + pin.title, () => {
        state.lab.pins = state.lab.pins.filter(candidate => candidate.id !== pin.id);
        save();
        renderPins();
        document.getElementById('lab-pins-heading').focus();
      }, 'lab-remove'));
      list.append(item);
    });
  }
  function renderLab() {
    const rail = document.getElementById('lab-thread');
    if (!rail) return;
    rail.setAttribute('aria-label', 'Lab Thread project notebook');
    rail.replaceChildren();
    const details = el('details', 'lab-shell');
    details.open = matchMedia('(min-width: 801px)').matches;
    const summary = el('summary', 'lab-summary');
    summary.append(el('span', 'learning-eyebrow', 'ONE-PERSON FRONTIER LAB'), el('span', 'lab-heading', 'Lab Thread'), el('span', 'lab-toggle', 'Your project, carried forward'));
    const body = el('div', 'lab-body');
    body.append(el('p', 'lab-intro', 'Keep one project beside the lesson. Change your thesis as the evidence changes.'));
    LAB_FIELDS.forEach(([key, title, placeholder]) => {
      const label = el('label', 'lab-field', null, { for: 'lab-' + key });
      label.append(el('span', '', title));
      const input = el('textarea', '', null, { id: 'lab-' + key, name: key, rows: key === 'thesis' ? '3' : '2', maxlength: '1400', placeholder });
      input.value = state.lab[key];
      input.addEventListener('input', () => {
        state.lab[key] = input.value;
        const status = document.getElementById('lab-storage-status');
        if (status) status.textContent = storageAvailable ? 'Saving on this device…' : storageMessage;
        clearTimeout(saveTimer);
        saveTimer = setTimeout(save, 250);
      });
      input.addEventListener('change', save);
      label.append(input);
      body.append(label);
    });
    body.append(el('h3', 'lab-pins-heading', 'Pinned concepts', { id: 'lab-pins-heading', tabindex: '-1' }), el('ul', 'lab-pins', null, { id: 'lab-pins' }));
    body.append(button('Export Lab Thread ↓', () => {
      save();
      const exportData = { title: 'The Rewrite · Lab Thread', schemaVersion: 1, exportedAt: new Date().toISOString(), project: state.lab, learningPath: state.profile, lessonOne: { submittedAnswers: state.answers, attempts: state.attempts, bothChecksPassed: mastered() } };
      const blob = new Blob([JSON.stringify(exportData, null, 2) + '\n'], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = el('a', '', '', { href: url, download: 'the-rewrite-lab-thread.json' });
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'learning-button lab-export'));
    body.append(el('p', 'learning-fine', storageMessage, { id: 'lab-storage-status', role: 'status' }));
    details.append(summary, body);
    rail.append(details);
    renderPins();
  }
  document.addEventListener('lab:pin', event => {
    const pin = event.detail;
    if (!pin || !LAYERS.includes(pin.id) || typeof pin.title !== 'string') return;
    if (!state.lab.pins.some(existing => existing.id === pin.id)) {
      state.lab.pins.push({ id: pin.id, title: pin.title.slice(0, 90), note: typeof pin.note === 'string' ? pin.note.slice(0, 300) : '' });
      save();
      renderPins();
    }
    const details = document.querySelector('#lab-thread details');
    if (details) details.open = true;
    const status = document.getElementById('lab-storage-status');
    if (status) status.textContent = pin.title.slice(0, 90) + ' is pinned. ' + storageMessage;
  });
  window.addEventListener('pagehide', save);

  const MODULES = [
    ['The Great Transition', 'Distinguish a runtime request from the dependencies that made it possible.', 'No prerequisites.', 'Choose a user outcome and name the first constraint to investigate.', 'application'],
    ['Energy, Silicon, and Physical Constraints', 'Connect power, chips, and memory to feasible workloads.', 'Lesson 1: requests and dependencies.', 'Ask whether your proposed deployment fits its physical and power budget.', 'energy'],
    ['Compute Infrastructure and Cluster Coordination', 'Reason about coordination costs when work spans many processors.', 'Basic understanding of chips and workloads.', 'Identify when distributing work helps, and when communication dominates.', 'compute'],
    ['Training Systems and Model Formation', 'Separate the data, optimization, and evaluation choices that produce a model.', 'Training versus inference; compute constraints.', 'Decide what evidence could justify changing weights.', 'training'],
    ['Inference, Serving, and Real-Time Economics', 'Compare latency, throughput, memory use, and per-request cost.', 'Request tracing and basic model execution.', 'Set a service objective you can measure with real requests.', 'inference'],
    ['Applications, Interfaces, and Product Leverage', 'Connect system behavior to a person’s task and a useful next action.', 'A target user and one complete request trace.', 'Define a task-success test instead of relying on a model score.', 'application'],
    ['Security, Safety, and Deployment Risk', 'Map boundaries, failure modes, and evidence needed before deployment.', 'Application flow and data movement.', 'Write one concrete risk and the control you can verify.', 'security'],
    ['Capital, Platforms, and Value Capture', 'Connect infrastructure cost and platform dependencies to business choices.', 'Serving costs and the target user’s outcome.', 'Test the assumption behind your project’s cost or distribution advantage.', 'economics'],
    ['Policy, Geopolitics, and Constraint Fields', 'Trace how external rules and resource access shape technical choices.', 'Physical constraints and deployment boundaries.', 'Record one policy assumption that needs current, jurisdiction-specific evidence.', 'policy'],
    ['Speaker Constellation: Who Solves What Layer', 'Locate a practitioner’s claims in the system and identify what evidence would support them.', 'Familiarity with the full stack.', 'Connect a practitioner insight to a testable project decision.', 'model'],
    ['The One-Person Frontier Lab', 'Scope a small experiment that produces evidence across the stack.', 'A project thesis, target user, and observed constraint.', 'Define the smallest useful prototype and a clear stopping condition.', 'application'],
    ['Final Synthesis: Where the Next Bottleneck Moves', 'Revisit a system after one limit improves and find the next constraint.', 'Evidence from a project experiment.', 'Revise the Lab Thread using observations, including what did not work.', 'economics']
  ];
  function renderRoadmap() {
    const section = document.getElementById('roadmap');
    if (!section) return;
    section.classList.add('learning-section');
    section.replaceChildren(eyebrow('THE PATH AHEAD'), el('h2', '', 'Twelve modules. One developing project.'), el('p', 'learning-intro', 'Lesson 1 is interactive. Modules 2–12 are scope previews: see their purpose, prerequisites, and what each would add to your Lab Thread.'));
    const list = el('ol', 'module-list', null, { id: 'roadmap-list' });
    MODULES.forEach(([title, objective, prereq, implication, layer], index) => {
      const item = el('li', 'module-row');
      const details = el('details', 'module-preview');
      const summary = el('summary', 'module-summary');
      summary.append(el('span', 'module-number', String(index + 1).padStart(2, '0')), el('span', 'module-title', title), el('span', 'module-status', index === 0 ? 'Interactive lesson' : 'Preview', index === 0 ? { id: 'module-one-status' } : undefined));
      const body = el('div', 'module-detail');
      [['Objective', objective], ['Prerequisites', prereq], ['Your Lab Thread', implication]].forEach(([label, text]) => {
        const paragraph = el('p');
        paragraph.append(el('strong', '', label + '. '), document.createTextNode(text));
        body.append(paragraph);
      });
      if (index === 0) body.append(el('a', 'learning-text-button', 'Open lesson 1 →', { href: '#lesson' }));
      else body.append(el('p', 'learning-fine', 'Full lesson not yet available. Explore the connected layer now:'));
      body.append(stackLink(layer));
      details.append(summary, body);
      item.append(details);
      list.append(item);
    });
    section.append(list);
    updateMastery();
  }
  renderDiagnostic();
  renderLesson();
  renderLab();
  renderRoadmap();
}());
