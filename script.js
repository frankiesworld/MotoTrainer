/*----------------------------------------------------V1 ------------------------------------------------------*/

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

/*-------------------------------------GET FASTEST LAP-------------*/

function getFastestLap(session) {
    let fastestLap = session.laps[0];

    for (const lap of session.laps) {
        if (lap.time < fastestLap.time) {
            fastestLap = lap;
        } 
    }

    return fastestLap;
}


/*----------------------------------------SLOWESTLAP-----------------------------------*/

function getSlowestLap(session) {
    let slowestLap = session.laps[0];

    for (const lap of session.laps) {
        if ( lap.time > slowestLap.time) {
            slowestLap = lap;
        }
    }

    return slowestLap;
}



function getAverageLap(session) {
    let total = 0;

    for (const lap of session.laps) {
        total += lap.time;
    }

    const average = total / session.laps.length;
    return average;
}



function getLapSpread(session) {
    const fastestLap = getFastestLap(session);
    const slowestLap = getSlowestLap(session);

    return slowestLap.time - fastestLap.time;
}

function formatLapTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    let remainingSeconds = (seconds % 60).toFixed(3);

    if (remainingSeconds < 10) {
        remainingSeconds = "0" + remainingSeconds;
    }

    return minutes + ":" + remainingSeconds;
    
}


const fastestTimeElement = document.getElementById("fastest-time");
fastestTimeElement.textContent = formatLapTime(getFastestLap(session).time);

const slowestTimeElement = document.getElementById("slowest-time");
slowestTimeElement.textContent = formatLapTime(getSlowestLap(session).time);

const averageTimeElement = document.getElementById("average-time");
averageTimeElement.textContent = formatLapTime(getAverageLap(session));


const spreadTimeElement = document.getElementById("spread-time");
spreadTimeElement.textContent = "+" + getLapSpread(session).toFixed(2) + "s";

