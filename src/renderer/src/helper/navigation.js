
let navigator;

export function setNavigator(navigate) {
  navigator = navigate;
}

export function navigateTo(path, options = {}) {
  if (navigator) navigator(path, options);
  else console.warn("Navigator not set");
}

export function replaceWith(path) {
  if (navigator) navigator(path, { replace: true });
}

export function goBack() {
  if (navigator) navigator(-1);
}