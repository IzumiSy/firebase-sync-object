import EventSource from 'eventsource';
import { initializeApp } from "firebase/app";
import { getDatabase, connectDatabaseEmulator, ref, onChildRemoved, onChildChanged, onChildAdded } from 'firebase/database';

const app = initializeApp({
  projectId: 'firebase-sync-object',
  databaseURL: 'http://localhost:9000/?ns=firebase-sync-object',
})
const db = getDatabase(app);
connectDatabaseEmulator(db, 'localhost', 9000)

const rootRef = ref(db, "posts")

const sse = new EventSource('http://localhost:9000/posts.json?ns=firebase-sync-object')

sse.addEventListener('open', (event) => {
  console.log("[opened]", event);
});

sse.addEventListener('message', (event) => {
  console.log("[message]", event);
});

sse.addEventListener('error', (err) => {
  console.log("[error]", err);
});

console.log("running...")

/*
onChildAdded(, snapshot => {
  console.log("[added]", snapshot.key, snapshot.val())
})

onChildChanged(ref(db, "posts"), snapshot => {
  console.log("[changed]", snapshot.key, snapshot.val());
})

onChildRemoved(ref(db, "posts"), snapshot => {
  console.log("[removed]", snapshot.key, snapshot.val());
})
*/

