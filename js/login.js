'use strict';
// Prototipo de interfaz: deliberadamente no autentica, almacena ni envía credenciales.
const loginForm = document.getElementById('loginForm');
const documentInput = document.getElementById('documento');
const passwordInput = document.getElementById('password');
const toggle = document.getElementById('togglePassword');
const status = document.getElementById('loginStatus');
const recovery = document.getElementById('recoverPassword');
const palettes = ['equilibrada', 'suave', 'profunda'];
try {
  const palette = localStorage.getItem('czg-demo-palette-v1');
  if (palettes.includes(palette)) document.documentElement.dataset.palette = palette;
} catch (_) { /* No se requiere almacenamiento para utilizar la vista. */ }
document.getElementById('loginYear').textContent = new Date().getFullYear();
function report(message) { status.textContent = message; status.hidden = false; }
function setError(input, errorId, message) {
  const error = document.getElementById(errorId);
  error.textContent = message;
  error.hidden = !message;
  if (message) input.setAttribute('aria-invalid', 'true');
  else input.removeAttribute('aria-invalid');
}
toggle.addEventListener('click', () => {
  const reveal = passwordInput.type === 'password';
  passwordInput.type = reveal ? 'text' : 'password';
  toggle.setAttribute('aria-pressed', String(reveal));
  toggle.setAttribute('aria-label', reveal ? 'Ocultar contraseña' : 'Mostrar contraseña');
  toggle.querySelector('.eye-slash').hidden = !reveal;
});
[[documentInput,'documentError'],[passwordInput,'passwordError']].forEach(([input,id]) => {
  input.addEventListener('input', () => { setError(input,id,''); status.hidden = true; });
});
loginForm.addEventListener('submit', event => {
  event.preventDefault();
  status.hidden = true;
  const doc = documentInput.value.trim();
  const docError = !doc ? 'Ingresa un documento de ejemplo.' : !/^[A-Za-z0-9-]{3,30}$/.test(doc) ? 'Usa entre 3 y 30 letras, números o guiones.' : '';
  const passwordError = !passwordInput.value ? 'Ingresa una contraseña de ejemplo.' : '';
  setError(documentInput,'documentError',docError);
  setError(passwordInput,'passwordError',passwordError);
  if (docError || passwordError) { (docError ? documentInput : passwordInput).focus(); return; }
  loginForm.reset();
  passwordInput.type = 'password';
  toggle.setAttribute('aria-pressed','false');
  toggle.setAttribute('aria-label','Mostrar contraseña');
  toggle.querySelector('.eye-slash').hidden = true;
  report('Formulario validado. El acceso real aún no está disponible: se requiere conectar la autenticación de Laravel. No se enviaron ni guardaron credenciales. Puedes explorar el panel de demostración con el enlace inferior.');
});
recovery.addEventListener('click', () => report('La recuperación de contraseña se habilitará con la autenticación de Laravel. Por ahora, solicita ayuda al administrador del sistema.'));
