const { app, BrowserWindow } = require("electron");
const path = require("path");
const { uIOhook } = require("uiohook-napi");
const electron = require("electron");

const remote = require("@electron/remote/main");
// 初始化
remote.initialize();

// modify your existing createWindow() function
const createWindow = () => {
  const area = electron.screen.getPrimaryDisplay().workAreaSize;
  console.log(process.platform);
  let cusX = area.width;
  let cusY = area.height;
  // 当不是mac系统时，屏幕位置使用下面的计算方式，默认为mac系统的计算方式
  if (process.platform && process.platform !== "darwin") {
    cusX = area.width - area.width * 0.5;
    cusY = area.height - area.height * 0.5;
  }
  const win = new BrowserWindow({
    x: cusX,
    y: cusY,
    width: area.width * 0.5,
    height: area.height * 0.5,
    frame: false, // 无边框
    transparent: true, // 透明度
    alwaysOnTop: true, // 窗口置顶
    resizable: false, // 是否可以改变大小
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true, // 是否使用nodejs 的特性
      contextIsolation: false,
    },
    icon: path.join(__dirname, "./public/doll.jpeg"),
    // 禁用窗口阴影，否则在mac系统选中时会有图片的阴影
    hasShadow: false,
  });
  // 允许窗口的 webcontents 访问
  remote.enable(win.webContents);
  // win.setIgnoreMouseEvents(true) // 设置鼠标忽略事件
  // 处理mac系统下，在全屏模式下，应用无法置顶的问题。
  if (process.platform === "darwin") {
    app.dock.show();
    win.setAlwaysOnTop(true, "floating", 1);
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    win.setFullScreenable(false);
  }
  //   win.webContents.openDevTools();
  win.loadFile("index.html");

  listenerKeyboardEvent(win);
};

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// 监听全局鼠标事件，并执行javascript脚本
const listenerKeyboardEvent = (win) => {
  uIOhook.on("keydown", (e) => {
    // console.log(e);
    // e = {
    //   type: 4,
    //   altKey: false,
    //   ctrlKey: true,
    //   metaKey: false,
    //   shiftKey: false,
    //   keycode: 44,
    // };
    // 按下
    const type = 1;
    const js = `if(window.onGlobalKeyBoard){window.onGlobalKeyBoard(${type},${e.keycode},${e.ctrlKey})}`;
    win.webContents.executeJavaScript(js);
  });

  uIOhook.on("keyup", (e) => {
    // 抬起
    const type = 2;
    win.webContents.executeJavaScript(
      `if(window.onGlobalKeyBoard){window.onGlobalKeyBoard(${type}, ${e.keycode})}`
    );
  });
  uIOhook.start();
};
