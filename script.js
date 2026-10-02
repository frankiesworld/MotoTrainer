/*----------------------------------------------------V1 ------------------------------------------------------*/

/*----------------------------------------------------DATA ------------------------------------------------------*/

const session = {
    track: "Bakers West SX", 
    laps: [
        {
            lap: 1,
            time: 72.173
            
        },
        {
            lap: 2,
            time: 71.547
        },
        {
            lap: 3,
            time: 67.485
        },
        {
            lap: 4,
            time: 66.970
        },
        {
            lap: 5,
            time: 67.854
        },
        {
            lap: 6,
            time: 66.925   
        },
        {
            lap: 7,
            time: 66.371
        },
        {
            lap: 8,
            time: 65.702
        },
        {
            lap: 9,
            time: 63.591 
        },
        {
            lap: 10,
            time: 68.271
        }
        
    ]        
}

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


// Average lap: adds all laps and divides by number of laps
function getAverageLap(session) {
    let total = 0;

    for (const lap of session.laps) {
        total += lap.time;
    }

    const average = total / session.laps.length;
    return average;
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

/*----------------------------------------DISPLAY----------------------------------------*/

// stat cards
const fastestTimeElement = document.getElementById("fastest-time");
const slowestTimeElement = document.getElementById("slowest-time");
const averageTimeElement = document.getElementById("average-time");
const spreadTimeElement = document.getElementById("spread-time");


// Lap list
const lapListElement = document.getElementById("lap-list");

// Update the display with the current session data
function updateDisplay() {

    // Update stat cards
     fastestTimeElement.textContent = formatLapTime(getFastestLap(session).time);
     slowestTimeElement.textContent = formatLapTime(getSlowestLap(session).time);
     averageTimeElement.textContent = formatLapTime(getAverageLap(session));
     spreadTimeElement.textContent = formatGap(getLapSpread(session));

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

addLapButton.addEventListener("click", function() {
    const lapTimeInput = lapInput.value;
    const lapTime = parseLapTime(lapTimeInput);

    if (!Number.isNaN(lapTime)) {
        addLap(session, lapTime);
        updateDisplay();
        lapInput.value = "";
    }
});

