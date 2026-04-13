// DOM Elements
const settingsSection = document.getElementById('settings')
const displaySection = document.getElementById('display')
const currentPhaseEl = document.getElementById('current-phase')
const timerDisplayEl = document.getElementById('timer-display')
const remainingRepsEl = document.getElementById('remaining-reps')
const totalRepsEl = document.getElementById('total-reps')

const repsInput = document.getElementById('reps')
const prepInput = document.getElementById('prepTime')
const phase1Input = document.getElementById('phase1Time')
const pauseInput = document.getElementById('pauseTime')
const phase2Input = document.getElementById('phase2Time')

const allInputs = [repsInput, prepInput, phase1Input, pauseInput, phase2Input]

const startBtn = document.getElementById('startBtn')
const pauseBtn = document.getElementById('pauseBtn')
const resumeBtn = document.getElementById('resumeBtn')
const restartBtn = document.getElementById('restartBtn')
const menuBtn = document.getElementById('menuBtn')
const stopBtn = document.getElementById('stopBtn')

// Audio Context for signals
let audioCtx

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    }
}

function playBeep(frequency = 440, duration = 0.2, type = 'sine') {
    if (!audioCtx) return
    const oscillator = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime)

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration)

    oscillator.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    oscillator.start()
    oscillator.stop(audioCtx.currentTime + duration)
}

function playGong() {
    if (!audioCtx) return
    // Simple gong approximation using multiple frequencies
    ;[200, 300, 450].forEach(freq => {
        playBeep(freq, 1.5, 'triangle')
    })
}

// Storage Logic
function saveSettings() {
    const settings = {
        prep: prepInput.value,
        p1: phase1Input.value,
        pause: pauseInput.value,
        p2: phase2Input.value,
        reps: repsInput.value
    }
    localStorage.setItem('workoutSettings', JSON.stringify(settings))
}

function loadSettings() {
    const saved = localStorage.getItem('workoutSettings')
    if (saved) {
        const settings = JSON.parse(saved)
        prepInput.value = settings.prep || ''
        phase1Input.value = settings.p1 || ''
        pauseInput.value = settings.pause || ''
        phase2Input.value = settings.p2 || ''
        repsInput.value = settings.reps || ''
    }
}

// Timer Logic
let timerId = null
let state = 'IDLE' // IDLE, PREP, PHASE1, PAUSE, PHASE2, FINISHED
let timeLeft = 0
let currentReps = 0
let totalReps = 0

function getVal(input) {
    const v = parseInt(input.value)
    return isNaN(v) ? 0 : v
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    timerDisplayEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

    // Show current round: Total - Remaining + 1
    const currentRound = totalReps - currentReps + (state === 'FINISHED' ? 0 : 1)
    remainingRepsEl.textContent = Math.min(currentRound, totalReps)
    totalRepsEl.textContent = totalReps

    // Update Phase Styling
    currentPhaseEl.className = ''
    switch(state) {
        case 'PREP':
            currentPhaseEl.textContent = 'Подготовка'
            currentPhaseEl.classList.add('phase-prep')
            break
        case 'PHASE1':
            currentPhaseEl.textContent = 'Фаза 1'
            currentPhaseEl.classList.add('phase-1')
            break
        case 'PAUSE':
            currentPhaseEl.textContent = 'Пауза'
            currentPhaseEl.classList.add('phase-pause')
            break
        case 'PHASE2':
            currentPhaseEl.textContent = 'Фаза 2'
            currentPhaseEl.classList.add('phase-2')
            break
        case 'FINISHED':
            currentPhaseEl.textContent = 'Завершено!'
            currentPhaseEl.classList.add('phase-finished')
            timerDisplayEl.textContent = '00:00'
            break
    }
}

function nextPhase() {
    const p1 = getVal(phase1Input)
    const p2 = getVal(phase2Input)
    const pause = getVal(pauseInput)

    if (state === 'PREP') {
        playBeep(880, 0.3)
        state = 'PHASE1'
        timeLeft = p1
    } else if (state === 'PHASE1') {
        playBeep(440, 0.2)
        state = 'PAUSE'
        timeLeft = pause
    } else if (state === 'PAUSE') {
        playBeep(440, 0.2)
        state = 'PHASE2'
        timeLeft = p2
    } else if (state === 'PHASE2') {
        currentReps--
        if (currentReps > 0) {
            playBeep(440, 0.2)
            state = 'PHASE1'
            timeLeft = p1
        } else {
            state = 'FINISHED'
            timeLeft = 0
            stopTimerInternal()
            playGong()
            showControls('FINISHED')
            updateDisplay()
            return
        }
    }

    if (timeLeft === 0 && state !== 'FINISHED') {
        nextPhase()
    } else {
        updateDisplay()
    }
}

function tick() {
    if (timeLeft > 0) {
        timeLeft--
        updateDisplay()
        if (timeLeft === 0) {
            nextPhase()
        }
    } else if (state === 'PREP' || state === 'FINISHED') {
         if (timeLeft === 0 && state !== 'FINISHED') nextPhase()
    }
}

function startTimer() {
    initAudio()

    const p1 = getVal(phase1Input)
    const p2 = getVal(phase2Input)
    const pause = getVal(pauseInput)
    const prep = getVal(prepInput)
    const reps = getVal(repsInput)

    if (p1 === 0 && p2 === 0 && pause === 0) {
        alert('Пожалуйста, введите время хотя бы для одной фазы')
        return
    }

    totalReps = reps || 1
    currentReps = totalReps

    if (prep > 0) {
        state = 'PREP'
        timeLeft = prep
    } else {
        state = 'PHASE1'
        timeLeft = p1
    }

    if (timeLeft === 0 && state !== 'FINISHED') {
        nextPhase()
    }

    settingsSection.classList.add('hidden')
    displaySection.classList.remove('hidden')
    showControls('RUNNING')

    updateDisplay()
    timerId = setInterval(tick, 1000)
}

function pauseTimer() {
    clearInterval(timerId)
    showControls('PAUSED')
}

function resumeTimer() {
    timerId = setInterval(tick, 1000)
    showControls('RUNNING')
}

function stopTimerInternal() {
    clearInterval(timerId)
}

function stopTimer() {
    stopTimerInternal()
    state = 'IDLE'
    settingsSection.classList.remove('hidden')
    displaySection.classList.add('hidden')
    showControls('IDLE')
}

function showControls(mode) {
    startBtn.classList.add('hidden')
    pauseBtn.classList.add('hidden')
    resumeBtn.classList.add('hidden')
    restartBtn.classList.add('hidden')
    menuBtn.classList.add('hidden')
    stopBtn.classList.add('hidden')

    switch(mode) {
        case 'IDLE':
            startBtn.classList.remove('hidden')
            break
        case 'RUNNING':
            pauseBtn.classList.remove('hidden')
            stopBtn.classList.remove('hidden')
            break
        case 'PAUSED':
            resumeBtn.classList.remove('hidden')
            stopBtn.classList.remove('hidden')
            break
        case 'FINISHED':
            restartBtn.classList.remove('hidden')
            menuBtn.classList.remove('hidden')
            break
    }
}

// Event Listeners
startBtn.addEventListener('click', startTimer)
pauseBtn.addEventListener('click', pauseTimer)
resumeBtn.addEventListener('click', resumeTimer)
restartBtn.addEventListener('click', startTimer)
menuBtn.addEventListener('click', stopTimer)
stopBtn.addEventListener('click', () => {
    stopTimer()
})

allInputs.forEach(input => {
    input.addEventListener('input', saveSettings)
})

// Initialize
loadSettings()
