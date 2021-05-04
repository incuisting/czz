const { createServer } = require("net");

let globalBuf = Buffer.from([01, 01, 01, 00, 90, 48]);
const server = createServer((socket) => {
  socket.on("data", (data) => {
    console.log("收到数据", data);
    if (data.toString("hex") === "01050016ff006dfe") {
      // up 填值
      globalBuf = Buffer.from([01, 01, 01, 01, 90, 48]);
      console.log("up", data);
      socket.write(data);
    }
    if (data.toString("hex") === "0101001800017dcd") {
      // 查询
      socket.write(globalBuf);
    }
    if (data.toString("hex") === "01050017ff003c3e") {
      // down
      console.log("down", data);
      globalBuf = Buffer.from([01, 01, 01, 00, 90, 48]);
      socket.write(data);
    }
    socket.write(data);
  });
});

server.listen(9993, () => {
  console.log("9993");
});
