import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Shared premium email wrapper ────────────────────────────────────────────────────
const emailWrapper = (content: string, preheader: string = "Pemberitahuan dari MSBP Store") => `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MSBP Store</title>
</head>
<body style="margin:0;padding:0;background-color:#000000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <span style="display:none;visibility:hidden;mso-hide:all;font-size:1px;color:#000000;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheader}
  </span>
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#0a0a0a;border:1px solid #1f1f1f;border-radius:16px;overflow:hidden;">
          
          <!-- Sleek Header -->
          <tr>
            <td style="padding:32px 32px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                     <h2 style="margin:0;color:#ffffff;font-size:18px;font-weight:800;letter-spacing:-0.5px;">MSBP STORE</h2>
                  </td>
                  <td align="right">
                    <span style="font-size:10px;font-weight:600;letter-spacing:1px;color:#666666;text-transform:uppercase;">Notifikasi Sistem</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Dynamic Content -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>

          <!-- Sleek Footer -->
          <tr>
            <td style="padding:0 32px 32px;">
              <div style="border-top:1px solid #1f1f1f;padding-top:24px;">
                <p style="margin:0;color:#666666;font-size:11px;line-height:1.6;">
                  Pesan ini dikirimkan otomatis oleh sistem keamanan <strong>MSBP Store</strong>.<br/>
                  Jika Anda tidak merasa melakukan aktivitas ini, mohon amankan akun Anda.
                </p>
                <p style="margin:16px 0 0;color:#444444;font-size:10px;">
                  &copy; ${new Date().getFullYear()} MSBPSTORE. Semua Hak Dilindungi.
                </p>
              </div>
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
          <h1 style="margin:0 0 12px;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Verifikasi Akun</h1>
          <p style="margin:0 0 32px;color:#a3a3a3;font-size:14px;line-height:1.6;">
            Halo <strong style="color:#ffffff;">${name}</strong>, gunakan kode keamanan di bawah ini untuk menyelesaikan proses pendaftaran Anda.
          </p>
          
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr>
              <td align="center" style="padding:24px;background-color:#111111;border:1px solid #222222;border-radius:12px;">
                <span style="font-size:42px;font-weight:800;letter-spacing:12px;color:#ffffff;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">${otp}</span>
              </td>
            </tr>
          </table>

          <p style="margin:0;color:#666666;font-size:12px;line-height:1.6;">
            Kode ini berlaku selama <strong>15 menit</strong>. Jangan bagikan kode ini kepada siapapun termasuk pihak MSBP Store.
          </p>
        `, "Kode OTP Verifikasi Akun Anda");

        const data = await resend.emails.send({
            from: "MsbpStore <noreply@msbpstore.my.id>",
            to: email,
            subject: "Kode Verifikasi Keamanan",
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
            <td style="padding:12px 0;border-bottom:1px solid #1f1f1f;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:#a3a3a3;font-size:13px;">Harga Asli</td>
                  <td align="right" style="color:#666666;font-size:13px;text-decoration:line-through;">Rp ${orderData.price.toLocaleString('id-ID')}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #1f1f1f;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:#34d399;font-size:13px;font-weight:600;">Diskon</td>
                  <td align="right" style="color:#34d399;font-size:13px;font-weight:600;">-Rp ${orderData.discount.toLocaleString('id-ID')}</td>
                </tr>
              </table>
            </td>
          </tr>
        ` : '';

        const totalAmount = orderData.discount && orderData.discount > 0
            ? orderData.finalPrice
            : orderData.price;

        const html = emailWrapper(`
          <h1 style="margin:0 0 12px;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Pesanan Dikonfirmasi</h1>
          <p style="margin:0 0 32px;color:#a3a3a3;font-size:14px;line-height:1.6;">
            Terima kasih telah berbelanja di MSBP Store. Berikut adalah detail pesanan Anda yang sedang kami proses.
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr>
              <td style="padding:16px;background-color:#111111;border:1px solid #222222;border-radius:12px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:0 0 12px;border-bottom:1px solid #1f1f1f;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="color:#a3a3a3;font-size:13px;">Order ID</td>
                          <td align="right" style="color:#ffffff;font-size:13px;font-weight:600;font-family:ui-monospace,monospace;">${orderData.orderId}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;border-bottom:1px solid #1f1f1f;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="color:#a3a3a3;font-size:13px;">Produk</td>
                          <td align="right" style="color:#ffffff;font-size:13px;font-weight:600;">${orderData.productName}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;border-bottom:1px solid #1f1f1f;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="color:#a3a3a3;font-size:13px;">Tujuan</td>
                          <td align="right" style="color:#ffffff;font-size:13px;font-weight:600;">${orderData.target}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  ${discountSection}
                  <tr>
                    <td style="padding:16px 0 0;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="color:#ffffff;font-size:14px;font-weight:600;">Total Pembayaran</td>
                          <td align="right" style="color:#ffffff;font-size:18px;font-weight:700;">Rp ${totalAmount.toLocaleString('id-ID')}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <a href="https://msbpstore.my.id/status" style="display:inline-block;background-color:#ffffff;color:#000000;padding:12px 24px;text-decoration:none;border-radius:8px;font-size:13px;font-weight:600;">Cek Status Pesanan</a>
              </td>
            </tr>
          </table>
        `, "Invoice Pembayaran Anda");

        await resend.emails.send({
            from: "MsbpStore <noreply@msbpstore.my.id>",
            to: email,
            subject: `Invoice: ${orderData.orderId}`,
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
          <h1 style="margin:0 0 12px;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Atur Ulang Password</h1>
          <p style="margin:0 0 24px;color:#a3a3a3;font-size:14px;line-height:1.6;">
            Kami menerima permintaan untuk mengatur ulang kata sandi pada akun Anda. Silakan klik tombol di bawah ini untuk mengamankan dan memperbarui kata sandi Anda.
          </p>
          
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr>
              <td>
                <a href="${resetLink}" style="display:inline-block;background-color:#ffffff;color:#000000;padding:14px 28px;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">Ganti Password Sekarang</a>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 24px;color:#666666;font-size:12px;line-height:1.6;">
            Tautan ini kedaluwarsa dalam <strong>1 jam</strong>. Jika Anda tidak merasa melakukan permintaan ini, mohon abaikan pesan ini.
          </p>

          <div style="padding:16px;background-color:#111111;border:1px solid #222222;border-radius:8px;">
            <p style="margin:0 0 6px;color:#666666;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Tautan Alternatif</p>
            <a href="${resetLink}" style="color:#6366f1;font-size:12px;text-decoration:none;word-break:break-all;">${resetLink}</a>
          </div>
        `, "Permintaan Atur Ulang Password Akun");

        await resend.emails.send({
            from: "MsbpStore <noreply@msbpstore.my.id>",
            to: email,
            subject: "Pemberitahuan Reset Password",
            html,
        });

        return { success: true };
    } catch (error) {
        console.error("Resend Reset Password Error:", error);
        return { success: false, error };
    }
};

