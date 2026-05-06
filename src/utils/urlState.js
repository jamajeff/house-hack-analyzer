export function encodeState(state) {
  try {
    const json = JSON.stringify(state);
    const encoded = btoa(encodeURIComponent(json));
    return encoded;
  } catch {
    return null;
  }
}

export function decodeState(encoded) {
  try {
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function saveToUrl(state) {
  const encoded = encodeState(state);
  if (encoded) {
    const url = new URL(window.location.href);
    url.searchParams.set('d', encoded);
    window.history.replaceState(null, '', url.toString());
  }
}

export function loadFromUrl() {
  const url = new URL(window.location.href);
  const encoded = url.searchParams.get('d');
  if (encoded) return decodeState(encoded);
  return null;
}
