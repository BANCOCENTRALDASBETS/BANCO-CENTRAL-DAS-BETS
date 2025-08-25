// backup-db.js — exporta dados do Realtime Database para JSON (opcionalmente .gz)
// Uso:
//   node backup-db.js
//   node backup-db.js --path "/sac/tickets"
//   node backup-db.js --gzip true
//
// Saída em: ./backups/export-YYYYMMDD-HHMMSS.json[.gz]

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import admin from "firebase-admin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CLI
const argv = yargs(hideBin(process.argv))
  .option("path", { type: "string", default: "/", describe: "Caminho do RTDB a exportar (ex.: /, /usuarios, /sac/tickets)" })
  .option("gzip", { type: "boolean", default: false, describe: "Compactar saída em .json.gz" })
  .help().argv;

// Chave de serviço
const keyPath = path.join(__dirname, "serviceAccountKey.json");
if (!fs.existsSync(keyPath)) {
  console.error("ERRO: Coloque o arquivo serviceAccountKey.json em:", keyPath);
  process.exit(1);
}
let serviceAccount;
try {
  serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
} catch (e) {
  console.error("ERRO: serviceAccountKey.json inválido:", e?.message || e);
  process.exit(1);
}

// Inicializa Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://banco-central-das-bets-f400d-default-rtdb.firebaseio.com",
});

const db = admin.database();

function tsStamp(d = new Date()) {
  const p2 = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = p2(d.getMonth() + 1);
  const dd = p2(d.getDate());
  const hh = p2(d.getHours());
  const mi = p2(d.getMinutes());
  const ss = p2(d.getSeconds());
  return `${yyyy}${mm}${dd}-${hh}${mi}${ss}`;
}

async function run() {
  const outDir = path.join(__dirname, "backups");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const targetPath = argv.path || "/";
  const stamp = tsStamp();
  const baseName = `export-${stamp}.json`;
  const outFile = path.join(outDir, argv.gzip ? `${baseName}.gz` : baseName);

  console.log(`[backup] Lendo do RTDB: ${targetPath}`);
  const ref = db.ref(targetPath);

  // Em Admin SDK, use once("value") para robustez
  const snap = await ref.once("value");
  const data = snap.val();

  if (data === null || data === undefined) {
    console.warn("[backup] Aviso: caminho sem dados (null). Salvando {}.");
  }

  const json = JSON.stringify(data ?? {}, null, 2);

  if (argv.gzip) {
    console.log(`[backup] Gravando (gzip): ${outFile}`);
    const gz = zlib.createGzip({ level: 9 });
    await new Promise((res, rej) => {
      const ws = fs.createWriteStream(outFile);
      ws.on("finish", res).on("error", rej);
      gz.on("error", rej);
      gz.end(json);
      gz.pipe(ws);
    });
  } else {
    console.log(`[backup] Gravando: ${outFile}`);
    fs.writeFileSync(outFile, json, "utf8");
  }

  console.log("[backup] OK: export concluído.");
  process.exit(0);
}

run().catch((e) => {
  console.error("Falhou:", e?.message || e);
  process.exit(1);
});
