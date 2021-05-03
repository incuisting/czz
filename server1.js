const { createServer } = require("net");
const server = createServer((socket) => {
  socket.on("data", (data) => {
    console.log("accept", data);
    socket.write("end");
  });
});

server.listen(9999, () => {
  console.log("9999");
});
