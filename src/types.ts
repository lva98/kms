import {Socket} from "socket.io";

export interface ElectSchedulerStrategy {
    execute (Sockets: Socket[]): Socket;
}

export class RoundRobinStrategy implements ElectSchedulerStrategy {
    private lastIndex: number;

    public constructor () {
        this.lastIndex = 0
    }

    public execute(sockets: Socket[]): Socket {
        const index = ++this.lastIndex % sockets.length
        this.lastIndex = index
        return sockets[index]
    }
}

export class RandomStrategy implements ElectSchedulerStrategy {
    public execute(sockets: Socket[]): Socket {
        const index = Math.round(Math.random() * sockets.length)
        return sockets[index]
    }
}

export enum Strategies {
    RandomStrategy = 'RS',
    RoundRobinStrategy = 'RRS'
}
