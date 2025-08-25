// set-claim-admin.js — define custom claim { admin: true/false } por email ou uid
// Uso:
//   node set-claim-admin.js --email "alguem@dominio.com" --admin true
//   node set-claim-admin.js --uid "ABC123" --admin false

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import admin from "firebase-admin";

const argv = yargs(hideBin(process.argv))
  .option("email", { type: "string", describe: "email do usuário" })
  .option("uid", { type: "string", describe: "UID do usuário" })
  .option("admin", { type: "boolean", default: true, describe: "definir admin=true/false" })
  .demandOption(["admin"])
  .check((args) => {
    if (!args.email && !args.uid) throw new Error("Informe --email ou --uid");
    return true;
  })
  .help()
  .argv;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const keyPath = path.join(__dirname, "serviceAccountKey.json");

// Valida a chave de serviço
if (!fs.existsSync(keyPath)) {
  console.error("ERRO: Coloque o arquivo serviceAccountKey.json em:", keyPath);
  console.error("Dica: Console Firebase → Configurações do projeto → Contas de serviço → Gerar nova chave privada.");
  process.exit(1);
}

const raw = fs.readFileSync(keyPath, "utf8");
if (!raw || raw.trim().length < 20) {
  console.error("ERRO: serviceAccountKey.json está vazio ou inválido. Baixe a chave de serviço real no Console Firebase.");
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(raw);
} catch (e) {
  console.error("ERRO: serviceAccountKey.json não é um JSON válido:", e?.message || e);
  process.exit(1);
}

// Inicializa Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // databaseURL opcional para claims, mantido para futuras operações
  databaseURL: "https://banco-central-das-bets-f400d-default-rtdb.firebaseio.com"
});

const auth = admin.auth();

async function run() {
  let userRecord;
  if (argv.email) {
    userRecord = await auth.getUserByEmail(argv.email);
  } else {
    userRecord = await auth.getUser(argv.uid);
  }

  const uid = userRecord.uid;
  const claims = userRecord.customClaims || {};
  claims.admin = !!argv.admin;

  await auth.setCustomUserClaims(uid, claims);

  console.log(`OK: claims atualizadas para UID=${uid} ->`, claims);
  console.log("Peça para o usuário sair e entrar novamente no Admin para refletir as claims.");
}

run().catch((e) => {
  console.error("Falhou:", e?.message || e);
  process.exit(1);
});
