let data;
let learners = {};

function preload() {
    // This loads the data file before the sketch starts.
    data = loadJSON('christel_house_mock_data.json');
}

function setup() {
    // Dynamically calculate the canvas height based on the number of learners.
    const canvasHeight = Object.keys(learners).length * 90 + 100;
    let canvas = createCanvas(900, canvasHeight);
    canvas.parent('canvas-container');

    processData(); // Organize the raw data.
    noLoop(); // Draw the visualization once since it's not animated.
    redraw(); // Ensure draw() is called at least once after setup.
}

function draw() {
    background(255);
    let yPos = 50; // Set the starting vertical position.

    // Loop through every learner we processed.
    for (const id in learners) {
        const learner = learners[id];
        
        // Draw the learner's ID on the left.
        fill(0);
        noStroke();
        textSize(14);
        textAlign(LEFT, TOP);
        textStyle(BOLD);
        text(learner.id, 20, yPos + 20);
        
        let xPos = 150;
        // Draw a sparkline graph for each of the learner's subjects.
        for (const subject in learner.subjects) {
            drawSparkline(xPos, yPos, learner.subjects[subject], subject);
            xPos += 150; // Move right for the next graph.
        }
        yPos += 90; // Move down for the next learner.
    }
}

function processData() {
    // This is the "smart" part that reorganizes the data.
    const records = Array.isArray(data) ? data : Object.values(data);
    for (const record of records) {
        // If we haven't seen this learner before, create a new entry for them.
        if (!learners[record.LearnerID]) {
            learners[record.LearnerID] = {
                id: record.LearnerID,
                subjects: {}
            };
        }
        // If we haven't seen this subject for this learner, create an empty list for it.
        if (!learners[record.LearnerID].subjects[record.Subject]) {
            learners[record.LearnerID].subjects[record.Subject] = [];
        }
        // Place the mark in the correct term spot (Term 1 -> index 0, etc.).
        learners[record.LearnerID].subjects[record.Subject][record.Term - 1] = record.Mark;
    }
}

// A reusable function to draw one mini-graph.
function drawSparkline(x, y, marks, title) {
    const graphW = 120;
    const graphH = 60;
    
    // Draw the subject title and the graph's border.
    fill(100);
    noStroke();
    textSize(10);
    textStyle(NORMAL);
    textAlign(CENTER);
    text(title, x + graphW / 2, y);
    stroke(200);
    noFill();
    rect(x, y + 15, graphW, graphH);

    // Draw the actual line graph showing the marks.
    stroke(0, 56, 101); // Christel House Blue
    strokeWeight(2);
    noFill();
    beginShape();
    for (let i = 0; i < marks.length; i++) {
        if (marks[i] === undefined) continue;
        const pointX = map(i, 0, marks.length - 1, x + 10, x + graphW - 10); // Add padding
        const pointY = map(marks[i], 0, 100, y + 15 + graphH, y + 15); // Map mark to Y position
        vertex(pointX, pointY);
    }
    endShape();
    
    // Draw circles for each mark, coloring them red if they are below 50.
    for (let i = 0; i < marks.length; i++) {
        if (marks[i] === undefined) continue;
        const pointX = map(i, 0, marks.length - 1, x + 10, x + graphW - 10);
        const pointY = map(marks[i], 0, 100, y + 15 + graphH, y + 15);
        fill(marks[i] < 50 ? '#E63946' : '#003865');
        noStroke();
        ellipse(pointX, pointY, 6, 6);
    }
}