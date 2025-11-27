document.addEventListener('DOMContentLoaded', function () {
    const get_ready = document.querySelector('#get__ready'),
        button_go = document.querySelector('.timer__button')

    function getTime(field) {
        const lastTwoChars = +field.value.slice(-2)

        return lastTwoChars
    }

    function setTime(digits) {

        get_ready.value = `00:0${digits}`

        console.log('Time is over')

    }

    function timer(time) {
        const intervalID = setInterval(() => {

            time--

            if (time === 0) {
                clearInterval(intervalID)
            }

            setTime(time)
        }, 1000)
    }


    button_go.addEventListener('click', function (event) {
        event.preventDefault()

        timer(getTime(get_ready))

    })
})
