import { app } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import { safeStorage, ipcMain } from 'electron';
import Store from 'electron-store';

const isProd: boolean = process.env.NODE_ENV === 'production';
const store = new Store()

// uncomment to clear everytime
store.clear()
if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

function saveObjectData(event, data) {

  if(data) {
    const buffer = safeStorage.encryptString(data)
    store.set('objectData', buffer)
  }
  event.sender.send('saveObjectData', JSON.parse(data))
}
function getObjectData(event) {
  const data:any = store.get('objectData');
  let objectData = null
  if(data) {
    const buff = Buffer.from(data.data)
    const parsed = safeStorage.decryptString(buff)
    objectData = JSON.parse(parsed);
  }
  event.sender.send('getObjectData', objectData)
}


(async () => {
  await app.whenReady();

  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
  });

  if (isProd) {
    await mainWindow.loadURL('app://./home.html');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }
})();

app.on('window-all-closed', () => {
  app.quit();
});

ipcMain.on('saveObjectData', saveObjectData)
ipcMain.on('getObjectData', getObjectData)