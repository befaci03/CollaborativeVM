import RFB from "/novnc/core/rfb.js";

let detectedLayout = "QWERTY";
function translateKey(layout, key) {
  return key;
}

function initNoVNC() {
  let rfb;
  try {
    rfb = new RFB(document.getElementById('vmScreen'), 'ws://localhost:5911');
    rfb.scaleViewport = true;
    rfb.resizeSession = true;
    console.log(`RFB_ScreenViewer connected on the VM ws://localhost:5911`);

    document.querySelector('#vmScreen div').setAttribute('style', 'display: flex; width: 100%; height: 100%; overflow: auto; background: url(\'/loadingVm.gif\'); background-repeat: no-repeat; background-position: center; background-size: 15%;');
    document.querySelector('canvas').setAttribute('style', 'margin: auto; outline: none; cursor: <%%>; width: 100%; height: 100%;'.replace('<%%>', vmConfig.cursorHoverScreen));
    const makeSure__vmscrn = setInterval(() => {
      document.querySelector('#vmScreen div').setAttribute('style', 'display: flex; width: 100%; height: 100%; overflow: auto; background: url(\'/loadingVm.gif\'); background-repeat: no-repeat; background-position: center; background-size: 15%;');
      document.querySelector('canvas').setAttribute('style', 'margin: auto; outline: none; cursor: <%%>; width: 100%; height: 100%;'.replace('<%%>', vmConfig.cursorHoverScreen));
    }, 400);

    rfb.addEventListener("disconnect", () => {
      console.warn("Deconnection detected, atfer 450ms reconnecting");
      clearInterval(makeSure__vmscrn);
      setTimeout(() => { return initNoVNC(); }, 450);
    });
  } catch (err) {
    console.error("Error when init RFB from noVNC:", err);
  }

  document.addEventListener("keydown", function(event) {
    if (rfb) {
      const translatedKey = translateKey(detectedLayout, event.keyCode);
      rfb.sendKey(translatedKey, true);
    }
  });
  document.addEventListener("keyup", function(event) {
    if (rfb) {
      const translatedKey = translateKey(detectedLayout, event.keyCode);
      rfb.sendKey(translatedKey, false);
    }
  });

  document.addEventListener("mousemove", (event) => {
    if (rfb && typeof rfb._sendPointerEvent === "function") {
      rfb._sendPointerEvent(event.clientX, event.clientY, 0);
    }
  });
  document.addEventListener("mousedown", (event) => {
    if (rfb && typeof rfb._sendPointerEvent === "function") {
      rfb._sendPointerEvent(event.clientX, event.clientY, 1 << event.button);
    }
  });
  document.addEventListener("mouseup", (event) => {
    if (rfb && typeof rfb._sendPointerEvent === "function") {
      rfb._sendPointerEvent(event.clientX, event.clientY, 0);
    }
  });

  document.getElementById('vmKeyCAD').addEventListener('click', () => {
    if (rfb) {
      rfb.sendCtrlAltDel();
    }
  });
}

function initSocket() {
  const socket = io();
  const vmId = window.location.pathname.split('/').pop();

  socket.emit('join_vm', { vmId, username: "guest" + Math.floor(Math.random() * 99999) });

  socket.on('update_users', (users) => {
    document.querySelector('#column1 .list').innerHTML =
      users.map(u => `<li>${u.username}</li>`).join('');
    document.querySelector('#onlineUsers_Counter').innerHTML =
      users.length;
  });

  document.getElementById('requestTurn')?.addEventListener('click', () => {
    socket.emit('request_turn', { vmId });
  });
  document.getElementById('cancelTurn')?.addEventListener('click', () => {
    socket.emit('cancel_turn', { vmId });
  });

  socket.on('update_queue', (queue) => {
    console.log("Updated queue:", queue);
  });

  // document.getElementById('chatSend')?.addEventListener('click', () => { ... });
  // socket.on('chat_message', (data) => { ... });
}

document.addEventListener("DOMContentLoaded", () => {
  if (vmConfig.cursorHoverScreen === "0=false??ERR404-return=:!") window.location.pathname = '/error/404?m=VM%20not%20found';

  initNoVNC();
  initSocket();
});
