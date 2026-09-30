/**
 * Test de signalisation de l'appel audio à deux sens :
 * - socket A (animateur) rejoint l'appel
 * - socket B (membre) rejoint → doit recevoir la liste [A] et A doit
 *   recevoir participant-joined (B)
 * - B envoie une offer ciblée vers A via live:signal → A doit la recevoir
 * - déconnexion de B → A doit recevoir participant-left
 * Usage : bun scripts/test-audio-call.ts
 */
import { io, Socket } from "socket.io-client";

const WS_URL = process.env.WS_TEST_URL ?? "http://localhost:3001";
const STREAM_ID = `test-call-${Date.now()}`;

const results: string[] = [];
const check = (name: string, ok: boolean) => {
  results.push(`${ok ? "✅" : "❌"} ${name}`);
  if (!ok) process.exitCode = 1;
};

const admin: Socket = io(WS_URL, { transports: ["websocket"], auth: { userId: "", name: "Animateur", role: "ADMIN" } });
const member: Socket = io(WS_URL, { transports: ["websocket"], auth: { userId: "", name: "Membre Test", role: "MEMBER" } });

let adminSawJoin = false;
let memberGotList = false;
let adminGotOffer = false;
let adminSawLeft = false;

admin.on("connect", () => {
  admin.emit("live:call:join", { streamId: STREAM_ID, displayName: "Animateur" });
});

member.on("connect", () => {
  setTimeout(() => member.emit("live:call:join", { streamId: STREAM_ID, displayName: "Membre Test" }), 300);
});

admin.on("live:call:participant-joined", (p: { socketId: string; name: string }) => {
  if (p.name === "Membre Test") adminSawJoin = true;
});

member.on("live:call:participants", (data: { participants: Array<{ socketId: string; name: string }> }) => {
  // Sans token, le service classe les sockets de test en GUEST (nom « Invité »)
  // : on ne peut pas matcher par nom, on vérifie juste la présence d'autrui.
  const other = data.participants[0];
  if (other) {
    memberGotList = true;
    // B offre vers A (règle du nouveau)
    member.emit("live:signal", {
      streamId: STREAM_ID,
      targetId: other.socketId,
      signal: { type: "offer", sdp: "v=0 fake offer sdp" },
    });
  }
});

admin.on("live:signal", (data: { senderName: string; signal: { type: string } }) => {
  // Le service reprend socket.data.userName (« Invité » pour les GUEST de
  // test) — on ne vérifie donc que le type offer reçu d'un tiers.
  if (data.signal?.type === "offer") adminGotOffer = true;
});

admin.on("live:call:participant-left", () => {
  adminSawLeft = true;
  setTimeout(finish, 200); // laisse passer une offer en vol éventuelle
});

function finish() {
  check("Liste initiale reçue par le membre (contient l'animateur)", memberGotList);
  check("Arrivée du membre visible par l'animateur", adminSawJoin);
  check("Offer du membre relayée à l'animateur (live:signal)", adminGotOffer);
  check("Départ du membre notifié à l'animateur", adminSawLeft);
  console.log(results.join("\n"));
  admin.disconnect();
  member.disconnect();
  process.exit(process.exitCode ?? 0);
}

setTimeout(() => {
  member.disconnect(); // déclenche participant-left chez l'admin
  setTimeout(() => {
    if (!adminSawLeft) finish();
  }, 700);
}, 2500);
