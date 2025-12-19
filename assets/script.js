// loading site content
document.addEventListener('DOMContentLoaded', function () {
    // variables
    const get_ready = document.querySelector('#get_ready'),
        first_phaze = document.querySelector('#first_phaze'),
        button_go = document.querySelector('#timer_button'),
        reps = document.querySelector('#timer_button')

    let timeStop = true,
        minToStr = 0,
        secToStr = 0

    // functions

    // set time numbers
    function timer(field) {
        let time = field.value
        timeStop = false

        let minutes = time.slice(0, 2),
            seconds = time.slice(3, 5)

        console.log(minutes, seconds)

        const intervalID = setInterval(() => {

            minutes--
            seconds--

            minToStr = minutes.toString().padStart(2, '0'),
                secToStr = seconds.toString().padStart(2, '0')

            if (time === 0) {
                clearInterval(intervalID)

                timeStop = true

                field.value = `${minToStr}:${secToStr}`

                return timeStop
            }

            field.value = `${minToStr}:${secToStr}`
        }, 1000)
    }

    // launch timers from pushing button
    button_go.addEventListener('click', function (event) {
        event.preventDefault()

        const endTime = '10:22'

        console.log(parseInt(endTime))

        timer(get_ready)
    })
})
