'use strict';

/*
 * Prototipo frontend: no hay servidor, autenticación ni persistencia del censo.
 * Solo las preferencias de color y las publicaciones DEMO se guardan localmente.
 */

const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

// --- Navegación adaptable ---
const menuToggle = $('#menuToggle');
const primaryNav = $('#primaryNav');

function closeMenu() {
  primaryNav.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menú de navegación');
}
menuToggle.addEventListener('click', () => {
  const open = primaryNav.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
});
$$('#primaryNav a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
$('#currentYear').textContent = new Date().getFullYear();

// --- Cambiador de escalas de azul / café / amarillo ---
const paletteOptions = $$('.palette-option');
const availablePalettes = ['equilibrada', 'suave', 'profunda'];
function applyPalette(name) {
  const safeName = availablePalettes.includes(name) ? name : 'equilibrada';
  document.documentElement.dataset.palette = safeName;
  paletteOptions.forEach(btn => {
    const active = btn.dataset.paletteChoice === safeName;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
  try { localStorage.setItem('czg-demo-palette-v1', safeName); } catch (_) {}
}
try { applyPalette(localStorage.getItem('czg-demo-palette-v1') || 'equilibrada'); } catch (_) { applyPalette('equilibrada'); }
paletteOptions.forEach(btn => btn.addEventListener('click', () => applyPalette(btn.dataset.paletteChoice)));

// --- Gestor de contenidos simulado ---
const STORAGE_KEY = 'czg-demo-publications-v1';
const demoPublications = [
  { id: 'ej-1', tipo: 'noticia', titulo: 'Bienvenida al espacio de noticias', descripcion: 'Aquí podrán aparecer noticias oficiales del Consejo Comunitario cuando su contenido sea aprobado.', fecha: '', demo: true },
  { id: 'ej-2', tipo: 'evento', titulo: 'Agenda de encuentros comunitarios', descripcion: 'Esta sección estará destinada a publicar eventos, convocatorias y encuentros de interés comunitario.', fecha: '', demo: true },
  { id: 'ej-3', tipo: 'comunicado', titulo: 'Comunicados institucionales', descripcion: 'Aquí se difundirán avisos y documentos públicos oficiales del Consejo Comunitario.', fecha: '', demo: true }
];
let publications = [];
let activeFilter = 'todas';
const typeLabels = { noticia: 'Noticia', evento: 'Evento', comunicado: 'Comunicado' };
const typeSymbols = { noticia: '✦', evento: '◷', comunicado: '◈' };

function loadPublications() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(stored)) return [];
    return stored.filter(p => p && typeof p.id === 'string' && typeLabels[p.tipo] && typeof p.titulo === 'string' && typeof p.descripcion === 'string' && typeof p.fecha === 'string').slice(0, 50);
  } catch (_) { return []; }
}
function persistPublications() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(publications));
    return true;
  } catch (_) {
    $('#cmsStatus').textContent = 'No se pudo guardar en este navegador. Revisa el almacenamiento disponible.';
    return false;
  }
}
publications = loadPublications();

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function prettyDate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return 'Sin fecha definida';
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return 'Sin fecha definida';
  return new Intl.DateTimeFormat('es-CO', {day:'numeric', month:'short', year:'numeric'}).format(date);
}
function createPublicationCard(item) {
  const card = el('article', 'publication-card');
  const art = el('div', 'publication-card__art');
  art.append(el('span', '', typeSymbols[item.tipo]), el('span', '', typeLabels[item.tipo]));
  const body = el('div', 'publication-card__body');
  const meta = el('div', 'publication-card__meta');
  meta.append(el('span', '', prettyDate(item.fecha)));
  if (item.demo) meta.append(el('span', 'publication-card__tag', 'EJEMPLO'));
  body.append(meta, el('h3', '', item.titulo), el('p', '', item.descripcion));
  card.append(art, body);
  return card;
}
function renderPublications() {
  const panel = $('#publicationPanel');
  panel.replaceChildren();
  const items = [...publications.filter(item => item.estado !== 'Borrador').map(item => ({...item, demo:true})), ...demoPublications].filter(item => activeFilter === 'todas' || item.tipo === activeFilter);
  if (!items.length) panel.append(el('p', 'empty-state', 'Todavía no hay publicaciones en esta categoría.'));
  else items.forEach(item => panel.append(createPublicationCard(item)));
  $$('.content-tab').forEach(tab => {
    const selected = tab.dataset.filter === activeFilter;
    tab.classList.toggle('is-active', selected);
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected) panel.setAttribute('aria-labelledby', tab.id);
  });
}
$$('.content-tab').forEach(tab => tab.addEventListener('click', () => { activeFilter = tab.dataset.filter; renderPublications(); }));
// Teclado: navegación entre pestañas con flechas, Inicio y Fin.
$('.content-tabs').addEventListener('keydown', event => {
  if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
  const tabs = $$('.content-tab');
  const current = tabs.indexOf(document.activeElement);
  if (current === -1) return;
  event.preventDefault();
  let next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
  tabs[next].focus(); tabs[next].click();
});
renderPublications();

