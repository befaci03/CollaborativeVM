import inquirer from 'inquirer';
import { SingleBar } from 'cli-progress';
import { exec, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function init(message, delayEachProgress) {
    console.clear();
    console.log(`\n${message}\n`);

    const progressBar = new SingleBar({
        format: 'Initializing [{bar}] {percentage}%',
        barCompleteChar: '=',
        barIncompleteChar: ' ',
        hideCursor: true
    });

    progressBar.start(100, 0);

    let progress = 0;
    const interval = setInterval(() => {
        progress += 3;
        progressBar.update(progress);
        if (progress >= 100) {
            clearInterval(interval);
            progressBar.stop();
            console.log('✅ Running\n');
            mainMenu();
        }
    }, delayEachProgress);
}

async function loading(mod, message, duration, endMsg) {
    return new Promise((resolve) => {
        if (message) console.log(`\n${message}\n`);

        const progressBar = new SingleBar({
            format: `${mod} [{bar}] {percentage}%`,
            barCompleteChar: '=',
            barIncompleteChar: ' ',
            hideCursor: true
        });

        progressBar.start(100, 0);

        let progress = 0;
        const interval = setInterval(() => {
            progress += 1;
            progressBar.update(progress);

            if (progress >= 100) {
                clearInterval(interval);
                progressBar.stop();
                console.log(`${endMsg || chalk.greenBright('Loaded')}\n`);
                resolve();
            }
        }, Math.round(duration / 100));
    });
}

async function mainMenu() {
    const mainChoices = [
        'Start the server',
        'Initialize project',
        'Modify configuration file',
        'Exit'
    ];

    console.clear();

    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Welcome to CollaborativeVM launcher, select any actions:',
            choices: mainChoices
        }
    ]);

    switch (action) {
        case 'Start the server':
            await startServer();
            break;
        case 'Initialize project':
            await initialize();
            break;
        case 'Modify configuration file':
            await modifyConfig();
            break;
        case 'Exit':
            console.log('Exiting launcher...');
            await loading('Exiting')
            process.exit(0);
    }
}

async function startServer() {
    console.log("\n🚀 Server is starting...\n");

    try {
        console.log("✅ Server started successfully!");
        await import('../../src/server.js');
    } catch (error) {
        console.error("❌ Error starting the server:", error);
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));
    mainMenu();
}

