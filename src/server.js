const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');

const __configPath = path.join(__dirname, '..', 'CONFIG.jsonc');
const { ProjectConfig } = require('./private/confParser');

let __config = new ProjectConfig().loadConfig(__configPath);

setInterval(() => {
  __config = new ProjectConfig().loadConfig(__configPath);
  console.log('Configuration file refreshed successfully! ✔️ (next refresh in 25s)');
}, 25000);

const ejsDefltElems = {
};

const { QEMUManager } = require('./private/qemuManager');
if (__config["vms.qemu"]) {
  Object.keys(__config["vms.qemu"] || {}).forEach(vmId => {
    new QEMUManager(__config).startVM(vmId);
  });
}

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
  const vmConfig = __config["vms.qemu"][vmId];
  res.render('vm', {
    "_config": {
      links: __config.links,
      generic: {
        rules: __config.generic.rules
      }
    },

    vmId,
    siteName: __config.global.name,
    socket: { users: [] },
    vmConfig: { cursorHoverScreen: vmConfig ? vmConfig.cursorIdWhenHoverScreen : '0=false??ERR404-return=:!' },
    wsVm: vmConfig ? `${vmConfig.vm[12] + 100}` : '6000'
  });
});

app.get('/vms', (req, res) => {
  res.render('vms', {
    "_config": {
      links: __config.links,
      generic: {
        rules: __config.generic.rules
      }
    },

    siteName: __config.global.name,
    vms: __config["vms.qemu"] || {}
  });
});

app.get('/', (req, res) => {
  res.render('home', {
    "_config": {
      links: __config.links,
      generic: {
        rules: __config.generic.rules
      }
    },

    siteName: __config.global.name
  });
});

app.get('/rules', (req, res) => {
  res.render('rules', {
    "_config": {
      links: __config.links,
      generic: {
        rules: __config.generic.rules
      }
    },

    siteName: __config.global.name
  });
});

app.get('/error/:code', (req, res) => {
  const msg = req.query.m || '';
  const codes = [400, 401, 403, 404, 408, 418, 423];
  if (!codes.includes(parseInt(req.params.code))) return res.redirect('/error/404?m=Invalid%20error%20code');
  res.render(`errorC${req.params.code}`, {
    "_config": {
      links: __config.links,
      generic: {
        rules: __config.generic.rules
      }
    },

    siteName: __config.global.name,
    msg
  });
});

io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);

  socket.on('vHsi5sc2s7dDx4s', (data) => {
    const vmId = data.vmId;
    if (!vmData[vmId]) {
      vmData[vmId] = { users: [], queue: [] };
    }
    const user = { id: socket.id, username: data.username || "guest" + socket.id.substr(1, 5) };
    vmData[vmId].users.push(user);

    socket.join(vmId);
    console.log(`Socket ${socket.id} join the VM ${vmId}`);

    io.to(vmId).emit('ihkz4FQS4hsqb5s7efD', vmData[vmId].users);
  });

  socket.on('1111111av5s8dlHFs', (data) => {
    const vmId = data.vmId;
    io.to(vmId).emit('1111111av5s8dlHFs', {
      uname: data.username,
      msg: data.message,
      time: new Date().toLocaleTimeString()
    });
  });

  socket.on('vv5dsx42qHss4Hzs4', (data) => {
    const vmId = data.vmId;
    if (!vmData[vmId]) vmData[vmId] = { users: [], queue: [] };
    if (!vmData[vmId].queue.includes(socket.id)) {
      vmData[vmId].queue.push(socket.id);
    } else {
      vmData[vmId].queue = vmData[vmId].queue.filter(id => id !== socket.id);
    }
    io.to(vmId).emit('ihkz4FQS4hsqBcns4d1', vmData[vmId].queue);
  });

  socket.on('zsiuGdz451Hss4Hzs4', (data) => {
    const vmId = data.vmId;
    if (vmData[vmId]) {
      vmData[vmId].queue = vmData[vmId].queue.filter(id => id !== socket.id);
      io.to(vmId).emit('ihkz4FQS4hsqBcns4d1', vmData[vmId].queue);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    for (const vmId in vmData) {
      vmData[vmId].users = vmData[vmId].users.filter(u => u.id !== socket.id);
      vmData[vmId].queue = vmData[vmId].queue.filter(id => id !== socket.id);
      io.to(vmId).emit('ihkz4FQS4hsqb5s7efD', vmData[vmId].users);
      io.to(vmId).emit('ihkz4FQS4hsqBcns4d1', vmData[vmId].queue);
    }
  });
});

const port = __config.server.listen || 3000;
server.listen(port, () => {
  console.log(`Server using the port ${port}`);
});
