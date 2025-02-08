# CollaborativeVM - Feel free, feel the open-source
**License: <https://github.com/Befaci03/CollaborativeVM/LICENSE.md>** ![Static Badge](https://img.shields.io/badge/license-GPL_3.0-orange)

### Hello, welcome to [the official GitHub repo](https://github.com/Befaci03/CollaborativeVM) of CollaborativeVM

### Credits: [Myself](http://befacidev.eu)

## FAQ

### Q: How it works ?
**A:** CollaborativeVM use the RFB noVNC framework for the virtual machine control.

   For the security, we use EJS template and express.js to hide some routes, some scripts that are needed to be private.

   We use AES, HMAC and some random basic encryptions algorithm to keep private credentials really safe.

   We use socket.io for some systems that really need a realtime system, like users and chat.

### Q: Where did you have the idea and why ?
**A:** I pick the idea from [Computernewb](https://computernewb.com) that created [CollabVM](https://computernewb.com/collab-vm) and [UserVM](https://computernewb.com/collab-vm/user-vm) to recreate it better than [CollabVM V3.0](https://computernewb.com/wiki/CollabVM_Server_3.0) and to remove all sh*ts that staffs coded in that.

## Requirements

### Minimal
OS: **Any Linux Distros** x64

RAM: **6GB DDR4** 12000mHz

CPU: **Intel Core i3** with *virtualization enabled* @2.30GHz (4 cores)

GPU: No neccesary

Drive: **180GB SSD**

### Recommended
OS: **Debian 11** with *XFCE x64*

RAM: **12GB DDR4** 14000MHz

CPU: **Intel Core i5** @3.40GHz (8 cores)

GPU: **It's recommended** but **not neccesary at all**

Drive: **420GB SSD**

## Setup
First, we need modules, execute `yarn && npm start` then when you are on the menu select `Initialize project`, and exit, then you're done!

Next, we need a modification of the config file to adapt to your use, simply follow comments on the file.

Finally, to launch CollaborativeVM, execute on a terminal `npm run instantstart` or `npm start` then select `Start the server`

## More about CollaborativeVM
![Static Badge](https://img.shields.io/badge/languages-TypeScript_JavaScript_EJS-blue)

![Static Badge](https://img.shields.io/badge/modules-express_socket.io_cli--progress_ldrs_child__process_inquirer_ora_path_fs_sqlite3_crypto_jsonc--parser_canvas-yellow)

![Static Badge](https://img.shields.io/badge/price-free-green) (is that logic lol)
