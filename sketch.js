// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let circleX, circleY; // 圓的初始位置
let circleRadius = 50; // 圓的半徑
let isDragging = false; // 是否正在拖動圓
let previousX, previousY; // 儲存圓的前一個位置

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
}

function draw() {
  image(video, 0, 0);

  // 畫出圓
  fill(0, 0, 255);
  noStroke();
  circle(circleX, circleY, circleRadius * 2);

  // 畫出圓心的軌跡
  if (isDragging) {
    stroke(255, 0, 0); // 紅色線條
    strokeWeight(2);
    line(previousX, previousY, circleX, circleY);
    previousX = circleX;
    previousY = circleY;
  }

  // 確保至少檢測到一隻手
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 獲取左手食指與大拇指的座標
        if (hand.handedness === "Left") {
          let indexFinger = hand.keypoints[8];
          let thumb = hand.keypoints[4];

          // 計算食指與圓心的距離
          let dIndex = dist(indexFinger.x, indexFinger.y, circleX, circleY);
          // 計算大拇指與圓心的距離
          let dThumb = dist(thumb.x, thumb.y, circleX, circleY);

          // 如果食指與大拇指同時碰觸到圓的邊緣，讓圓跟隨手指移動
          if (dIndex < circleRadius && dThumb < circleRadius) {
            circleX = (indexFinger.x + thumb.x) / 2;
            circleY = (indexFinger.y + thumb.y) / 2;
            isDragging = true; // 開始畫軌跡
          } else {
            isDragging = false; // 停止畫軌跡
          }
        }

        // 繪製手部關節點
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];

          // 根據左右手設定顏色
          if (hand.handedness == "Left") {
            fill(255, 0, 255);
          } else {
            fill(255, 255, 0);
          }

          noStroke();
          circle(keypoint.x, keypoint.y, 16);
        }

        // 繪製手指的連接線
        drawFingerLines(hand.keypoints, 0, 4);  // Thumb
        drawFingerLines(hand.keypoints, 5, 8);  // Index finger
        drawFingerLines(hand.keypoints, 9, 12); // Middle finger
        drawFingerLines(hand.keypoints, 13, 16); // Ring finger
        drawFingerLines(hand.keypoints, 17, 20); // Pinky finger
      }
    }
  } else {
    isDragging = false; // 停止畫軌跡
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
