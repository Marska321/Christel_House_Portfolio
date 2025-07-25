let data;
let learners = {};

// --- Branded & Accessible Color Palette ---
const chBlue = '#003865';      // Christel House Primary Blue (for "On Track")
const chTeal = '#00A99D';      // Accent Teal (for "Learning Support")
const chOrange = '#E97451';    // A warm, clear orange (for "Attendance Concern")
const chAlertRed = '#C14444';   // A softer, professional red (for "Academic Concern")
const chBackground = '#F8F9FA'; // A very light grey for the page background
const chText = '#343A40';       // A dark grey for text, softer than pure black

function preload() {
    data = loadJSON('christel_house_mock_data.json');
}

function setup() {
    let canvas = createCanvas(800, 500);
    canvas.parent('canvas-container');
    textFont('Montserrat'); // <-- ADD THIS LINE
    processData();
}

function draw() {
    background(255);    
    let x = 50;
    let y = 100;
    let hoveredLearner = null;

    for (const id in learners) {
        const learner = learners[id];
        if (dist(mouseX, mouseY, x, y) < learner.radius) {
            hoveredLearner = learner;
        }
        // Draw the bubble
        strokeWeight(hoveredLearner === learner ? 3 : 1.5);
        stroke(chBlue);
        fill(learner.color);
        ellipse(x, y, learner.radius * 2, learner.radius * 2);
        // Advance position
        x += 80;
        if (x > width - 50) {
            x = 50;
            y += 80;
        }
    }
    if (hoveredLearner) {
        drawTooltip(hoveredLearner);
    }
}

function processData() {
    const records = Array.isArray(data) ? data : Object.values(data);
for (const record of records) {
        if (!learners[record.LearnerID]) {
            learners[record.LearnerID] = { id: record.LearnerID, grade: record.Grade, hasBarrier: record.LearningBarrier, marks: [], attendances: [], };
        }
        learners[record.LearnerID].marks.push(record.Mark);
        learners[record.LearnerID].attendances.push(record.Attendance);
    }

    for (const id in learners) {
        const learner = learners[id];
        const avgMark = learner.marks.reduce((a, b) => a + b, 0) / learner.marks.length;
        const avgAttendance = learner.attendances.reduce((a, b) => a + b, 0) / learner.attendances.length;

        let academicRisk = avgMark < 50 ? 3 : (avgMark < 65 ? 1 : 0);
        let attendanceRisk = avgAttendance < 85 ? 3 : (avgAttendance < 90 ? 1 : 0);
        let barrierRisk = learner.hasBarrier ? 2 : 0;

        // NEW CODE
        if (academicRisk >= attendanceRisk && academicRisk > 0) { learner.primaryConcern = "Academic"; learner.color = chAlertRed; } 
        else if (attendanceRisk > academicRisk) { learner.primaryConcern = "Attendance"; learner.color = chOrange; } 
        else if (learner.hasBarrier) { learner.primaryConcern = "Learning Support"; learner.color = chTeal; } 
        else { learner.primaryConcern = "On Track"; learner.color = chBlue; }

        learner.radius = 10 + (academicRisk + attendanceRisk + barrierRisk) * 3;
        learner.avgMark = avgMark;
    }
}

function drawTooltip(learner) {
    let tooltipX = mouseX + 15;
    let tooltipY = mouseY;
    fill(0, 0, 0, 200);
    noStroke();
    rect(tooltipX, tooltipY, 220, 80, 5);
    fill(255);
    textSize(14);
    textAlign(LEFT, TOP);
    text(`ID: ${learner.id}`, tooltipX + 10, tooltipY + 10);
    text(`Grade: ${learner.grade}`, tooltipX + 10, tooltipY + 30);
    text(`Avg Mark: ${learner.avgMark.toFixed(1)}% | Concern: ${learner.primaryConcern}`, tooltipX + 10, tooltipY + 50);
}

function drawLegend() {
    const legendItems = [{ color: chAlertRed, text: 'Academic Concern' }, { color: chOrange, text: 'Attendance Concern' }, { color: chTeal, text: 'Learning Support Flag' }, { color: chBlue, text: 'On Track' }];
    legendItems.forEach((item, index) => {
        fill(item.color); noStroke(); ellipse(550, 40 + index * 25, 15, 15);
        fill(50); textSize(12); textAlign(LEFT, CENTER); text(item.text, 570, 40 + index * 25);
    });
}