// seed-users.js — popula dados de exemplo no Realtime Database
// Cria: /__healthcheck, /usuarios/demo-uid-1 e /usuarios/demo-uid-2
// (e 2 tickets no /sac/tickets) — usa firebase-admin (chave de serviço)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import admin from "firebase-admin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1) valida chave de serviço
const keyPath = path.join(__dirname, "serviceAccountKey.json");
if (!fs.existsSync(keyPath)) {
  console.error("ERRO: Coloque o arquivo serviceAccountKey.json em:", keyPath);
  process.exit(1);
}
const raw = fs.readFileSync(keyPath, "utf8");
if (!raw || raw.trim().length < 20) {
  console.error("ERRO: serviceAccountKey.json está vazio/ inválido.");
  process.exit(1);
}
let serviceAccount;
try {
  serviceAccount = JSON.parse(raw);
} catch (e) {
  console.error("ERRO: serviceAccountKey.json não é JSON válido:", e?.message || e);
  process.exit(1);
}

// 2) inicializa admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://banco-central-das-bets-f400d-default-rtdb.firebaseio.com",
});

const db = admin.database();

async function run() {
  const now = Date.now();

  // 3) healthcheck
  await db.ref("/__healthcheck").set("ok");

  // 4) usuários demo
  await db.ref("/usuarios/demo-uid-1/perfil").set({
    nome: "Usuário Demo 1",
    telefone: "+55 11 90000-0001",
  });

  await db.ref("/usuarios/demo-uid-2/perfil").set({
    nome: "Usuário Demo 2",
    telefone: "+55 21 90000-0002",
  });

  // 5) tickets demo
  const ticketsRef = db.ref("/sac/tickets");

  const t1 = ticketsRef.push();
  await t1.set({
    id: t1.key,
    titulo: "Onboarding — validação inicial",
    descricao: "Ticket criado pelo seed para testar o painel.",
    status: "aberto",
    createdAt: now - 2 * 24 * 60 * 60 * 1000, // 2 dias atrás
    createdBy: "seed-script",
  });

  const t2 = ticketsRef.push();
  await t2.set({
    id: t2.key,
    titulo: "Suporte — exemplo fechado",
    descricao: "Exemplo de ticket já fechado.",
    status: "fechado",
    createdAt: now - 5 * 24 * 60 * 60 * 1000, // 5 dias atrás
    createdBy: "seed-script",
  });

  console.log("OK: seed concluído.");
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Falhou:", e?.message || e);
    process.exit(1);
  });
