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

/*----------------------------------------FOMATTING----------------------------------------*/
// 63.591 -> 1:03.591
function formatLapTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    let remainingSeconds = (seconds % 60).toFixed(3);

    if (remainingSeconds < 10) {
        remainingSeconds = "0" + remainingSeconds;
    }

    return minutes + ":" + remainingSeconds;
    
}

// 8.582 -> +8.582s
function formatGap(seconds) {
    return "+" + seconds.toFixed(2) + "s";
}


/*----------------------------------------DISPLAY----------------------------------------*/

// stat cards
const fastestTimeElement = document.getElementById("fastest-time");
fastestTimeElement.textContent = formatLapTime(getFastestLap(session).time);

const slowestTimeElement = document.getElementById("slowest-time");
slowestTimeElement.textContent = formatLapTime(getSlowestLap(session).time);

const averageTimeElement = document.getElementById("average-time");
averageTimeElement.textContent = formatLapTime(getAverageLap(session));


const spreadTimeElement = document.getElementById("spread-time");
spreadTimeElement.textContent = formatGap(getLapSpread(session));

// Lap list
const lapListElement = document.getElementById("lap-list");
const lapData = getLapDeltas(session);
    
for (const lap of lapData) {
    // 1. create
    const lapRow = document.createElement("div");
    const lapNumber = document.createElement("span");
    const lapTime = document.createElement("span");
    const lapDelta = document.createElement("span");
    // 2. Classes
    lapRow.className = "lap-row";
    lapNumber.className = "lap-number";
    lapTime.className = "lap-time";
    lapDelta.className = "lap-delta";

    // 3. Text
    lapNumber.textContent = "Lap" + lap.lap;
    lapTime.textContent = formatLapTime(lap.time);
   
    if (lap.delta === 0) {
        lapDelta.textContent = "( BEST LAP )";
    } else {
        lapDelta.textContent = formatGap(lap.delta);
    }

    // 4. attach
    lapRow.appendChild(lapNumber);
    lapRow.appendChild(lapTime);
    lapRow.appendChild(lapDelta);
    lapListElement.appendChild(lapRow);

}

