/*----------------------------------------------------V1 ------------------------------------------------------*/

/*----------------------------------------------------DATA ------------------------------------------------------*/

const SESSION_VERSION = 1;

const session = loadSession();
const sessionHistory = loadHistory();


/*----------------------------------------------Logic--------------------------------------*/
// fastest lap: and keeps best
function getFastestLap(session) {
    let fastestLap = session.laps[0];

    for (const lap of session.laps) {
        if (lap.time < fastestLap.time) {
            fastestLap = lap;
        } 
    }

    return fastestLap;
}

// slowest lap: and keeps worst
function getSlowestLap(session) {
    let slowestLap = session.laps[0];

    for (const lap of session.laps) {
        if ( lap.time > slowestLap.time) {
            slowestLap = lap;
        }
    }

    return slowestLap;
}


// Lap spread: slowest lap - fastest lap
function getLapSpread(session) {
    const fastestLap = getFastestLap(session);
    const slowestLap = getSlowestLap(session);

    return slowestLap.time - fastestLap.time;
}

// Gap to fastest lap time
function getLapDeltas(session) {
    const fastestLap = getFastestLap({ laps: getValidLaps(session.laps) });
    const lapDeltas = [];
    let fastestTime = 0;

    if (fastestLap !== undefined) {
        fastestTime = fastestLap.time;
    }


    for (const lap of session.laps) {
        const delta = lap.time - fastestTime;
        const lapData = {
            lap: lap.lap,
            time: lap.time,
            delta: delta,
            invalid: lap.invalid
        };
        lapDeltas.push(lapData);
    }
    return lapDeltas;
}

function getLastLapData(session) {
    const deltas = getLapDeltas(session);

    if (deltas.length === 0) {
        return null;
    }

    return deltas[deltas.length - 1];
}


function getValidLaps(laps) {
    const validLaps = [];

    for (const lap of laps) {
        if (!lap.invalid) {
            validLaps.push(lap);
        }
    }
    return validLaps; 

}


function getChartData(session) {
    const chartLabels = [];
    const chartTimes = [];
    const chartColors = [];

    for (const lapData of getLapDeltas(session)) {
        chartLabels.push("Lap " + lapData.lap);
        chartTimes.push(lapData.time);

        if (lapData.invalid) {
            chartColors.push("red");
        } else if (lapData.delta === 0) {
            chartColors.push("green");
        } else {
            chartColors.push("black"); 
        }

    }

    return {
        labels: chartLabels,
        times: chartTimes,
        colors: chartColors
    };
}


function addLap(session, time) {
    const newLap = {
        lap: session.laps.length + 1,
        time: time, 
        invalid: false
    };
    session.laps.push(newLap);
}

// Split session into two halves
 function getSessionHalves(session) {
    const half = Math.floor(session.laps.length / 2);
    const firstHalf = session.laps.slice(0, half);
    const secondHalf = session.laps.slice(half);
    return {
        firstHalf: firstHalf,
        secondHalf: secondHalf
    };
}

// Average time of any array of laps ( whole session or half)
function getAverageTime(laps) {
        let total = 0;

    for (const lap of laps) {
        total += lap.time;
    }

    const average = total / laps.length;
    return average;
}

// Pace trend: second half average - first half average
// positive value indicates slowing down, negative value indicates speeding up
function getPaceTrend(session) {
    const { firstHalf, secondHalf } = getSessionHalves(session);
    const firstHalfAverage = getAverageTime(firstHalf);
    const secondHalfAverage = getAverageTime(secondHalf);

    return secondHalfAverage - firstHalfAverage;
}

// Coach note based on pace trend
function getCoachNote(session) {

    if (session.laps.length < 4) {
        return "No pace trend available (not enough laps)";
    }

    const thresholdPercent = 0.01; // 1% threshold
    const averageTime = getAverageTime(session.laps);
    const threshold = averageTime * thresholdPercent;

    const paceTrend = getPaceTrend(session);
    const gap = Math.abs(paceTrend).toFixed(2);

    if (paceTrend > threshold) {
        return "Fading, Second half was " + gap + "s" + " slower than the first half! Focus on your lines and throttle control!";
    } else if (paceTrend < -threshold) {
        return "Chipping away! Second half was " + gap + "s" + " faster! Keep Pushing!";
    } else {
        return "Head down! Flow! " + gap + "s" + " Keep it up!";
    }
    
}

function archiveSession(session, sessionHistory) {
    if (session.laps.length === 0) {
        return; // Only archive if there are laps in the session
    }

    const archivedSession = {
        date: new Date().toLocaleString(),
        track: session.track,
        bike: session.bike,
        rider: session.rider,
        laps: session.laps.slice(), // Create a copy of the laps array
        version: SESSION_VERSION
    };
    sessionHistory.push(archivedSession);
}

function restoreSession(session, pastSession) {
    session.track = pastSession.track;
    session.bike = pastSession.bike;
    session.rider = pastSession.rider;
    session.laps = pastSession.laps.slice();
}

