/* ---------- TABS ---------- */
document.querySelectorAll("nav.tabs button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll("nav.tabs button")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelectorAll("section.view")
      .forEach((s) => s.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.view).classList.add("active");
  });
});

/* ---------- FLOW DATA ---------- */
// Each node: text (agent line), note (optional reminder), choices[] -> {label,class,next}
const flow = {
  start: {
    line: "Buenos días, señor/a _____________ le llamo de Banamex para darle la bienvenida a nuestro banco con un beneficio especial por activar su cuenta. Solo una pregunta: ¿ya le entregamos su tarjeta?",
    choices: [
      { label: "Sí", cls: "si", next: "fechaEntrega" },
      { label: "No", cls: "no", next: "noTarjeta" },
    ],
    step: 1,
  },
  fechaEntrega: {
    line: "¿Qué día recogió su tarjeta?",
    choices: [{ label: "Continuar", cls: "next", next: "dudaTarjeta" }],
    step: 2,
  },
  limiteCredito: {
    line: "Excelente y ¿Ya le entregamos su límite de crédito? o quedo pendiente el dato?",
    choices: [
      { label: "Sí", cls: "si", next: "noQuedoDuda" },
      { label: "No", cls: "no", next: "limiteCreditoNo" },
    ],
    step: 3,
  },
  limiteCreditoNo: {
    line: "Entiendo. El límite de crédito normalmente se libera entre 24 y 72 horas después de la entrega, por lo que puede tardar un poco en quedar disponible.",
    choices: [{ label: "Continuar", cls: "next", next: "noQuedoDuda" }],
    step: 4,
  },
  dudaTarjeta: {
    line: "¿Le quedó alguna duda sobre su tarjeta?",
    choices: [
      { label: "Sí", cls: "si", next: "resolverDudas" },
      { label: "No", cls: "no", next: "limiteCredito" },
    ],
    step: 4,
  },
  resolverDudas: {
    line: "Entiendo. ¿Cuál es su duda? (Resolver la duda del cliente)",
    choices: [{ label: "Continuar", cls: "next", next: "noQuedoDuda" }],
    step: 4,
  },
  confirmarDocumentos: {
    line: "Perfecto, ahora que ya aclaramos su duda, también es importante que recuerde llevar sus documentos a sucursal.",
    choices: [
      { label: "Recordar documentos", cls: "next", next: "recordarDocumentos" },
      { label: "No trae documentos hoy", cls: "next", next: "sinDocumentosHoy" },
      { label: "Continuar", cls: "next", next: "noQuedoDuda" },
    ],
    step: 5,
  },
  sinDocumentosHoy: {
    line: "Entiendo. Si hoy no trae los documentos, podemos agendar una visita futura o indicarle la fecha más cercana para regresar.",
    choices: [
      { label: "Agendar visita", cls: "next", next: "agendarVisita" },
      { label: "Recordar documentos", cls: "next", next: "recordarDocumentos" },
    ],
    step: 5,
  },
  noQuedoDuda: {
    line: "Perfecto, dejo el comentario. Muchas gracias por su tiempo y que tenga un excelente día.",
    choices: [{ label: "Finalizar llamada", cls: "next", next: "end" }],
    step: 7,
  },
  noTarjeta: {
    line: "Entiendo, para la activación de su beneficio es necesario entregarle su tarjeta. ¿cree que pueda ir el día de hoy?",
    choices: [
      { label: "Sí", cls: "si", next: "sucursalMente" },
      { label: "No", cls: "no", next: "agendarVisita" },
    ],
    step: 2,
  },
  sucursalMente: {
    line: "Perfecto, ¿ya tiene alguna sucursal en mente donde pueda acudir?",
    note: "Recordatorio: pedir al cliente la documentación requerida antes de su visita.",
    choices: [
      { label: "Sí", cls: "si", next: "recordarDocumentos" },
      { label: "No", cls: "no", next: "buscarSucursal" },
    ],
    step: 3,
  },
  buscarSucursal: {
    line: "Buscar sucursal cercana al cliente",
    isAction: true,
    choices: [
      {
        label: "Buscar sucursales",
        cls: "next",
        href: "https://www.banamex.com/es/localizador-sucursales.html?lid=MX|es|personas|tarjetas-credito|tarjeta-de-credito-recompensas-descubre-H4-Information-IrLocalizadorSucursales-ES",
        next: "recordarDocumentos",
      },
    ],
    step: 4,
  },
  recordarDocumentos: {
    line: "(Se recuerda al cliente que debe llevar los documentos necesarios para la entrega de su tarjeta)",
    isAction: true,
    note: "Si el cliente lo solicita, puede revisar la lista completa en la pestaña “Documentación requerida”. En caso de no traerlos hoy, también puede agendar una nueva visita.",
    choices: [
      {
        label: "Ver documentación",
        cls: "next",
        view: "documentos",
        next: "noQuedoDuda",
      },
      { label: "No trae documentos hoy", cls: "next", next: "sinDocumentosHoy" },
      { label: "Continuar", cls: "next", next: "noQuedoDuda" },
    ],
    step: 5,
  },
  agendarVisita: {
    line: "(Agendar visita el día más cercano a hoy)",
    isAction: true,
    choices: [{ label: "Continuar", cls: "next", next: "recordarDocumentos" }],
    step: 3,
  },
  recomendacionApp: {
    line: "Por último, le recomiendo descargar la aplicación Banamex, así cuando pase por su tarjeta podrán activarle la banca móvil. Puede encontrarla fácilmente en su tienda de aplicaciones como “Banamex móvil”.",
    choices: [{ label: "Finalizar llamada", cls: "next", next: "end" }],
    step: 6,
  },
  end: {
    isEnd: true,
    step: 7,
  },
};
const TOTAL_STEPS = 7;