async function initialize() {
    console.log('Installing modules...');

    const modules = [
        'jsonc-parser@3.3.1', 'canvas@3.1.0', 'fs@0.0.1-security', 'path@0.12.7', 'socket.io@4.8.1', 'sqlite3@5.1.7', 'express@4.21.2',
        'ejs@3.1.10', 'crypto@1.0.1', 'ldrs@1.0.2'
    ];

    const progressBar = new SingleBar({
        format: '[ {bar} ] {percentage}% | {value}/{total} modules installed',
        barCompleteChar: '█',
        barIncompleteChar: '░',
        hideCursor: true
    });

    progressBar.start(modules.length, 0);

    let installedCount = 0;
    let failedModules = [];

    for (const module of modules) {
        try {
            await new Promise((resolve, reject) => {
                exec(`yarn add ${module} > /dev/null 2>&1`, (error, stdout, stderr) => {
                    if (error) {
                        failedModules.push(module);
                        reject(error);
                        return;
                    }
                    installedCount++;
                    progressBar.update(installedCount);
                    resolve();
                });
            });
        } catch {
        }
    }

    progressBar.stop();

    await new Promise((resolve) => {
        setTimeout(() => {
            console.log(chalk.bold.green(`✅ ${installedCount}/${modules.length} modules installed successfully!`));
            if (failedModules.length > 0) {
                console.log(chalk.bold.red(`❌ Failed to install: ${failedModules.join(', ')}`));
            }
            resolve();
        }, 1670);
    });

    console.log('Setting up configuration file...');
    await new Promise((resolve, reject) => {
        fs.writeFile(path.join(__dirname, '..', '..', 'CONFIG.jsonc'), `{
  "global": {
    "name": "CollaborativeVM",
    "dashboard": true, // To integrate the UI dashboard (need the [dash] options to work)
    "authsys": true, // Enable the authentication system, can be useful for account banning
    "useip": true, // Use IPs for many systems, ban, sessions, and even more
    "usemacdevice": true, // Use MAC for many systems, ban, sessions, and auth system
    "wordsblacklist": "blacklists/words", // Only works with .list file
    "nameblacklist": "blacklists/names", // Only works with .list file
    "passwordblacklist": "blacklists/passwords" // Only works with .list file
  },
  "server": {
    "listen": 3000 // Port that the server will listen to work (3000 is the most used for port webserver)
  },
  "generic": {
    "rules": { // The rule name is the key and the value is the rule
      "Rule as example": "This is an example rule",
      "Rule as example 2": "This is another example rule"
    }
  },
  "links": {
    "reddit": "/r/example", // A subreddit (r) or a user (u)
    "discord": "example", // Discord invite ID (make sure that the link is permanent)
    "twitter": "example" // X username
  },
  "dash": { // Default password: _password!!
    "password": "I+CaOGevqjvS8/FZqr0Uk9vecFNdKkYgqnUsUVQaI4Hs2MseSjmsNtIU9RdUqTJL5ANouvdz4uW7EtTWkjINvyGhm4gEfTG6MqJvg7D6MW5554Xd9oxhAVb/5L/v7IkMA9WgIC7Fxiy/YwWa2KE+WQEAsldvK/rH57U5xguaEK5OZpCIDyB+Fxw3JX2EkOG0IiM0se6r/6TNpuqsNnIB2ZIW3QwfZdiLtOYhJSQK05VmvsGzQg6BB30eTPwxyPeA5ZUodaBeY6RCTCWWE9BjexTScmT+nh4cGuD/+kEBTvToqjrLGHymsj8oG4NP4Dcnbj+H7GbmM83syAlCqn2fRA==",
    "disableConfig": ["#global", "bots:needaccount", "#_auth"], // Blacklist some configurator option
    "whitelistIp": ["127.0.0.1", "123.456.789.01"]
  },
  "users": {
    "maxsessions": 2, // The maximum sessions of a single IP (Need to enable useip or usemacdevice)
    "allowvpn": false, // Allow users that have a VPN
    "accountban": true, // Only works and available if you enable account system
    "deviceban": true, // Enable the device ban (if you put the banDevice permission this won't works)
    "ipban": true // Enable the IP ban (same as deviceban but for banIp)
  },
  "roles.perms": {
    "id": [], // Available: bypassturn, infiniteturn, restartqemu, restart, reset, instantvote, clearQueue, kick, banIp, banDevice, banAccount (only if auth system is enabled), htmlMessage, clearChat
    "admin": "*",
    "mod": ["bypassturn", "restart", "instantvote", "clearQueue", "kick", "banIp", "banDevice", "banAccount", "htmlMessage", "clearChat"],
    "help": ["restart", "clearQueue", "clearChat"]
  },
  "roles.list": {
    "id": [
      "Name", "#0f0f0f", "encrypted_password", 
      "namepass!", 
      ["username1", "username2", "username3", "..."]
    ], /* Default password: _password!! */
    "admin": ["Administrator", "#e00b0b", "I+CaOGevqjvS8/FZqr0Uk9vecFNdKkYgqnUsUVQaI4Hs2MseSjmsNtIU9RdUqTJL5ANouvdz4uW7EtTWkjINvyGhm4gEfTG6MqJvg7D6MW5554Xd9oxhAVb/5L/v7IkMA9WgIC7Fxiy/YwWa2KE+WQEAsldvK/rH57U5xguaEK5OZpCIDyB+Fxw3JX2EkOG0IiM0se6r/6TNpuqsNnIB2ZIW3QwfZdiLtOYhJSQK05VmvsGzQg6BB30eTPwxyPeA5ZUodaBeY6RCTCWWE9BjexTScmT+nh4cGuD/+kEBTvToqjrLGHymsj8oG4NP4Dcnbj+H7GbmM83syAlCqn2fRA==", "admin"],
    "mod": ["Moderator", "#23d91b", "I+CaOGevqjvS8/FZqr0Uk9vecFNdKkYgqnUsUVQaI4Hs2MseSjmsNtIU9RdUqTJL5ANouvdz4uW7EtTWkjINvyGhm4gEfTG6MqJvg7D6MW5554Xd9oxhAVb/5L/v7IkMA9WgIC7Fxiy/YwWa2KE+WQEAsldvK/rH57U5xguaEK5OZpCIDyB+Fxw3JX2EkOG0IiM0se6r/6TNpuqsNnIB2ZIW3QwfZdiLtOYhJSQK05VmvsGzQg6BB30eTPwxyPeA5ZUodaBeY6RCTCWWE9BjexTScmT+nh4cGuD/+kEBTvToqjrLGHymsj8oG4NP4Dcnbj+H7GbmM83syAlCqn2fRA==", "mod"],
    "help": ["Helper", "#24d2f0", "I+CaOGevqjvS8/FZqr0Uk9vecFNdKkYgqnUsUVQaI4Hs2MseSjmsNtIU9RdUqTJL5ANouvdz4uW7EtTWkjINvyGhm4gEfTG6MqJvg7D6MW5554Xd9oxhAVb/5L/v7IkMA9WgIC7Fxiy/YwWa2KE+WQEAsldvK/rH57U5xguaEK5OZpCIDyB+Fxw3JX2EkOG0IiM0se6r/6TNpuqsNnIB2ZIW3QwfZdiLtOYhJSQK05VmvsGzQg6BB30eTPwxyPeA5ZUodaBeY6RCTCWWE9BjexTScmT+nh4cGuD/+kEBTvToqjrLGHymsj8oG4NP4Dcnbj+H7GbmM83syAlCqn2fRA==", "helper"]
  },
  "bots": {
    "allow": true, // Allow bots in your VMs
    "needaccount": false, // Bots need to use auth system, keep it to false if auth is disabled
    "allowedperms": [] // Allow some permissions to bots
  },
  "_auth": {
    "passwordlength": [8, 20], // Define the minimum and maximum length of a password
    "namelength": [4, 15] // Define the minimum and maximum length of a username
  },
  "vms.qemu": { // QEMU is the only option, so keep it or you will be unable to run the whole server
    "namevm0": {
      "vm": [
        "system-x86_64", // the QEMU type to use
        true, // Enable KVM
        "", // Extra/Advanced QEMU options
        "1500M", // RAM amount
        "namevm0.img", // Drive path (any format)
        "qcow2", // Drive format
        false, // The ISO path. To don't select an ISO, set it to false
        "2", // Cores amount (Using host CPU cores)
        false, // Enable network (available: false, true, "none" - none is false)
        false, // Display system (we recommend to disable, available: dbus, spice-app, egl-headless, curses, sdl, gtk, false - false is for hide the qemu window)
        "std", // VGA display system (we recommend virtio, available: qxl, std, virtio)
        false, // Enable/Disable snapshots
        5901 // The VNC port of the VM (required)
      ],
      "display": {
        "thumbnail": ["track"], // The thumbnail of the VM (available: track - track means that the thumbnail will take the screen of the VM, path like /thumbs/namevm0.png all images registered on images folder, none)
        "name": "VM0", // The name of the VM
        "description": "This is the example VM", // The description of the VM (a few HTML tags are functional)
        "tags": ["nsfw", "example", "no-internet", "no-audio", "no-chat"] // The tags on the VM (available: nsfw, example, no-internet, no-audio, anyos, no-chat, no-mouse, no-keyboard)
      },
      "turnTimeLimit": 20, // The time for the next user to have the turn (in seconds)
      "enableChatSys": true, // Enable/Disable the chatting system
      "cursorIdWhenHoverScreen": "url(\\"/cursors/vm.gif\\"), auto !important" // The cursor ID when hover the VM screen
    }
  }
}`, { encoding: 'utf-8' }, (err) => {
        if (err) {
            console.error(chalk.red(`File writing failed, code ${err.code}: ${err.message}`));
            mainMenu();
            reject();
        } else {
            resolve();
        }
    });
});
}

async function modifyConfig() {
    console.log('\n             🛠️ Launching nano...\n');

    await new Promise(async (resolve, reject) => {
        await execSync(`cd ../../.. && nano CONFIG.jsonc`, (error, stdout, stderr) => {
            if (error) {
                console.error(chalk.red(`Error when executing shell command, code ${error.code}: ${error.message}`));
                mainMenu();
                reject();
            } else if (stderr) {
                console.error(chalk.red(`Error while launching nano: ${stderr}`));
                mainMenu();
                reject();
            } else {}
        });
        resolve();
    });

    mainMenu();
}

init('Initializing the launcher menu.', 43);
