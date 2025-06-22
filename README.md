# 🖥️ CPU Scheduling Simulator

An interactive **web-based simulator** that visually demonstrates how CPU scheduling works through animated progress bars, real-time Gantt chart generation, and dynamic performance metrics.


---

## 📌 About the Project

This project allows users to input a set of processes with attributes like **arrival time**, **burst time**, and for Round Robin, a **time quantum**. It then simulates the selected CPU scheduling algorithm step-by-step in the browser with:

- Animated progress bars for each process
- Gantt chart visualization
- Metrics like Turnaround Time, Waiting Time, and Completion Time

Everything happens **live in the browser** with no server required.

---

## ⚙️ Algorithms Implemented

| Algorithm                          | Type            
|-------------------------------------------|------------------
| ✅ FCFS (First Come First Serve)         | Non-Preemptive  
| ✅ SJF (Shortest Job First)              | Non-Preemptive  
| ✅ SRTF (Shortest Remaining Time First)  | Preemptive   
| ✅ Round Robin (RR)                      | Preemptive       
| ✅ Priority Scheduling                   | Preemptive  


---

## ✨ Key Features

- 🔁 Real-time scheduling simulation with animation
- 🧮 Auto-calculates and displays:
  - Completion Time (CT)
  - Turnaround Time (TAT)
  - Waiting Time (WT)
  -  First Time CPU Allocation
- ⌛ Simulates CPU idle time if no processes are ready
- 🎨 Clean and minimal UI
- 💻 No frameworks — built with **HTML, CSS, JavaScript**

---

## 📷 Screenshots

![Screenshot 2025-06-23 021040](https://github.com/user-attachments/assets/949fbbd9-1469-401b-a512-c94a2e6bd130)

![Screenshot 2025-06-23 021148](https://github.com/user-attachments/assets/3f6180b9-a0d2-4156-97d7-a74be6e26f05)

![image](https://github.com/user-attachments/assets/485ef105-1551-4039-860f-cde87a13a881)

---

## 🛠 Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **No libraries**, no backend

---

## 🚀 Getting Started

To run locally:

```bash
git clone https://github.com/Raman-Rajpoot/cpu-scheduling-simulator.git
cd cpu-scheduling-simulator
open index.html
