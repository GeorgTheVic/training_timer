// loading site content
document.addEventListener('DOMContentLoaded', function () {
    // variables
    const get_ready = document.querySelector('#get_ready'),
        first_phaze = document.querySelector('#first_phaze'),
        button_go = document.querySelector('#timer_button'),
        reps = document.querySelector('#timer_button')
    ring = new Audio('assets/gong.MP3')

    let timeStop = false
    // minToStr,
    // secToStr

    // get_ready_value = +get_ready.value

    // functions

    // set time numbers
    // function timer(field) {
    //     let time = field.value
    //     timeStop = false

    //     let minutes = time.slice(0, 2),
    //         seconds = time.slice(3, 5)

    //     const intervalID = setInterval(() => {

    //         while (seconds > 0) {
    //             seconds--

    //             minToStr = minutes.toString().padStart(2, '0'),
    //                 secToStr = seconds.toString().padStart(2, '0')

    //             if (time === 0) {
    //                 clearInterval(intervalID)

    //                 timeStop = true

    //                 field.value = `${minToStr}:${secToStr}`

    //                 return timeStop
    //             }
    //         }

    //         minutes--


    //         field.value = `${minToStr}:${secToStr}`
    //     }, 1000)
    // }

    // // launch timers from pushing button
    // button_go.addEventListener('click', function (event) {
    //     event.preventDefault()

    //     const endTime = '10:22'

    //     timer(get_ready)
    // })

    // !
    function setTimer(field, callback) {
        let time = +field.value

        const intervalID = setInterval(() =>{
            time--

            field.value = time

            if (time === 0) {
                clearInterval(intervalID)
                console.log('time is over')
                ring.play()
            }
        })
    }
    // !



    function startTimer(field, nextTimer) {
        let time = +field.value

        const intervalID = setInterval(() => {

            time--

            field.value = time

            if (time === 0) {
                clearInterval(intervalID)
                console.log('time is over')
                ring.play()

                startTimer(nextTimer)
            }

        }, 1000)
    }

    button_go.addEventListener('click', function (event) {
        event.preventDefault()

        startTimer(get_ready, () => {
            startTimer(none, first_phaze)
        })

        console.log('pushed')
    })
})
