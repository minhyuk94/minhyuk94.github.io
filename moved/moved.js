// 게임이 mhyoo-games.github.io 로 옮겨 갔다. 이 주소(minhyuk94.github.io/…)에 남은 저장을 챙겨 새 주소로 보낸다.
// 페이지마다 window.MOVE = { to: 새 주소, ls: [localStorage 앞글자…], idb: [Godot 저장 파일 이름…] }
(function () {
  var M = window.MOVE, route = location.hash;
  function go(payload) { location.replace(M.to + location.search + (payload || route)); }
  function b64(u) { var s = ''; for (var i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  var data = { ls: {}, idb: [], r: route }, any = false;
  try {
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (M.ls.some(function (p) { return k.indexOf(p) === 0; })) { data.ls[k] = localStorage.getItem(k); any = true; }
    }
  } catch (e) { /* 막힘 */ }
  function send() {
    if (!any) return go('');
    var txt = JSON.stringify(data);
    if (typeof CompressionStream === 'undefined') return go('#carry=j.' + encodeURIComponent(txt));
    new Response(new Blob([txt]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer()
      .then(function (buf) { go('#carry=z.' + b64(new Uint8Array(buf))); })
      .catch(function () { go('#carry=j.' + encodeURIComponent(txt)); });
  }
  if (!M.idb || !M.idb.length || !window.indexedDB) return send();
  // Godot 저장 파일 (있을 때만 연다: 없는 DB를 새로 만들지 않게)
  var list = indexedDB.databases ? indexedDB.databases() : Promise.resolve([{ name: '/userfs' }]);
  list.then(function (dbs) {
    if (!dbs.some(function (x) { return x.name === '/userfs'; })) return send();
    var req = indexedDB.open('/userfs');
    req.onerror = send;
    req.onsuccess = function () {
      var db = req.result;
      if (!db.objectStoreNames.contains('FILE_DATA')) { db.close(); return send(); }
      var st = db.transaction('FILE_DATA', 'readonly').objectStore('FILE_DATA'), cur = st.openCursor(), all = {};
      cur.onsuccess = function () {
        var c = cur.result;
        if (c) { all[String(c.key)] = c.value; return c.continue(); }
        db.close();
        // 저장 파일 + 그 위 폴더들 (Godot: /userfs/godot/app_userdata/<게임 이름>/…)
        var keep = {};
        Object.keys(all).forEach(function (key) {
          var v = all[key];
          if (!v || !v.contents || !M.idb.some(function (n) { return key.indexOf(n) >= 0; })) return;
          keep[key] = 1;
          var parts = key.split('/');
          for (var j = 2; j < parts.length; j++) { var dir = parts.slice(0, j).join('/'); if (all[dir]) keep[dir] = 1; }
        });
        Object.keys(keep).sort().forEach(function (key) {
          var v = all[key], e = { k: key, t: +new Date(v.timestamp), m: v.mode };
          if (v.contents) e.c = b64(new Uint8Array(v.contents));
          data.idb.push(e); any = true;
        });
        send();
      };
      cur.onerror = function () { db.close(); send(); };
    };
  }).catch(send);
})();