let current = "start";

function renderProgress(step) {
  const bar = document.getElementById("progressBar");
  bar.innerHTML = "";
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const el = document.createElement("i");
    if (i <= step) el.classList.add("done");
    bar.appendChild(el);
  }
}

function renderStage(key) {
  const node = flow[key];
  const stage = document.getElementById("stage");
  renderProgress(node.step);

  if (node.isEnd) {
    stage.innerHTML = `
      <div class="end-card">
        <div class="big">✅</div>
        <h3 class="headline" style="margin-bottom:6px;">Llamada formalizada</h3>
        <p class="sans" style="color:var(--gris); margin-bottom:24px;">No olvides registrar la calificación correspondiente en tu sistema de gestión.</p>
        <button class="choice-btn restart sans" onclick="restartFlow()">Reiniciar guion</button>
      </div>`;
    return;
  }

  let html = `<div class="step-label sans">Paso ${node.step} de ${TOTAL_STEPS}</div>`;
  html += `<p class="line ${node.isAction ? "" : "agent"}">${node.line}</p>`;
  if (node.note) {
    html += `<div class="note">💡 ${node.note}</div><br>`;
  }
  html += `<div class="choices">`;
  node.choices.forEach((c) => {
    if (c.href) {
      html += `<a class="choice-btn ${c.cls} sans" href="${c.href}" target="_blank" rel="noopener" onclick="setTimeout(()=>goTo('${c.next}'),0)">${c.label} ↗</a>`;
    } else if (c.view) {
      html += `<button class="choice-btn ${c.cls} sans" onclick="goToView('${c.view}','${c.next}')">${c.label}</button>`;
    } else {
      html += `<button class="choice-btn ${c.cls} sans" onclick="goTo('${c.next}')">${c.label}</button>`;
    }
  });
  html += `</div>`;
  stage.innerHTML = html;
}

function goTo(key) {
  current = key;
  renderStage(key);
}
function goToView(viewId, nextKey) {
  document
    .querySelectorAll("nav.tabs button")
    .forEach((b) => b.classList.remove("active"));
  document
    .querySelectorAll("section.view")
    .forEach((s) => s.classList.remove("active"));
  document
    .querySelector('[data-view="' + viewId + '"]')
    .classList.add("active");
  document.getElementById(viewId).classList.add("active");
  current = nextKey;
  renderStage(nextKey);
}
function restartFlow() {
  current = "start";
  renderStage("start");
}

renderStage(current);
