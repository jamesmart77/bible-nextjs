const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

export async function verifyRecaptcha(token: string): Promise<boolean> {
  if (!RECAPTCHA_SECRET) {
    console.error('RECAPTCHA_SECRET_KEY is not configured');
    return false;
  }

  const form = new URLSearchParams();
  form.append('secret', RECAPTCHA_SECRET);
  form.append('response', token);

  const response = await fetch(RECAPTCHA_VERIFY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  });

  if (!response.ok) {
    console.error('Recaptcha verification request failed', response.statusText);
    return false;
  }

  const data = await response.json();
  return data.success === true;
}
