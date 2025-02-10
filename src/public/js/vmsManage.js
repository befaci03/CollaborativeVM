import RFB from "/novnc/core/rfb.js";

function initScreens(vms) {
  for (const vmId in vms) {
    if (!document.getElementById(`${vmId}-trackmode`)) return;

    const vmConfig = vms[vmId];
    let rfb;
    try {
      rfb = new RFB(document.getElementById(`${vmId}-trackmode`), `ws://localhost:${vmConfig.vm[12] + 100}`, {
        credentials: {
          
        },
        shared: true,
        repeaterID: '',
        wsProtocols: []
      });

      rfb.scaleViewport = false;
      rfb.resizeSession = false;
      rfb.focusOnClick = false;
      rfb.viewOnly = true;

      rfb.qualityLevel = 0;
      rfb.compressionLevel = 9;

      console.log(`RFB_ScreenViewer connected on the VM ws://localhost:${vmConfig.vm[12] + 100}`);

      const screenDiv = document.querySelector(`#${vmId}-trackmode div`);
      const canvas = document.querySelector(`#${vmId}-trackmode canvas`);
      if (screenDiv && canvas) {
        screenDiv.setAttribute('style', 'display: flex; width: 100%; height: 100%; overflow: auto; background: url(\'/loading.gif\'); background-repeat: no-repeat; background-position: center; background-size: 130%;');
        canvas.setAttribute('style', 'margin: auto; outline: none; cursor: pointer; width: 100%; height: 100%;');
        canvas.setAttribute('height', '384');
        canvas.setAttribute('width', '512');
      }
    } catch (err) {
      console.error("Error when init RFB from noVNC:", err);
    }
  }
}

function initBoxes(vms) {
  for (const vmId in vms) {
    // Tags part
    const tags = vms[vmId].display.tags;
    const tagsContainer = document.getElementById(`${vmId}-vmBoxTags`);

    tags.forEach(tag => {
      const tagElement = document.createElement('span');

      if (tag === "nsfw") {
        tagElement.classList.add('tag_nsfw_vmBox');
        tagElement.innerHTML = "NSFW";
      };
      if (tag === "no-audio") tagElement.innerHTML = "No audio";
      if (tag === "no-keyboard") tagElement.innerHTML = "No keyboard";
      if (tag === "no-internet") tagElement.innerHTML = "No network";
      if (tag === "no-mouse") tagElement.innerHTML = "No mouse";
      if (tag === "no-chat") tagElement.innerHTML = "No chat";
      if (tag === "example") {
        tagElement.classList.add('tag_example_vmBox');
        tagElement.innerHTML = "Example";
      };
      if (tag === "anyos") {
        tagElement.classList.add('tag_anyos_vmBox');
        tagElement.innerHTML = "AnyOS";
      };
      tagElement.classList.add('tag');

      tagsContainer.appendChild(tagElement);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initScreens(window.vms);
  initBoxes(window.vms);
});
