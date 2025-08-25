/**
 * set-claim-admin.js
 * Uso:
 *   node set-claim-admin.js "email@dominio.com" true
 *   node set-claim-admin.js "email@dominio.com" false
 *
 * Requisitos:
 *  - Coloque serviceAccountKey.json nesta mesma pasta (NÃO commitar).
 *  - Node.js instalado.
 */

const admin = require('firebase-admin');
const path = require('path');

let serviceAccount;
try {
  serviceAccount = require('./serviceAccountKey.json');
} catch (e) {
  console.error('ERRO: Arquivo serviceAccountKey.json não encontrado nesta pasta.');
  console.error('Coloque o arquivo aqui e rode novamente.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://banco-central-das-bets-f400d-default-rtdb.firebaseio.com'
});

const [, , email, flag] = process.argv;

function printUsageAndExit() {
  console.log('\nUso correto:');
  console.log('  node set-claim-admin.js "email@dominio.com" true');
  console.log('  node set-claim-admin.js "email@dominio.com" false\n');
  process.exit(1);
}

if (!email || typeof flag === 'undefined') {
  console.error('Parâmetros inválidos.');
  printUsageAndExit();
}

const normalized = String(flag).toLowerCase();
if (!['true', 'false'].includes(normalized)) {
  console.error('O segundo parâmetro deve ser true ou false.');
  printUsageAndExit();
}

const isAdmin = normalized === 'true';

(async () => {
  try {
    const user = await admin.auth().getUserByEmail(email);
    const uid = user.uid;
    const newClaims = { ...(user.customClaims || {}), admin: isAdmin };

    await admin.auth().setCustomUserClaims(uid, newClaims);

    // Forçar refresh de sessão para o usuário pegar o novo claim
    await admin.auth().revokeRefreshTokens(uid);

    const updated = await admin.auth().getUser(uid);

    console.log('\n✅ Claim atualizado com sucesso.');
    console.log('----------------------------------------');
    console.log(`Email:      ${updated.email}`);
    console.log(`UID:        ${uid}`);
    console.log(`admin:      ${newClaims.admin}`);
    console.log('Observação: o usuário precisa deslogar/logar para o claim refletir no cliente.');
    console.log('----------------------------------------\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Falha ao atualizar claim.');
    console.error(err && err.message ? err.message : err);
    process.exit(1);
  }
})();
