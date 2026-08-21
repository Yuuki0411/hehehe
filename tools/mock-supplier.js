/* ============================================================
   MOCK API SUPPLIER (untuk uji coba lokal)
   ------------------------------------------------------------
   Meniru endpoint Digiflazz: POST /v1/price-list dan /v1/transaction
   (topup + status). Tidak terhubung ke supplier sungguhan.

   Jalankan:
     node tools/mock-supplier.js          → http://127.0.0.1:3998/v1
   ============================================================ */

const http = require("http");

const PRODUCTS = [
  { buyer_sku_code: "ML86", product_name: "MLBB 86 Diamonds", brand: "Mobile Legends", price: 13000 },
  { buyer_sku_code: "ML172", product_name: "MLBB 172 Diamonds", brand: "Mobile Legends", price: 25000 },
  { buyer_sku_code: "ML257", product_name: "MLBB 257 Diamonds", brand: "Mobile Legends", price: 37000 },
  { buyer_sku_code: "VALO475", product_name: "VALORANT 475 Points", brand: "VALORANT", price: 54000 },
  { buyer_sku_code: "GI60", product_name: "Genshin Impact 60 Genesis Crystals", brand: "Genshin Impact", price: 9000 },
];

let topupCount = 0;

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch { resolve({}); }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://" + req.headers.host);
  const body = await readBody(req);
  const json = JSON.stringify;
  const send = (code, obj) => {
    res.writeHead(code, { "Content-Type": "application/json" });
    res.end(json(obj));
  };

  if (req.method !== "POST") return send(405, { error: "POST only" });

  // price-list
  if (url.pathname === "/v1/price-list") {
    return send(200, { data: PRODUCTS });
  }

  // transaction
  if (url.pathname === "/v1/transaction") {
    if (body.type === "status") {
      // polling: selalu kembalikan Sukses
      return send(200, {
        data: { ref_id: body.ref_id, status: "Sukses", sn: "SN-MOCK-" + String(body.ref_id).slice(-6), message: "Transaksi sukses" },
      });
    }
    // topup: pertama kali Pending, berikutnya Sukses (simulasi proses)
    topupCount++;
    const status = topupCount === 1 ? "Pending" : "Sukses";
    return send(200, {
      data: { ref_id: body.ref_id, status, sn: status === "Sukses" ? "SN-MOCK-" + String(body.ref_id).slice(-6) : "", message: status === "Pending" ? "Menunggu diproses" : "Transaksi sukses" },
    });
  }

  return send(404, { error: "unknown path: " + url.pathname });
});

const PORT = Number(process.env.PORT || 3998);
server.listen(PORT, () => {
  console.log("Mock supplier di http://127.0.0.1:" + PORT + "/v1");
});
