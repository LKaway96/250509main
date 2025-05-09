// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let circleX, circleY; // 圓的初始位置
let circleRadius = 50; // 圓的半徑

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
}

function draw() {
  image(video, 0, 0);

  // 畫出圓
  fill(0, 0, 255);
  noStroke();
  circle(circleX, circleY, circleRadius * 2);

  // Ensure at least one hand is detected
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 獲取左手食指的座標 (keypoint 8)
        if (hand.handedness === "Left") {
          let indexFinger = hand.keypoints[8];
          let d = dist(indexFinger.x, indexFinger.y, circleX, circleY);

          // 如果食指碰觸到圓，讓圓跟隨食指移動
          if (d < circleRadius) {
            circleX = indexFinger.x;
            circleY = indexFinger.y;
          }
        }

        // Loop through keypoints and draw circles
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];

          // Color-code based on left or right hand
          if (hand.handedness == "Left") {
            fill(255, 0, 255);
          } else {
            fill(255, 255, 0);
          }

          noStroke();
          circle(keypoint.x, keypoint.y, 16);
        }

        // Draw lines connecting keypoints for each finger
        drawFingerLines(hand.keypoints, 0, 4);  // Thumb
        drawFingerLines(hand.keypoints, 5, 8);  // Index finger
        drawFingerLines(hand.keypoints, 9, 12); // Middle finger
        drawFingerLines(hand.keypoints, 13, 16); // Ring finger
        drawFingerLines(hand.keypoints, 17, 20); // Pinky finger
      }
    }
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
