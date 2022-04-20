import { Server, Socket } from 'socket.io'

export const sockets: Socket[] = []
export const startSocketioServer = () => {
    console.log('[Socket] Start Server')
    const io = new Server(3000)

    io.on('connection', (socket: Socket) => {
        console.log(`[Socket] "${socket.id}" connected`)
        sockets.push(socket)
        socket.on('disconnect', () => {
            console.log(`[Socket] "${socket.id}" disconnect`)
            const index = sockets.indexOf(socket)
            sockets.splice(index, 1)
        })
    })
}