const cmsDialog = $('#cmsDialog');
const cmsForm = $('#cmsForm');
const cmsStatus = $('#cmsStatus');
const cancelEdit = $('#cancelEdit');
function resetCmsForm() {
  cmsForm.reset();
  $('#editId').value = '';
  const today = new Date();
  const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  cmsForm.elements.fecha.value = localDate;
  $('#savePublication').textContent = 'Guardar publicación';
  cancelEdit.hidden = true;
}
function renderCmsList() {
  const list = $('#cmsList');
  list.replaceChildren();
  if (!publications.length) { list.append(el('p', 'cms-list__empty', 'No hay publicaciones creadas desde este navegador.')); return; }
  publications.forEach(item => {
    const wrap = el('div', 'cms-list-item');
    const info = el('div');
    info.append(el('strong', '', item.titulo), el('span', '', `${typeLabels[item.tipo]} · ${prettyDate(item.fecha)}`));
    const actions = el('div', 'cms-list-item__actions');
    const edit = el('button', '', 'Editar'); edit.type = 'button'; edit.addEventListener('click', () => editPublication(item.id));
    const remove = el('button', '', 'Eliminar'); remove.type = 'button'; remove.addEventListener('click', () => removePublication(item.id));
    actions.append(edit, remove); wrap.append(info, actions); list.append(wrap);
  });
}
function editPublication(id) {
  const item = publications.find(p => p.id === id);
  if (!item) return;
  cmsForm.elements.editId.value = item.id;
  cmsForm.elements.tipo.value = item.tipo;
  cmsForm.elements.fecha.value = item.fecha;
  cmsForm.elements.titulo.value = item.titulo;
  cmsForm.elements.descripcion.value = item.descripcion;
  $('#savePublication').textContent = 'Actualizar publicación';
  cancelEdit.hidden = false;
  cmsStatus.textContent = 'Editando una publicación de ejemplo.';
  cmsForm.elements.titulo.focus();
}
function removePublication(id) {
  if (!window.confirm('¿Eliminar esta publicación de prueba?')) return;
  publications = publications.filter(p => p.id !== id);
  persistPublications(); renderCmsList(); renderPublications();
  cmsStatus.textContent = 'Publicación de prueba eliminada.';
  if ($('#editId').value === id) resetCmsForm();
}
$('#openCms')?.addEventListener('click', () => {
  resetCmsForm(); renderCmsList(); cmsStatus.textContent = '';
  if (typeof cmsDialog.showModal === 'function') cmsDialog.showModal();
  else cmsDialog.setAttribute('open', '');
});
$('#closeCms').addEventListener('click', () => cmsDialog.close());
cmsDialog.addEventListener('click', event => { if (event.target === cmsDialog) cmsDialog.close(); });
cancelEdit.addEventListener('click', () => { resetCmsForm(); cmsStatus.textContent = 'Edición cancelada.'; });
cmsForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!cmsForm.reportValidity()) return;
  const tipo = cmsForm.elements.tipo.value;
  const titulo = cmsForm.elements.titulo.value.trim();
  const descripcion = cmsForm.elements.descripcion.value.trim();
  const fecha = cmsForm.elements.fecha.value;
  if (!typeLabels[tipo] || !titulo || descripcion.length < 10 || !fecha) { cmsStatus.textContent = 'Revisa los campos obligatorios.'; return; }
  const id = $('#editId').value;
  if (id) {
    const index = publications.findIndex(p => p.id === id);
    if (index !== -1) publications[index] = { id, tipo, titulo, descripcion, fecha };
  } else {
    if (publications.length >= 50) { cmsStatus.textContent = 'Máximo de 50 publicaciones de demostración.'; return; }
    publications.unshift({ id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), tipo, titulo, descripcion, fecha });
  }
  const saved = persistPublications();
  renderCmsList(); renderPublications(); resetCmsForm();
  if (saved) cmsStatus.textContent = id ? 'Publicación de prueba actualizada.' : 'Publicación de prueba guardada en este navegador.';
});
$('#clearPublications').addEventListener('click', () => {
  if (!publications.length || !window.confirm('¿Borrar todas las publicaciones creadas en este navegador?')) return;
  publications = []; persistPublications(); renderCmsList(); renderPublications(); resetCmsForm();
  cmsStatus.textContent = 'Se borraron las publicaciones de demostración.';
});

