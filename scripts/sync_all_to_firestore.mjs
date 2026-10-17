import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = {
  apiKey: "AIzaSyCkrqzgNX0cy8u7SeuZsMZP4-11ADsQCFo",
  authDomain: "deargod-6060e.firebaseapp.com",
  projectId: "deargod-6060e",
  storageBucket: "deargod-6060e.firebasestorage.app",
  messagingSenderId: "991140697212",
  appId: "1:991140697212:web:222866f4fee69c9e38a5f9",
  measurementId: "G-SWHD79M1TV"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const tsContent = fs.readFileSync("./data/members.ts", "utf-8");
  const dataIndex = tsContent.indexOf("MEMBERS_DATA");
  if (dataIndex === -1) {
    console.error("Could not find MEMBERS_DATA in data/members.ts");
    process.exit(1);
  }

  const eqBracket = tsContent.indexOf("= [", dataIndex);
  const arrayStart = tsContent.indexOf("[", eqBracket);
  const arrayEnd = tsContent.indexOf("];", arrayStart) + 1;
  const jsonString = tsContent.substring(arrayStart, arrayEnd);
  console.log("String start:", JSON.stringify(jsonString.slice(0, 50)));
  console.log("String end:", JSON.stringify(jsonString.slice(-50)));
  
  const members = JSON.parse(jsonString);
  console.log(`Parsed ${members.length} members from data/members.ts`);

  // Write back to data/members.json
  fs.writeFileSync("./data/members.json", JSON.stringify(members, null, 2), "utf-8");
  console.log("Restored data/members.json with all 56 members");

  // Sync to Firestore
  let count = 0;
  for (const m of members) {
    const cleanDoc = {
      id: m.id,
      memberId: m.memberId,
      name: m.name,
      role: m.role,
      facebook: m.facebook || "",
      avatar: m.avatar || "/images/deargod-avatar.png",
    };
    await setDoc(doc(db, "members", m.id), cleanDoc);
    count++;
    process.stdout.write(`\rUploading member to Firestore: ${count}/${members.length} (${m.name})`);
  }
  console.log("\nAll 56 members uploaded to Firestore successfully!");

  // Music settings
  try {
    const rawMusic = fs.readFileSync("./data/music.json", "utf-8").replace(/^\uFEFF/, '');
    const music = JSON.parse(rawMusic);
    await setDoc(doc(db, "settings", "music"), music);
    console.log("Music settings synced successfully!");
  } catch (mErr) {
    console.warn("Music sync warning:", mErr.message);
  }

  console.log("Done!");
  process.exit(0);
}

run().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
