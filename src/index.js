'use strict'

const Http = require('http')
const path = require('path')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationURL } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = Http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    socket.on('join', (chatInfo, callback) => {
        const { error, user } = addUser({ id: socket.id, ...chatInfo })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('message', generateMessage(`Hello ${chatInfo.username}! Welcome to the ${user.room} chat room.`))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${chatInfo.username} has just joined our chat.`))
        io.to(user.room).emit('roomInfo', { room: user.room, users: getUsersInRoom(user.room) })
        callback()
    })

    socket.on('clientMessage', (clientMessage, callback) => {
        const { username, room } = getUser(socket.id)
        const filter = new Filter()

        if (filter.isProfane(clientMessage)) {
            return callback('Profanity is not allowed!')
        }
        
        io.to(room).emit('message', generateMessage(clientMessage, username))
        callback()
    })

    socket.on('location', ({ latitude, longitude }, callback) => {
        const { username, room } = getUser(socket.id)
        io.to(room).emit('location', generateLocationURL(`https://google.com/maps?q=${latitude},${longitude}`, username))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (!user) {
            return
        }

        io.to(user.room).emit('message', generateMessage(`${user.username} has just left us! :(`))
        io.to(user.room).emit('roomInfo', { room: user.room, users: getUsersInRoom(user.room) })
    })
})

server.listen(port, () => {
    console.log(`Server is up and running on port: ${port}`)
})