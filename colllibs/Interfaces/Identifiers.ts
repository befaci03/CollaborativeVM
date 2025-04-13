import crypto from 'crypto';

export interface UserAuth {
    username: string;
    email: string;
    password: crypto.Hash | string;
    rank: Int16Array;
    createdAt: Date;
}
export interface User {
    username: string;
    rank: Int16Array;
}

export interface VM {
    id: string;
    name: string;
    owner: string|null;
    description: string|null;
    tags: string[];
}

export interface Rank {
    id: string;
    name: string;
    password: crypto.Hash | string;
    permissions: string[];
}
export interface Permission {
    id: string;
    name: string;
    description: string;
    ranks: string[];
}

export interface ActionsID {
    connect: "TW1ka1MwWjFjWGczUkZOaFl6WnpNbU09";
    user: "U0c1VlRXcE5kWEYyTVVFPQ";
    dis: "TTBweGMyOTM";
    set: "TTFrMFoxazM";
    turn: "U0cxelJ6TjRabVo2VFRJPQ";
    get: "TTBwcGJ6RXg";
    ip: "TTFaTFUyZE0";
    data: "Unpad1EwdG1TbEZHV0VvPQ";
    vm: "TTFwMFUweDA";
    rank: "U0dSYWJYRnVZM3BXUVVNPQ";
    permission: "UkVjelZHOVdSVmRGWlhST2FWbDFha2d5Wm5KRVlRPT0";
    status: "U0dKT1VIWlNkRWRsYzJvPQ";
    message: "TW5Ka2NsSmxWbFpOZUZkUVRrZHlaRUU9";
    send: "U0dKTVJWUlpkVzlGWVZrPQ";
    request: "TW5Od2JtMXRkSGRaUW5OT1J6UlNOR2M9";
    xss: "TTJKQk16ZEc";
    control: "TW1ka1MwWjFja2MzT0dwcmRERkdhR1U9";
    qemu: "U0dOcVdrVmxUbXRhWkc0PQ";
    command: "TW1ka1MwWjFOemRyV0UxMVRsTlNWVGc9";
    vote: "U0c5SFRFWk1Wa05yVTNBPQ";
    reset: "U0dSYWRYQlVkMHhEZDFjPQ";
    reboot: "U0dSYWRXNVpkSGREWlRNPQ";
    clear: "Um5aTGIwVlVhVTVCU0RJPQ";
    queue: "U0dOdGEyaGpWMDEwVFhvPQ";
    list: "U0ZOU2RWWjZlSEZwWjB3PQ";
    online: "U0ZKa1NERlJWRU15WVZBPQ";
    ghost: "UnpZeVRFcElVMWxtT0djPQ";
    auth: "Um5kdE1sTnRZM2hqY25BPQ";
}
export interface Actions {
    connectVm: `${ActionsID["connect"]}${ActionsID["vm"]}`;
    disconnectVm: `${ActionsID["dis"]}${ActionsID["connect"]}${ActionsID["vm"]}`;
    setUser: `${ActionsID["set"]}${ActionsID["user"]}`;
    getUser: `${ActionsID["get"]}${ActionsID["user"]}`;
    setVm: `${ActionsID["set"]}${ActionsID["vm"]}`;
    getVm: `${ActionsID["get"]}${ActionsID["vm"]}`;
    setRank: `${ActionsID["set"]}${ActionsID["rank"]}`;
    getRank: `${ActionsID["get"]}${ActionsID["rank"]}`;
    setPermission: `${ActionsID["set"]}${ActionsID["permission"]}`;
    getPermission: `${ActionsID["get"]}${ActionsID["permission"]}`;
    setStatus: `${ActionsID["set"]}${ActionsID["status"]}`;
    getStatus: `${ActionsID["get"]}${ActionsID["status"]}`;
    sendMessage: `${ActionsID["send"]}${ActionsID["message"]}`;
    getData: `${ActionsID["get"]}${ActionsID["data"]}`;
    setControl: `${ActionsID["set"]}${ActionsID["control"]}`;
    qemuCommand: `${ActionsID["qemu"]}${ActionsID["command"]}`;
    voteReset: `${ActionsID["vote"]}${ActionsID["reset"]}`;
    voteReboot: `${ActionsID["vote"]}${ActionsID["reboot"]}`;
    clearQueue: `${ActionsID["clear"]}${ActionsID["queue"]}`;
    listOnline: `${ActionsID["list"]}${ActionsID["online"]}`;
    authUser: `${ActionsID["auth"]}${ActionsID["user"]}`;
}
