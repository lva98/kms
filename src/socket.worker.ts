import { io } from 'socket.io-client'

export const addSchedulerListener = (callback: any) => {
    const socket = io('http://localhost:3000')
    socket.on('scheduler', (...args) => {
        callback(args)
    })
}
