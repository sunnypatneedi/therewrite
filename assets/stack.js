(function() {
  'use strict';

  /* ==========================================================
     DATA: Layer definitions
     ========================================================== */
  var LAYERS = [
  {
    "id": "energy",
    "name": "Energy & Power",
    "brief": "Electricity, cooling, and a place to run the machines",
    "color": "var(--color-energy)",
    "tag": "L1",
    "constraint": false,
    "panel": {
      "what": "A data center needs a reliable electricity supply and a way to remove heat. These physical systems support both model training and the servers that answer requests.",
      "why": "A chip cannot deliver useful work if the facility cannot power or cool it. Adding software capacity does not remove a physical limit.",
      "depends": [
        "Electricity supply",
        "Cooling systems",
        "Facility capacity",
        "Equipment reliability"
      ],
      "breaks": "A power interruption can stop service. A cooling limit can force equipment to slow down or take capacity offline.",
      "who": "Utilities, facility operators, hardware operators, and cloud providers.",
      "builder": "Include availability and region constraints when choosing a provider. The cheapest advertised compute is not useful if it cannot support your workload.",
      "lab": "Name one physical dependency your project inherits from its provider. Record what a service interruption would mean for your user."
    }
  },
  {
    "id": "silicon",
    "name": "Silicon & Chips",
    "brief": "Processors, memory, and the bandwidth between them",
    "color": "var(--color-silicon)",
    "tag": "L2",
    "constraint": false,
    "panel": {
      "what": "Processors perform the calculations. Memory holds model parameters and working data; connections move that data where it is needed.",
      "why": "A fast processor can still wait on memory. The useful capacity of a machine depends on the workload and how data moves through it.",
      "depends": [
        "Power and cooling",
        "Chip fabrication",
        "Memory capacity",
        "Memory and connection bandwidth"
      ],
      "breaks": "A model may not fit in available memory. Moving data can take longer than the calculation itself.",
      "who": "Chip designers, fabrication plants, memory suppliers, and hardware system builders.",
      "builder": "Compare the complete workload, including memory and serving software. A headline chip specification does not predict your product latency.",
      "lab": "For a local model, check memory requirements before choosing hardware. For an API, measure user-visible performance rather than guessing the underlying chip."
    }
  },
  {
    "id": "compute",
    "name": "Compute & Clusters",
    "brief": "Machines coordinated into a usable service",
    "color": "var(--color-compute)",
    "tag": "L3",
    "constraint": false,
    "panel": {
      "what": "A cluster coordinates machines, network connections, storage, and scheduled work. Training jobs and inference services can use this infrastructure in different ways.",
      "why": "Adding machines helps only when work can reach them and they can communicate. Queues and uneven demand can leave some resources busy while others sit idle.",
      "depends": [
        "Processors and memory",
        "Network capacity",
        "Scheduling",
        "Recovery and monitoring"
      ],
      "breaks": "Machine failures, overloaded queues, slow connections, and recovery traffic can reduce available capacity.",
      "who": "Cloud infrastructure teams, cluster operators, and platform engineers.",
      "builder": "Decide which failures your product can tolerate. Use timeouts, clear error states, and workload limits that match that decision.",
      "lab": "Sketch what happens if the serving provider is unavailable. A safe retry, a smaller feature, or a clear pause can each be an intentional response."
    }
  },
  {
    "id": "training",
    "name": "Training Systems",
    "brief": "Data and optimization shape model behavior before serving",
    "color": "var(--color-training)",
    "tag": "L4",
    "constraint": false,
    "panel": {
      "what": "Training adjusts model parameters using data and an optimization objective. Further training can change how a model follows instructions or handles a particular task.",
      "why": "Training shapes what the model can do before it receives your request. A normal inference call uses existing parameters; it does not retrain the model on that prompt.",
      "depends": [
        "Training data",
        "Compute infrastructure",
        "Learning objective",
        "Evaluation examples"
      ],
      "breaks": "Poor or unrepresentative data, unstable optimization, and an objective that rewards the wrong behavior can produce a model that fails your task.",
      "who": "Model researchers, data teams, training engineers, and evaluators.",
      "builder": "Start with examples of success and failure. Compare prompting, retrieval, and fine-tuning against the same evaluation before choosing more training.",
      "lab": "Write a few representative tasks and the evidence that would count as a good result. Use data only when you have the rights and consent needed for that use."
    }
  },
  {
    "id": "model",
    "name": "Model Architecture",
    "brief": "The structure and learned parameters used to make predictions",
    "color": "var(--color-model)",
    "tag": "L5",
    "constraint": false,
    "panel": {
      "what": "A model combines an architecture with learned parameters. Different designs process information differently; text, image, and audio systems need not follow the same generation process.",
      "why": "Model choice affects capability, memory needs, and how work is performed. Size alone does not establish which model is best for a product.",
      "depends": [
        "Architecture design",
        "Training process",
        "Available memory",
        "Serving implementation"
      ],
      "breaks": "A model may fail on unfamiliar inputs, produce unsupported claims, or require resources that do not fit the product.",
      "who": "Model developers, applied researchers, and the teams selecting models for products.",
      "builder": "Choose against your task: acceptable quality, response time, cost, and data requirements. Evaluate the complete system with representative examples.",
      "lab": "Write one case where a model can sound convincing while being wrong. Decide how the product would detect or contain that failure."
    }
  },
  {
    "id": "inference",
    "name": "Inference & Serving",
    "brief": "Turn a request into a response using an existing model",
    "color": "var(--color-inference)",
    "tag": "L6",
    "constraint": false,
    "panel": {
      "what": "Serving receives a request, schedules work, runs the model, and returns output. It may combine requests into batches or reuse previously computed information.",
      "why": "Users experience the quality and speed of this whole path. Waiting in a queue can matter as much as the model calculation.",
      "depends": [
        "Model behavior",
        "Hardware and memory",
        "Traffic patterns",
        "Latency requirements"
      ],
      "breaks": "Demand can outpace serving capacity. Long requests, rate limits, and slow recovery can make latency or failure rates unacceptable.",
      "who": "Model-serving engineers, platform teams, and application teams operating their own models.",
      "builder": "Measure time to useful output and completed-task cost. A faster response that fails the task is not a successful optimization.",
      "lab": "Pick a response-time target for one user task. Then identify what you could change if traffic increased: request length, model, queue, or interaction."
    }
  },
  {
    "id": "application",
    "name": "Applications & Product",
    "brief": "Turn system capability into a useful human outcome",
    "color": "var(--color-application)",
    "tag": "L7",
    "constraint": false,
    "panel": {
      "what": "The application combines an interface, task context, model calls, and rules for taking action. It defines what the user is trying to accomplish and how results are checked.",
      "why": "A model response is one part of an outcome. The product must make uncertainty understandable and give people a useful next step.",
      "depends": [
        "Task understanding",
        "Model quality",
        "Serving reliability",
        "Interface design"
      ],
      "breaks": "An unclear task, slow feedback, unsupported output, or an action taken without the right permission can undermine the product.",
      "who": "Product builders, designers, domain specialists, and the people using the system.",
      "builder": "Start with one valuable task and a visible success criterion. Make failures recoverable and consequential actions reviewable.",
      "lab": "Name the person, their task, and one observable sign that your project helped. Keep that outcome in the Lab Thread as you change the system."
    }
  },
  {
    "id": "security",
    "name": "Security & Safety",
    "brief": "Protect people, data, and authorized actions across the stack",
    "color": "var(--color-security)",
    "tag": "CF",
    "constraint": true,
    "panel": {
      "what": "Security protects access, data, and system integrity. Safety asks how the system can cause harm and which controls reduce that risk.",
      "why": "A safeguard at one layer may be weakened by another. A reliable model does not replace access controls, and an access check does not establish that an output is safe.",
      "pressure": "Training data, model behavior, serving access, application actions, and operational response.",
      "breaks": "Exposed credentials, unsafe data handling, untrusted instructions, and actions outside the user’s authority can cause harm.",
      "who": "Every product and infrastructure team, with security specialists and domain experts where needed.",
      "builder": "State what the system is allowed to read and do. Design checks around the actual harm your product could cause.",
      "lab": "Write one failure your project must prevent and one boundary you can enforce. For sensitive actions, include a review or a safe stopping point."
    }
  },
  {
    "id": "economics",
    "name": "Economics & Capital",
    "brief": "What the system costs and whether the outcome is worth it",
    "color": "var(--color-economics)",
    "tag": "CF",
    "constraint": true,
    "panel": {
      "what": "Economics connects the cost of building and operating a system to the value of its output. Capital affects how much work can be funded before that value is returned.",
      "why": "A design that works technically can still cost too much per successful task. Retries, failed outputs, support, and idle resources all change the result.",
      "pressure": "Hardware choices, training investment, serving cost, product scope, and pricing.",
      "breaks": "Costs can grow faster than useful outcomes. A low price per model call can hide expensive retries or a high failure rate.",
      "who": "Builders, operations teams, finance teams, customers, and investors.",
      "builder": "Track cost per completed user task alongside quality. Compare options at the same success standard.",
      "lab": "Choose a cost boundary for your project and list what it includes. Mark any unmeasured item as an assumption to test."
    }
  },
  {
    "id": "policy",
    "name": "Policy & Geopolitics",
    "brief": "Rules and institutional choices constrain what can be deployed",
    "color": "var(--color-policy)",
    "tag": "CF",
    "constraint": true,
    "panel": {
      "what": "Laws, institutional rules, procurement requirements, and international relationships can constrain where a system operates and how it handles data.",
      "why": "A technically feasible design may not fit the rules of a customer, jurisdiction, or deployment environment. Those requirements need to be understood early.",
      "pressure": "Hardware access, data use, model distribution, provider selection, and deployment location.",
      "breaks": "A team can choose a provider or data flow that conflicts with its actual obligations. Requirements also change over time.",
      "who": "Policymakers, institutions, legal specialists, procurement teams, and product operators.",
      "builder": "Document the deployment context and check requirements against current authoritative sources. This lesson does not determine legal compliance.",
      "lab": "Record where the project will run and whose data it handles. List one requirement to verify before a real deployment."
    }
  }
];

  var LAYER_ICONS = {
    energy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    silicon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3"/></svg>',
    compute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h4M14 12h4"/></svg>',
    training: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 19l4-4 4 4 4-8 4 4"/><path d="M4 15V5M4 5h16"/></svg>',
    model: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/></svg>',
    inference: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
    application: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg>',
    security: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    economics: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>',
    policy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>'
  };

  var SPEAKERS = [
    { name: 'Anjney Midha', role: 'AMP PBC / Course Instructor', layers: ['Compute', 'Economics', 'Policy'], semester: 'Spring 2026' },
    { name: 'Ben Mann', role: 'Co-Founder, Anthropic', layers: ['Training', 'Models', 'Safety'], semester: 'Winter 2025' },
    { name: 'Guillaume Lample', role: 'Co-Founder, Mistral', layers: ['Training', 'Models', 'Applications'], semester: 'Winter 2025' },
    { name: 'Andreas Blattmann', role: 'Co-Founder, Black Forest Labs', layers: ['Training', 'Models', 'Inference'], semester: 'Spring 2026' },
    { name: 'Sualeh Asif', role: 'CTO & Co-Founder, Cursor', layers: ['Compute', 'Inference', 'Applications'], semester: 'Winter 2025' },
    { name: 'Mati Staniszewski', role: 'CEO & Co-Founder, ElevenLabs', layers: ['Models', 'Inference', 'Applications'], semester: 'Spring 2026' },
    { name: 'Guillermo Rauch', role: 'CEO, Vercel', layers: ['Compute', 'Inference', 'Applications'], semester: 'Winter 2025' },
    { name: 'Steve Huffman', role: 'CEO & Co-Founder, Reddit', layers: ['Compute', 'Applications', 'Policy'], semester: 'Winter 2025' },
    { name: 'Shyam Sankar', role: 'CTO, Palantir', layers: ['Compute', 'Applications', 'Security'], semester: 'Winter 2025' },
    { name: 'Abdullah Alswaha', role: 'MCIT, KSA', layers: ['Energy', 'Silicon', 'Policy'], semester: 'Winter 2025' },
    { name: 'Joe Sullivan', role: 'Former CISO, Uber', layers: ['Security', 'Policy'], semester: 'Winter 2025' },
    { name: 'Julie Cordua', role: 'CEO, Thorn', layers: ['Security', 'Applications'], semester: 'Winter 2025' },
    { name: 'Todd McKinnon', role: 'CEO & Founder, Okta', layers: ['Security', 'Compute'], semester: 'Winter 2025' }
  ];

  var selectedLayerIndex = -1;
  var returnFocus = null;
  var inertBackground = [];
  var previousOverflow = '';

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function(character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function renderStack() {
    var container = document.getElementById('stack-container');
    var spine = document.getElementById('progress-spine');
    if (!container) return;
    var html = '';
    var spineHtml = '';
    LAYERS.forEach(function(layer, i) {
      if (i === 7) {
        html += '<div class="constraint-separator"><div class="constraint-separator-line"></div>' +
          '<div class="constraint-separator-text">Cross-cutting constraints</div>' +
          '<div class="constraint-separator-line"></div></div>';
      }
      html += '<button type="button" class="layer-node' + (layer.constraint ? ' constraint-field' : '') +
        '" data-layer="' + i + '" data-layer-id="' + layer.id + '" style="--layer-color:' + layer.color +
        '" aria-controls="side-panel" aria-expanded="false">' +
        '<span class="layer-index">' + layer.tag + '</span>' +
        '<span class="layer-icon-small" style="color:' + layer.color + '" aria-hidden="true">' + LAYER_ICONS[layer.id] + '</span>' +
        '<span class="layer-info"><span class="layer-name">' + escapeHTML(layer.name) + '</span>' +
        '<span class="layer-brief">' + escapeHTML(layer.brief) + '</span></span>' +
        '<span class="layer-tag">' + (layer.constraint ? 'Influence' : layer.tag) + '</span></button>';
      spineHtml += '<button type="button" class="progress-dot" data-layer="' + i +
        '" style="--layer-color:' + layer.color + '" aria-label="Explore ' + escapeHTML(layer.name) +
        '" aria-controls="side-panel" aria-expanded="false"></button>';
      if (i < LAYERS.length - 1) spineHtml += '<span class="progress-line" aria-hidden="true"></span>';
    });
    container.innerHTML = html;
    if (spine) spine.innerHTML = spineHtml;
    document.querySelectorAll('.layer-node, .progress-dot').forEach(function(node) {
      node.addEventListener('click', function() { selectLayer(Number(node.dataset.layer)); });
    });
  }

  function selectLayer(index) {
    var layer = LAYERS[index];
    if (!layer) return;
    selectedLayerIndex = index;
    document.querySelectorAll('.layer-node, .progress-dot').forEach(function(node) {
      var selected = Number(node.dataset.layer) === index;
      node.classList.toggle('selected', selected && node.classList.contains('layer-node'));
      node.classList.toggle('dimmed', !selected && node.classList.contains('layer-node'));
      node.classList.toggle('active', selected && node.classList.contains('progress-dot'));
      node.setAttribute('aria-expanded', String(selected));
    });
    updateDependencyLines(index);
    openPanel(layer);
    document.dispatchEvent(new CustomEvent('layer:selected', { detail: { id: layer.id, title: layer.name } }));
  }

  function deselectAll() {
    selectedLayerIndex = -1;
    document.querySelectorAll('.layer-node, .progress-dot').forEach(function(node) {
      node.classList.remove('selected', 'active', 'dimmed');
      node.setAttribute('aria-expanded', 'false');
    });
    updateDependencyLines(-1);
    closePanel();
  }

  // The SVG shares the layer container's origin, including the heading offset.
  // Thick lines are required dependencies; thin dashed paths are influences.
  function drawDependencyLines() {
    var svg = document.getElementById('dep-svg');
    var container = document.getElementById('stack-container');
    if (!svg || !container) return;
    var nodes = container.querySelectorAll('.layer-node');
    if (nodes.length < 2) return;
    var bounds = container.getBoundingClientRect();
    var parentBounds = svg.parentElement.getBoundingClientRect();
    svg.style.left = (bounds.left - parentBounds.left) + 'px';
    svg.style.top = (bounds.top - parentBounds.top) + 'px';
    svg.style.width = bounds.width + 'px';
    svg.style.height = bounds.height + 'px';
    svg.setAttribute('viewBox', '0 0 ' + bounds.width + ' ' + bounds.height);
    var lines = '';
    for (var i = 0; i < 6; i++) {
      var from = nodes[i].getBoundingClientRect();
      var to = nodes[i + 1].getBoundingClientRect();
      var x = from.left - bounds.left + from.width / 2;
      lines += '<path class="dep-line dep-hard" data-from="' + i + '" data-to="' + (i + 1) +
        '" style="stroke-width:2" d="M ' + x + ' ' + (from.bottom - bounds.top) + ' V ' + (to.top - bounds.top) + '"/>';
    }
    var targets = { 7: [3, 5, 6], 8: [0, 3, 6], 9: [1, 3, 6] };
    Object.keys(targets).forEach(function(key) {
      var index = Number(key);
      var from = nodes[index].getBoundingClientRect();
      var x1 = from.right - bounds.left;
      var y1 = from.top - bounds.top + from.height / 2;
      var gutter = bounds.width + 10 + (index - 7) * 8;
      targets[index].forEach(function(target) {
        var to = nodes[target].getBoundingClientRect();
        var x2 = to.right - bounds.left;
        var y2 = to.top - bounds.top + to.height / 2;
        lines += '<path class="dep-line dep-soft" data-from="' + index + '" data-to="' + target +
          '" style="stroke-width:1" stroke-dasharray="3 5" d="M ' + x1 + ' ' + y1 + ' H ' + gutter + ' V ' + y2 + ' H ' + x2 + '"/>';
      });
    });
    svg.innerHTML = lines;
    updateDependencyLines(selectedLayerIndex);
  }

  function updateDependencyLines(index) {
    document.querySelectorAll('.dep-line').forEach(function(line) {
      var connected = Number(line.dataset.from) === index || Number(line.dataset.to) === index;
      line.classList.toggle('highlighted', index >= 0 && connected);
      line.classList.toggle('dimmed', index >= 0 && !connected);
      line.style.stroke = index >= 0 && connected ? LAYERS[index].color : '';
    });
  }

  function section(label, text) {
    return '<div class="panel-section"><h3 class="panel-section-label">' + escapeHTML(label) +
      '</h3><div class="panel-section-text">' + escapeHTML(text) + '</div></div>';
  }

  function openPanel(layer) {
    var panel = document.getElementById('side-panel');
    var overlay = document.getElementById('panel-overlay');
    var content = document.getElementById('panel-content');
    if (!panel || !overlay || !content) return;
    if (panel.hidden) {
      returnFocus = document.activeElement;
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      inertBackground = [];
      Array.from(document.body.children).forEach(function(element) {
        if (element === panel || element === overlay || element.contains(panel) || /^(SCRIPT|STYLE)$/.test(element.tagName)) return;
        inertBackground.push({ element: element, inert: element.inert });
        element.inert = true;
      });
    }
    document.getElementById('panel-dot').style.background = layer.color;
    var name = document.getElementById('panel-name');
    name.textContent = layer.name;
    name.style.color = layer.color;
    panel.style.setProperty('--layer-color', layer.color);
    var html = section('What it does', layer.panel.what) + section('Why it matters', layer.panel.why);
    if (layer.panel.depends) {
      html += '<div class="panel-section"><h3 class="panel-section-label">Depends on</h3><ul class="panel-deps">';
      layer.panel.depends.forEach(function(dependency) { html += '<li class="panel-dep-tag">' + escapeHTML(dependency) + '</li>'; });
      html += '</ul></div>';
    }
    if (layer.panel.pressure) html += section('Where it applies pressure', layer.panel.pressure);
    if (layer.panel.breaks) html += section('What breaks', layer.panel.breaks);
    if (layer.panel.who) html += section('Who operates here', layer.panel.who);
    if (layer.panel.builder) html += section('Builder implication', layer.panel.builder);
    if (layer.panel.lab) html += section('For your Lab Thread', layer.panel.lab);
    html += '<button type="button" class="panel-pin lesson-button" id="panel-pin">Pin this insight to Lab Thread</button>' +
      '<p class="panel-pin-status" id="panel-pin-status" role="status"></p>';
    if (layer.panel.speakers && layer.panel.speakers.length) {
      html += '<div class="panel-section"><h3 class="panel-section-label">Related CS153 voices</h3>' +
        '<p class="panel-note">Editorial connections to the course guest list.</p><div class="panel-speakers">';
      layer.panel.speakers.forEach(function(speaker) {
        html += '<span class="panel-speaker-badge">' + escapeHTML(speaker.name) + '</span>';
      });
      html += '</div></div>';
    }
    if (layer.panel.sourceUrl) {
      html += '<p class="panel-note"><a href="' + escapeHTML(layer.panel.sourceUrl) +
        '" target="_blank" rel="noopener noreferrer">Course reference ↗</a></p>';
    }
    content.innerHTML = html;
    document.getElementById('panel-pin').addEventListener('click', function(event) {
      document.dispatchEvent(new CustomEvent('lab:pin', {
        detail: { id: layer.id, title: layer.name, note: layer.panel.lab || layer.panel.builder || layer.panel.why }
      }));
      event.currentTarget.textContent = 'Pinned to Lab Thread';
      document.getElementById('panel-pin-status').textContent = 'Return to the lesson to add your project decision.';
    });
    panel.hidden = false;
    panel.inert = false;
    overlay.hidden = false;
    panel.setAttribute('aria-hidden', 'false');
    panel.classList.add('open');
    overlay.classList.add('open');
    panel.scrollTop = 0;
    document.getElementById('panel-close').focus();
  }

  function closePanel() {
    var panel = document.getElementById('side-panel');
    var overlay = document.getElementById('panel-overlay');
    if (!panel || panel.hidden) return;
    panel.hidden = true;
    panel.inert = true;
    panel.setAttribute('aria-hidden', 'true');
    panel.classList.remove('open');
    if (overlay) { overlay.hidden = true; overlay.classList.remove('open'); }
    inertBackground.forEach(function(saved) { saved.element.inert = saved.inert; });
    inertBackground = [];
    document.body.style.overflow = previousOverflow;
    if (returnFocus && returnFocus.isConnected && !returnFocus.inert) returnFocus.focus();
  }

  function initPanel() {
    var panel = document.getElementById('side-panel');
    if (!panel) return;
    panel.hidden = true;
    panel.inert = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', 'panel-name');
    panel.setAttribute('aria-hidden', 'true');
    panel.removeAttribute('aria-label');
    document.getElementById('panel-overlay').hidden = true;
    document.getElementById('panel-close').addEventListener('click', deselectAll);
    document.getElementById('panel-overlay').addEventListener('click', deselectAll);
    document.addEventListener('keydown', function(event) {
      if (panel.hidden) return;
      if (event.key === 'Escape') { event.preventDefault(); deselectAll(); return; }
      if (event.key !== 'Tab') return;
      var focusable = Array.from(panel.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), [tabindex="0"]'))
        .filter(function(element) { return !element.hidden && element.getClientRects().length > 0; });
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    });
    document.addEventListener('stack:select', function(event) {
      var id = event.detail && event.detail.id;
      var index = LAYERS.findIndex(function(layer) { return layer.id === id; });
      if (index >= 0) selectLayer(index);
    });
  }

  /* Qualitative teaching model. Weights are authored assumptions, not fitted
     coefficients or measured utilization. Budget adds capacity, reducing
     compute scarcity; operating that capacity can add power and spending pressure. */
  function clamp01(value) { return Math.min(1, Math.max(0, value)); }

  function simulate(inputs) {
    inputs = inputs || {};
    function value(id) {
      var number = Number(inputs[id]);
      return Number.isFinite(number) ? clamp01(number / 100) : 0.5;
    }
    var budget = value('compute'), latency = value('latency'), model = value('modelSize');
    var traffic = value('traffic'), safety = value('safety'), regulation = value('regulatory'), capital = value('capital');
    var stress = [
      0.32 * model + 0.36 * traffic + 0.10 * budget + 0.10 * regulation + 0.12 * (1 - capital),
      0.30 * model + 0.25 * traffic + 0.25 * (1 - budget) + 0.20 * regulation,
      0.30 * model + 0.35 * traffic + 0.35 * (1 - budget),
      0.40 * model + 0.25 * safety + 0.20 * (1 - budget) + 0.15 * (1 - capital),
      0.35 * model + 0.35 * (1 - latency) + 0.30 * safety,
      0.40 * traffic + 0.35 * (1 - latency) + 0.15 * model + 0.10 * (1 - budget),
      0.25 * traffic + 0.20 * safety + 0.20 * regulation + 0.20 * (1 - latency) + 0.15 * (1 - capital),
      0.45 * safety + 0.15 * model + 0.25 * traffic + 0.15 * regulation,
      0.35 * (1 - capital) + 0.30 * budget + 0.20 * traffic + 0.15 * model,
      0.60 * regulation + 0.20 * traffic + 0.20 * safety
    ].map(clamp01);
    var bottleneck = stress.reduce(function(highest, current, index) {
      return current > stress[highest] ? index : highest;
    }, 0);
    return { stress: stress, bottleneck: bottleneck };
  }

  var SLIDERS = [
    { id: 'compute', name: 'Compute budget', low: 'Constrained', high: 'Ample' },
    { id: 'latency', name: 'Latency tolerance', low: 'Immediate', high: 'Can wait' },
    { id: 'modelSize', name: 'Model size', low: 'Compact', high: 'Large' },
    { id: 'traffic', name: 'Traffic demand', low: 'Light', high: 'Heavy' },
    { id: 'safety', name: 'Safety requirements', low: 'Baseline', high: 'Stringent' },
    { id: 'regulatory', name: 'Regulatory constraints', low: 'Few', high: 'Many' },
    { id: 'capital', name: 'Capital available', low: 'Limited', high: 'Ample' }
  ];
  var SCENARIOS = [
    { id: 'voice', name: 'Live voice assistant', values: { compute: 35, latency: 5, modelSize: 40, traffic: 65, safety: 70, regulatory: 30, capital: 40 } },
    { id: 'frontier', name: 'Large model launch', values: { compute: 80, latency: 50, modelSize: 95, traffic: 90, safety: 60, regulatory: 45, capital: 80 } },
    { id: 'regulated', name: 'Regulated service', values: { compute: 55, latency: 40, modelSize: 45, traffic: 40, safety: 95, regulatory: 95, capital: 60 } }
  ];
  var simValues = Object.assign({}, SCENARIOS[0].values);
  var activeScenario = 'voice';
  var simFrame = 0;
  var lastBottleneck = null;
  var SIM_EXPLAIN = [
    'Model size and sustained traffic increase physical demand. More compute capacity may also need more power and cooling. Test a smaller model or a lower peak load.',
    'Large models, traffic and constrained procurement put pressure on chips and memory. More compute budget can ease scarcity, but supply and policy still matter.',
    'Demand is high relative to the compute budget. Increase available capacity or reduce demand, then watch which constraint becomes limiting next.',
    'A larger model and stricter safety needs increase the work of model development. Try narrowing the task before committing to more training.',
    'The model must satisfy capability, response-time and safety needs together. A smaller model may serve quickly but still needs a task-specific quality check.',
    'Heavy traffic and a short response-time target make serving difficult. Allow more time, reduce model size or add capacity, then compare the new pressure.',
    'The product must reconcile response time, user volume, trust and cost. Narrowing the promised experience can make the whole system more practical.',
    'Stringent safety needs, scale and regulation increase the work of evaluation and protection. Add controls and test the use case before expanding access.',
    'Compute spending and operating demand compete with available capital. Test a smaller model, lighter load or a more focused product promise.',
    'Regulatory constraints dominate this scenario. Examine location, data handling and permitted uses before selecting infrastructure.'
  ];

  function sliderValueText(slider, number) {
    if (number <= 20) return slider.low;
    if (number >= 80) return slider.high;
    return number < 40 ? 'Toward ' + slider.low.toLowerCase() : number > 60 ? 'Toward ' + slider.high.toLowerCase() : 'Moderate';
  }

  function renderSimulator() {
    var stack = document.getElementById('sim-stack');
    var sliders = document.getElementById('sim-sliders');
    if (!stack || !sliders) return;
    stack.innerHTML = LAYERS.map(function(layer, index) {
      return '<div class="sim-layer sim-pressure" data-sim="' + index + '" style="--layer-color:' + layer.color + '">' +
        '<span class="sim-layer-name">' + escapeHTML(layer.name) + '</span>' +
        '<span class="sim-layer-pressure"></span><span class="sim-layer-bottleneck" aria-hidden="true"></span></div>';
    }).join('');
    sliders.innerHTML = SLIDERS.map(function(slider) {
      return '<div class="sim-slider-group"><label for="slider-' + slider.id + '"><span class="sim-slider-name">' + slider.name +
        '</span><span class="sim-slider-value" id="sv-' + slider.id + '"></span></label>' +
        '<input type="range" min="0" max="100" step="5" value="' + simValues[slider.id] + '" id="slider-' + slider.id +
        '" aria-describedby="sim-assumptions"><div class="sim-slider-range"><span>' + slider.low + '</span><span>' + slider.high + '</span></div></div>';
    }).join('');
    var scenarios = document.getElementById('sim-scenarios');
    if (!scenarios) {
      scenarios = document.createElement('div'); scenarios.id = 'sim-scenarios';
      sliders.insertAdjacentElement('beforebegin', scenarios);
    }
    scenarios.classList.add('sim-scenarios');
    scenarios.setAttribute('role', 'group');
    scenarios.setAttribute('aria-label', 'Teaching scenarios');
    scenarios.innerHTML = SCENARIOS.map(function(scenario) {
      return '<button type="button" class="scenario-button" data-scenario="' + scenario.id + '" aria-pressed="' +
        String(scenario.id === activeScenario) + '">' + scenario.name + '</button>';
    }).join('') + '<button type="button" class="scenario-reset" id="sim-reset">Reset scenario</button>';
    scenarios.querySelectorAll('[data-scenario]').forEach(function(button) {
      button.addEventListener('click', function() { applyScenario(button.dataset.scenario); });
    });
    document.getElementById('sim-reset').addEventListener('click', function() { applyScenario(activeScenario); });
    if (!document.getElementById('sim-assumptions')) {
      var assumptions = document.createElement('p');
      assumptions.id = 'sim-assumptions'; assumptions.className = 'sim-assumptions';
      assumptions.textContent = 'Illustrative teaching model. These pressure levels follow authored assumptions; they are not measurements or forecasts. Budget adds compute capacity and can add power and spending pressure. The highest pressure is the suggested constraint to investigate.';
      scenarios.insertAdjacentElement('afterend', assumptions);
    }
    var readout = document.getElementById('sim-readout');
    if (readout) { readout.setAttribute('role', 'status'); readout.setAttribute('aria-live', 'polite'); readout.setAttribute('aria-atomic', 'true'); }
    SLIDERS.forEach(function(slider) {
      document.getElementById('slider-' + slider.id).addEventListener('input', function(event) {
        simValues[slider.id] = Number(event.currentTarget.value);
        scenarios.querySelectorAll('[data-scenario]').forEach(function(button) { button.setAttribute('aria-pressed', 'false'); });
        updateSliderLabel(slider);
        if (simFrame) cancelAnimationFrame(simFrame);
        simFrame = requestAnimationFrame(function() { simFrame = 0; updateSim(true); });
      });
    });
    SLIDERS.forEach(updateSliderLabel);
    updateSim(false);
  }

  function updateSliderLabel(slider) {
    var input = document.getElementById('slider-' + slider.id);
    input.value = simValues[slider.id];
    var valueText = sliderValueText(slider, simValues[slider.id]);
    document.getElementById('sv-' + slider.id).textContent = valueText;
    input.setAttribute('aria-valuetext', valueText);
  }

  function applyScenario(id) {
    var scenario = SCENARIOS.find(function(item) { return item.id === id; });
    if (!scenario) return;
    activeScenario = id;
    simValues = Object.assign({}, scenario.values);
    SLIDERS.forEach(updateSliderLabel);
    document.querySelectorAll('[data-scenario]').forEach(function(button) { button.setAttribute('aria-pressed', String(button.dataset.scenario === id)); });
    updateSim(true);
  }

  function updateSim(animate) {
    var result = simulate(simValues);
    document.querySelectorAll('.sim-layer').forEach(function(element, index) {
      var pressure = result.stress[index];
      var label = pressure < 0.35 ? 'Lower pressure' : pressure < 0.60 ? 'Moderate pressure' : 'High pressure';
      element.style.setProperty('--pressure', pressure.toFixed(3));
      element.style.setProperty('--stress-glow', Math.round(pressure * 34) + '%');
      element.classList.toggle('bottleneck', index === result.bottleneck);
      element.classList.toggle('stressed', pressure >= 0.60);
      element.querySelector('.sim-layer-pressure').textContent = label;
      element.querySelector('.sim-layer-bottleneck').textContent = index === result.bottleneck ? 'Leading constraint' : '';
      element.setAttribute('aria-label', LAYERS[index].name + ': ' + label + (index === result.bottleneck ? ', leading constraint' : ''));
      if (animate && index === result.bottleneck && lastBottleneck !== index && element.animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        element.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }], { duration: 360, easing: 'ease-out', iterations: 1 });
      }
    });
    var layer = LAYERS[result.bottleneck];
    // Announce a changed constraint once, rather than on every slider frame.
    if (lastBottleneck !== result.bottleneck) {
      document.getElementById('sim-bottleneck-name').textContent = layer.name;
      document.getElementById('sim-bottleneck-name').style.color = layer.color;
      document.getElementById('sim-bottleneck-explain').textContent = SIM_EXPLAIN[result.bottleneck];
    }
    lastBottleneck = result.bottleneck;
    document.dispatchEvent(new CustomEvent('sim:changed', { detail: { id: layer.id, title: layer.name, inputs: Object.assign({}, simValues) } }));
  }

  function renderConstellation() {
    var grid = document.getElementById('constellation-grid');
    if (!grid) return;
    var domains = { Energy: 'energy', Silicon: 'silicon', Compute: 'compute', Training: 'training', Models: 'model', Inference: 'inference', Applications: 'application', Security: 'security', Safety: 'security', Economics: 'economics', Policy: 'policy' };
    grid.innerHTML = SPEAKERS.map(function(speaker) {
      var source = speaker.semester === 'Winter 2025' ? 'https://cs153.stanford.edu/winter2025/' : 'https://cs153.stanford.edu/';
      return '<article class="constellation-card"><div class="constellation-card-header">' +
        '<h3 class="constellation-card-name">' + escapeHTML(speaker.name) + '</h3></div>' +
        '<p class="constellation-card-role">' + escapeHTML(speaker.role) + ' · <a href="' + source +
        '" target="_blank" rel="noopener noreferrer">' + escapeHTML(speaker.semester) + ' guest list ↗</a></p>' +
        '<div class="constellation-card-layers" aria-label="Editorial domain connections">' + speaker.layers.map(function(domain) {
          return '<button type="button" class="constellation-layer-tag" data-domain="' + domains[domain] +
            '" style="--domain-color:var(--color-' + domains[domain] + ')" aria-label="Explore ' + domain +
            ' through ' + escapeHTML(speaker.name) + '">' + domain + '</button>';
        }).join('') + '</div></article>';
    }).join('');
    grid.querySelectorAll('[data-domain]').forEach(function(button) {
      button.addEventListener('click', function() {
        selectLayer(LAYERS.findIndex(function(layer) { return layer.id === button.dataset.domain; }));
      });
    });
  }

  // Public, side-effect-free teaching model for verification and future lessons.
  window.RewriteStack = { simulate: simulate };

  function init() {
    initPanel();
    renderStack();
    renderSimulator();
    renderConstellation();
    requestAnimationFrame(drawDependencyLines);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawDependencyLines);
    var container = document.getElementById('stack-container');
    if (window.ResizeObserver && container) new ResizeObserver(drawDependencyLines).observe(container);
    else window.addEventListener('resize', drawDependencyLines);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
