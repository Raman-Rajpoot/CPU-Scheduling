// GLOBLE VARIABLE
const addBtn = document.getElementById('add-process');
const runBtn = document.getElementById('run-scheduler');
const refresh = document.getElementById('Refresh');
const algo = document.getElementById('algo');

// COLORS
const darkColors = [
    "#0000ff", "red", "#0000ff", "#ff00ff",
    "#0000ff", "#ff4500", "#4682b4", "#ffa07a",
    "#6a5acd", "#32cd32", "#008080", "#da70d6",
    "#00fa9a", "#9932cc", "#adff2f", "#00ced1",
    "#8b008b", "#8b4513", "#00bfff", "#8fbc8f",
    "#b22222", "#556b2f", "#ff4500", "#9400d3",
    "#8b0000", "#20b2aa", "#cd5c5c", "#ffd700",
    "#00ff00", "#ff69b4", "#bdb76b", "#ff8c00",
    "#1e90ff", "#ffa500", "#4169e1", "#228b22",
    "#ff1493", "#228b22", "#8b4513", "#556b2f",
    "#2f4f4f", "#00ff00", "#800000", "#dda0dd",
    "#ff0000", "#0000ff", "#808000", "#9400d3"
];

// SELECT ALGO
const selector = () => {
    const pr = document.getElementsByClassName('pr');
    const rr = document.getElementById('Rrobin');

    if (algo.value == 'priority') {
        for (let it = 0; it < pr.length; it++) {
            pr[it].style.display = 'block';
        }
        rr.style.display = 'none';
    } else if (algo.value == 'round') {
        rr.style.display = 'block';
        for (let it = 0; it < pr.length; it++) {
            pr[it].style.display = 'none';
        }
    } else {
        for (let it = 0; it < pr.length; it++) {
            pr[it].style.display = 'none';
        }
        rr.style.display = 'none';
    }
}

algo.onchange = selector;

// VARIABLES
const processes = [];
let count = 1;
let Ctime = 0;
const readyQueue = [];
const solutionTable = [];