// --- Formulario de censo: VALIDACIÓN LOCAL, SIN PERSISTENCIA Y SIN ENVÍO ---
const censusForm = $('#censusForm');
const steps = $$('.form-step', censusForm);
const formMessage = $('#formMessage');
let currentStep = 0;
function setFormMessage(text = '', variant = '') {
  formMessage.hidden = !text;
  formMessage.textContent = text;
  formMessage.className = `form-message${variant ? ` is-${variant}` : ''}`;
}
function showStep(index) {
  currentStep = Math.max(0, Math.min(steps.length - 1, index));
  steps.forEach((fieldset, i) => { fieldset.hidden = i !== currentStep; fieldset.classList.toggle('is-active', i === currentStep); });
  $('#stepIndicator').textContent = `${String(currentStep + 1).padStart(2,'0')} / 0${steps.length}`;
  $('#formProgress').style.width = `${(currentStep + 1) / steps.length * 100}%`;
  $('#prevStep').hidden = currentStep === 0;
  $('#nextStep').hidden = currentStep === steps.length - 1;
  $('#submitCensus').hidden = currentStep !== steps.length - 1;
  setFormMessage();
}
function validateStep() {
  const controls = $$('input, select, textarea', steps[currentStep]);
  let invalid = null;
  controls.forEach(control => {
    // El input file solo es una simulación; no se trata ni se transmite el archivo.
    const valid = control.checkValidity() && (control.type === 'checkbox' ? control.checked : true);
    if (!valid) { control.setAttribute('aria-invalid', 'true'); if (!invalid) invalid = control; }
    else control.removeAttribute('aria-invalid');
  });
  if (invalid) {
    setFormMessage('Revisa los campos obligatorios y los formatos antes de continuar.', 'error');
    invalid.focus();
    return false;
  }
  return true;
}
$('#nextStep').addEventListener('click', () => { if (validateStep()) showStep(currentStep + 1); });
$('#prevStep').addEventListener('click', () => showStep(currentStep - 1));
$$('input, select, textarea', censusForm).forEach(control => control.addEventListener('input', () => control.removeAttribute('aria-invalid')));
censusForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!validateStep()) return;
  // Intencionalmente NO se lee FormData, ni archivos, ni se envía nada por red.
  censusForm.reset();
  showStep(0);
  setFormMessage('Validación de demostración completada. Ningún dato ni documento fue enviado o almacenado. Para un censo real se necesita implementar el backend seguro y la autorización de tratamiento de datos.', 'success');
  formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});
showStep(0);
