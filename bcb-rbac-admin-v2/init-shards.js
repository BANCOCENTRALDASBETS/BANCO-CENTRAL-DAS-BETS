// init-shards.js — inicializa shards 0..15 em todos os links
// Uso: node init-shards.js
import { initializeApp, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import fs from "fs";

// Carrega credenciais locais
const serviceAccount = JSON.parse(fs.readFileSync("./serviceAccountKey.json", "utf8"));

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: "https://banco-central-das-bets-f400d-default-rtdb.firebaseio.com"
});

const db = getDatabase();

async function initShardsForLink(linkId) {
  const refLink = db.ref(`links/${linkId}`);
  const snap = await refLink.get();
  if (!snap.exists()) return;

  const val = snap.val() || {};
  const updates = {};

  // Migrar contadores antigos se existirem
  const oldC = val.c || 0;
  const oldD = val.c_dislike || 0;
  if ("c" in val) updates[`links/${linkId}/c`] = null;
  if ("c_dislike" in val) updates[`links/${linkId}/c_dislike`] = null;

  // Inicializar 16 shards
  for (let i = 0; i < 16; i++) {
    updates[`links/${linkId}/stats/shards/${i}/c`] = (i === 0 ? oldC : 0);
    updates[`links/${linkId}/stats/shards/${i}/c_dislike`] = (i === 0 ? oldD : 0);
  }

  await db.ref().update(updates);
  console.log(`✔ Shards inicializados para ${linkId} (migrou c=${oldC}, d=${oldD})`);
}

async function main() {
  const linksSnap = await db.ref("links").get();
  if (!linksSnap.exists()) {
    console.log("(i) Nenhum link encontrado em /links");
    return;
  }
  const tasks = [];
  linksSnap.forEach(child => tasks.push(initShardsForLink(child.key)));
  await Promise.all(tasks);
  console.log("✅ Inicialização de shards concluída.");
}

main().catch(err => {
  console.error("Erro:", err);
  process.exit(1);
});
