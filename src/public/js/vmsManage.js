import RFB from "/novnc/core/rfb.js";

function initScreens(vms) {
  for (const vmId in vms) {
    if (!document.getElementById(`${vmId}-trackmode`)) return;

    const vmConfig = vms[vmId];
    let rfb;
    try {
      rfb = new RFB(document.getElementById(`${vmId}-trackmode`), `ws://localhost:5911`);
      rfb.scaleViewport = false;
      rfb.resizeSession = false;
      rfb.focusOnClick = false;
      rfb.qualityLevel = 0;
      rfb.compressionLevel = 9;
      console.log(`RFB_ScreenViewer connected on the VM ws://localhost:5911`);

      const makeSure__vmscrn = setInterval(() => {
        document.querySelector(`#${vmId}-trackmode div`).setAttribute('style', 'display: flex; width: 100%; height: 100%; overflow: auto; background: url(\'/loading.gif\'); background-repeat: no-repeat; background-position: center; background-size: 130%;');
        document.querySelector(`#${vmId}-trackmode canvas`).setAttribute('style', 'margin: auto; outline: none; cursor: <%%>; width: 50%; height: 50%;'.replace('<%%>', vmConfig.cursorHoverScreen));
      }, 10000);

      rfb.addEventListener("disconnect", () => {
        clearInterval(makeSure__vmscrn);
        setTimeout(() => { return initScreens(vms); }, 200);
      });
    } catch (err) {
      console.error("Error when init RFB from noVNC:", err);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initScreens(window.vms);
});