// ADDING PROCESSES
function addProcess() {
    if (processes.length > 20) return;
    algo.setAttribute("disabled", true);
    const at = parseInt(document.getElementById('arrival-time').value);
    let pr = parseInt(document.getElementById('Priority').value);
    const bt = parseInt(document.getElementById('burst-time').value);
    if (isNaN(pr)) pr = 0;

    // SHOW IN TABLE
    if (at >= 0 && bt >= 0 && pr >= 0) {
        const table = document.getElementById('process-table');
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>PROCESS ${count}</td>
            <td>${at}</td>
            <td>${bt}</td>
            <td>${pr}</td>`;
        table.appendChild(newRow);
        // PUSH IN PROCESSES ARRAY
        processes.push({ id: count, arrivalTime: at, burstTime: bt, priority: pr });
        count++;
    }
    // Clear input fields after adding process
    document.getElementById('arrival-time').value = '';
    document.getElementById('Priority').value = '';
    document.getElementById('burst-time').value = '';
}

// CALL ADD FUNCTION
addBtn.addEventListener("click", addProcess);

// SHOW PERCENTAGE COMPLETION
function showPercentages(duration, label2) {
    let percentageCompleted = 0;
    label2.value = 0;

    const interval = setInterval(() => {
        if (percentageCompleted >= 100) {
            clearInterval(interval);
            return;
        }
        percentageCompleted++;
        label2.innerText = `${percentageCompleted}%`;
        label2.value = percentageCompleted;
    }, duration / 100);
}


const solution = (pr, isPreemptive = false) => {
    const solTable = document.getElementById('sol');
    if (isPreemptive) {
        solTable.innerHTML = '';
    }
    const solRow = document.createElement('tr');
    solRow.innerHTML = `
        <td>p${pr.id}</td>
        <td>${pr.arrivalTime}</td>
        <td>${pr.burstTime}</td>
        <td>${pr.timeOfCompletion}</td>
        <td>${pr.turnAroundTime}</td>
        <td>${pr.timeGetCPU}</td>
        <td>${pr.waitingTimeForGetCPU}</td>`;
    solTable.appendChild(solRow);
}


// FCFS ALGORITHM
function fcfs() {
    const processDiv = document.getElementById('process');
    processDiv.innerHTML = '';
    let currentTime = 0;
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

    // EXCUTE PROCESS
    function executeProcess(index) {
        if (index >= processes.length) return;

        const process = processes[index];
        const label = document.createElement('div');
        label.innerText = `Process ${process.id}`;
        processDiv.appendChild(label);

        const label2 = document.createElement('div');
        label2.innerText = `0%`;
        label2.value = 0;
        label2.style.textAlign = 'right';
        label2.style.width = '40vw';
        label2.style.marginTop = '-1.1rem';
        processDiv.appendChild(label2);



        // NEW PROCESS
        const newProcess = document.createElement('div');
        newProcess.classList.add('outer-div');
        newProcess.style.border = '1px solid black';
        newProcess.style.width = '40vw';
        newProcess.style.height = '15px';
        newProcess.style.margin = '10px';

        const childDiv = document.createElement('div');
        childDiv.classList.add('inner-class');
        childDiv.setAttribute('id', `p${process.id}`);
        childDiv.style.width = '0vw';
        childDiv.style.height = '15px';
        childDiv.style.backgroundColor = 'green';
        childDiv.style.transition = 'none';
        newProcess.appendChild(childDiv);
        processDiv.appendChild(newProcess);

        const startTime = process.arrivalTime * 1000 - currentTime < 0 ? 0 : process.arrivalTime * 1000 - currentTime;

        if (Ctime < process.arrivalTime) {
            readyQueue.push(['idle', process.arrivalTime - Ctime]);
            Ctime += process.arrivalTime - Ctime;
        }
        readyQueue.push([`${process.id}`, process.burstTime]);

        let timeGetCPU = Ctime;
        Ctime += process.burstTime;

        let timeOfCompletion = Ctime;
        let turnAroundTime = timeOfCompletion - process.arrivalTime;
        let waitingTimeForGetCPU = turnAroundTime - process.burstTime;

        solutionTable.push({
            id: process.id,
            timeGetCPU: timeGetCPU,
            arrivalTime: process.arrivalTime,
            timeOfCompletion: timeOfCompletion,
            turnAroundTime: turnAroundTime,
            waitingTimeForGetCPU: waitingTimeForGetCPU,
            burstTime: process.burstTime
        });
        // GNATT CHART
        gantChart(process.id);
        solution(solutionTable[solutionTable.length - 1]);
        // SIMULATION
        setTimeout(() => {
            const duration = process.burstTime * 1000;

            childDiv.style.width = '0vw';
            childDiv.style.transition = 'none';
            void childDiv.offsetWidth;
            childDiv.style.transition = `width ${duration}ms linear`;
            childDiv.style.width = '40vw';

            currentTime += process.arrivalTime * 1000 + duration;
            showPercentages(duration, label2);

            setTimeout(() => {
                label.innerText = `P${process.id} (Completed)`;
                executeProcess(index + 1);
            }, duration);
        }, startTime);
    }

    executeProcess(0);
}
// GANTT CHART
const gantChart = () => {
    const gantChart = document.getElementById('gantChart');
    gantChart.innerHTML = '';
    gantChart.style.border = '1px solid #ccc';
    gantChart.style.display = 'flex';
    gantChart.style.alignItems = 'center';
    gantChart.style.height = '40px';
    gantChart.style.marginTop = '20px';
    gantChart.style.position = 'relative';
    gantChart.style.overflow = 'hidden';
    gantChart.style.borderRadius = '8px';
    gantChart.style.fontSize = '12px';
    gantChart.style.fontFamily = 'sans-serif';

    const totalTime = readyQueue.reduce((sum, item) => sum + item[1], 0);

    let currentTime = 0;

    readyQueue.forEach(([pid, duration], index) => {
        const div = document.createElement('div');
        const percentWidth = (duration / totalTime) * 100;
        div.style.width = `${percentWidth}%`;
        div.style.height = '100%';
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.justifyContent = 'center';
        div.style.color = '#fff';
        div.style.fontWeight = 'bold';
        div.style.position = 'relative';
        div.style.borderRight = '1px solid #fff';
        div.style.boxSizing = 'border-box';

        if (pid === 'idle') {
            div.style.backgroundColor = 'gray';
            div.innerText = 'IDLE';
        } else {
            div.style.backgroundColor = darkColors[pid] || '#4CAF50';
            div.innerText = `P${pid}`;
        }

        div.title = `P${pid} | Duration: ${duration} | Start: ${currentTime}`;

        const timeStamp = document.createElement('span');
        timeStamp.innerText = `${currentTime}`;
        timeStamp.style.position = 'absolute';
        timeStamp.style.bottom = '-18px';
        timeStamp.style.left = '0';
        timeStamp.style.fontSize = '10px';
        timeStamp.style.color = '#333';
        div.appendChild(timeStamp);

        gantChart.appendChild(div);
        currentTime += duration;
    });
};

// SHORTEST JOB FIRST (NOT PRIMITIVE)
const SJF = () => {
    const processDiv = document.getElementById('process');
    processDiv.innerHTML = '';

    let currentTime = 0;
    let ind = 0;
    let Ctime = 0;


    processes.sort((a, b) =>
        a.arrivalTime === b.arrivalTime ? a.burstTime - b.burstTime : a.arrivalTime - b.arrivalTime
    );

    const queue = [];
    const dequeue = [];

    while (queue.length !== processes.length) {

        if (ind < processes.length && Ctime < processes[ind].arrivalTime && dequeue.length === 0) {
            Ctime = processes[ind].arrivalTime;
        }

        while (ind < processes.length && Ctime >= processes[ind].arrivalTime) {
            dequeue.push(processes[ind++]);
        }

        dequeue.sort((a, b) => a.burstTime - b.burstTime);
        const currentProcess = dequeue.shift();
        Ctime += currentProcess.burstTime;
        queue.push(currentProcess);
    }

    Ctime = 0;

    function executeProcess(index) {
        if (index >= queue.length) return;

        const process = queue[index];

        const label = document.createElement('div');
        label.innerText = `P${process.id}`;
        processDiv.appendChild(label);

        const label2 = document.createElement('div');
        label2.innerText = `0%`;
        label2.value = 0;
        label2.style.textAlign = 'right';
        label2.style.width = '40vw';
        label2.style.marginTop = '-1.1rem';
        processDiv.appendChild(label2);
        // NEW PROCESS
        const newProcess = document.createElement('div');
        newProcess.classList.add('outer-div');
        newProcess.style.cssText = `
            border: 1px solid black;
            width: 40vw;
            height: 15px;
            margin: 10px;
        `;

        const childDiv = document.createElement('div');
        childDiv.classList.add('inner-class');
        childDiv.setAttribute('id', `p${process.id}`);
        childDiv.style.cssText = `
            width: 0%; 
            height: 15px;
            background-color: green;
            transition: width ${process.burstTime * 1000}ms linear; /* Animate the width change */
        `;
        newProcess.appendChild(childDiv);
        processDiv.appendChild(newProcess);


        const startTime = Math.max(0, process.arrivalTime * 1000 - currentTime);

        if (Ctime < process.arrivalTime) {
            readyQueue.push(['idle', process.arrivalTime - Ctime]);
            Ctime += process.arrivalTime - Ctime;
        }

        readyQueue.push([process.id, process.burstTime]);

        const timeGetCPU = Ctime;
        Ctime += process.burstTime;

        const timeOfCompletion = Ctime;
        const turnAroundTime = timeOfCompletion - process.arrivalTime;
        const waitingTime = turnAroundTime - process.burstTime;

        solutionTable.push({
            id: process.id,
            timeGetCPU,
            arrivalTime: process.arrivalTime,
            timeOfCompletion,
            turnAroundTime,
            waitingTimeForGetCPU: waitingTime,
            burstTime: process.burstTime
        });
        // GANTT CHART
        gantChart(process.id);
        solution(solutionTable[solutionTable.length - 1]);

        setTimeout(() => {
            const duration = process.burstTime * 1000;
            childDiv.style.width = '0vw';
            childDiv.style.transition = 'none';
            void childDiv.offsetWidth;
            childDiv.style.transition = `width ${duration}ms linear`;
            childDiv.style.width = '40vw';

            setTimeout(() => {
                childDiv.style.width = '100%';
                currentTime += startTime + duration;
                showPercentages(duration, label2);

                setTimeout(() => {
                    label.innerText = `P${process.id} (Completed)`;
                    executeProcess(index + 1);
                }, duration);

            }, startTime);
        }, 0);
    }

    executeProcess(0);
};

// PRIORITY ALGO
const Priority = () => {

    const processDiv = document.getElementById('process');
    processDiv.innerHTML = '';
    let currentTime = 0;
    // SORT PROCESS
    processes.sort((a, b) => {
        if (a.arrivalTime == b.arrivalTime) return a.burstTime - b.burstTime;
        return a.arrivalTime - b.arrivalTime;
    }

    );
    const queue = [];
    const dequeue = [];
    let ind = 0;

    while (queue.length !== processes.length) {
        if (ind < processes.length && Ctime < processes[ind].arrivalTime && dequeue.length === 0) {
            Ctime = processes[ind].arrivalTime;
        }

        while (ind < processes.length && Ctime >= processes[ind].arrivalTime) {
            dequeue.push(processes[ind]);
            ind++;
        }

        dequeue.sort((a, b) => b.priority - a.priority);

        const currentProcess = dequeue.shift();
        Ctime += currentProcess.burstTime;
        queue.push(currentProcess);
    }

    Ctime = 0;
    function executeProcess(index) {
        if (index >= queue.length) return;
        const process = queue[index];

        const label = document.createElement('div');
        label.innerText = `P${process.id}`;
        processDiv.appendChild(label);

        const label2 = document.createElement('div');
        label2.innerText = `${0}%`;
        label2.value = 0;
        label2.style.textAlign = 'right';
        label2.style.width = '40vw';
        label2.style.marginTop = '-1.1rem';
        processDiv.appendChild(label2);
        // NEW PROCESS
        const newProcess = document.createElement('div');
        newProcess.classList.add('outer-div');
        newProcess.style.border = '1px solid black';
        newProcess.style.width = '40vw';
        newProcess.style.height = '15px';
        newProcess.style.margin = '10px';

        const childDiv = document.createElement('div');
        childDiv.classList.add('inner-class');
        childDiv.setAttribute('id', `p${process.id}`);
        childDiv.style.width = '0vw';
        childDiv.style.height = '15px';
        childDiv.style.backgroundColor = 'green';
        newProcess.appendChild(childDiv);
        processDiv.appendChild(newProcess);


        const startTime = process.arrivalTime * 1000 - currentTime < 0 ? 0 : process.arrivalTime * 1000 - currentTime;


        if (Ctime < process.arrivalTime) {
            readyQueue.push(['idle', process.arrivalTime - Ctime]);
            Ctime += process.arrivalTime - Ctime;
        }
        readyQueue.push([`${process.id}`, process.burstTime]);
        let timeGetCPU = Ctime;

        Ctime += process.burstTime;

        let timeOfCompletion = Ctime;
        let turnAroundTime = timeOfCompletion - process.arrivalTime;
        let waitingTimeForGetCPU = turnAroundTime - process.burstTime;

        solutionTable.push({ 'id': process.id, 'timeGetCPU': timeGetCPU, 'arrivalTime': process.arrivalTime, 'timeOfCompletion': timeOfCompletion, 'turnAroundTime': turnAroundTime, 'waitingTimeForGetCPU': waitingTimeForGetCPU, 'burstTime': process.burstTime });
        // GANTT CHART
        gantChart(process.id);
        solution(solutionTable[solutionTable.length - 1]);
        //SIMULATION
        setTimeout(() => {
            const duration = process.burstTime * 1000;
            childDiv.style.width = '0vw';
            childDiv.style.transition = 'none';
            void childDiv.offsetWidth;
            childDiv.style.transition = `width ${duration}ms linear`;
            childDiv.style.width = '40vw';


            currentTime += process.arrivalTime * 1000 + duration;

            showPercentages(duration, label2);


            setTimeout(() => {
                label.innerText = `P${process.id} (Completed)`;

                executeProcess(index + 1);
            }, duration);

        }, startTime);
    }

    executeProcess(0);

}


// LONGEST JOB FIRST
const LJF = () => {

    const processDiv = document.getElementById('process');
    processDiv.innerHTML = '';
    let currentTime = 0;
    // SORT PROCESS
    processes.sort((a, b) => {
        if (a.arrivalTime == b.arrivalTime) return b.burstTime > a.burstTime;
        return a.arrivalTime - b.arrivalTime;
    }

    );

    const queue = [];
    const dequeue = [];

    let ind = 0;

    while (queue.length !== processes.length) {


        if (ind < processes.length && Ctime < processes[ind].arrivalTime && dequeue.length === 0) {
            Ctime = processes[ind].arrivalTime;
        }

        while (ind < processes.length && Ctime >= processes[ind].arrivalTime) {
            dequeue.push(processes[ind]);
            ind++;
        }

        dequeue.sort((a, b) => b.burstTime - a.burstTime);

        const currentProcess = dequeue.shift();
        Ctime += currentProcess.burstTime;
        queue.push(currentProcess);
    }

    Ctime = 0;

    function executeProcess(index) {
        if (index >= queue.length) return;
        const process = queue[index];

        const label = document.createElement('div');
        label.innerText = `P${process.id}`;
        processDiv.appendChild(label);

        const label2 = document.createElement('div');
        label2.innerText = `${0}%`;
        label2.value = 0;
        label2.style.textAlign = 'right';
        label2.style.width = '40vw';
        label2.style.marginTop = '-1.1rem';
        processDiv.appendChild(label2);
        // NEW PROCESS
        const newProcess = document.createElement('div');
        newProcess.classList.add('outer-div');
        newProcess.style.border = '1px solid black';
        newProcess.style.width = '40vw';
        newProcess.style.height = '15px';
        newProcess.style.margin = '10px';

        const childDiv = document.createElement('div');
        childDiv.classList.add('inner-class');
        childDiv.setAttribute('id', `p${process.id}`);
        childDiv.style.width = '0vw';
        childDiv.style.height = '15px';
        childDiv.style.backgroundColor = 'green';
        newProcess.appendChild(childDiv);
        processDiv.appendChild(newProcess);


        const startTime = process.arrivalTime * 1000 - currentTime < 0 ? 0 : process.arrivalTime * 1000 - currentTime;

        console.log('ctime : ', Ctime, ' At : ', process.arrivalTime, ' wt : ', process.arrivalTime - Ctime);
        if (Ctime < process.arrivalTime) {
            readyQueue.push(['idle', process.arrivalTime - Ctime]);
            Ctime += process.arrivalTime - Ctime;
        }
        readyQueue.push([process.id, process.burstTime]);
        let timeGetCPU = Ctime;

        Ctime += process.burstTime;

        let timeOfCompletion = Ctime;
        let turnAroundTime = timeOfCompletion - process.arrivalTime;
        let waitingTimeForGetCPU = turnAroundTime - process.burstTime;

        solutionTable.push({ 'id': process.id, 'timeGetCPU': timeGetCPU, 'arrivalTime': process.arrivalTime, 'timeOfCompletion': timeOfCompletion, 'turnAroundTime': turnAroundTime, 'waitingTimeForGetCPU': waitingTimeForGetCPU, 'burstTime': process.burstTime });

        // GANTT CHART
        gantChart(process.id);
        solution(solutionTable[solutionTable.length - 1]);
        // SIMULATION
        setTimeout(() => {
            const duration = process.burstTime * 1000;
            childDiv.style.width = '0vw';
            childDiv.style.transition = 'none';
            void childDiv.offsetWidth;
            childDiv.style.transition = `width ${duration}ms linear`;
            childDiv.style.width = '40vw';

            currentTime += process.arrivalTime * 1000 + duration;

            showPercentages(duration, label2);
            setTimeout(() => {
                label.innerText = `P${process.id} (Completed)`;

                executeProcess(index + 1);
            }, duration);

        }, startTime);
    }

    executeProcess(0);
}

// ROUND ROBIN ALGO
function roundRobin() {
    const processDiv = document.getElementById('process');
    processDiv.innerHTML = '';
    readyQueue.length = 0;
    solutionTable.length = 0;

    let quantumInput = document.getElementById('quantum');
    let quantum = quantumInput ? parseInt(quantumInput.value) : 2;
    if (isNaN(quantum) || quantum <= 0) quantum = 2;

    const procList = processes.map(p => ({
        ...p,
        originalBurst: p.burstTime,
        remaining: p.burstTime,
        completed: false,
        start: null
    }));

    let time = 0;
    let completedCount = 0;
    const n = procList.length;
    const processElements = {};
    const queue = [];

    function enqueueArrivals() {
        for (const proc of procList) {
            if (
                proc.arrivalTime <= time &&
                !proc.completed &&
                !queue.includes(proc)
            ) {
                queue.push(proc);
            }
        }
    }

    function ensureProcessElements(proc) {
        if (!processElements[proc.id]) {
            const container = document.createElement('div');
            container.id = `process-${proc.id}`;

            const label = document.createElement('div');
            label.innerText = `P${proc.id}`;
            container.appendChild(label);

            const percentageLabel = document.createElement('div');
            percentageLabel.innerText = '0%';
            percentageLabel.style.textAlign = 'right';
            percentageLabel.style.width = '40vw';
            percentageLabel.style.marginTop = '-1.1rem';
            container.appendChild(percentageLabel);

            const progressContainer = document.createElement('div');
            progressContainer.classList.add('outer-div');
            progressContainer.style.width = '40vw';
            progressContainer.style.height = '15px';
            progressContainer.style.margin = '10px';

            const progressBar = document.createElement('div');
            progressBar.classList.add('inner-class');
            progressBar.style.width = '0%';
            progressBar.style.height = '15px';
            progressBar.style.backgroundColor = 'green';
            progressContainer.appendChild(progressBar);
            container.appendChild(progressContainer);

            processDiv.appendChild(container);

            processElements[proc.id] = {
                label,
                percentageLabel,
                progressBar,
                container
            };
        }
        return processElements[proc.id];
    }

    function executeNext() {
        if (completedCount === n) {
            gantChart();
            return;
        }

        enqueueArrivals();

        if (queue.length === 0) {
            // CPU Idle
            let nextArrival = Math.min(
                ...procList.filter(p => !p.completed && p.arrivalTime > time).map(p => p.arrivalTime)
            );
            if (isFinite(nextArrival)) {
                readyQueue.push(['idle', nextArrival - time]);
                gantChart();
                time = nextArrival;
                setTimeout(executeNext, 500);
                return;
            }
        }

        const proc = queue.shift();
        if (!proc) return;

        const elements = ensureProcessElements(proc);
        if (proc.start === null) proc.start = time;

        const execTime = Math.min(quantum, proc.remaining);


        readyQueue.push([proc.id, execTime]);
        //GANTT CHART
        gantChart();

        const barWidth = 40;
        const completedBefore = proc.originalBurst - proc.remaining;
        const startPercentage = (completedBefore / proc.originalBurst) * 100;
        const endPercentage = ((completedBefore + execTime) / proc.originalBurst) * 100;

        elements.progressBar.style.transition = 'none';
        elements.progressBar.style.width = `${startPercentage}%`;
        void elements.progressBar.offsetWidth;

        const duration = execTime * 1000;
        elements.progressBar.style.transition = `width ${duration}ms linear`;
        elements.progressBar.style.width = `${endPercentage}%`;

        // Animate percentage
        let currentPercentage = startPercentage;
        const percentageInterval = setInterval(() => {
            currentPercentage += (endPercentage - startPercentage) / 100;
            elements.percentageLabel.innerText = `${Math.round(currentPercentage)}%`;
            if (currentPercentage >= endPercentage) {
                clearInterval(percentageInterval);
                elements.percentageLabel.innerText = `${Math.round(endPercentage)}%`;
            }
        }, duration / 100);

        setTimeout(() => {
            proc.remaining -= execTime;
            time += execTime;

            // If process finished
            if (proc.remaining === 0) {
                proc.completed = true;
                completedCount++;
                proc.timeOfCompletion = time;
                proc.turnAroundTime = proc.timeOfCompletion - proc.arrivalTime;
                proc.waitingTimeForGetCPU = proc.turnAroundTime - proc.originalBurst;
                proc.timeGetCPU = proc.start;
                solutionTable.push({
                    id: proc.id,
                    timeGetCPU: proc.timeGetCPU,
                    arrivalTime: proc.arrivalTime,
                    timeOfCompletion: proc.timeOfCompletion,
                    turnAroundTime: proc.turnAroundTime,
                    waitingTimeForGetCPU: proc.waitingTimeForGetCPU,
                    burstTime: proc.originalBurst
                });
                solution(solutionTable[solutionTable.length - 1]);
                elements.label.innerText = `P${proc.id} (Completed)`;
            } else {
                elements.label.innerText = `P${proc.id} (Paused)`;
            }

            enqueueArrivals();

            if (!proc.completed && !queue.includes(proc)) {
                queue.push(proc);
            }

            executeNext();
        }, duration);
    }

    enqueueArrivals();
    executeNext();
}





// SHORTEST REMAINING TIME FIRST (PRIMITIVE)
function SRTF() {
    const processDiv = document.getElementById('process');
    processDiv.innerHTML = '';
    readyQueue.length = 0;
    solutionTable.length = 0;

    const procList = processes.map(p => ({
        ...p,
        originalBurst: p.burstTime,
        remaining: p.burstTime,
        completed: false,
        start: null,
        progressBar: null,
        label: null,
        percentageLabel: null
    }));

    let time = 0;
    let completedCount = 0;
    const n = procList.length;
    const processElements = {};

    function getNextProcess() {
        let candidates = procList.filter(p =>
            p.arrivalTime <= time && !p.completed && p.remaining > 0
        );
        if (candidates.length === 0) return null;
        candidates.sort((a, b) => a.remaining - b.remaining || a.arrivalTime - b.arrivalTime);
        return candidates[0];
    }

    function ensureProcessElements(proc) {
        if (!processElements[proc.id]) {
            const container = document.createElement('div');
            container.id = `process-${proc.id}`;

            const label = document.createElement('div');
            label.innerText = `P${proc.id}`;
            container.appendChild(label);

            const percentageLabel = document.createElement('div');
            percentageLabel.innerText = '0%';
            percentageLabel.style.textAlign = 'right';
            percentageLabel.style.width = '40vw';
            percentageLabel.style.marginTop = '-1.1rem';
            container.appendChild(percentageLabel);

            const progressContainer = document.createElement('div');
            progressContainer.classList.add('outer-div');
            progressContainer.style.width = '40vw';
            progressContainer.style.height = '15px';
            progressContainer.style.margin = '10px';

            const progressBar = document.createElement('div');
            progressBar.classList.add('inner-class');
            progressBar.style.width = '0%';
            progressBar.style.height = '15px';
            progressBar.style.backgroundColor = 'green';
            progressContainer.appendChild(progressBar);
            container.appendChild(progressContainer);

            processDiv.appendChild(container);

            processElements[proc.id] = {
                label,
                percentageLabel,
                progressBar,
                container
            };
        }
        return processElements[proc.id];
    }

    function executeNext() {
        if (completedCount === n) {
            gantChart();
            return;
        }

        let proc = getNextProcess();

        // CPU is idle
        if (!proc) {

            const nextArrival = Math.min(...procList
                .filter(p => !p.completed && p.arrivalTime > time)
                .map(p => p.arrivalTime)
            );
            if (isFinite(nextArrival)) {
                readyQueue.push(['idle', nextArrival - time]);
                time = nextArrival;
                setTimeout(executeNext, 500);
                return;
            }
        }

        proc = getNextProcess();
        if (!proc) return;

        const elements = ensureProcessElements(proc);
        if (proc.start === null) proc.start = time;

        let nextTime = Infinity;
        for (const p of procList) {
            if (!p.completed && p !== proc &&
                p.arrivalTime > time &&
                p.arrivalTime < time + proc.remaining) {
                nextTime = Math.min(nextTime, p.arrivalTime);
            }
        }
        const execTime = Math.min(
            proc.remaining,
            nextTime === Infinity ? proc.remaining : nextTime - time
        );

        readyQueue.push([proc.id, execTime]);

        // Animate progress bar
        const completedBefore = proc.originalBurst - proc.remaining;
        const startPercentage = (completedBefore / proc.originalBurst) * 100;
        const endPercentage = ((completedBefore + execTime) / proc.originalBurst) * 100;

        elements.progressBar.style.transition = 'none';
        elements.progressBar.style.width = `${startPercentage}%`;
        void elements.progressBar.offsetWidth;

        const duration = execTime * 1000;
        elements.progressBar.style.transition = `width ${duration}ms linear`;
        elements.progressBar.style.width = `${endPercentage}%`;

        // Animate percentage
        let currentPercentage = startPercentage;
        const percentageInterval = setInterval(() => {
            currentPercentage += (endPercentage - startPercentage) / 100;
            elements.percentageLabel.innerText = `${Math.round(currentPercentage)}%`;
            if (currentPercentage >= endPercentage) {
                clearInterval(percentageInterval);
                elements.percentageLabel.innerText = `${Math.round(endPercentage)}%`;
            }
        }, duration / 100);

        // Update process state after animation
        setTimeout(() => {
            proc.remaining -= execTime;
            time += execTime;

            if (proc.remaining === 0) {
                proc.completed = true;
                completedCount++;
                proc.timeOfCompletion = time;
                proc.turnAroundTime = proc.timeOfCompletion - proc.arrivalTime;
                proc.waitingTimeForGetCPU = proc.turnAroundTime - proc.originalBurst;
                solutionTable.push({
                    id: proc.id,
                    timeGetCPU: proc.start,
                    arrivalTime: proc.arrivalTime,
                    timeOfCompletion: proc.timeOfCompletion,
                    turnAroundTime: proc.turnAroundTime,
                    waitingTimeForGetCPU: proc.waitingTimeForGetCPU,
                    burstTime: proc.originalBurst
                });
                solution(solutionTable[solutionTable.length - 1]);
                elements.label.innerText = `P${proc.id} (Completed)`;
            } else {
                elements.label.innerText = `P${proc.id} (Paused)`;
            }

            gantChart();
            executeNext();
        }, duration);
    }

    executeNext();
}




// RUN BTN FUNCTION
runBtn.addEventListener("click", () => {

    runBtn.setAttribute("disabled", true);
    addBtn.setAttribute("disabled", true);
    algo.setAttribute("disabled", true);
    if (algo.value == 'fcfs') {
        fcfs();
    }
    else if (algo.value == 'sjf') {
        SJF();
    }
    else if (algo.value == 'priority') {
        Priority();
    }
    else if (algo.value == 'ljf') {
        LJF();
    }
    else if (algo.value == 'round') {
        roundRobin();
    }
    else if (algo.value == 'srtf') {
        SRTF();
    }
    else {
        alert("Some Went Wrong !!!!");
        throw 'error!!';
    }
});

//REFRESH BTN FUNCTION
refresh.addEventListener('click', () => {
    window.location.reload();
})