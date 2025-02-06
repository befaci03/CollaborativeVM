const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');

const __configPath = path.join(__dirname, '..', 'CONFIG.jsonc');
const { ProjectConfig } = require('./private/confParser');

let __config = new ProjectConfig().loadConfig(__configPath);

/*setInterval(() => {
  __config = new ProjectConfig().loadConfig();
  console.log('Configuration file refreshed successfully! ✔️ (next refresh in 25s)');
}, 25000);*/

const { QEMUManager } = require('./private/qemuManager');
Object.keys(__config["vms.qemu"]).forEach(vmId => {
  new QEMUManager(__config).startVM(vmId);
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const vmData = {};

app.get('/vm/:vmId', (req, res) => {
  const vmId = req.params.vmId;
  res.render('vm', { 
    vmId, 
    siteName: __config.global.name, 
    socket: { users: [] }, 
    vmConfig: { cursorHoverScreen: __config["vms.qemu"][vmId] ? __config["vms.qemu"][vmId].cursorIdWhenHoverScreen : '0=false??ERR404-return=:!' } 
  });
});

app.get('/', (req, res) => {
  res.send("Welcome on CollaborativeVM! Go to /vm/[id] to start.");
});


io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);

  socket.on('join_vm', (data) => {
    const vmId = data.vmId;
    if (!vmData[vmId]) {
      vmData[vmId] = { users: [], queue: [] };
    }
    const user = { id: socket.id, username: data.username || "guest" + socket.id.substr(1, 5) };
    vmData[vmId].users.push(user);

    socket.join(vmId);
    console.log(`Socket ${socket.id} join the VM ${vmId}`);

    io.to(vmId).emit('update_users', vmData[vmId].users);
  });

  socket.on('chat_message', (data) => {
    const vmId = data.vmId;
    io.to(vmId).emit('chat_message', {
      uname: data.username,
      msg: data.message,
      time: new Date().toLocaleTimeString()
    });
  });

  socket.on('request_turn', (data) => {
    const vmId = data.vmId;
    if (!vmData[vmId]) vmData[vmId] = { users: [], queue: [] };
    if (!vmData[vmId].queue.includes(socket.id)) {
      vmData[vmId].queue.push(socket.id);
    }
    io.to(vmId).emit('update_queue', vmData[vmId].queue);
  });

  socket.on('cancel_turn', (data) => {
    const vmId = data.vmId;
    if (vmData[vmId]) {
      vmData[vmId].queue = vmData[vmId].queue.filter(id => id !== socket.id);
      io.to(vmId).emit('update_queue', vmData[vmId].queue);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    for (const vmId in vmData) {
      vmData[vmId].users = vmData[vmId].users.filter(u => u.id !== socket.id);
      vmData[vmId].queue = vmData[vmId].queue.filter(id => id !== socket.id);
      io.to(vmId).emit('update_users', vmData[vmId].users);
      io.to(vmId).emit('update_queue', vmData[vmId].queue);
    }
  });
});

const port = __config.server.listen || 3000;
server.listen(port, () => {
  console.log(`Server using the port ${port}`);
});
