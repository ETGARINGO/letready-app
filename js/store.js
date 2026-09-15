/* =========================================================
   LETReady — storage + accounts
   Data lives on the device. Nothing is sent anywhere.
   Works in a browser, in a PWA, and inside Capacitor.
   ========================================================= */
(function (global) {
  "use strict";

  const NS = "letready:";
  const mem = {};                 // fallback when localStorage is blocked

  const Store = {
    get(key) {
      try {
        const raw = localStorage.getItem(NS + key);
        return raw === null ? null : JSON.parse(raw);
      } catch (e) {
        return mem[key] === undefined ? null : mem[key];
      }
    },
    set(key, value) {
      try { localStorage.setItem(NS + key, JSON.stringify(value)); }
      catch (e) { mem[key] = value; }
      return value;
    },
    remove(key) {
      try { localStorage.removeItem(NS + key); } catch (e) {}
      delete mem[key];
    },
    keys() {
      try {
        return Object.keys(localStorage).filter(k => k.indexOf(NS) === 0).map(k => k.slice(NS.length));
      } catch (e) { return Object.keys(mem); }
    }
  };

  /* ---------- password hashing ---------- */
  function fallbackHash(str) {
    // Used only when SubtleCrypto is unavailable (for example on file:// pages).
    let h1 = 0x811c9dc5, h2 = 0x01000193;
    for (let i = 0; i < str.length; i++) {
      h1 = (h1 ^ str.charCodeAt(i)) >>> 0;
      h1 = Math.imul(h1, 16777619) >>> 0;
      h2 = (Math.imul(h2 ^ str.charCodeAt(i), 2246822519) + i) >>> 0;
    }
    return (h1.toString(16) + h2.toString(16)).padStart(16, "0");
  }

  async function hash(password, salt) {
    const input = salt + "|" + password;
    if (global.crypto && global.crypto.subtle && global.isSecureContext) {
      const bytes = new TextEncoder().encode(input);
      const digest = await global.crypto.subtle.digest("SHA-256", bytes);
      return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
    }
    return "fb:" + fallbackHash(input);
  }

  function randomSalt() {
    const arr = new Uint8Array(16);
    if (global.crypto && global.crypto.getRandomValues) global.crypto.getRandomValues(arr);
    else for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
    return Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  function slug(email) {
    return email.trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
  }

  /* ---------- accounts ---------- */
  const Auth = {
    users() { return Store.get("users") || {}; },

    currentId() { return Store.get("session"); },

    current() {
      const id = this.currentId();
      if (!id) return null;
      const u = this.users()[id];
      return u ? Object.assign({ id }, u) : null;
    },

    async register(name, email, password) {
      const id = slug(email);
      const users = this.users();
      if (users[id]) throw new Error("An account already uses that email. Sign in instead.");
      const salt = randomSalt();
      users[id] = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        salt,
        hash: await hash(password, salt),
        guest: false,
        createdAt: Date.now()
      };
      Store.set("users", users);
      Store.set("session", id);
      return Object.assign({ id }, users[id]);
    },

    async login(email, password) {
      const id = slug(email);
      const users = this.users();
      const u = users[id];
      if (!u) throw new Error("No account found for that email.");
      const attempt = await hash(password, u.salt);
      if (attempt !== u.hash) throw new Error("That password does not match. Try again.");
      Store.set("session", id);
      return Object.assign({ id }, u);
    },

    guest() {
      const id = "guest";
      const users = this.users();
      if (!users[id]) {
        users[id] = { name: "Guest reviewer", email: "", salt: "", hash: "", guest: true, createdAt: Date.now() };
        Store.set("users", users);
      }
      Store.set("session", id);
      return Object.assign({ id }, users[id]);
    },

    async changePassword(oldPw, newPw) {
      const id = this.currentId();
      const users = this.users();
      const u = users[id];
      if (!u || u.guest) throw new Error("Guest accounts do not use a password.");
      if (await hash(oldPw, u.salt) !== u.hash) throw new Error("Your current password is incorrect.");
      u.salt = randomSalt();
      u.hash = await hash(newPw, u.salt);
      Store.set("users", users);
    },

    updateProfile(patch) {
      const id = this.currentId();
      const users = this.users();
      if (!users[id]) return null;
      Object.assign(users[id], patch);
      Store.set("users", users);
      return Object.assign({ id }, users[id]);
    },

    logout() { Store.remove("session"); },

    deleteAccount() {
      const id = this.currentId();
      const users = this.users();
      delete users[id];
      Store.set("users", users);
      Store.remove("progress:" + id);
      Store.remove("session");
    }
  };

  global.Store = Store;
  global.Auth = Auth;
})(window);
