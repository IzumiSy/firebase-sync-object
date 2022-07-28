import EventSource from 'eventsource';

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
