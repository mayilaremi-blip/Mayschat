/* Mayschat : réception des notifications quand l'app est fermée. À placer à côté de index.html. */
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js","https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");
firebase.initializeApp({apiKey:"COLLE_ICI",authDomain:"COLLE_ICI",projectId:"COLLE_ICI",messagingSenderId:"COLLE_ICI",appId:"COLLE_ICI"}); // mêmes valeurs que dans plus.js
firebase.messaging().onBackgroundMessage(p=>{const d=p.data||{};
 self.registration.showNotification(d.title||"Mayschat",{body:d.body||"",tag:d.tag||d.kind,renotify:true,vibrate:d.kind==="match"?[200,100,200,100,500]:[150],data:{url:"./"}})});
self.addEventListener("notificationclick",ev=>{ev.notification.close();
 ev.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(l=>{for(const c of l)if("focus" in c)return c.focus();return clients.openWindow(ev.notification.data.url)}))});
