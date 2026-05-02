import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Shared email wrapper ────────────────────────────────────────────────────
const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MSBP Store</title>
</head>
<body style="margin:0;padding:0;background:#06080f;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#06080f;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header / Brand -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:12px 0 4px;">
                    <p style="margin:0;color:#7c85f0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">MSBP STORE</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div style="width:48px;height:2px;background:#7c85f0;margin:0 auto;border-radius:2px;"></div>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:8px;">
                    <p style="margin:0;color:#4d5a80;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;text-align:center;">Top Up Game & Voucher Digital</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card Body -->
          <tr>
            <td style="background:#0b0f1c;border:1px solid #1a2240;border-radius:12px;overflow:hidden;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:28px 0 0;">
              <p style="color:#1a2240;font-size:11px;font-weight:600;letter-spacing:1px;margin:0;">
                2026 MSBPSTORE &middot; msbpstore.my.id
              </p>
              <p style="color:#1a2240;font-size:10px;margin:4px 0 0;">
                Pusat Top Up Game Terpercaya
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ─── 1. OTP Verification Email ───────────────────────────────────────────────
export const sendVerificationEmail = async (email: string, name: string, otp: string) => {
    try {
        const html = emailWrapper(`
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:40px 36px 0;text-align:center;">
                <p style="margin:0 0 6px;color:#4d5a80;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Verifikasi Akun</p>
                <h1 style="color:#eef0ff;font-size:22px;font-weight:800;letter-spacing:-0.5px;margin:0 0 12px;">Selesaikan Pendaftaran Anda</h1>
                <p style="color:#9ba4c4;font-size:14px;line-height:1.7;margin:0;">
                  Halo <strong style="color:#eef0ff;">${name}</strong>, gunakan kode di bawah untuk memverifikasi akun Anda.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 36px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="background:#121830;border:1px solid #1a2240;border-radius:10px;padding:32px 20px;">
                      <p style="color:#4d5a80;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px;">Kode Verifikasi</p>
                      <span style="font-size:46px;font-weight:900;letter-spacing:16px;color:#eef0ff;font-family:'Courier New',Courier,monospace;">${otp}</span>
                      <p style="color:#4d5a80;font-size:12px;font-weight:600;margin:16px 0 0;">Berlaku selama 15 menit</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 36px 36px;text-align:center;border-top:1px solid #1a2240;">
                <p style="color:#4d5a80;font-size:12px;line-height:1.8;margin:24px 0 0;">
                  Jika Anda tidak merasa mendaftar di MSBP Store, abaikan email ini.<br/>
                  Jangan bagikan kode ini kepada siapapun.
                </p>
              </td>
            </tr>
          </table>
        `);

        const data = await resend.emails.send({
            from: "MsbpStore <noreply@msbpstore.my.id>",
            to: email,
            subject: "Kode Verifikasi MSBPSTORE",
            html,
        });

        if (data.error) {
            console.error("Resend API returning error:", data.error);
            return { success: false, error: data.error };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Resend OTP Connection Error:", error);
        return { success: false, error };
    }
};

// ─── 2. Order Invoice Email ───────────────────────────────────────────────────
export const sendOrderInvoice = async (email: string, orderData: any) => {
    try {
        const discountSection = orderData.discount && orderData.discount > 0 ? `
          <tr>
            <td style="padding:12px 20px;border-bottom:1px solid #1a2240;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:#4d5a80;font-size:13px;font-weight:600;">Harga Asli</td>
                  <td align="right" style="color:#4d5a80;font-size:13px;font-weight:600;text-decoration:line-through;">Rp ${orderData.price.toLocaleString('id-ID')}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 20px;border-bottom:1px solid #1a2240;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:#34d399;font-size:13px;font-weight:700;">Diskon Voucher</td>
                  <td align="right" style="color:#34d399;font-size:13px;font-weight:800;">-Rp ${orderData.discount.toLocaleString('id-ID')}</td>
                </tr>
              </table>
            </td>
          </tr>
        ` : '';

        const totalAmount = orderData.discount && orderData.discount > 0
            ? orderData.finalPrice
            : orderData.price;

        const html = emailWrapper(`
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:40px 36px 0;text-align:center;">
                <p style="margin:0 0 6px;color:#4d5a80;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Invoice Pembayaran</p>
                <h1 style="color:#eef0ff;font-size:22px;font-weight:800;letter-spacing:-0.5px;margin:0 0 10px;">Pesanan Dikonfirmasi</h1>
                <p style="color:#9ba4c4;font-size:13px;line-height:1.7;margin:0;">Berikut adalah bukti pembayaran resmi Anda dari MSBP Store.</p>
              </td>
            </tr>

            <tr>
              <td style="padding:28px 36px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#121830;border:1px solid #1a2240;border-radius:10px;overflow:hidden;">
                  <tr>
                    <td style="padding:12px 20px;border-bottom:1px solid #1a2240;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="color:#4d5a80;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Transaction ID</td>
                          <td align="right" style="color:#9ba4c4;font-size:12px;font-weight:800;font-family:monospace;">${orderData.orderId}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 20px;border-bottom:1px solid #1a2240;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="color:#4d5a80;font-size:13px;font-weight:600;">Produk</td>
                          <td align="right" style="color:#eef0ff;font-size:13px;font-weight:800;">${orderData.productName}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 20px;border-bottom:1px solid #1a2240;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="color:#4d5a80;font-size:13px;font-weight:600;">Target User</td>
                          <td align="right" style="color:#eef0ff;font-size:13px;font-weight:800;font-family:monospace;">${orderData.target}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  ${discountSection}
                  <tr>
                    <td style="padding:18px 20px;background:#121830;border-top:2px solid #1a2240;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="color:#9ba4c4;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Total Bayar</td>
                          <td align="right" style="color:#7c85f0;font-size:22px;font-weight:900;letter-spacing:-0.5px;">Rp ${totalAmount.toLocaleString('id-ID')}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:0 36px;text-align:center;">
                <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                  <tr>
                    <td style="background:rgba(52,211,153,0.12);border:1px solid rgba(52,211,153,0.35);border-radius:6px;padding:8px 20px;">
                      <span style="color:#34d399;font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;">Pembayaran Berhasil</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:28px 36px 36px;text-align:center;">
                <p style="color:#4d5a80;font-size:13px;line-height:1.7;margin:0 0 20px;">
                  Pesanan Anda sedang diproses. Terima kasih telah berbelanja di MSBP Store.
                </p>
                <a href="https://msbpstore.my.id/status" style="display:inline-block;background:#7c85f0;color:#ffffff;padding:13px 28px;text-decoration:none;border-radius:8px;font-weight:700;font-size:13px;letter-spacing:0.5px;">
                  Cek Status Pesanan
                </a>
              </td>
            </tr>
          </table>
        `);

        await resend.emails.send({
            from: "MsbpStore <noreply@msbpstore.my.id>",
            to: email,
            subject: `Invoice MSBPSTORE - ${orderData.orderId}`,
            html,
        });

        return { success: true };
    } catch (error) {
        console.error("Resend Invoice Error:", error);
        return { success: false, error };
    }
};

// ─── 3. Reset Password Email ──────────────────────────────────────────────────
export const sendResetPasswordLinkEmail = async (email: string, resetLink: string) => {
    try {
        const html = emailWrapper(`
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:48px 36px 0;text-align:center;">
                <p style="margin:0 0 8px;color:#4d5a80;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Keamanan Akun</p>
                <h1 style="color:#eef0ff;font-size:24px;font-weight:900;letter-spacing:-0.5px;margin:0 0 14px;">Reset Password Akun Anda</h1>
                <p style="color:#9ba4c4;font-size:14px;line-height:1.75;margin:0;max-width:400px;display:block;margin-left:auto;margin-right:auto;">
                  Kami menerima permintaan untuk mengatur ulang kata sandi pada akun MSBP Store Anda. Klik tombol di bawah untuk melanjutkan.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 36px;text-align:center;">
                <a href="${resetLink}" style="display:inline-block;background:#7c85f0;color:#ffffff;padding:15px 40px;text-decoration:none;border-radius:8px;font-weight:800;font-size:14px;letter-spacing:0.5px;text-transform:uppercase;">
                  Atur Ulang Password
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 36px 32px;text-align:center;border-top:1px solid #1a2240;">
                <p style="color:#4d5a80;font-size:12px;line-height:1.8;margin:24px 0 0;">
                  Tautan ini hanya berlaku selama <strong style="color:#9ba4c4;">1 jam</strong>.<br/>
                  Jika Anda tidak meminta reset password, abaikan email ini.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 36px 40px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#121830;border:1px solid #1a2240;border-radius:8px;">
                  <tr>
                    <td style="padding:16px 20px;">
                      <p style="color:#4d5a80;font-size:11px;margin:0 0 6px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Tautan Alternatif</p>
                      <p style="margin:0;"><a href="${resetLink}" style="color:#7c85f0;font-size:11px;word-break:break-all;font-family:monospace;text-decoration:none;line-height:1.6;">${resetLink}</a></p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        `);

        await resend.emails.send({
            from: "MsbpStore <noreply@msbpstore.my.id>",
            to: email,
            subject: "Atur Ulang Password MSBPSTORE",
            html,
        });

        return { success: true };
    } catch (error) {
        console.error("Resend Reset Password Error:", error);
        return { success: false, error };
    }
};
