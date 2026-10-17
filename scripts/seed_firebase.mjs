import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from "fs";
import path from "path";

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

async function seed() {
  console.log("Connecting to Firestore: deargod-6060e...");
  try {
    const rawMembers = fs.readFileSync("./data/members.json", "utf-8").replace(/^\uFEFF/, '');
    const members = JSON.parse(rawMembers);
    console.log(`Found ${members.length} members to sync.`);

    let count = 0;
    for (const m of members) {
      await setDoc(doc(db, "members", m.id), m);
      count++;
      process.stdout.write(`\rSyncing members to Firestore: ${count}/${members.length}`);
    }
    console.log("\nAll members synced successfully!");

    // Music
    const rawMusic = fs.readFileSync("./data/music.json", "utf-8").replace(/^\uFEFF/, '');
    const music = JSON.parse(rawMusic);
    await setDoc(doc(db, "settings", "music"), music);
    console.log("Music settings synced successfully!");

    console.log("\nSUCCESS: All data is now live on Firebase Firestore!");
    process.exit(0);
  } catch (err) {
    console.error("\nError syncing to Firestore:", err.message);
    if (err.message.includes("permission") || err.message.includes("Missing or insufficient permissions")) {
      console.log("\nNOTE: Please go to Firebase Console -> Firestore Database -> Rules tab, and allow read/write:");
      console.log(`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
      `);
    }
    process.exit(1);
  }
}

seed();
