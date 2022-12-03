const electron = require("@electron/remote");
const win = electron.getCurrentWindow();
// 鼠标按下还是抬起
let dragging = false;
let mouseX = 0;
let mouseY = 0;

window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ["chrome", "node", "electron"]) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
  // 设置拖拽功能
  const el = document.getElementById("ikun");
  el.addEventListener("mousedown", (e) => {
    dragging = true;
    const { pageX, pageY } = e;
    mouseX = pageX;
    mouseY = pageY;
  });
});
// 鼠标抬起禁止拖拽
window.addEventListener("mouseup", () => {
  dragging = false;
});
// 设置拖拽功能
window.addEventListener("mousemove", (e) => {
  console.log(dragging);
  if (dragging) {
    const { pageX, pageY } = e;
    const pos = win.getPosition();
    pos[0] = pos[0] + pageX - mouseX;
    pos[1] = pos[1] + pageY - mouseY;
    win.setPosition(pos[0], pos[1], true);
  }
});
// 设置指定区域的鼠标点击不穿透
window.addEventListener("mousemove", (event) => {
  const el = document.getElementById("ikun");
  let flag = event.target === el;
  if (!flag) {
    win.setIgnoreMouseEvents(true, { forward: true });
  } else {
    win.setIgnoreMouseEvents(false);
  }
});
