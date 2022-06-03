const $messages = document.querySelector('#messages')

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild

    // Calculate new message height
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Check if autoscroll should be applied
    if ($messages.scrollHeight - newMessageHeight <= $messages.scrollTop + $messages.offsetHeight) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

export { autoscroll as default }