function migrateSession(saved) {
    if(saved.version === undefined) {
        if (saved.bike === undefined) {
            saved.bike = "";
        }
        if (saved.rider === undefined) {
            saved.rider = "";
        }
    saved.version = 1;
    }
        return saved;
}



/*----------------------------------------FORMATTING----------------------------------------*/
// 63.591 -> 1:03.591
function formatLapTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    let remainingSeconds = (seconds % 60).toFixed(3);

    if (remainingSeconds < 10) {
        remainingSeconds = "0" + remainingSeconds;
    }

    return minutes + ":" + remainingSeconds;
    
}

// 8.582 -> +8.58s
function formatGap(seconds) {
    return "+" + seconds.toFixed(2) + "s";
}


function parseLapTime(text) {
    const parts = text.split(":");

    const minutes = Number(parts[0]);
    const seconds = Number(parts[1]);

    const totalSeconds = minutes * 60 + seconds;

    return totalSeconds;
}


/*----------------------------------------STORAGE----------------------------------------*/
function saveSession(session) {
    const sessionJSON = JSON.stringify(session);
    localStorage.setItem("session", sessionJSON);
}

function loadSession() {
    const sessionJSON = localStorage.getItem("session");
    if (sessionJSON) {
        return migrateSession(JSON.parse(sessionJSON));
    }
    return {
        track: "Bakers West SX",
        bike: "",
        rider: "",
        laps: [],
        version: SESSION_VERSION
    };
}

function saveHistory(history) {
    const historyJSON = JSON.stringify(history);
    localStorage.setItem("history", historyJSON);
}

function loadHistory() {
    const historyJSON = localStorage.getItem("history");
    if (historyJSON) {
        const savedHistory = JSON.parse(historyJSON);
        for (const pastSession of savedHistory) {
            migrateSession(pastSession);
        }

        return savedHistory;
    }
    return [];
}

/*----------------------------------------DISPLAY----------------------------------------*/

// stat cards
const fastestTimeElement = document.getElementById("fastest-time");
const slowestTimeElement = document.getElementById("slowest-time");
const averageTimeElement = document.getElementById("average-time");
const spreadTimeElement = document.getElementById("spread-time");
const trackNameElement = document.getElementById("track-name");
const lapCountElement = document.getElementById("lap-count");
const coachNoteElement = document.getElementById("coach-note");
const historySelect = document.getElementById("history-select");
const pitBoardNoteElement = document.getElementById("last-lap-note");
const pitBoardTimeElement = document.getElementById("last-lap-time");



// Lap list
const lapListElement = document.getElementById("lap-list");

// Practice session input
const sessionInputElement = document.getElementById("session-input");
const importSessionButton = document.getElementById("import-session-button");


// Lap trend chart: created once, then updated in updateDisplay
const lapChartElement = document.getElementById("lap-chart");

const lapChart = new Chart(lapChartElement, {
    type: "line",
    data: {
        labels: [],
        datasets: [{
            label: "Lap Time",
            data: [],
            pointBackgroundColor:[],
            pointRadius: 5
        }]
    },
    options: {
        scales: {
            y: {
                ticks: {
                    //Y axis labels: 72.5->1:12.500
                    callback: function (value) {
                        return formatLapTime(value);
                    }
                }
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    // Hover text for each point
                    label: function (context) {
                        const lapData = getLapDeltas(session)[context.dataIndex];
                        const time = formatLapTime(lapData.time);

                        if (lapData.invalid) {
                            return time + " · INVALID";
                        } else if (lapData.delta === 0) {
                            return time + " · BEST";
                        } else {
                            return time + " · " + formatGap(lapData.delta);
                        }
                    }
                }
            }
        }
    }    
});


