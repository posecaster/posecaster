var theModel;
var inputSize = 100;
var camera;

javascript: (function () { var script = document.createElement('script'); script.onload = function () { var stats = new Stats(); document.body.appendChild(stats.dom); requestAnimationFrame(function loop() { stats.update(); requestAnimationFrame(loop) }); }; script.src = 'https://mrdoob.github.io/stats.js/build/stats.min.js'; document.head.appendChild(script); })()

function getXMLHTTPRequest() {
    var request;
    // Lets try using ActiveX to instantiate the XMLHttpRequest object
    try {
        request = new ActiveXObject("Microsoft.XMLHTTP");
    } catch (ex1) {
        try {
            request = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (ex2) {
            request = null;
        }
    }
    // If the previous didn't work, lets check if the browser natively support XMLHttpRequest 
    if (!request && typeof XMLHttpRequest != "undefined") {
        //The browser does, so lets instantiate the object
        request = new XMLHttpRequest();
    }
    return request;
}


function loadFile(filename, callback) {
    var aXMLHttpRequest = getXMLHTTPRequest();
    var allData;
    if (aXMLHttpRequest) {
        aXMLHttpRequest.open("GET", filename, true);

        aXMLHttpRequest.onreadystatechange = function (aEvt) {
            if (aXMLHttpRequest.readyState == 4) {
                allData = aXMLHttpRequest.responseText;
                callback(allData)
            }
        };

        //Lets fire off the request
        aXMLHttpRequest.send(null);
    }
    else {
        //Oh no, the XMLHttpRequest object couldn't be instantiated.
        alert("A problem occurred instantiating the XMLHttpRequest object.");
    }
}


var onresize = function () {
    width = document.body.clientWidth;
    height = document.body.clientHeight;
    document.getElementsByClassName("container")[0].style.transform = "scale(" + width / 1280 + ") translate(-50%, -50%)";
    //document.getElementsByClassName("container")[0].style.transform = "scale(" + height/720 + ") translate(-50%, -50%)";
    document.getElementsByClassName("container")[0].style.transformOrigin = "0 0";
    setTimeout(function () {
        // This hides the address bar:
        window.scrollTo(0, 1);
    }, 1000);
}


window.addEventListener("resize", onresize);
onresize();

/*
document.body.addEventListener("mouseenter", function() {
    document.getElementById("controls").style.transition= "all 1s";
    document.getElementById("controls").style.marginLeft= "0px"
});
document.body.addEventListener("mouseleave", function(){
    document.getElementById("controls").style.marginLeft= "-450px"
});

setTimeout(function(){
    document.getElementById("controls").style.marginLeft= "-450px"
}, 3*1000);
*/





/*
var script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/gh/dataarts/dat.gui/dat.gui.min.js';
document.head.appendChild(script);
*/


var modelSettings = {
    'model': window.location.pathname.replace("index.html", "").split("/models/")[1].replace("/", ""),
    'title': function () { return this.model; },
    wsurl: localStorage.getItem("wsurl") || "ws://localhost:44444/",
    picinpic: function () {
        window.videoPicInPic();
    },
    reload: function () {
        window.location.reload();
    },
    about: function () {
        window.open("https://about.posecaster.com");
    },
    quit: function () {
        var x = confirm("Are you sure you want to exit?");
        if (x) {
            window.close();
        }
    },
    inputSize: 100,
    selfie: false,
    sendImage: false,
    complexity: null,
    detectionThreshold: 0.5,
    trackingThreshold: 0.5
};

var complex = ['lite', 'full', 'heavy'];

if (modelSettings.model === "face") {
    complex = ['short range', 'full range'];
}
else if (modelSettings.model === "hands") {
    complex = ['lite', 'full'];
}
modelSettings["complexity"] = complex[0];
modelSettings[modelSettings.model] = modelSettings.title;

var allModels = ['pose', 'hands', 'face', 'facemesh', 'holistic'];
allModels.splice(allModels.indexOf(modelSettings.model), 1);

allModels = [modelSettings.model].concat(allModels);

const gui = new dat.GUI({ width: 300 });



// add heading

// add heading
//
gui.add(modelSettings, modelSettings.model);

const modelFolder = gui.addFolder('Switch Model');
modelFolder.add(modelSettings, 'model', allModels).onChange(function (newModel) {
    if (newModel == window.location.pathname.replace("index.html", "").split("/models/")[1].replace("/", "")) {
        return;
    }
    else {
        window.location.href = "../../models/" + newModel + "/index.html";
    }
});

const netFolder = gui.addFolder('Network Settings');

netFolder.add(modelSettings, 'wsurl').onFinishChange(function (value) {
    localStorage.setItem("wsurl", value);
    ws.close();
    connectws();
});


netFolder.add(modelSettings, 'sendImage').onChange(function (value) {

});

const settFolder = gui.addFolder('Model Settings');

modelSettings.inputSize = parseInt(localStorage.getItem("inputSize") || 100);

settFolder.add(modelSettings, 'inputSize', 10, 100).step(1).onFinishChange(function (value) {
    localStorage.setItem("inputSize", value);
    window.location.reload();
});


settFolder.add(modelSettings, 'selfie').onChange(function (value) {
    if (value) {
        document.getElementsByClassName("output_canvas")[0].style.transform = "scale(-1, 1)";
    }
    else {
        document.getElementsByClassName("output_canvas")[0].style.transform = "";
    }
});

settFolder.add(modelSettings, 'complexity', complex).onChange(function (value) {
    updateModel();
});

settFolder.add(modelSettings, 'detectionThreshold', 0.0, 1.0).onChange(function (value) {
    updateModel();
});

if (modelSettings.model != "face") {
    settFolder.add(modelSettings, 'trackingThreshold', 0.0, 1.0).onChange(function (value) {
        updateModel();
    });
}

var misc = gui.addFolder('App Settings');
misc.add(modelSettings, 'reload');
//misc.add(modelSettings, 'picinpic');
misc.add(modelSettings, 'quit');
misc.add(modelSettings, 'about');

modelFolder.open();
netFolder.open();
settFolder.open();
misc.open();
//gui.close();

function updateModel() {
    if (theModel) {
        theModel.setOptions({
            modelComplexity: complex.indexOf(modelSettings.complexity),
            smoothLandmarks: true,
            enableSegmentation: true,
            smoothSegmentation: true,
            refineFaceLandmarks: true,
            maxNumFaces: 5,
            maxFaces: 5,
            maxNumHands: 4,
            minDetectionConfidence: modelSettings.detectionThreshold,
            minTrackingConfidence: modelSettings.trackingThreshold
        });
    }
}

setTimeout(function () {
    updateModel();
}, 1000);
