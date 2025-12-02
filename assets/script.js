// loading site content
document.addEventListener('DOMContentLoaded', function () {
    // variables
    const get_ready = document.querySelector('#get_ready'),
        first_phaze = document.querySelector('#first_phaze'),
        button_go = document.querySelector('#timer_button'),
        reps = document.querySelector('#timer_button')

    let timeStop = true

    // functions

    // set time numbers
    function timer(field) {
        let time = field.value
        timeStop = false

        let minutes = time.slice(0, 2),
            seconds = time.slice(3, 5)

        console.log(minutes, seconds)

        const intervalID = setInterval(() => {

            time--

            if (time === 0) {
                clearInterval(intervalID)

                timeStop = true

                field.value = `${minutes}:${seconds}`

                return timeStop
            }

            field.value = `${minutes}:${seconds}`
        }, 1000)
    }

    // launch timers from pushing button
    button_go.addEventListener('click', function (event) {
        event.preventDefault()

        timer(get_ready)
    })
})
