echo // set-claim-admin.js — define custom claim { admin: true/false } por email ou uid
// Uso:
//   node set-claim-admin.js --email "alguem@dominio.com" --admin true
//   node set-claim-admin.js --uid "ABC123" --admin false

import fs from "node:fs";
import path from "node:path";
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

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const keyPath = path.join(__dirname, "serviceAccountKey.json");

if (!fs.existsSync(keyPath)) {
  console.error("ERRO: Coloque o arquivo serviceAccountKey.json dentro de bcb-rbac-admin-v2/");
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
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
> bcb-rbac-admin-v2/set-claim-admin.js
