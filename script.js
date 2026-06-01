// DOM Elements
const settingsSection = document.getElementById('settings')
const displaySection = document.getElementById('display')
const currentPhaseEl = document.getElementById('current-phase')
const timerDisplayEl = document.getElementById('timer-display')
const remainingRepsEl = document.getElementById('remaining-reps')
const totalRepsEl = document.getElementById('total-reps')
const totalTimeEl = document.getElementById('total-time')

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
    if (audioCtx.state === 'suspended') {
        audioCtx.resume()
    }
}

function playTone(frequency = 440, duration = 0.2, type = 'sine', volume = 0.5) {
    if (!audioCtx) return
    const oscillator = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime)

    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration)

    oscillator.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    oscillator.start()
    oscillator.stop(audioCtx.currentTime + duration)
}

function playStartPhase() {
    // Energetic double beep
    playTone(660, 0.15, 'square', 0.6)
    setTimeout(() => playTone(880, 0.2, 'square', 0.6), 200)
}

function playPausePhase() {
    // Calm low tone
    playTone(330, 0.4, 'sine', 0.6)
}

function playTick() {
    // Short click for last seconds
    playTone(880, 0.05, 'triangle', 0.4)
}

function playGong() {
    if (!audioCtx) return
    // Rich multiple frequency gong
    ;[200, 300, 450, 600].forEach(freq => {
        playTone(freq, 2.0, 'triangle', 0.7)
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
let animFrameId = null
let state = 'IDLE' // IDLE, PREP, PHASE1, PAUSE, PHASE2, FINISHED

// Time tracking
let phaseEndTime = 0
let workoutStartTime = 0
let totalPausedTime = 0
let pauseStartTime = 0

let currentPhaseDuration = 0 // in seconds
let lastTickSecond = -1
let lastTotalTimeSecond = -1

let currentReps = 0
let totalReps = 0

function getVal(input) {
    const v = parseInt(input.value)
    return isNaN(v) ? 0 : v
}

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

function updateDisplay(secondsLeft) {
    if (secondsLeft !== lastTickSecond) {
        timerDisplayEl.textContent = formatTime(secondsLeft)
        lastTickSecond = secondsLeft
        
        // Pulse animation for active timer
        if (state !== 'IDLE' && state !== 'FINISHED' && state !== 'PAUSED') {
            timerDisplayEl.classList.remove('pulse-anim')
            // trigger reflow
            void timerDisplayEl.offsetWidth
            timerDisplayEl.classList.add('pulse-anim')
        } else {
            timerDisplayEl.classList.remove('pulse-anim')
        }
    }

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

function setPhase(newState, durationSec) {
    state = newState
    currentPhaseDuration = durationSec
    phaseEndTime = Date.now() + durationSec * 1000
    
    // Play sound based on phase
    if (state === 'PHASE1' || state === 'PHASE2') {
        playStartPhase()
    } else if (state === 'PAUSE') {
        playPausePhase()
    } else if (state === 'PREP') {
        playTone(440, 0.3, 'sine', 0.5)
    }
    
    updateDisplay(durationSec)
}

function nextPhase() {
    const p1 = getVal(phase1Input)
    const p2 = getVal(phase2Input)
    const pause = getVal(pauseInput)

    if (state === 'PREP') {
        setPhase('PHASE1', p1)
    } else if (state === 'PHASE1') {
        setPhase('PAUSE', pause)
    } else if (state === 'PAUSE') {
        setPhase('PHASE2', p2)
    } else if (state === 'PHASE2') {
        currentReps--
        if (currentReps > 0) {
            setPhase('PHASE1', p1)
        } else {
            state = 'FINISHED'
            stopTimerInternal()
            playGong()
            showControls('FINISHED')
            updateDisplay(0)
            timerDisplayEl.classList.remove('pulse-anim')
            return
        }
    }

    // Skip empty phases automatically
    if (currentPhaseDuration === 0 && state !== 'FINISHED') {
        nextPhase()
    }
}

function tick() {
    if (state === 'PAUSED' || state === 'IDLE') return

    const now = Date.now()

    if (state !== 'FINISHED') {
        let timeLeftMs = phaseEndTime - now
        if (timeLeftMs <= 0) {
            nextPhase()
        } else {
            let secondsLeft = Math.ceil(timeLeftMs / 1000)
            updateDisplay(secondsLeft)
        }
    }

    if (state !== 'IDLE' && state !== 'FINISHED' && state !== 'PAUSED') {
        animFrameId = requestAnimationFrame(tick)
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
    
    workoutStartTime = Date.now()
    totalPausedTime = 0
    lastTotalTimeSecond = -1
    
    // Вычисляем общее время и время под нагрузкой
    const totalDuration = prep + (p1 + pause + p2) * totalReps
    const tensionDuration = (p1 + p2) * totalReps
    totalTimeEl.textContent = `${formatTime(totalDuration)} (под нагрузкой: ${formatTime(tensionDuration)})`

    if (prep > 0) {
        setPhase('PREP', prep)
    } else {
        setPhase('PHASE1', p1)
    }

    if (currentPhaseDuration === 0 && state !== 'FINISHED') {
        nextPhase()
    }

    settingsSection.classList.add('hidden')
    displaySection.classList.remove('hidden')
    showControls('RUNNING')

    animFrameId = requestAnimationFrame(tick)
}

function pauseTimer() {
    state = 'PAUSED'
    pauseStartTime = Date.now()
    cancelAnimationFrame(animFrameId)
    timerDisplayEl.classList.remove('pulse-anim')
    showControls('PAUSED')
}

function resumeTimer() {
    initAudio()
    
    const now = Date.now()
    const pauseDuration = now - pauseStartTime
    totalPausedTime += pauseDuration
    phaseEndTime += pauseDuration
    
    // Resume current phase
    state = currentPhaseEl.className.includes('prep') ? 'PREP' : 
            currentPhaseEl.className.includes('1') ? 'PHASE1' : 
            currentPhaseEl.className.includes('pause') ? 'PAUSE' : 'PHASE2'
            
    showControls('RUNNING')
    animFrameId = requestAnimationFrame(tick)
}

function stopTimerInternal() {
    cancelAnimationFrame(animFrameId)
    timerDisplayEl.classList.remove('pulse-anim')
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
stopBtn.addEventListener('click', stopTimer)

allInputs.forEach(input => {
    input.addEventListener('input', saveSettings)
})

// Initialize
loadSettings()
