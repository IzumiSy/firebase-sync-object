import { initializeApp } from "firebase/app";
import { getDatabase, connectDatabaseEmulator, ref, set } from 'firebase/database';

((async () => {
  const app = initializeApp({
    projectId: 'firebase-sync-object',
    databaseURL: 'http://localhost:9000/?ns=firebase-sync-object',
  })
  const db = getDatabase(app);
  connectDatabaseEmulator(db, 'localhost', 9000)

  const rootRef = ref(db, "posts")
  await set(rootRef, {
    "book1": "nice book",
    "book2": "good book",
  })

  console.log("Finished seeding")
  process.exit(0);
})())
