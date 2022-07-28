import { initializeApp } from "firebase/app";
import { getDatabase, connectDatabaseEmulator, ref, onChildRemoved, onChildChanged, onChildAdded } from 'firebase/database';

const app = initializeApp({
  projectId: 'firebase-sync-object',
  databaseURL: 'http://localhost:9000/?ns=firebase-sync-object',
})
const db = getDatabase(app);
connectDatabaseEmulator(db, 'localhost', 9000)

onChildAdded(ref(db, "posts"), snapshot => {
  console.log("[added]", snapshot.key, snapshot.val())
})

onChildChanged(ref(db, "posts"), snapshot => {
  console.log("[changed]", snapshot.key, snapshot.val());
})

onChildRemoved(ref(db, "posts"), snapshot => {
  console.log("[removed]", snapshot.key, snapshot.val());
})

console.log("running...")
