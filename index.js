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

const selector = () => {
    const pr = document.getElementsByClassName('pr');
    const rr = document.getElementById('Rrobin');
    console.log(rr.style.display);
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
    console.log(pr);
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

// CALL ADD FUN
addBtn.addEventListener("click", addProcess);

function showPercentages(duration, label2, cover = 100) {
    let percentageCompleted = 0;
    const percentageInterval = setInterval(() => {
        if (cover - percentageCompleted >= 1) {
            label2.innerText = `${Math.round(label2.value + 1)}%`;
            label2.value += 1;
        } else {
            label2.innerText = `${Math.round(label2.value + cover - percentageCompleted)}%`;
            label2.value += cover - percentageCompleted;
            clearInterval(showPercentages);
        }
        percentageCompleted++;
        if (percentageCompleted >= cover) clearInterval(percentageInterval);
    }, duration / cover);
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

const efficiencyChart = () => {
    // Efficiency chart implementation can go here
}

// FCFS ALGORITHM
function fcfs() {
    const processDiv = document.getElementById('process');
    processDiv.innerHTML = '';
    let currentTime = 0;
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

    function executeProcess(index) {
        if (index >= processes.length) return;

        const process = processes[index];
        const label = document.createElement('div');
        label.innerText = `Process ${process.id}`;
        processDiv.appendChild(label);

        const label2 = document.createElement('div');
        label2.innerText = `${0}%`;
        label2.value = 0;
        processDiv.appendChild(label2);

        const newProcess = document.createElement('div');
        newProcess.classList.add('outer-div');
        newProcess.style.border = '1px solid black';
        newProcess.style.width = '50vw';
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

        solutionTable.push({
            id: process.id,
            timeGetCPU: timeGetCPU,
            arrivalTime: process.arrivalTime,
            timeOfCompletion: timeOfCompletion,
            turnAroundTime: turnAroundTime,
            waitingTimeForGetCPU: waitingTimeForGetCPU,
            burstTime: process.burstTime
        });

        gantChart(process.id);
        solution(solutionTable[solutionTable.length - 1]);

        setTimeout(() => {
            const duration = process.burstTime * 1000;
            childDiv.style.transition = `width ${duration}ms linear`;
            childDiv.style.width = '50vw';

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
const gantChart = (id) => {
    let gantChart = document.getElementById('gantChart');
    // let gantTimesline = document.getElementById('gantChart-timeline');
    gantChart.style.border = '1px solid black';
    gantChart.innerHTML = '';
    // gantTimesline.innerHTML = '';
    gantChart.style.display = 'flex';

    let total = 0;
    readyQueue.forEach((item) => { total += item[1]; });

    readyQueue.forEach((item, index) => {
        let div = document.createElement('div');
        div.style.height = '20px';
        div.style.width = `${(item[1] / total) * 90}vw`;
        div.style.margin = '0.15px';

        if (item[0] === 'idle') {
            div.style.backgroundColor = 'black';
        } else {
            div.style.backgroundColor = `${darkColors[item[0]]}`;
        }
        div.innerText = item[0] === 'idle' ? `${item[0]}` : `P${item[0]}`;
        // let gantTimestamp = div.cloneNode(true);
        // gantTimestamp.innerText = `${item[0]}`;
        gantChart.append(div);
        // gantTimesline.appendChild(gantTimestamp);
    });
}

// Run FCFS when the run button is clicked
// runBtn.addEventListener("click", fcfs);



const SJF=()=>{
  
    const processDiv = document.getElementById('process');
    processDiv.innerHTML = '';

    //CURRENT TIME 
    let currentTime = 0;
  
    // Sort processes based on arrival time AND BURST TIME
    processes.sort((a, b) =>{ 
        if(a.arrivalTime == b.arrivalTime) return a.burstTime - b.burstTime;
         return a.arrivalTime - b.arrivalTime;
    }
         
    ); 

    const queue = []; // QUEUE CONTAINS PROCESS ACC. TO BURST TIME + ARRIVAL TIME
    const dequeue = []; // QUEUE HELP TO SORT ARRIVED PROCCESS BASED ON BURST TIME

    let ind = 0;

    while (queue.length !== processes.length) {

        // UPDATE CURRENT TIME (ADDING IDLE TIME)
        if (ind< processes.length && Ctime < processes[ind].arrivalTime && dequeue.length === 0) {
            Ctime = processes[ind].arrivalTime;
        }
        
        // INCLUDE PROCESS WHICH ARRIVED
        while (ind < processes.length && Ctime >= processes[ind].arrivalTime) {
            dequeue.push(processes[ind]);
            ind++;
        }
        
        //SORT BASED ON BURST TIME
        dequeue.sort((a, b) => a.burstTime - b.burstTime);
        
        //REMOVE FIRST ELEMENT AND ADD IN READYQUEUE
        const currentProcess = dequeue.shift();
        Ctime += currentProcess.burstTime;
        queue.push(currentProcess);
    }

    Ctime=0;

    function executeProcess(index) {
        if (index >= queue.length) return; // Stop if all processes have been executed
        const process = queue[index];

        const label = document.createElement('div');
        label.innerText = `P${process.id}`;
        processDiv.appendChild(label);

        const label2 = document.createElement('div');
        label2.innerText = `${0}%`;
        label2.value=0;
        processDiv.appendChild(label2);

        const newProcess = document.createElement('div');
        newProcess.classList.add('outer-div');
        newProcess.style.border = '1px solid black';
        newProcess.style.width = '50vw';
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

        // Calculate start time based on completion time of previous process

        const startTime=  process.arrivalTime * 1000-currentTime <0 ? 0:  process.arrivalTime * 1000-currentTime;
       
        // console.log('ctime : ', Ctime , ' At : ', process.arrivalTime, ' wt : ',process.arrivalTime -Ctime );
        if(Ctime <  process.arrivalTime ){
              readyQueue.push(['idle',  process.arrivalTime -Ctime]);
              Ctime+= process.arrivalTime -Ctime;
        }
        readyQueue.push([process.id, process.burstTime]);
        let timeGetCPU = Ctime;

        Ctime +=  process.burstTime ;
        
        let timeOfCompletion = Ctime;
        let turnAroundTime = timeOfCompletion - process.arrivalTime ;
        let waitingTimeForGetCPU =turnAroundTime - process.burstTime ;
        
        solutionTable.push({'id':process.id,'timeGetCPU':timeGetCPU,'arrivalTime':process.arrivalTime,'timeOfCompletion':timeOfCompletion,'turnAroundTime':turnAroundTime,'waitingTimeForGetCPU':waitingTimeForGetCPU,'burstTime':process.burstTime});
        
        //GANTT CHART AT EVERY PROCESS DONE
        gantChart(process.id);
        solution(solutionTable[solutionTable.length-1]);

        // Simulate process execution
        setTimeout(() => {
            const duration = process.burstTime * 1000; // Convert burst time to milliseconds
            childDiv.style.transition = `width ${duration}ms linear`;
            childDiv.style.width = '100%';

            // Update current time
            currentTime += process.arrivalTime * 1000 + duration;  
            // Wait for the transition to finish, then move to the next process
            
            showPercentages(duration,label2);
            setTimeout(() => {
                label.innerText = `P${process.id} (Completed)`;

                // Start the next process after the current one completes
                executeProcess(index + 1);
            }, duration);
          
        }, startTime); // Use startTime as the start time for the current process
    }
    // Start with the first process
    executeProcess(0);
}










const Priority=()=>{

    
    const processDiv = document.getElementById('process');
    processDiv.innerHTML = '';
    let currentTime = 0;
  
    processes.sort((a, b) =>{ 
        if(a.arrivalTime == b.arrivalTime) return a.burstTime - b.burstTime;
         return a.arrivalTime - b.arrivalTime;
    }
         
    ); // Sort processes based on arrival time
    const queue = [];
    const dequeue = [];
    let ind = 0;

    while (queue.length !== processes.length) {
        if (ind< processes.length && Ctime < processes[ind].arrivalTime && dequeue.length === 0) {
            Ctime = processes[ind].arrivalTime;
        }

        while (ind < processes.length && Ctime >= processes[ind].arrivalTime) {
            dequeue.push(processes[ind]);
            ind++;
        }

        dequeue.sort((a, b) =>b.priority - a.priority);

        const currentProcess = dequeue.shift();
        Ctime += currentProcess.burstTime;
        queue.push(currentProcess);
    }

    console.log('Queue:', queue);
    Ctime=0;
    function executeProcess(index) {
        if (index >= queue.length) return; // Stop if all processes have been executed
        const process = queue[index];

        const label = document.createElement('div');
        label.innerText = `P${process.id}`;
        processDiv.appendChild(label);

        const label2 = document.createElement('div');
        label2.innerText = `${0}%`;
        label2.value=0;
        processDiv.appendChild(label2);

        const newProcess = document.createElement('div');
        newProcess.classList.add('outer-div');
        newProcess.style.border = '1px solid black';
        newProcess.style.width = '50vw';
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

        // Calculate start time based on completion time of previous process

        const startTime=  process.arrivalTime * 1000-currentTime <0 ? 0:  process.arrivalTime * 1000-currentTime;
       
        // console.log('ctime : ', Ctime , ' At : ', process.arrivalTime, ' wt : ',process.arrivalTime -Ctime );
        if(Ctime <  process.arrivalTime ){
              readyQueue.push(['idle',  process.arrivalTime -Ctime]);
              Ctime+= process.arrivalTime -Ctime;
        }
        readyQueue.push([`${process.id}`, process.burstTime]);
        let timeGetCPU = Ctime;

        Ctime +=  process.burstTime ;
        
        let timeOfCompletion = Ctime;
        let turnAroundTime = timeOfCompletion - process.arrivalTime ;
        let waitingTimeForGetCPU =turnAroundTime - process.burstTime ;
        
        solutionTable.push({'id':process.id,'timeGetCPU':timeGetCPU,'arrivalTime':process.arrivalTime,'timeOfCompletion':timeOfCompletion,'turnAroundTime':turnAroundTime,'waitingTimeForGetCPU':waitingTimeForGetCPU,'burstTime':process.burstTime});
        
        //GANTT CHART AT EVERY PROCESS DONE
        gantChart(process.id);
        solution(solutionTable[solutionTable.length-1]);
        // Simulate process execution
        setTimeout(() => {
            const duration = process.burstTime * 1000; // Convert burst time to milliseconds
            childDiv.style.transition = `width ${duration}ms linear`;
            childDiv.style.width = '100%';

            // Update current time
            currentTime += process.arrivalTime * 1000 + duration;
            
            showPercentages(duration,label2);

            // Wait for the transition to finish, then move to the next process
            setTimeout(() => {
                label.innerText = `P${process.id} (Completed)`;

                // Start the next process after the current one completes
                executeProcess(index + 1);
            }, duration);
          
        }, startTime); // Use startTime as the start time for the current process
    }
     
    // Start with the first process
    executeProcess(0);
   
}













const LJF=()=>{

    
   
    const processDiv = document.getElementById('process');
    processDiv.innerHTML = '';

    //CURRENT TIME 
    let currentTime = 0;
  
    // Sort processes based on arrival time AND BURST TIME
    processes.sort((a, b) =>{ 
        if(a.arrivalTime == b.arrivalTime) return b.burstTime > a.burstTime;
         return a.arrivalTime - b.arrivalTime;
    }
         
    ); 

    const queue = []; // QUEUE CONTAINS PROCESS ACC. TO BURST TIME + ARRIVAL TIME
    const dequeue = []; // QUEUE HELP TO SORT ARRIVED PROCCESS BASED ON BURST TIME

    let ind = 0;

    while (queue.length !== processes.length) {

        // UPDATE CURRENT TIME (ADDING IDLE TIME)
        if (ind< processes.length && Ctime < processes[ind].arrivalTime && dequeue.length === 0) {
            Ctime = processes[ind].arrivalTime;
        }
        
        // INCLUDE PROCESS WHICH ARRIVED
        while (ind < processes.length && Ctime >= processes[ind].arrivalTime) {
            dequeue.push(processes[ind]);
            ind++;
        }
        
        //SORT BASED ON BURST TIME
        dequeue.sort((a, b) => b.burstTime - a.burstTime);
        
        //REMOVE FIRST ELEMENT AND ADD IN READYQUEUE
        const currentProcess = dequeue.shift();
        Ctime += currentProcess.burstTime;
        queue.push(currentProcess);
    }

    Ctime=0;

    function executeProcess(index) {
        if (index >= queue.length) return; // Stop if all processes have been executed
        const process = queue[index];

        const label = document.createElement('div');
        label.innerText = `P${process.id}`;
        processDiv.appendChild(label);

        const label2 = document.createElement('div');
        label2.innerText = `${0}%`;
        label2.value=0;
        processDiv.appendChild(label2);

        const newProcess = document.createElement('div');
        newProcess.classList.add('outer-div');
        newProcess.style.border = '1px solid black';
        newProcess.style.width = '50vw';
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

        // Calculate start time based on completion time of previous process

        const startTime=  process.arrivalTime * 1000-currentTime <0 ? 0:  process.arrivalTime * 1000-currentTime;
       
        // console.log('ctime : ', Ctime , ' At : ', process.arrivalTime, ' wt : ',process.arrivalTime -Ctime );
        if(Ctime <  process.arrivalTime ){
              readyQueue.push(['idle',  process.arrivalTime -Ctime]);
              Ctime+= process.arrivalTime -Ctime;
        }
        readyQueue.push([process.id, process.burstTime]);
        let timeGetCPU = Ctime;

        Ctime +=  process.burstTime ;
        
        let timeOfCompletion = Ctime;
        let turnAroundTime = timeOfCompletion - process.arrivalTime ;
        let waitingTimeForGetCPU =turnAroundTime - process.burstTime ;
        
        solutionTable.push({'id':process.id,'timeGetCPU':timeGetCPU,'arrivalTime':process.arrivalTime,'timeOfCompletion':timeOfCompletion,'turnAroundTime':turnAroundTime,'waitingTimeForGetCPU':waitingTimeForGetCPU,'burstTime':process.burstTime});
        
        //GANTT CHART AT EVERY PROCESS DONE
        gantChart(process.id);
        solution(solutionTable[solutionTable.length-1]);

        // Simulate process execution
        setTimeout(() => {
            const duration = process.burstTime * 1000; // Convert burst time to milliseconds
            childDiv.style.transition = `width ${duration}ms linear`;
            childDiv.style.width = '100%';

            // Update current time
            currentTime += process.arrivalTime * 1000 + duration;  
            // Wait for the transition to finish, then move to the next process
            
            showPercentages(duration,label2);
            setTimeout(() => {
                label.innerText = `P${process.id} (Completed)`;

                // Start the next process after the current one completes
                executeProcess(index + 1);
            }, duration);
          
        }, startTime); // Use startTime as the start time for the current process
    }
    // Start with the first process
    executeProcess(0);
}







const ROUND_ROBIN=()=>{

    
    let l= document.getElementById('timeQuant').value;
    let time_slot =l;
    document.getElementById('Rrobin').setAttribute('disabled',true);
    const processDiv = document.getElementById('process');
    processDiv.innerHTML = '';
    let currentTime = 0;
    const Done =[];
  
    processes.sort((a, b) =>{ 
         return a.arrivalTime - b.arrivalTime;
    }); // Sort processes based on arrival time

    const Total_Time =[];
    processes.forEach((vl)=>{
        Total_Time.push([vl.id,vl.burstTime]);
    });

    const queue = [];
    const Arrived = [];
    let ind = 0;
    
    const Pqueue =[...processes];
   
    let flagCon =true;
    while (Arrived.length != 0 || Pqueue.length!= 0) {
       
       let wtTime =0;
       if(ind< Pqueue.length && Ctime < Pqueue[ind].arrivalTime && Arrived.length == 0){
         wtTime =Pqueue[ind].arrivalTime - Ctime;
          Ctime += wtTime; 
          readyQueue.push(['idle',wtTime])  
       }

       while(Pqueue.length > 0 && Pqueue[0].arrivalTime <= Ctime){
      
            Arrived.push(Pqueue[0]);
            // let index =Pqueue.indexOf(x);
            Pqueue.shift();
        
       }
    //    dequeue.sort((a,b)=>{return b.burstTime >= a.burstTime})
      let dur= Math.min(time_slot, Arrived[0].burstTime);
      
      queue.push({'id':Arrived[0].id, 'burstTime':dur,'waiting' :wtTime});
      readyQueue.push([Arrived[0].id,dur]);
      Arrived[0].burstTime=Arrived[0].burstTime- dur;
     
     let  pr = Total_Time.filter((vl)=>{return vl[0]==Arrived[0].id});
     
         let timeGetCPU = Ctime;
    
    //  console.log(pr);
      Ctime+= dur;
     
      let process = Arrived[0];
      let timeOfCompletion = Ctime;
      let turnAroundTime = timeOfCompletion - process.arrivalTime ;
      let waitingTimeForGetCPU =turnAroundTime - pr[0][1] ;
      
    let isExist = solutionTable.filter((it)=>{
          return it.id==Arrived[0].id;
    })
if(Arrived.length>0){
    // console.log(isExist);    
    if(isExist.length == 0){
      solutionTable.push({'id':process.id,'timeGetCPU':timeGetCPU,'arrivalTime':process.arrivalTime,'timeOfCompletion':timeOfCompletion,'turnAroundTime':turnAroundTime,'waitingTimeForGetCPU':waitingTimeForGetCPU,'burstTime': pr[0][1]});
    }
    else{
        // console.log('else',solutionTable);
        isExist[0].timeOfCompletion = timeOfCompletion;
        isExist[0].turnAroundTime= turnAroundTime;
        isExist[0].waitingTimeForGetCPU= waitingTimeForGetCPU;
        isExist[0].arrivalTime += process.arrivalTime; 
    }
    // console.log('if',solutionTable);
}

while(Pqueue.length > 0 && Pqueue[0].arrivalTime <= Ctime){
      
    Arrived.push(Pqueue[0]);
    // let index =Pqueue.indexOf(x);
    Pqueue.shift();

}

      if(Arrived[0].burstTime==0){
        Arrived.shift();
      }
      else{
        const pr=Arrived[0];
        Arrived.shift();
        Arrived.push(pr);
      }
     wtTime =0;
    }

    // console.log('Queue:', queue);
    Ctime=0;

    const Comp = [];
    
   solutionTable.forEach((it)=>{
       solution(it);
   })

    function executeProcess(index) {
        if (index >= queue.length) return; // Stop if all processes have been executed
        const process = queue[index];

        let include = Comp.indexOf(process.id);

        if(include == -1){
        const label = document.createElement('div');
        label.innerText = `P${process.id}`;
        label.setAttribute('id', `l${process.id}`);
        processDiv.appendChild(label);

        const label2 = document.createElement('div');
        label2.innerText = `${0}%`;
        label2.value=0;
        label2.setAttribute('id',`l2${process.id}`);
        processDiv.appendChild(label2);

        const newProcess = document.createElement('div');
        newProcess.classList.add('outer-div');
        newProcess.style.border = '1px solid black';
        newProcess.style.width = '50vw';
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
        Comp.push(process.id);
        // Calculate start time based on completion time of previous process
        }
     let label = document.getElementById(`l${process.id}`);
     let label2 =document.getElementById(`l2${process.id}`);
     let Cdiv = document.getElementById(`p${process.id}`)
        setTimeout(() => {
            const duration = process.burstTime * 1000; // Convert burst time to milliseconds
            Cdiv.style.transition = `width ${duration}ms linear`;

            
            
           let  total = Total_Time.filter((vl)=>{return vl[0]==process.id});
        //    console.log(total);

           let addition =0;
            if(include == -1){
                Done.push([process.id,process.burstTime]);
            }
            else{
              let  Cpr=Done.filter((vl)=>{ return vl[0]==process.id});
              addition= Cpr[0][1];
                // console.log('addi',addition,'Cpr',Cpr);
                Cpr[0][1]+=(process.burstTime);

            }
            Cdiv.style.width = ` ${ (((addition + process.burstTime)/total[0][1]) * 50)}vw`;
        //   console.log('width ',(process.burstTime/total[0][1]) * 50, ' process bt ', process.burstTime, ' total ',total[0][1] );
            // Update current time
            let cover=(process.burstTime/total[0][1])*100;
          
            showPercentages(duration,label2,cover);
            currentTime += process.arrivalTime * 1000 + duration;
            
            
            gantChart(process.id)
            // Wait for the transition to finish, then move to the next process
            setTimeout(() => {
            //  if(Cdiv.style.width == '50vw')  label.innerText = `P${process.id} (Completed)`;
                 
                // Start the next process after the current one completes
                executeProcess(index + 1);
                if( addition +process.burstTime ==total[0][1]){
                    label.innerText=`P${process.id} Completed`;
              }
            }, duration);
          
        }, process.waiting*1000); // Use startTime as the start time for the current process
    }
     
    // Start with the first process
    executeProcess(0);
   

}




const SRTF=()=>{

    let time_slot = 1;
    const processDiv = document.getElementById('process');
    processDiv.innerHTML = '';
    let currentTime = 0;
    const Done =[];
  
    processes.sort((a, b) =>{ 
        if(a.arrivalTime == b.arrivalTime) return a.burstTime - b.burstTime;
         return a.arrivalTime - b.arrivalTime;
    }
         
    ); // Sort processes based on arrival time
    const Total_Time =[];
    processes.forEach((vl)=>{
        Total_Time.push([vl.id,vl.burstTime]);
    })
    const queue = [];
    const Arrived = [];
    let ind = 0;
    
    const Pqueue =[...processes];
   
    while (Arrived.length != 0 || Pqueue.length!= 0) {
       
       let wtTime =0;
       if(ind< Pqueue.length && Ctime < Pqueue[ind].arrivalTime && Arrived.length == 0){
         wtTime =Pqueue[ind].arrivalTime - Ctime;
          Ctime += wtTime;
          readyQueue.push(['idle', wtTime])
           
       }

       while(Pqueue.length > 0 && Pqueue[0].arrivalTime <= Ctime){
            console.log('Arrived process: ',Pqueue[0]);
            Arrived.push(Pqueue[0]);
            // let index =Pqueue.indexOf(x);
            Pqueue.shift();
        
       }
      
    Arrived.sort((a, b) =>{ 
         return a.burstTime - b.burstTime;    
    }  
    ); 
    //    dequeue.sort((a,b)=>{return b.burstTime >= a.burstTime})
      let dur= Math.min(time_slot, Arrived[0].burstTime);
      
    //   console.log("befor : ", Arrived[0]);
     if(Arrived.length>0)
           queue.push({'id':Arrived[0].id, 'burstTime':dur,'waiting' :wtTime});
      readyQueue.push([Arrived[0].id,dur]);
      Arrived[0].burstTime -= dur;
    //   Ctime+= dur;
  
      

     let  pr = Total_Time.filter((vl)=>{return vl[0]==Arrived[0].id});
     
     let timeGetCPU = Ctime;

//  console.log(pr);
  Ctime+= dur;
 


  let process = Arrived[0];
  let timeOfCompletion = Ctime;
  let turnAroundTime = timeOfCompletion - process.arrivalTime ;
  let waitingTimeForGetCPU =turnAroundTime - pr[0][1] ;
  
let isExist = solutionTable.filter((it)=>{
      return it.id==Arrived[0].id;
})
if(Arrived.length>0){
console.log(isExist);    
if(isExist.length == 0){
  solutionTable.push({'id':process.id,'timeGetCPU':timeGetCPU,'arrivalTime':process.arrivalTime,'timeOfCompletion':timeOfCompletion,'turnAroundTime':turnAroundTime,'waitingTimeForGetCPU':waitingTimeForGetCPU,'burstTime': pr[0][1]});
}
else{
    console.log('else',solutionTable);
    isExist[0].timeOfCompletion = timeOfCompletion;
    isExist[0].turnAroundTime= turnAroundTime;
    isExist[0].waitingTimeForGetCPU= waitingTimeForGetCPU;
    isExist[0].arrivalTime += process.arrivalTime; 
}
console.log('if',solutionTable);
}











      if(Arrived[0].burstTime==0){
        Arrived.shift();
      }
     
    // Arrived.sort((a,b)=>{a.burstTime - b.burstTime});
    console.log('after : ', Arrived[0]);

      
     wtTime =0;
    }
    
    console.log('Queue:', queue);
    Ctime=0;


    solutionTable.forEach((it)=>{
        solution(it);
    });

    
    const Comp = [];
    
    function executeProcess(index) {
        if (index >= queue.length) return; // Stop if all processes have been executed
        const process = queue[index];

        let include = Comp.indexOf(process.id);

        if(include == -1){
        const label = document.createElement('div');
        label.innerText = `P${process.id}`;
        label.setAttribute('id', `l${process.id}`);
        processDiv.appendChild(label);

        const label2 = document.createElement('div');
        label2.innerText = `${0}%`;
        label2.value=0;
        label2.setAttribute('id',`l2${process.id}`);
        processDiv.appendChild(label2);

        const newProcess = document.createElement('div');
        newProcess.classList.add('outer-div');
        newProcess.style.border = '1px solid black';
        newProcess.style.width = '50vw';
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
        Comp.push(process.id);
        // Calculate start time based on completion time of previous process
        }
     let label = document.getElementById(`l${process.id}`);
     let label2 = document.getElementById(`l2${process.id}`);
     let Cdiv = document.getElementById(`p${process.id}`);
        setTimeout(() => {
            const duration = process.burstTime * 1000; // Convert burst time to milliseconds
            Cdiv.style.transition = `width ${duration}ms linear`;
           
           let  total = Total_Time.filter((vl)=>{return vl[0]==process.id});
        //    console.log(total);

           let addition =0;
            if(include == -1){
                Done.push([process.id,process.burstTime]);
            }
            else{
              let  Cpr=Done.filter((vl)=>{ return vl[0]==process.id});
              addition= Cpr[0][1];
                // console.log('addi',addition,'Cpr',Cpr);
                Cpr[0][1]+=(process.burstTime);

            }
            Cdiv.style.width = ` ${ (((addition +process.burstTime)/total[0][1]) * 50)}vw`;
        //   console.log('width ',(process.burstTime/total[0][1]) * 50, ' process bt ', process.burstTime, ' total ',total[0][1] );
            // Update current time
            currentTime += process.arrivalTime * 1000 + duration;
            let cover=(process.burstTime* 100) /total[0][1];
          
            showPercentages(duration,label2,cover);
            gantChart(process.id);
            setTimeout(() => {
           
                if( addition +process.burstTime ==total[0][1]){
                    label.innerText=`P${process.id} Completed`;
              }
                executeProcess(index + 1);
            }, duration);
          
        }, process.waiting*1000); // Use startTime as the start time for the current process
    }
     
    // Start with the first process
    executeProcess(0);
        
}




runBtn.addEventListener("click", () => {
   
    runBtn.setAttribute("disabled",true);
    addBtn.setAttribute("disabled",true);
    algo.setAttribute("disabled",true);
    if(algo.value=='fcfs'){
        console.log("fcfs");
         fcfs();
        }
    else if(algo.value=='sjf'){
        console.log("sjf");
         SJF();
    }
    else if(algo.value=='priority'){
        console.log("pr");
        Priority();
    }
    else if(algo.value=='ljf'){
        console.log("ljf");
         LJF();
    }
    else if(algo.value=='round'){
        console.log("round");
         ROUND_ROBIN();
    }
    else if(algo.value=='srtf') SRTF();
    else{
        alert("Some Error Occured !!!!");
        throw 'error!!';
    }
});
refresh.addEventListener('click',()=>{
    window.location.reload();
})