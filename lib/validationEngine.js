export async function validateBridgeIntent(form) {
  const response = await fetch('/api/validate', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(form),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || 'Validation failed.');
  }

  return payload;
}
