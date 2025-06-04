let grid = [];
let cols, rows; let size = 10;

let handPose;
let video;
let hands = [];
let options = {flipped: true};

// 新增字母陣列
const letters = ["T", "K", "U", "E", "T"];

function preload() {
  handPose = ml5.handPose(options);
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, {flipped: true});
  video.size(640, 480);
  video.hide();
  handPose.detectStart(video, gotHands);
  
  cols = floor(width/size);
  rows = floor(height/size);
  for (let i=0; i<cols; i++) {
    grid[i] = [];
    for (let j=0; j<rows; j++) {
      grid[i][j] = null; // 改為 null
    }
  }
}

function draw() {
  background(0);
  // ml5.js handPose Model
  image(video, 0, 0, width, height);
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    for (let j = 0; j < hand.keypoints.length; j++) {
      let indexFinger = hand.keypoints[8];
      addCoins(indexFinger.x, indexFinger.y);
    }
  }
  
  // Falling Coins
  drawRect();
  let nextGrid = [];
  for (let i=0; i<cols; i++) {
    nextGrid[i] = [];
    for (let j=0; j<rows; j++) {
      nextGrid[i][j] = null;
    }
  }
  
  for (let i=0; i<cols; i++) {
    for (let j=0; j<rows; j++) {
      let cell = grid[i][j]; 
      if (cell) {
        if (j + 1 < rows) {
          let below = grid[i][j+1];
          let dir = random() < 0.5 ? 1 : -1;
          let belowDiag = null;
          if (i + dir >= 0 && i + dir <= cols-1) {
            belowDiag = grid[i+dir][j+1];
          }
          if (!below) {
            nextGrid[i][j+1] = cell;
          } else if (!belowDiag) {
            nextGrid[i+dir][j+1] = cell;
          } else {
            nextGrid[i][j] = cell;
          }
        } else {
          nextGrid[i][j] = cell;
        }
      }
    }
  }
  grid = nextGrid;
}

function drawRect() {
  textAlign(CENTER, CENTER);
  textSize(size);
  for (let i=0; i<cols; i++) {
    for (let j=0; j<rows; j++) {
      if (grid[i][j]) {
        let {val, alpha} = grid[i][j];
        fill(255, 223, 0, alpha);
        text(val, i*size + size/2, j*size + size/2);
      }
    }
  }
}

function addCoins(fingerX, fingerY) {
  let x = floor(fingerX / size);
  let y = floor(fingerY / size);
  x = constrain(x, 0, cols-1);
  y = constrain(y, 0, rows-1);
  // 隨機選一個字母
  let letter = random(letters);
  grid[x][y] = {
    val: letter,
    alpha: (frameCount % 205) + 50
  };
}

function gotHands(results) {
  hands = results;
}
