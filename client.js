"use strict";

const {
  requests: { RequestFactory },
} = require("jsmodbus");
const CRC = require("crc");
const struct = require("python-struct");
const { Socket } = require("net");

const MAP = {
  ON: 0xff00,
  OFF: 0x0000,
  UP: 0x0016,
  DOWN: 0x0017,
  UP_STATUS: 0x0018,
  DOWN_STATUS: 0x0019,
};

function control(addr, value = MAP.ON) {
  const msgNotCrc = struct.pack("!BBHH", 0x1, 0x5, addr, value);
  const msgCrc = CRC.crc16modbus(msgNotCrc);
  const msgCrcPack = struct.pack("<H", msgCrc);
  const combine = Buffer.concat([msgNotCrc, msgCrcPack]);
  console.log(combine.toString("hex"));
}

function readCoil(startAddr, readNumber) {
  const msgWithoutCrc = struct.pack("!BBHH", 0x1, 0x1, startAddr, readNumber);
  const crc_val = CRC.crc16modbus(msg_without_crc);
  const crcPack = struct.pack("<H", crc_val);
  const combine = Buffer.concat([msgWithoutCrc, crcPack]);
  console.log(combine.toString("hex"));
  return combine;
}
function connect(host, port, command) {
  const socket = new Socket();
  const options = {
    host,
    port,
  };

  socket.on("connect", function () {
    socket.write(command);
  });

  socket.on("error", console.error);
  socket.on("data", function (data) {
    console.log("data", data);
  });

  socket.connect(options);
}

function up(host, port) {
  connect(host, port, control(MAP.UP, MAP.OFF));
  connect(host, port, control(MAP.UP, MAP.ON));
}
function down(host, port) {
  connect(host, port, control(MAP.DOWN, MAP.OFF));
  connect(host, port, control(MAP.DOWN, MAP.ON));
}
function query(host, port) {
  const upStatus = connect(host, port, readCoil(MAP.UP_STATUS, 1));
  const downStatus = connect(host, port, readCoil(MAP.DOWN_STATUS, 1));
}
