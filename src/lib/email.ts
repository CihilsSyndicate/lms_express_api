import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'LMS Platform <noreply@domainanda.com>';
const frontendUrl = process.env.FRONTEND_APP_URL || 'http://localhost:3000';

let resend: Resend | null = null;

function getResendClient(): Resend {
  if (!resend) {
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resend = new Resend(resendApiKey);
  }
  return resend;
}

export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
  username: string,
): Promise<void> {
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f6;padding:40px 16px">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:12px;overflow:hidden">
          <tr>
            <td style="padding:32px 32px 0">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <span style="font-size:24px;font-weight:700;color:#7054dc">LMS Platform</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px">
              <h1 style="font-size:20px;font-weight:700;color:#1a1a2e;margin:0 0 16px">Reset Password</h1>
              <p style="font-size:14px;line-height:1.6;color:#4a4a5e;margin:0 0 8px">Hai <strong>${escapeHtml(username)}</strong>,</p>
              <p style="font-size:14px;line-height:1.6;color:#4a4a5e;margin:0 0 16px">
                Kami menerima permintaan reset password untuk akun LMS Platform Anda.
                Klik tombol di bawah ini untuk memilih password baru:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 24px">
                    <a href="${resetUrl}"
                       style="display:inline-block;padding:12px 28px;background-color:#7054dc;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fff8e1;border-radius:8px;padding:12px 16px;margin-bottom:16px">
                <tr>
                  <td>
                    <p style="font-size:12px;line-height:1.5;color:#8a6d00;margin:0">
                      Link ini berlaku selama <strong>1 jam</strong>. Jika Anda tidak meminta reset password, abaikan email ini.
                    </p>
                  </td>
                </tr>
              </table>
              <p style="font-size:13px;line-height:1.5;color:#7a7e8a;margin:0 0 8px">
                Jika tombol di atas tidak berfungsi, salin dan tempel URL berikut ke browser Anda:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f6;border-radius:6px;padding:10px 14px;margin-bottom:16px">
                <tr>
                  <td>
                    <p style="font-size:11px;line-height:1.5;color:#7a7e8a;margin:0;word-break:break-all">${resetUrl}</p>
                  </td>
                </tr>
              </table>
              <p style="font-size:11px;line-height:1.5;color:#9ca3af;margin:0;font-style:italic">
                Email ini dikirim otomatis oleh sistem LMS Platform. Harap tidak membalas email ini.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;background-color:#f8f7ff;border-top:1px solid #e8e6f0">
              <p style="font-size:11px;color:#9ca3af;margin:0;text-align:center">
                &copy; ${new Date().getFullYear()} LMS Platform. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const client = getResendClient();
  const { error } = await client.emails.send({
    from: fromEmail,
    to: [to],
    subject: 'Reset Password — LMS Platform',
    html,
  });

  if (error) {
    console.error('[EMAIL] Failed to send password reset email:', error);
    throw new Error('Gagal mengirim email reset password. Silakan coba lagi.');
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
