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
async function main() {
  //1. client
  const macInt = await transferMAC();
  //2. sever
  const authCode = encrypt(macInt);
  // 3.client
  const originalText = decrypt(authCode);
  console.log(macInt === originalText);
}

main();
