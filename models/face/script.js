// Our input frames will come from here.
const videoElement =
    document.getElementsByClassName('input_video')[0];
const canvasElement =
    document.getElementsByClassName('output_canvas')[0];
const controlsElement =
    document.getElementsByClassName('control-panel')[0];
const canvasCtx = canvasElement.getContext('2d');


/*
const SocketIOClient = require("socket.io-client");
const io = new SocketIOClient("http://localhost:4512");
const socket = io.connect();
socket.on("connect", () => {
	console.log("Connected to Max 8");
});

function sendToMaxPatch(poses) {
    	socket.emit("dispatch", [poses]);
}
*/

//uWebSockets.js/NodeJS



var ws;
function connectws() {
  ws = new WebSocket(modelSettings.wsurl);
  ws.onopen = function() {
    // subscribe to some channels
    ws.send(JSON.stringify({
        //.... some message the I must send when I connect ....
    }));
  };

  ws.onmessage = function(e) {
    console.log('Message:', e.data);
  };

  ws.onclose = function(e) {
    console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
    setTimeout(function() {
      connectws();
    }, 1000);
  };

  ws.onerror = function(err) {
    console.error('Socket encountered error: ', err.message, 'Closing socket');
    ws.close();
  };
}

connectws();



function sendToMaxPatch(poses) {
    ws.send(JSON.stringify(poses));
}



// We'll add this to our control panel later, but we'll save it here so we can
// call tick() each time the graph runs.
//const fpsControl = new FPS();

// Optimization: Turn off animated spinner after its hiding animation is done.
const spinner = document.querySelector('.loading');
spinner.ontransitionend = () => {
  spinner.style.display = 'none';
};

function removeElements(landmarks, elements) {
  for (const element of elements) {
    delete landmarks[element];
  }
}

function removeLandmarks(results) {
  if (results.poseLandmarks) {
    removeElements(
        results.poseLandmarks,
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 16, 17, 18, 19, 20, 21, 22]);
  }
}

function connect(ctx, connectors) {
  const canvas = ctx.canvas;
  for (const connector of connectors) {
    const from = connector[0];
    const to = connector[1];
    if (from && to) {
      if (from.visibility && to.visibility &&
          (from.visibility < 0.1 || to.visibility < 0.1)) {
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(from.x * canvas.width, from.y * canvas.height);
      ctx.lineTo(to.x * canvas.width, to.y * canvas.height);
      ctx.stroke();
    }
  }
}

function onResults(results) {
    console.log(results);
      	//	sendToMaxPatch([results.rightHandLandmarks, results.leftHandLandmarks, results.faceLandmarks,results.poseLandmarks]);
      		sendToMaxPatch(results);
  // Hide the spinner.
  document.body.classList.add('loaded');

  // Remove landmarks we don't want to draw.
 // removeLandmarks(results);

  // Update the frame rate.

  // Draw the overlays.
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {
        drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });
        drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, { color: '#FF3030' });
        drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, { color: '#FF3030' });
        drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, { color: '#30FF30' });
        drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, { color: '#30FF30' });
        drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, { color: '#E0E0E0' });
        drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, { color: '#E0E0E0' });
       // if (solutionOptions.refineLandmarks) {
            drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_IRIS, { color: '#FF3030' });
            drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_IRIS, { color: '#30FF30' });
       // }
    }
}

    /*
  // Pose...
  drawConnectors(
      canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
      {color: '#00FF00'});
  drawLandmarks(
      canvasCtx, results.poseLandmarks,
      {color: '#00FF00', fillColor: '#FF0000'});

  // Hands...
  drawConnectors(
      canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS,
      {color: '#00CC00'});
  drawLandmarks(
      canvasCtx, results.rightHandLandmarks, {
        color: '#00FF00',
        fillColor: '#FF0000',
        lineWidth: 2,
        radius: (landmark) => {
          return lerp(landmark.z, -0.15, .1, 10, 1);
        }
      });
  drawConnectors(
      canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS,
      {color: '#CC0000'});
  drawLandmarks(
      canvasCtx, results.leftHandLandmarks, {
        color: '#FF0000',
        fillColor: '#00FF00',
        lineWidth: 2,
        radius: (landmark) => {
          return lerp(landmark.z, -0.15, .1, 10, 1);
        }
      });
  // Face...
  drawConnectors(
      canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION,
      {color: '#C0C0C070', lineWidth: 1});
  drawConnectors(
      canvasCtx, results.faceLandmarks, FACEMESH_RIGHT_EYE,
      {color: '#FF3030'});
  drawConnectors(
      canvasCtx, results.faceLandmarks, FACEMESH_RIGHT_EYEBROW,
      {color: '#FF3030'});
  drawConnectors(
      canvasCtx, results.faceLandmarks, FACEMESH_LEFT_EYE,
      {color: '#30FF30'});
  drawConnectors(
      canvasCtx, results.faceLandmarks, FACEMESH_LEFT_EYEBROW,
      {color: '#30FF30'});
  drawConnectors(
      canvasCtx, results.faceLandmarks, FACEMESH_FACE_OVAL,
      {color: '#E0E0E0'});
  drawConnectors(
      canvasCtx, results.faceLandmarks, FACEMESH_LIPS,
      {color: '#E0E0E0'});

  // Connect elbows to hands.
  canvasCtx.lineWidth = 5;
  if (results.poseLandmarks) {
    if (results.rightHandLandmarks) {
      canvasCtx.strokeStyle = '#00FF00';
      connect(canvasCtx, [[
                results.poseLandmarks[POSE_LANDMARKS.RIGHT_ELBOW],
                results.rightHandLandmarks[0]
              ]]);
    }
      if (results.leftHandLandmarks) {
        canvasCtx.strokeStyle = '#FF0000';
        connect(canvasCtx, [[
                  results.poseLandmarks[POSE_LANDMARKS.LEFT_ELBOW],
                  results.leftHandLandmarks[0]
                ]]);
    }
  }
    */

  canvasCtx.restore();
}

const face = new FaceMesh({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.1/${file}`;
}});
face.onResults(onResults);
theModel = face;

/**
 * Instantiate a camera. We'll feed each frame we receive into the solution.
 */
var inputSize  = parseInt(localStorage.getItem("inputSize") || 100);
camera = new Camera(videoElement, {
  onFrame: async () => {
    await face.send({image: videoElement});
  },
  width: 1280 * inputSize/100,
  height: 720 * inputSize/100
});
camera.start();

