const NodeRSA = require("node-rsa");
const fs = require("fs");
const { resolve } = require("path");
const CryptoJS = require("crypto-js");
const moment = require("moment");
const privateKey = fs.readFileSync(resolve(__dirname, "./private"), {
  encoding: "utf-8",
});

const publicKey = fs.readFileSync(resolve(__dirname, "./public"), {
  encoding: "utf-8",
});

const key = new NodeRSA();
key.importKey(privateKey);

function makeId(length) {
  const result = [];
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result.push(
      characters.charAt(Math.floor(Math.random() * charactersLength))
    );
  }
  return result.join("");
}

function getLic(bean) {
  let lic = "";
  const aesKey = makeId(16);
  const encData = CryptoJS.AES.encrypt(JSON.stringify(bean), aesKey).toString();
  const encDataLength = encData.length.toString(16);
  const sign = key.sign(encData, "base64", "utf8");
  lic = aesKey + encDataLength + encData + sign;
  return lic;
}
function checkLic(lic) {
  if (!lic) {
    return false;
  }
  const key = NodeRSA(publicKey);
  const aesKey = lic.substring(0, 16);
  const encDataLength = parseInt(lic.substring(16, 18), 16);
  const encData = lic.substring(18, 18 + encDataLength);
  const sign = lic.substring(18 + encDataLength);
  if (!key.verify(encData, sign, "utf8", "base64")) {
    console.log("无效");
    return false;
  }
  const data = CryptoJS.AES.decrypt(encData, aesKey);
  const deData = JSON.parse(data.toString(CryptoJS.enc.Utf8));
  const { appId, notBefore, notAfter } = deData;
  console.log(deData);
  console.log(appId);
  const time = moment().valueOf();
  if (time < notBefore || time > notAfter) {
    return false;
  }

  return true;
}

function createBean(appId, authorizationTime) {
  const timeStamp = moment.duration(authorizationTime, "days");
  const issuedTime = moment().valueOf();
  return {
    appId,
    issuedTime,
    notBefore: issuedTime,
    notAfter: issuedTime + timeStamp,
  };
}
const lic = getLic(createBean("demo", 10));
checkLic(lic);
