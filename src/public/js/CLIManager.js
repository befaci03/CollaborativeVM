import RFB from "/novnc/core/rfb.js";

let detectedLayout = "QWERTY";
function translateKey(layout, key) {
  return key;
}

function initNoVNC() {
  let rfb;
  try {
    const wsUrl = `ws://${window.location.hostname}:${wsprt}`;
    const _VMScreen = document.getElementById('vmScreen');
    rfb = new RFB(_VMScreen, wsUrl);
    rfb.scaleViewport = true;
    rfb.resizeSession = true;
    console.log(`RFB connected on the VM ${wsUrl}`);

    const vmScreenDiv = document.querySelector('#vmScreen div');
    if (vmScreenDiv) {
      vmScreenDiv.setAttribute('style', 'display: flex; width: 100%; height: 100%; overflow: auto; background: url(\'/loadingVm.gif\'); background-repeat: no-repeat; background-position: center; background-size: 15%;');
    }
    const canvas = document.querySelector('#vmScreen canvas');
    if (canvas) {
      canvas.setAttribute('style', `margin: auto; outline: none; cursor: ${vmConfig.cursorHoverScreen}; width: 100%; height: 100%;`);
    }

    const makeSure__vmscrn = setInterval(() => {
      if (vmScreenDiv) {
        vmScreenDiv.setAttribute('style', 'display: flex; width: 100%; height: 100%; overflow: auto; background: url(\'/loadingVm.gif\'); background-repeat: no-repeat; background-position: center; background-size: 15%;');
      }
      if (canvas) {
        canvas.setAttribute('style', `margin: auto; outline: none; cursor: ${vmConfig.cursorHoverScreen}; width: 100%; height: 100%;`);
      }
    }, 600);

    rfb.addEventListener("disconnect", () => {
      console.warn("Deconnection detected, after 450ms reconnecting");
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

  socket.emit('vHsi5sc2s7dDx4s', { vmId, username: "guest" + Math.floor(Math.random() * 99999) });

  socket.on('ihkz4FQS4hsqb5s7efD', (users) => {
    document.querySelector('#column1 .list').innerHTML =
      users.map(u => `<li>${u.username}</li>`).join('');
    document.querySelector('#onlineUsers_Counter').innerHTML =
      users.length;
  });

  document.getElementById('requestTurn')?.addEventListener('click', () => {
    socket.emit('vv5dsx42qHss4Hzs4', { vmId });
  });
  document.getElementById('cancelTurn')?.addEventListener('click', () => {
    socket.emit('zsiuGdz451Hss4Hzs4', { vmId });
  });

  socket.on('ihkz4FQS4hsqBcns4d1', (queue) => {
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
