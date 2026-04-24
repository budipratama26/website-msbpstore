import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Shared email wrapper ───────────────────────────────────────────────────
const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MSBP Store</title>
</head>
<body style="margin:0;padding:0;background:#0a0e17;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e17;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

          <!-- Header / Logo -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#3b82f6;border-radius:10px;padding:10px 16px;text-align:center;">
                    <span style="color:#ffffff;font-size:15px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">MSBP STORE</span>
                  </td>
                </tr>
              </table>
              <p style="color:#475569;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:10px 0 0;">Top Up Game &amp; Voucher Digital</p>
            </td>
          </tr>

          <!-- Card Body -->
          <tr>
            <td style="background:#111827;border:1px solid #1e2d45;border-radius:12px;overflow:hidden;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:28px 0 0;">
              <p style="color:#1e2d45;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin:0;">
                © 2026 MSBPSTORE · msbpstore.my.id
              </p>
              <p style="color:#1e2d45;font-size:10px;font-weight:600;margin:4px 0 0;">
                Pusat Top Up Game Terpercaya &amp; Termurah
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

// ─── 1. OTP Verification Email ──────────────────────────────────────────────
export const sendVerificationEmail = async (email: string, name: string, otp: string) => {
    try {
        const html = emailWrapper(`
          <!-- OTP Content -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:36px 36px 0;text-align:center;">
                <div style="width:52px;height:52px;background:#1d3a6e;border:1px solid rgba(59,130,246,0.4);border-radius:10px;margin:0 auto 20px;display:inline-flex;align-items:center;justify-content:center;">
                  <span style="font-size:24px;">🔐</span>
                </div>
                <h1 style="color:#f1f5f9;font-size:22px;font-weight:800;letter-spacing:-0.5px;margin:0 0 8px;">Verifikasi Akun Anda</h1>
                <p style="color:#475569;font-size:14px;line-height:1.6;margin:0;">Halo <strong style="color:#94a3b8;">${name}</strong>, selesaikan pendaftaran dengan kode OTP berikut.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 36px;">
                <!-- OTP Box -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="background:#1a2235;border:1px solid #1e2d45;border-radius:10px;padding:28px 20px;">
                      <p style="color:#475569;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;">Kode Verifikasi</p>
                      <span style="font-size:44px;font-weight:900;letter-spacing:14px;color:#f1f5f9;font-family:'Courier New',Courier,monospace;">${otp}</span>
                      <p style="color:#3b82f6;font-size:12px;font-weight:700;margin:14px 0 0;">⏱ Berlaku 15 menit</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 36px 32px;text-align:center;">
                <p style="color:#475569;font-size:12px;line-height:1.7;margin:0;">
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
            subject: "🔐 Kode Verifikasi MSBPSTORE",
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

// ─── 2. Order Invoice Email ──────────────────────────────────────────────────
export const sendOrderInvoice = async (email: string, orderData: any) => {
    try {
        const discountSection = orderData.discount && orderData.discount > 0 ? `
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #1e2d45;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:#475569;font-size:13px;font-weight:600;">Harga Asli</td>
                  <td align="right" style="color:#475569;font-size:13px;font-weight:700;text-decoration:line-through;">Rp ${orderData.price.toLocaleString('id-ID')}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #1e2d45;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:#10b981;font-size:13px;font-weight:700;">🎟️ Diskon Voucher</td>
                  <td align="right" style="color:#10b981;font-size:13px;font-weight:800;">-Rp ${orderData.discount.toLocaleString('id-ID')}</td>
                </tr>
              </table>
            </td>
          </tr>
        ` : '';

        const totalAmount = orderData.discount && orderData.discount > 0
            ? orderData.finalPrice
            : orderData.price;

        const html = emailWrapper(`
          <!-- Invoice Content -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:36px 36px 0;text-align:center;">
                <div style="width:52px;height:52px;background:#1d3a6e;border:1px solid rgba(59,130,246,0.4);border-radius:10px;margin:0 auto 20px;display:inline-flex;align-items:center;justify-content:center;">
                  <span style="font-size:24px;">🧾</span>
                </div>
                <h1 style="color:#f1f5f9;font-size:22px;font-weight:800;letter-spacing:-0.5px;margin:0 0 6px;">Pesanan Dikonfirmasi!</h1>
                <p style="color:#475569;font-size:13px;line-height:1.6;margin:0;">Ini adalah bukti pembayaran resmi Anda dari MSBP Store.</p>
              </td>
            </tr>

            <!-- Order Details Table -->
            <tr>
              <td style="padding:28px 36px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a2235;border:1px solid #1e2d45;border-radius:10px;overflow:hidden;">
                  <tr>
                    <td style="padding:16px 20px;border-bottom:1px solid #1e2d45;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="color:#475569;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Transaction ID</td>
                          <td align="right" style="color:#94a3b8;font-size:12px;font-weight:800;font-family:monospace;">${orderData.orderId}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:16px 20px;border-bottom:1px solid #1e2d45;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="color:#475569;font-size:13px;font-weight:600;">Produk</td>
                          <td align="right" style="color:#f1f5f9;font-size:13px;font-weight:800;">${orderData.productName}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:16px 20px;border-bottom:1px solid #1e2d45;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="color:#475569;font-size:13px;font-weight:600;">Target User</td>
                          <td align="right" style="color:#f1f5f9;font-size:13px;font-weight:800;font-family:monospace;">${orderData.target}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  ${discountSection}
                  <tr>
                    <td style="padding:20px;background:#1d3a6e;border-top:1px solid rgba(59,130,246,0.3);">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="color:#94a3b8;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Total Bayar</td>
                          <td align="right" style="color:#3b82f6;font-size:22px;font-weight:900;letter-spacing:-0.5px;">Rp ${totalAmount.toLocaleString('id-ID')}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Status Badge -->
            <tr>
              <td style="padding:0 36px;text-align:center;">
                <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                  <tr>
                    <td style="background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.4);border-radius:6px;padding:8px 20px;">
                      <span style="color:#10b981;font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;">✅ Pembayaran Berhasil</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- CTA -->
            <tr>
              <td style="padding:28px 36px 36px;text-align:center;">
                <p style="color:#475569;font-size:13px;line-height:1.7;margin:0 0 20px;">
                  Pesanan sedang diproses secepat kilat. Have a great game! 🎮
                </p>
                <a href="https://msbpstore.my.id/status" style="display:inline-block;background:#3b82f6;color:#ffffff;padding:13px 28px;text-decoration:none;border-radius:8px;font-weight:800;font-size:13px;letter-spacing:0.5px;">
                  Cek Status Pesanan →
                </a>
              </td>
            </tr>
          </table>
        `);

        await resend.emails.send({
            from: "MsbpStore <noreply@msbpstore.my.id>",
            to: email,
            subject: `🧾 Invoice MSBPSTORE - ${orderData.orderId}`,
            html,
        });

        return { success: true };
    } catch (error) {
        console.error("Resend Invoice Error:", error);
        return { success: false, error };
    }
};

// ─── 3. Reset Password Email ─────────────────────────────────────────────────
export const sendResetPasswordLinkEmail = async (email: string, resetLink: string) => {
    try {
        const html = emailWrapper(`
          <!-- Reset Password Content -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:48px 36px 0;text-align:center;">
                <!-- Icon Container with Gradient -->
                <div style="width:64px;height:64px;background:linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(37,99,235,0.05) 100%);border:1px solid rgba(59,130,246,0.3);border-radius:16px;margin:0 auto 24px;display:inline-flex;align-items:center;justify-content:center;box-shadow:0 8px 32px rgba(59,130,246,0.15);">
                  <span style="font-size:28px;">🔐</span>
                </div>
                <h1 style="color:#ffffff;font-size:26px;font-weight:900;letter-spacing:-0.5px;margin:0 0 12px;font-family:'Segoe UI',sans-serif;">Reset Password Akun Anda</h1>
                <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0;font-weight:500;">
                  Kami menerima permintaan untuk mengatur ulang kata sandi pada akun MSBP Store Anda. Silakan klik tombol di bawah ini untuk melanjutkan proses.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 36px;text-align:center;">
                <!-- Main CTA Button -->
                <a href="${resetLink}" style="display:inline-block;background:linear-gradient(to right, #2563eb, #3b82f6);color:#ffffff;padding:16px 42px;text-decoration:none;border-radius:12px;font-weight:800;font-size:15px;letter-spacing:0.5px;box-shadow:0 8px 24px rgba(37,99,235,0.3);text-transform:uppercase;border:1px solid rgba(255,255,255,0.1);">
                  Atur Ulang Password
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 36px 28px;text-align:center;">
                <p style="color:#64748b;font-size:12px;line-height:1.7;margin:0;font-weight:500;">
                  Tautan ini bersifat rahasia dan hanya berlaku selama <strong style="color:#cbd5e1;">1 jam</strong>.<br/>Jika Anda tidak pernah meminta reset password, Anda dapat mengabaikan dan menghapus email ini dengan aman.
                </p>
              </td>
            </tr>
            <!-- Fallback link box -->
            <tr>
              <td style="padding:0 36px 40px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(15,23,42,0.6);border:1px solid rgba(51,65,85,0.5);border-radius:12px;">
                  <tr>
                    <td style="padding:18px 24px;text-align:left;">
                      <p style="color:#94a3b8;font-size:11px;margin:0 0 8px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Tautan Alternatif</p>
                      <p style="margin:0;"><a href="${resetLink}" style="color:#60a5fa;font-size:11px;word-break:break-all;font-family:monospace;text-decoration:none;line-height:1.5;">${resetLink}</a></p>
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
            subject: "🔑 Atur Ulang Password MSBPSTORE",
            html,
        });

        return { success: true };
    } catch (error) {
        console.error("Resend Reset Password Error:", error);
        return { success: false, error };
    }
};
