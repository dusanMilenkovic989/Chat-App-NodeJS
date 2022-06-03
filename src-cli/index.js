import io from 'socket.io-client'
import Qs from 'qs'
import Mustache from 'mustache'
import moment from 'moment'
import autoscroll from './autoscroll'

const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $roomInfo = document.querySelector('#sidebar')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const chatInfo = Qs.parse(location.search, { ignoreQueryPrefix: true })

socket.on('message', ({ username, text, createdAt }) => {
    const html = Mustache.render(messageTemplate, {
        username,
        text,
        createdAt: moment(createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('location', ({ username, url, createdAt }) => {
    const html = Mustache.render(locationTemplate, {
        username,
        url,
        createdAt: moment(createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomInfo', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, { room, users })
    $roomInfo.innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const message = e.target.elements.message.value
    const checkContent = message.trim()

    if (typeof message === 'string' && checkContent.length > 0) {
        $messageFormButton.setAttribute('disabled', 'disabled')

        socket.emit('clientMessage', message, (restriction) => {
            $messageFormButton.removeAttribute('disabled')
            $messageFormInput.value = ''

            if (restriction) {
                return console.log(restriction)
            }
            
            console.log('Delivered!')
        })
    }

    $messageFormInput.focus()
})

$sendLocationButton.addEventListener('click', (e) => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('location', {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')
        })
    })
})

socket.emit('join', chatInfo, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})