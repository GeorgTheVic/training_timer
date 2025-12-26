document.addEventListener('DOMContentLoaded', function() {
    // Получаем элементы DOM по ID
    const timerForm = document.querySelector('.timer');
    const timerButton = document.getElementById('timer_button');
    const getReadyInput = document.getElementById('get_ready');
    const firstPhaseInput = document.getElementById('first_phaze');
    const secondPhaseInput = document.getElementById('second_phaze'); // Теперь по ID
    const repsInput = document.getElementById('reps');
    const totalTimeInput = document.querySelector('input[type="time"]');

    // Создаем элемент для отображения текущего времени
    const timeDisplay = document.createElement('div');
    timeDisplay.className = 'timer__display';
    timeDisplay.style.cssText = `
        font-size: 48px;
        text-align: center;
        margin: 20px 0;
        font-weight: bold;
        color: #333;
    `;

    // Создаем элемент для отображения текущего этапа
    const phaseDisplay = document.createElement('div');
    phaseDisplay.className = 'timer__phase';
    phaseDisplay.style.cssText = `
        font-size: 24px;
        text-align: center;
        margin: 10px 0;
        color: #666;
    `;

    // Вставляем отображение таймера в форму
    const firstTimerRow = document.querySelector('.timer__row');
    timerForm.insertBefore(phaseDisplay, firstTimerRow);
    timerForm.insertBefore(timeDisplay, firstTimerRow);

    // Переменные для управления таймером
    let timerInterval = null;
    let isRunning = false;
    let currentPhase = 'idle'; // 'preparation', 'phase1', 'phase2'
    let remainingTime = 0;
    let currentRep = 1;
    let totalReps = 1;

    // Функция для проигрывания гонга
    function playGong() {
        try {
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(context.destination);

            oscillator.frequency.setValueAtTime(800, context.currentTime);
            oscillator.frequency.setValueAtTime(600, context.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0.5, context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);

            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + 0.5);
        } catch (e) {
            console.log("Гонг!");
        }
    }

    // Функция для расчета общего времени
    function calculateTotalTime() {
        const getReady = parseInt(getReadyInput.value) || 0;
        const phase1 = parseInt(firstPhaseInput.value) || 0;
        const phase2 = parseInt(secondPhaseInput.value) || 0;
        const reps = parseInt(repsInput.value) || 1;

        const totalSeconds = getReady + (phase1 + phase2) * reps;

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Обновляем общее время при изменении значений
    [getReadyInput, firstPhaseInput, secondPhaseInput, repsInput].forEach(input => {
        input.addEventListener('input', function() {
            totalTimeInput.value = calculateTotalTime();
        });
    });

    // Инициализируем общее время
    totalTimeInput.value = calculateTotalTime();

    // Функция для обновления отображения таймера
    function updateDisplay(time, phaseText) {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        phaseDisplay.textContent = phaseText;

        // Изменяем цвет в зависимости от фазы
        switch(currentPhase) {
            case 'preparation':
                timeDisplay.style.color = '#3498db';
                phaseDisplay.style.color = '#3498db';
                break;
            case 'phase1':
                timeDisplay.style.color = '#2ecc71';
                phaseDisplay.style.color = '#2ecc71';
                break;
            case 'phase2':
                timeDisplay.style.color = '#e74c3c';
                phaseDisplay.style.color = '#e74c3c';
                break;
            default:
                timeDisplay.style.color = '#333';
                phaseDisplay.style.color = '#666';
        }
    }

    // Функция для перехода к следующей фазе
    function nextPhase() {
        playGong(); // Проигрываем гонг при смене фазы

        switch(currentPhase) {
            case 'preparation':
                currentPhase = 'phase1';
                remainingTime = parseInt(firstPhaseInput.value) || 0;
                updateDisplay(remainingTime, `Фаза 1 - Повторение ${currentRep}/${totalReps}`);
                break;

            case 'phase1':
                currentPhase = 'phase2';
                remainingTime = parseInt(secondPhaseInput.value) || 0;
                updateDisplay(remainingTime, `Фаза 2 - Повторение ${currentRep}/${totalReps}`);
                break;

            case 'phase2':
                if (currentRep < totalReps) {
                    currentRep++;
                    currentPhase = 'phase1';
                    remainingTime = parseInt(firstPhaseInput.value) || 0;
                    updateDisplay(remainingTime, `Фаза 1 - Повторение ${currentRep}/${totalReps}`);
                } else {
                    // Все повторения завершены
                    stopTimer();
                    updateDisplay(0, 'Тренировка завершена!');
                    timerButton.textContent = 'Начать заново';
                    return;
                }
                break;

            default:
                // Начинаем с подготовки
                currentPhase = 'preparation';
                currentRep = 1;
                remainingTime = parseInt(getReadyInput.value) || 0;
                updateDisplay(remainingTime, 'Подготовка');
                break;
        }
    }

    // Функция для запуска таймера
    function startTimer() {
        if (isRunning) return;

        isRunning = true;
        timerButton.textContent = 'Стоп';

        totalReps = parseInt(repsInput.value) || 1;
        currentRep = 1;

        // Начинаем с фазы подготовки
        currentPhase = 'preparation';
        remainingTime = parseInt(getReadyInput.value) || 0;
        updateDisplay(remainingTime, 'Подготовка');

        // Запускаем интервал таймера
        timerInterval = setInterval(function() {
            if (remainingTime > 0) {
                remainingTime--;
                updateDisplay(remainingTime, phaseDisplay.textContent);
            } else {
                nextPhase();
            }
        }, 1000);
    }

    // Функция для остановки таймера
    function stopTimer() {
        if (!isRunning) return;

        isRunning = false;
        clearInterval(timerInterval);
        timerButton.textContent = 'Старт';
        currentPhase = 'idle';
    }

    // Функция для сброса таймера
    function resetTimer() {
        stopTimer();
        currentRep = 1;
        updateDisplay(parseInt(getReadyInput.value) || 0, 'Готов к тренировке');
        timerButton.textContent = 'Старт';
    }

    // Обработчик клика по кнопке
    timerButton.addEventListener('click', function(e) {
        e.preventDefault();

        if (isRunning) {
            stopTimer();
        } else {
            if (timerButton.textContent === 'Начать заново') {
                resetTimer();
                timerButton.textContent = 'Старт';
            } else {
                startTimer();
            }
        }
    });

    // Обработчик отправки формы
    timerForm.addEventListener('submit', function(e) {
        e.preventDefault();

        if (isRunning) {
            stopTimer();
        } else {
            if (timerButton.textContent === 'Начать заново') {
                resetTimer();
                timerButton.textContent = 'Старт';
            } else {
                startTimer();
            }
        }
    });

    // Инициализируем отображение
    updateDisplay(parseInt(getReadyInput.value) || 0, 'Готов к тренировке');
});
