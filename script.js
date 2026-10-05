/*----------------------------------------------------V1 ------------------------------------------------------*/

/*----------------------------------------------------DATA ------------------------------------------------------*/

const session = loadSession();


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
    const fastestLap = getFastestLap(session);
    const lapDeltas = [];

    for (const lap of session.laps) {
        const delta = lap.time - fastestLap.time;
        const lapData = {
            lap: lap.lap,
            time: lap.time,
            delta: delta
        };
        lapDeltas.push(lapData);
    }
    return lapDeltas;
}

function addLap(session, time) {
    const newLap = {
        lap: session.laps.length + 1,
        time: time
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
        return JSON.parse(sessionJSON);
    }
    return {
        track: "Bakers West SX",
        bike: "",
        rider: "",
        laps: []
    };
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



// Lap list
const lapListElement = document.getElementById("lap-list");

// Practice session input
const sessionInputElement = document.getElementById("session-input");
const importSessionButton = document.getElementById("import-session-button");



// Update the display with the current session data
function updateDisplay() {

  // Session INFO
    trackNameElement.textContent = session.track;
    lapCountElement.textContent = session.laps.length;

    if (session.laps.length === 0) {
        lapListElement.innerHTML = "";
        fastestTimeElement.textContent = "--:---";
        slowestTimeElement.textContent = "--:---";
        averageTimeElement.textContent = "--:---";
        spreadTimeElement.textContent = "--:---";
        coachNoteElement.textContent = "Spin some Laps you Bozo!";

        return;
    }



    // Update stat cards
    fastestTimeElement.textContent = formatLapTime(getFastestLap(session).time);
    slowestTimeElement.textContent = formatLapTime(getSlowestLap(session).time);
    averageTimeElement.textContent = formatLapTime(getAverageTime(session.laps));
    spreadTimeElement.textContent = formatGap(getLapSpread(session));
    coachNoteElement.textContent = getCoachNote(session);

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
        if (lap.delta === 0) {
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


updateDisplay();


/*----------------------------------------EVENTS----------------------------------------*/

const lapInput = document.getElementById("lap-input");
const addLapButton = document.getElementById("add-lap-button");
const newSessionButton = document.getElementById("new-session-button");

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
    if (confirm("Are you sure you want to start a new session? This will clear all current laps.")) {
        session.laps = [];
        saveSession(session);
        updateDisplay();
    }
});

 