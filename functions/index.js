import functions from "firebase-functions";
import admin from "firebase-admin";
import corsLib from "cors";
import fetch from "node-fetch";

admin.initializeApp();
const db = admin.database();
const cors = corsLib({ origin: true });

function getClientIp(req) {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.length > 0) {
    return xf.split(",")[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || null;
}

async function lookupGeoIP(ip) {
  try {
    const url = `https://ipapi.co/${ip}/json/`;
    const res = await fetch(url, { timeout: 5000 });
    if (!res.ok) throw new Error(`GeoIP HTTP ${res.status}`);
    const j = await res.json();
    return {
      pais: j.country_name || "",
      regiao: j.region || j.region_code || "",
      cidade: j.city || "",
      latitudeAprox: typeof j.latitude === "number" ? j.latitude : null,
      longitudeAprox: typeof j.longitude === "number" ? j.longitude : null,
      asn: j.asn || "",
      org: j.org || "",
      timezone: j.timezone || "",
      cepAprox: j.postal || "",
      fonte: "geoip:ipapi.co",
      precisao: "aproximada-por-ip"
    };
  } catch (e) {
    console.error("lookupGeoIP error:", e.message);
    return null;
  }
}

export const collectTelemetry = functions
  .region("us-central1")
  .https.onRequest(async (req, res) => {
    cors(req, res, async () => {
      try {
        if (req.method !== "POST") {
          return res.status(405).json({ error: "Method not allowed" });
        }
        const authHeader = req.headers.authorization || "";
        const m = authHeader.match(/^Bearer (.+)$/);
        if (!m) {
          return res.status(401).json({ error: "Missing Bearer token" });
        }
        const idToken = m[1];
        let decoded;
        try {
          decoded = await admin.auth().verifyIdToken(idToken);
        } catch (e) {
          return res.status(401).json({ error: "Invalid ID token" });
        }
        const { uid, sessaoId } = req.body || {};
        if (!uid || !sessaoId) {
          return res.status(400).json({ error: "uid and sessaoId are required" });
        }
        if (decoded.uid !== uid) {
          return res.status(403).json({ error: "UID mismatch" });
        }
        const ipPublico = getClientIp(req);
        const ipGeo = ipPublico ? await lookupGeoIP(ipPublico) : null;
        const ref = db.ref(`usuarios/${uid}/perfil/dispositivo/${sessaoId}`);
        await ref.update({
          ipPublico: ipPublico || null,
          ipGeo: ipGeo || null
        });
        return res.json({ ok: true, ipPublico, ipGeoPresent: !!ipGeo });
      } catch (e) {
        console.error("collectTelemetry error:", e);
        return res.status(500).json({ error: "Internal error" });
      }
    });
  });
