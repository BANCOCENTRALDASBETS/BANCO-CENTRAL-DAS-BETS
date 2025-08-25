// aggregate-shards.js (ESM) — consolida shards em links/{id}/stats/agg
// Uso: node aggregate-shards.js
import { initializeApp, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import fs from "fs";

// Carrega credenciais do service account
// Coloque o arquivo JSON no mesmo diretório deste script
const serviceAccount = JSON.parse(fs.readFileSync("./serviceAccountKey.json", "utf8"));

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: "https://banco-central-das-bets-f400d-default-rtdb.firebaseio.com"
});

const db = getDatabase();

async function aggregateShardsForLink(linkId) {
  const shardsSnap = await db.ref(`links/${linkId}/stats/shards`).get();
  if (!shardsSnap.exists()) {
    console.log(`(i) Sem shards para ${linkId}`);
    return;
  }
  let c = 0, d = 0;
  shardsSnap.forEach(s => {
    const v = s.val() || {};
    c += v.c || 0;
    d += v.c_dislike || 0;
  });
  await db.ref(`links/${linkId}/stats/agg`).set({ c, c_dislike: d });
  console.log(`✔ ${linkId}: agg => { c:${c}, c_dislike:${d} }`);
}

async function main() {
  const linksSnap = await db.ref("links").get();
  if (!linksSnap.exists()) {
    console.log("(i) Nenhum link encontrado em /links");
    return;
  }
  const tasks = [];
  linksSnap.forEach(child => tasks.push(aggregateShardsForLink(child.key)));
  await Promise.all(tasks);
  console.log("✅ Agregação concluída.");
}

main().catch(err => {
  console.error("Erro na agregação:", err);
  process.exit(1);
});
