'use strict'

const generateMessage = (text, username = 'Host') => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocationURL = (url, username) => {
    return {
        username,
        url,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationURL
}