// Update the display with the current session data
function updateDisplay() {

  // Session INFO
    trackNameElement.textContent = session.track;
    lapCountElement.textContent = session.laps.length;

    const validSession = {
        track: session.track,
        laps: getValidLaps(session.laps)
    };

    if (session.laps.length === 0) {
        lapListElement.innerHTML = "";
        fastestTimeElement.textContent = "--:---";
        slowestTimeElement.textContent = "--:---";
        averageTimeElement.textContent = "--:---";
        spreadTimeElement.textContent = "--:---";
        pitBoardTimeElement.textContent = "--:---";
        pitBoardNoteElement.textContent = "";
        coachNoteElement.textContent = "Spin some Laps you Bozo!";
        
        // Clear the lap chart
        lapChart.data.labels = [];
        lapChart.data.datasets[0].data = [];
        lapChart.data.datasets[0].pointBackgroundColor = [];
        lapChart.update();

        return;
    }

   if (!validSession.laps.length) {
        fastestTimeElement.textContent = "--:---";
        slowestTimeElement.textContent = "--:---";
        averageTimeElement.textContent = "--:---";
        spreadTimeElement.textContent = "--:---";
        coachNoteElement.textContent = "flow dont force anything!";
    } else {
           // Update stat cards
            fastestTimeElement.textContent = formatLapTime(getFastestLap(validSession).time);
            slowestTimeElement.textContent = formatLapTime(getSlowestLap(validSession).time);
            averageTimeElement.textContent = formatLapTime(getAverageTime(validSession.laps));
            spreadTimeElement.textContent = formatGap(getLapSpread(validSession));
            coachNoteElement.textContent = getCoachNote(validSession);
    }

    // PitBoard time and messsage
    const lastLap = getLastLapData(session);
    
    if (lastLap.invalid) {
        pitBoardTimeElement.textContent = "INVALID";
        pitBoardNoteElement.textContent = "Relax and recover";
    } else if (lastLap.delta === 0) {
        pitBoardTimeElement.textContent = formatLapTime(lastLap.time);
        pitBoardNoteElement.textContent = "Best Lap";
    } else {
        pitBoardTimeElement.textContent = formatLapTime(lastLap.time);
        pitBoardNoteElement.textContent = formatGap(lastLap.delta);
    
    }

    // lap trend chart
    const chartData = getChartData(session);

    lapChart.data.labels = chartData.labels;
    lapChart.data.datasets[0].data = chartData.times;
    lapChart.data.datasets[0].pointBackgroundColor = chartData.colors;

    lapChart.update();



    // Update lap list
     lapListElement.innerHTML = "";

     const lapData = getLapDeltas(session);
    
     for (const lap of lapData) {

        // Create a new row for each lap
        const lapRow = document.createElement("div");
        const lapNumber = document.createElement("span");
        const lapTime = document.createElement("span");
        const lapDelta = document.createElement("span");

        // Add the lap number, time, and delta to the row
        lapRow.className = "lap-row";
        lapNumber.className = "lap-number";
        lapTime.className = "lap-time";
        lapDelta.className = "lap-delta";

        // Set the text content for each element
        lapNumber.textContent = "Lap " + lap.lap;    
        lapTime.textContent = formatLapTime(lap.time);

        if (lap.invalid) {
            lapDelta.textContent = "( INVALID LAP )";
            lapRow.classList.add("invalid-lap");
        } else if (lap.delta === 0) {
            lapDelta.textContent = "( BEST LAP )";
            lapRow.classList.add("best-lap");
        } else {
            lapDelta.textContent = formatGap(lap.delta);
        }
        
        // attatch the elements to the lap row and then to the lap list
        lapRow.appendChild(lapNumber);
        lapRow.appendChild(lapTime);
        lapRow.appendChild(lapDelta);
        lapListElement.appendChild(lapRow);
    }
}

function renderHistory() {
    historySelect.innerHTML = ""; // Clear existing options
    // Loop through the history and create a new option for each session
    for (let i = 0; i < sessionHistory.length; i++) {
        const pastSession = sessionHistory[i];
        const option = document.createElement("option");
        option.value = i;
        option.textContent = `${pastSession.date} - ${pastSession.track} - ${pastSession.laps.length} laps`;
        historySelect.appendChild(option);
    }
}

updateDisplay();
renderHistory();

/*----------------------------------------EVENTS----------------------------------------*/

const lapInput = document.getElementById("lap-input");
const addLapButton = document.getElementById("add-lap-button");
const newSessionButton = document.getElementById("new-session-button");
const loadHistoryButton = document.getElementById("load-history-button");

addLapButton.addEventListener("click", function() {
    const lapTimeInput = lapInput.value;
    const lapTime = parseLapTime(lapTimeInput);

    if (!Number.isNaN(lapTime)) {
        addLap(session, lapTime);
        saveSession(session);
        updateDisplay();
        lapInput.value = "";
    }
});


importSessionButton.addEventListener("click", function() {
    const sessionText = sessionInputElement.value;
    const lapTimes = sessionText.split("\n") 
    
    session.laps = [];        // Clear existing laps before loading new ones

    for (const lapTimeText of lapTimes) {
        const lapTime = parseLapTime(lapTimeText.trim());
        if (!Number.isNaN(lapTime)) {
            addLap(session, lapTime);
        }
    }
    saveSession(session);
    updateDisplay();
});

newSessionButton.addEventListener("click", function() {
    if (confirm("Are you sure you want to start a new session? Your current session will be saved to History.")) {
        archiveSession(session, sessionHistory);
        saveHistory(sessionHistory);
        renderHistory();
        session.laps = [];
        saveSession(session);
        updateDisplay();
    }
});

loadHistoryButton.addEventListener("click", function() {
    if (sessionHistory.length === 0) {
        alert("No sessions from history to load.");
        return;
    }

    const index = Number(historySelect.value);
    const pastSession = sessionHistory[index];
    if (confirm("Your current laps will be replaced.")) {
        restoreSession(session, pastSession);
        saveSession(session);
        updateDisplay();
    }
});


