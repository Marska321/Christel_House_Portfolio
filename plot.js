let rawData;
let processedLearners = [];

// --- Branded & Accessible Color Palette ---
const chBlue = '#003865';      // For learners with no flag
const chTeal = '#00A99D';      // For learners with a learning barrier flag
const axisColor = '#343A40';
const gridColor = '#E0E0E0';

// --- Plot Layout ---
const padding = 60;

function preload() {
    rawData = loadJSON('christel_house_mock_data.json');
}

function setup() {
    let canvas = createCanvas(800, 600);
    canvas.parent('canvas-container');
    textFont('Montserrat');
    
    // Process the data once to get our averages.
    processData();
}

function draw() {
    background(255);
    drawAxesAndGrid();
    drawLegend();
    
    let hoveredLearner = null;

    // --- Draw each learner as a point on the plot ---
    for (const learner of processedLearners) {
        // Map attendance (70-100%) to the X-axis coordinate
        const x = map(learner.avgAttendance, 70, 100, padding, width - padding);
        // Map mark (30-100%) to the Y-axis coordinate
        const y = map(learner.avgMark, 30, 100, height - padding, padding);

        // Check if the mouse is hovering over this point
        if (dist(mouseX, mouseY, x, y) < 8) {
            hoveredLearner = learner;
        }

        // Style the points
        stroke(axisColor);
        strokeWeight(1);
        fill(learner.hasBarrier ? chTeal : chBlue);
        
        // Make the hovered point larger
        if (hoveredLearner === learner) {
            ellipse(x, y, 16, 16);
        } else {
            ellipse(x, y, 12, 12);
        }
    }
    
    if (hoveredLearner) {
        drawTooltip(hoveredLearner);
    }
}

function processData() {
    let learnersTemp = {};
    
    // This is our 'smart' fix to prevent the "not iterable" error.
    const records = Array.isArray(rawData) ? rawData : Object.values(rawData);

    // Group all records by a unique learner ID.
    for (const record of records) {
        if (!learnersTemp[record.LearnerID]) {
            learnersTemp[record.LearnerID] = {
                id: record.LearnerID,
                hasBarrier: record.LearningBarrier,
                marks: [],
                attendances: []
            };
        }
        learnersTemp[record.LearnerID].marks.push(record.Mark);
        learnersTemp[record.LearnerID].attendances.push(record.Attendance);
    }

    // Now, calculate the average mark and attendance for each learner.
    for (const id in learnersTemp) {
        const l = learnersTemp[id];
        const avgMark = l.marks.reduce((a, b) => a + b, 0) / l.marks.length;
        const avgAttendance = l.attendances.reduce((a, b) => a + b, 0) / l.attendances.length;

        processedLearners.push({
            id: l.id,
            hasBarrier: l.hasBarrier,
            avgMark: avgMark,
            avgAttendance: avgAttendance
        });
    }
}

function drawAxesAndGrid() {
    // Draw grid lines for context
    stroke(gridColor);
    strokeWeight(1);
    for (let i = 0; i <= 10; i++) {
        let x = map(i, 0, 10, padding, width - padding);
        line(x, padding, x, height - padding);
        let y = map(i, 0, 10, height - padding, padding);
        line(padding, y, width - padding, y);
    }

    // Draw main axis lines
    stroke(axisColor);
    strokeWeight(2);
    line(padding, padding, padding, height - padding); // Y-Axis
    line(padding, height - padding, width - padding, height - padding); // X-Axis

    // Draw labels
    fill(axisColor);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(14);
    text("Average Attendance (%)", width / 2, height - padding / 2.5);
    
    push();
    translate(padding / 2.5, height / 2);
    rotate(-HALF_PI);
    text("Average Mark (%)", 0, 0);
    pop();

    // Draw tick marks
    textSize(10);
    for (let i = 0; i <= 10; i++) {
        let markValue = int(map(i, 0, 10, 30, 100));
        let y = map(i, 0, 10, height - padding, padding);
        textAlign(RIGHT, CENTER);
        text(markValue, padding - 8, y);
        
        let attendanceValue = int(map(i, 0, 10, 70, 100));
        let x = map(i, 0, 10, padding, width - padding);
        textAlign(CENTER, TOP);
        text(attendanceValue, x, height - padding + 8);
    }
}

function drawTooltip(learner) {
    let tooltipX = mouseX > width / 2 ? mouseX - 210 : mouseX + 15;
    let tooltipY = mouseY > height / 2 ? mouseY - 100 : mouseY + 15;
    
    fill(0, 0, 0, 220); // semi-transparent black
    noStroke();
    rect(tooltipX, tooltipY, 200, 80, 5); // rounded rectangle

    fill(255);
    textSize(14);
    textAlign(LEFT, TOP);
    textStyle(BOLD);
    text(`ID: ${learner.id}`, tooltipX + 10, tooltipY + 10);
    textStyle(NORMAL);
    text(`Avg. Mark: ${learner.avgMark.toFixed(1)}%`, tooltipX + 10, tooltipY + 35);
    text(`Avg. Attendance: ${learner.avgAttendance.toFixed(1)}%`, tooltipX + 10, tooltipY + 55);
}

function drawLegend() {
    fill(chBlue); noStroke();
    ellipse(width - 200, padding - 20, 12, 12);
    fill(axisColor); textAlign(LEFT, CENTER); textSize(12);
    text("No Barrier Flag", width - 185, padding - 20);

    fill(chTeal); noStroke();
    ellipse(width - 200, padding, 12, 12);
    fill(axisColor);
    text("Learning Barrier Flag", width - 185, padding);
}