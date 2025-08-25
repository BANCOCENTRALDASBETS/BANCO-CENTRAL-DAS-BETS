echo // list-users.js — lista usuários (UID, email, claims)
// Uso: node list-users.js

import fs from "node:fs";
import path from "node:path";
import admin from "firebase-admin";

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
  let nextPageToken = undefined;
  do {
    const result = await auth.listUsers(1000, nextPageToken);
    for (const u of result.users) {
      console.log({
        uid: u.uid,
        email: u.email || "",
        claims: u.customClaims || {}
      });
    }
    nextPageToken = result.pageToken;
  } while (nextPageToken);
}

run().catch((e) => {
  console.error("Falhou:", e?.message || e);
  process.exit(1);
});
> bcb-rbac-admin-v2/list-users.js
