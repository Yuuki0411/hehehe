/* ============================================================
   MAILER — klien SMTP murni Node.js (net + tls)
   ------------------------------------------------------------
   Mengirim email tanpa dependency npm. Mendukung:
   - SMTP port 587 dengan STARTTLS (default, mis. smtp.gmail.com)
   - SMTP port 465 TLS langsung (bila MAIL_SECURE=1)
   - Autentikasi AUTH PLAIN (user + app password)
   - Email multipart (plain text + HTML)

   Contoh pemakaian:
     const { sendEmail } = require("./mailer");
     await sendEmail({
       host: "smtp.gmail.com", port: 587, secure: false,
       user: "digemsmarket@gmail.com", pass: "app-password-16-karakter",
       from: "digemsmarket@gmail.com", fromName: "Topup Digems",
       to: "pembeli@email.com",
       subject: "Verifikasi Email",
       text: "Klik link ...",
       html: "<p>Klik link ...</p>",
     });
   ============================================================ */

const net = require("net");
const tls = require("tls");

function b64(s) {
  return Buffer.from(s, "utf8").toString("base64");
}

/* Bersihkan header agar tidak bisa disisipi baris baru (header injection) */
function safe(s) {
  return String(s == null ? "" : s).replace(/[\r\n]+/g, " ");
}

/* Bungkus satu email menjadi payload DATA SMTP */
function buildData(cfg) {
  const subject = safe(cfg.subject || "Pesan");
  const fromName = safe(cfg.fromName || "Topup Digems");
  const text = String(cfg.text || "");
  const html = String(cfg.html || "");
  const headers = [
    "From: " + fromName + " <" + cfg.from + ">",
    "To: <" + cfg.to + ">",
    "Subject: " + subject,
    "MIME-Version: 1.0",
    'Content-Type: multipart/alternative; boundary="bdgems"',
    "",
    "--bdgems",
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    text,
    "--bdgems",
    "Content-Type: text/html; charset=utf-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    html,
    "--bdgems--",
    ".",
  ];
  return headers.join("\r\n") + "\r\n";
}

function sendEmail(cfg) {
  return new Promise((resolve, reject) => {
    const host = cfg.host;
    const port = Number(cfg.port || 587);
    const secure = !!cfg.secure;
    let sock = null;
    let buf = "";
    let queue = [];
    let done = false;

    const fail = (e) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try { if (sock) sock.destroy(); } catch (err) {}
      reject(e);
    };

    const timer = setTimeout(() => fail(new Error("SMTP timeout ke " + host)), 30000);

    /* Terima baris respons SMTP; baris terakhir berformat "250 OK" (kode + spasi) */
    function onData(chunk) {
      buf += chunk.toString("utf8");
      let idx;
      while ((idx = buf.indexOf("\r\n")) !== -1) {
        const line = buf.slice(0, idx);
        buf = buf.slice(idx + 2);
        const p = queue[0];
        if (!p) continue;
        p.lines.push(line);
        if (/^\d{3} /.test(line)) {
          queue.shift();
          p.resolve(line);
        }
      }
    }

    /* Kirim perintah SMTP & tunggu respons */
    function cmd(line) {
      return new Promise((res, rej) => {
        const entry = { lines: [], resolve: res, reject: rej };
        queue.push(entry);
        sock.write(line + "\r\n");
      });
    }

    async function run() {
      // 1) greeting server (220)
      await new Promise((res, rej) => queue.push({ lines: [], resolve: res, reject: rej }));

      if (secure) {
        // port 465 — TLS langsung dari awal (socket sudah TLS)
        await cmd("EHLO digems.local");
      } else {
        // port 587 — STARTTLS lalu upgrade ke TLS
        await cmd("EHLO digems.local");
        await cmd("STARTTLS");
        const t = tls.connect({ socket: sock, servername: host });
        sock = t;
        t.on("data", onData);
        t.on("error", fail);
        await new Promise((res, rej) => {
          t.once("secureConnect", res);
          t.once("error", rej);
        });
        await cmd("EHLO digems.local");
      }

      // 2) autentikasi AUTH PLAIN \0user\0pass
      const authResp = await cmd("AUTH PLAIN " + b64("\0" + cfg.user + "\0" + cfg.pass));
      if (!/^235/.test(authResp)) {
        throw new Error("Autentikasi SMTP gagal (" + authResp + "). Cek MAIL_USER & MAIL_PASS (Gmail: App Password).");
      }

      // 3) kirim email
      await cmd("MAIL FROM:<" + cfg.from + ">");
      await cmd("RCPT TO:<" + cfg.to + ">");
      await cmd("DATA");
      sock.write(buildData(cfg));
      const dataResp = await new Promise((res, rej) => queue.push({ lines: [], resolve: res, reject: rej }));
      if (!/^250/.test(dataResp)) throw new Error("Pengiriman email ditolak (" + dataResp + ")");

      // 4) tutup koneksi
      await cmd("QUIT").catch(() => {});
      done = true;
      clearTimeout(timer);
      try { sock.destroy(); } catch (e) {}
      resolve(true);
    }

    sock = secure
      ? tls.connect({ host, port, servername: host })
      : net.connect({ host, port });

    sock.on("connect", () => { run().catch(fail); });
    sock.on("data", onData);
    sock.on("error", fail);
  });
}

module.exports = { sendEmail };
