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
const STATUS_MAP = {
  "00": "OFF",
  "01": "ON",
};
function control(addr, value = MAP.ON) {
  const msgNotCrc = struct.pack("!BBHH", 0x1, 0x5, addr, value);
  const msgCrc = CRC.crc16modbus(msgNotCrc);
  const msgCrcPack = struct.pack("<H", msgCrc);
  const combine = Buffer.concat([msgNotCrc, msgCrcPack]);
  return combine;
}

function readCoil(startAddr, readNumber) {
  const msgWithoutCrc = struct.pack("!BBHH", 0x1, 0x1, startAddr, readNumber);
  const crc_val = CRC.crc16modbus(msgWithoutCrc);
  const crcPack = struct.pack("<H", crc_val);
  const combine = Buffer.concat([msgWithoutCrc, crcPack]);
  console.log(combine.toString("hex"));
  return combine;
}
function connect(host, port, command, cb) {
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
    console.log(command, data);
    const read = data.readUInt16BE(2);
    const status_code = Buffer.from([read]).toString("hex");
    cb(STATUS_MAP[status_code]);
    socket.end();
  });

  socket.connect(options);
}

function up(host, port) {
  const socket = new Socket();
  const options = {
    host,
    port,
  };

  socket.on("connect", function () {
    socket.write(control(MAP.UP, MAP.OFF));
    socket.write(control(MAP.UP, MAP.ON));
  });

  socket.on("error", console.error);
  socket.on("data", function (data) {
    console.log("up", data.toString());
    socket.end();
  });

  socket.connect(options);
  // connect(host, port, control(MAP.UP, MAP.OFF));
  // connect(host, port, control(MAP.UP, MAP.ON));
}

function down(host, port) {
  const socket = new Socket();
  const options = {
    host,
    port,
  };

  socket.on("connect", function () {
    socket.write(control(MAP.DOWN, MAP.OFF));
    socket.write(control(MAP.DOWN, MAP.ON));
  });

  socket.on("error", console.error);
  socket.on("data", function (data) {
    console.log("down", data);
    socket.end();
  });

  socket.connect(options);
}
function query(host, port) {
  const upStatus = connect(host, port, readCoil(MAP.UP_STATUS, 1), (status) => {
    console.log("up", status);
  });
  // const downStatus = connect(
  //   host,
  //   port,
  //   readCoil(MAP.DOWN_STATUS, 1),
  //   (status) => {
  //     console.log("down", status);
  //   }
  // );
}

// const buf = Buffer.alloc(6);
// buf.writeUInt16BE(0x0101, 0);
// buf.writeUInt16BE(0x0100, 2);
// buf.writeUInt16BE(0x9048, 4);

// const read = buf.readUInt16BE(2);
// const status_code = Buffer.from([read]).toString("hex");
// console.log(buf.toString("hex"));
// console.log(STATUS_MAP[status_code]);

// up("127.0.0.1", 9999);

// down("127.0.0.1", 9999);

query("127.0.0.1", 9999);

// connect("10.10.100.254", 8899, control(MAP.DOWN, MAP.OFF));
// connect("10.10.100.254", 8899, control(MAP.DOWN, MAP.ON));
