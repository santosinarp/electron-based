const electron = require('electron')
const url = require('url')
const path = require('path')

const {app, BrowserWindow, Menu, globalShortcut, ipcMain} = electron

let mainWindow
let addWindow

process.env.NODE_ENV = 'production'

// Listen for app to be ready
app.on('ready', () => {
    // create new window
    mainWindow = new BrowserWindow({})
    
    // Load html file to the window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Quit app when closed
    mainWindow.on('close', () => {
        app.quit()
    })

    // Register Shortcut
    if(process.platform === 'darwin') {
        globalShortcut.register('Command+Q', () => {
            app.quit()
        })

    }else {
        globalShortcut.register('Ctrl+Q', () => {
            app.quit()
        })
    }

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)

    // Insert menu
    Menu.setApplicationMenu(mainMenu)
})

// Handle create add window
function createAddWindow() {
    // create new window
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add Shopping List Item'
    })
    
    // Load html file to the window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Garbage collection handle
    addWindow.on('close', () => {
        addWindow = null
    })
}

// Catch item:add
ipcMain.on('item:add', (e, item) => {
    mainWindow.webContents.send('item:add', item)
    addWindow.close()
})

// Create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add Item',
                click() {
                    createAddWindow()
                } 
            },
            {
                label: 'Clear Item',
                click() {
                    mainWindow.webContents.send('item:clear')
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    app.quit()
                }
            }
        ]
    }
]

// If mac, add empty object to menu
if(process.platform === 'darwin') {
    mainMenuTemplate.unshift({})
}

// add developer tools except in production mode
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle Devtools',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools()
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}