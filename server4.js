const { createServer } = require("net");

let globalBuf = Buffer.from([01, 01, 01, 00, 90, 48]);
const server = createServer((socket) => {
  socket.on("data", (data) => {
    if (data.toString("hex") === "01050016ff006dfe") {
      // up 填值
      globalBuf = Buffer.from([01, 01, 01, 01, 90, 48]);
      socket.write(data);
    }
    if (data.toString("hex") === "0101001800017dcd") {
      // 查询
      socket.write(globalBuf);
    }
    if (data.toString("hex") === "01050017ff003c3e") {
      // down
      globalBuf = Buffer.from([01, 01, 01, 00, 90, 48]);
      socket.write(data);
    }
  });
});

server.listen(9999, () => {
  console.log("9999");
});
