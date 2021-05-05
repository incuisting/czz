const { mac } = require("address");
const CryptoJS = require("crypto-js");

function getMAC() {
  return new Promise((resolve, reject) => {
    mac((err, addr) => {
      if (err) {
        reject(err);
      }
      resolve(addr);
    });
  });
}

async function transferMAC() {
  const mac = await getMAC();
  const macArray = mac.split(":");
  const macIntArray = macArray
    .map((item) => {
      return parseInt(item, 16);
    })
    .join("-");
  return macIntArray;
  console.log(macIntArray);
}
function encrypt(mac) {
  const code = CryptoJS.AES.encrypt(mac, "123").toString();
  console.log("code", code);
  return code;
}
function decrypt(code) {
  const bytes = CryptoJS.AES.decrypt(code, "123");
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  console.log("originalText", originalText);
  return originalText;
}
async function planA() {
  //1. client
  const macInt = await transferMAC();
  //2. sever
  const authCode = encrypt(macInt);
  // 3.client
  const originalText = decrypt(authCode);
  console.log(macInt === originalText);
}

// main();
async function bit32MAC() {
  const mac = await getMAC();
  const macArray = mac.split(":");
  const mac32 = macArray
    .map((el) => {
      return parseInt(el, 16).toString(32);
    })
    .join("-");
  return mac32;
}
function parse32MACTo10(mac32) {
  const macArray = mac32
    .split("-")
    .map((el) => {
      const mac10 = parseInt(el, 32) + "";
      const mac10Str = Math.floor(Math.random() * 10) + mac10.padStart(3, "0");
      return mac10Str;
    })
    .join("-");
  return macArray;
}

function parse10To16(mac10) {
  const macArray = mac10
    .split("-")
    .map((el) => {
      const mac16 = Number(el.substr(1, 3)).toString(16);
      return mac16;
    })
    .join(":");

  return macArray;
}
async function planB() {
  let mac = await getMAC();
  //1.client info
  const mac32 = await bit32MAC();
  console.log("mac32", mac32);
  //2.server auth code
  const mac10 = parse32MACTo10(mac32);
  console.log("mac10", mac10);
  // 3. client decrypt
  const mac16 = parse10To16(mac10);
  console.log("mac16", mac16);
  console.log(mac === mac16);
}

planB();
