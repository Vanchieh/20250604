let grid = [];
let cols, rows; let size = 100; // 放大10倍

let handPose;
let video;
let hands = [];
let options = {flipped: true};

// 新增字母陣列
const letters = ["T", "K", "U", "E", "T"];
// 新增顏色陣列
const colors = ["#ff595e","#ffca3a","#8ac926","#1982c4","#6a4c93"];

function preload() {
  handPose = ml5.handPose(options);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO, {flipped: true});
  video.size(windowWidth, windowHeight);
  video.hide();
  handPose.detectStart(video, gotHands);

  resizeGrid();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  video.size(windowWidth, windowHeight);
  resizeGrid();
}

function resizeGrid() {
  cols = floor(width/size);
  rows = floor(height/size);
  grid = [];
  for (let i=0; i<cols; i++) {
    grid[i] = [];
    for (let j=0; j<rows; j++) {
      grid[i][j] = null;
    }
  }
}

let dropCooldown = 0; // 新增冷卻計時器
let dropInterval = 15; // 每15幀才掉落一次

function draw() {
  background(0);
  image(video, 0, 0, width, height);

  // 掉落冷卻計時
  if (dropCooldown > 0) {
    dropCooldown--;
  }

  let fingerX, fingerY;

  // 只在冷卻結束時且有手時掉落一個
  if (hands.length > 0) {
    let hand = hands[0]; // 只取第一隻手
    let indexFinger = hand.keypoints[8];
    fingerX = indexFinger.x;
    fingerY = indexFinger.y;

    // 畫紅點
    fill(255, 0, 0);
    noStroke();
    ellipse(fingerX, fingerY, 20, 20);

    // 只在冷卻結束時掉落
    if (dropCooldown === 0) {
      addCoins(fingerX, fingerY);
      dropCooldown = dropInterval; // 重設冷卻
    }

    // 檢查碰撞
    let gridX = floor(fingerX / size);
    let gridY = floor(fingerY / size);
    gridX = constrain(gridX, 0, cols-1);
    gridY = constrain(gridY, 0, rows-1);
    if (grid[gridX][gridY]) {
      grid[gridX][gridY] = null;
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
        let {val, alpha, color} = grid[i][j];
        fill(color);
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
  // 隨機選一個字母和顏色
  let letter = random(letters);
  let color = random(colors);
  grid[x][y] = {
    val: letter,
    alpha: (frameCount % 205) + 50,
    color: color
  };
}

function gotHands(results) {
  hands = results;
}
