const get_ready = document.querySelector('#get__ready'),
    button_go = document.querySelector('.timer__button')


function timer(time) {
    const intervalID = setInterval(() => {
        console.log(`Count: ${time--}`)
        if (time === 0) {
            clearInterval(intervalID)

            console.log('Time is over')
        }
    }, 1000)
}


button_go.addEventListener('click', function (event) {
    event.preventDefault()

    let get_ready_value = +get_ready.value

    timer(get_ready_value)

})
