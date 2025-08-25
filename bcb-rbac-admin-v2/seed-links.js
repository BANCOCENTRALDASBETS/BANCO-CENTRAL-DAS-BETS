// seed-links.js (ESM) — cria/atualiza nós em /links para os IDs usados no site
// Uso: node seed-links.js
import { initializeApp, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import fs from "fs";

// Coloque o serviceAccountKey.json neste diretório
const serviceAccount = JSON.parse(fs.readFileSync("./serviceAccountKey.json", "utf8"));

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: "https://banco-central-das-bets-f400d-default-rtdb.firebaseio.com"
});

const db = getDatabase();

const LINKS = [
  {id:'L1',  url:'https://56bx2.com/?pid=1622043487'},
  {id:'L2',  url:'https://www.56f5.com/?pid=1944788621'},
  {id:'L26', url:'https://7075a2.cc/?pid=1304070624'},
  {id:'L27', url:'https://5161a3.cc/?pid=2916139340'},
  {id:'L28', url:'https://53a1.xyz/?pid=2847554641'},
  {id:'L29', url:'https://11q118.com/?pid=2804170821'},
  {id:'L30', url:'https://9096b5.cc/?pid=395755008'},
  {id:'L31', url:'https://554201.com/?pid=2056754853'},
  {id:'L32', url:'https://8857w2.com/?pid=2502848820'},
  {id:'L33', url:'https://8385b.xyz/?pid=218084685'},
  {id:'L34', url:'https://7xx.vip/?pid=683932395'},
  {id:'L35', url:'https://zww29.com/?pid=1618655052'},
  {id:'L36', url:'https://55dd9.cc/?pid=2295003355'},
  {id:'L37', url:'https://11a14.xyz/?pid=1097969127'},
  {id:'L38', url:'https://28888game.com/?pid=1528981018'},
  {id:'L39', url:'https://oss.n9ossmjbymc.com/?pid=1441287305'},
  {id:'L40', url:'https://78tt5.com/?pid=2081370451'},
  {id:'L61', url:'https://66e99y.com/?pid=1766296985'}
];

async function seed() {
  const now = Date.now();
  const ops = LINKS.map(({id, url}) => {
    return db.ref(`links/${id}`).set({
      url,
      createdBy: "seed-script",
      createdAt: now
    });
  });
  await Promise.all(ops);
  console.log(`✅ Seed concluído: ${LINKS.length} links criados/atualizados.`);
}

seed().then(()=>process.exit(0)).catch(err=>{
  console.error("Erro no seed:", err);
  process.exit(1);
});
