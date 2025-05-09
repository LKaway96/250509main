// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let circleX, circleY; // 圓的初始位置
let circleRadius = 50; // 圓的半徑
let isDragging = false; // 是否正在拖動圓 (食指)
let isThumbDragging = false; // 是否正在拖動圓 (大拇指)
let previousX, previousY; // 儲存圓的前一個位置 (食指)
let thumbPreviousX, thumbPreviousY; // 儲存圓的前一個位置 (大拇指)

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // 圓的初始位置在視窗中間
  circleX = width / 2;
  circleY = height / 2;

  // Start detecting hands
  handPose.detectStart(video, gotHands);

  // 初始化前一個位置
  previousX = circleX;
  previousY = circleY;
  thumbPreviousX = circleX;
  thumbPreviousY = circleY;
}

function draw() {
  image(video, 0, 0);

  // 畫出圓
  fill(0, 0, 255);
  noStroke();
  circle(circleX, circleY, circleRadius * 2);

  // 畫出圓心的軌跡 (食指)
  if (isDragging) {
    stroke(255, 0, 0); // 紅色線條
    strokeWeight(2);
    line(previousX, previousY, circleX, circleY);
    previousX = circleX;
    previousY = circleY;
  }

  // 畫出圓心的軌跡 (大拇指)
  if (isThumbDragging) {
    stroke(0, 255, 0); // 綠色線條
    strokeWeight(2);
    line(thumbPreviousX, thumbPreviousY, circleX, circleY);
    thumbPreviousX = circleX;
    thumbPreviousY = circleY;
  }

  // 確保至少檢測到一隻手
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 獲取手指的座標
        let indexFinger = hand.keypoints[8];
        let thumb = hand.keypoints[4];

        // 計算食指與圓心的距離
        let dIndex = dist(indexFinger.x, indexFinger.y, circleX, circleY);
        // 計算大拇指與圓心的距離
        let dThumb = dist(thumb.x, thumb.y, circleX, circleY);

        // 如果食指碰觸到圓的邊緣，讓圓跟隨食指移動
        if (dIndex < circleRadius) {
          circleX = indexFinger.x;
          circleY = indexFinger.y;
          isDragging = true; // 開始畫紅色軌跡
          isThumbDragging = false; // 停止畫綠色軌跡
        } 
        // 如果大拇指碰觸到圓的邊緣，讓圓跟隨大拇指移動
        else if (dThumb < circleRadius) {
          circleX = thumb.x;
          circleY = thumb.y;
          isThumbDragging = true; // 開始畫綠色軌跡
          isDragging = false; // 停止畫紅色軌跡
        } else {
          isDragging = false; // 停止畫紅色軌跡
          isThumbDragging = false; // 停止畫綠色軌跡
        }
      }
    }
  } else {
    isDragging = false; // 停止畫紅色軌跡
    isThumbDragging = false; // 停止畫綠色軌跡
  }
}

// Helper function to draw lines between keypoints
function drawFingerLines(keypoints, startIdx, endIdx) {
  stroke(0, 255, 0); // Set line color
  strokeWeight(2);   // Set line thickness
  for (let i = startIdx; i < endIdx; i++) {
    let kp1 = keypoints[i];
    let kp2 = keypoints[i + 1];
    line(kp1.x, kp1.y, kp2.x, kp2.y);
  }
}
