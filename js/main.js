
/*
  contains arrays for each major emotion that contain their sub-emotions.
  includes methods for converting emotion to color
*/
class EmotionManager {
    constructor () {
        var likeList = [
          "happy", 
          "nice", 
          "genuine smile ", 
          "agreement", 
          "pleased", 
          "relieved", 
          "interested", 
          "agreeable", 
          "nice hello ", 
          "nice goodbye ", 
          "calm", 
          "modest", 
          "relaxed", 
          "curious", 
          "determined", 
          "questioning", 
          "contemplative", 
          "smug", 
          "knowing", 
          "shy", 
          "look left ", 
          "look right ", 
          "look up ", 
          "look down",
          "cool"
        ];

        var loveList = [
          "love", 
          "sympathy", 
          "supportive", 
          "positive", 
          "appreciation", 
          "very happy", 
          "gentle", 
          "belief", 
          "thoughtful", 
          "dancing", 
          "serious", 
          "excited", 
          "proud", 
          "sweetness", 
          "singing", 
          "flirty", 
          "righteous", 
          "sure", 
          "victorious",
          "didactic"
        ];

        var laughingList = [
          "ha!", 
          "ha",
          "nice laugh", 
          "nasty laugh", 
          "giggling", 
          "sniggering", 
          "mocking", 
          "joking", 
          "silly", 
          "wry smile", 
          "sarcastic smile", 
          "amused", 
          "naughty", 
          "tongue out", 
          "winking"
        ];

        var surpriseList = [
          "shocked", 
          "aah", 
          "disbelief", 
          "amazed", 
          "surprised", 
          "jumpy", 
          "impressed", 
          "alert"
        ];

        var sadList = [
          "crying", 
          "very sad", 
          "upset", 
          "frowning", 
          "sad", 
          "uninterested", 
          "sigh", 
          "apologetic", 
          "disappointed", 
          "disinterested", 
          "confused", 
          "uncomfortable", 
          "embarrassed", 
          "disagreement", 
          "reluctant", 
          "worried", 
          "concerned", 
          "distracted", 
          "doubting", 
          "forgetful", 
          "guilty", 
          "lazy", 
          "none", 
          "bored", 
          "sleepy", 
          "tired", 
          "unsure", 
          "robotic"
        ];

        var angerList = [
          "furious", 
          "forceful",
          "infuriated", 
          "angry", 
          "scared", 
          "shouting", 
          "frustrated", 
          "nasty goodbye", 
          "indignation", 
          "mean", 
          "annoyed", 
          "argumentative", 
          "assertive", 
          "stubborn",
          "devious",
          "grumpy"
        ];

        var disgustList = [
          "eek!",
          "eek",
          "hatred", 
          "disgust", 
          "sneering", 
          "sarcastic", 
          "displeased", 
          "negative", 
          "unimpressed", 
          "reluctant hello", 
          "nosey", 
          "rude", 
          "uncomfortable"
        ];

        this.responseLists = [likeList, loveList, laughingList, surpriseList, sadList, angerList, disgustList];
        this.responseNames = ["like", "love", "laughing", "surprise", "sad", "anger", "disgust"];
    }

    getEmotionCategory (input) {
        for (var i = 0; i < this.responseLists.length; i++) {
            var list = this.responseLists[i];
            var foundI = list.indexOf(input.trim());
            if (foundI >= 0) {
                return this.getEmotionCategoryName(i);
            }
        }
    }

    getEmotionCategoryName (index) {
        return this.responseNames[index];
    }
    
    getColorForEmotion (input) {
        return this.getColorForEmotionCategory(this.getEmotionCategory(input));
    }

    getColorForEmotionIndex (i) {
        return rgbToHex(this.getColorForEmotionCategory(this.responseNames[i]));
    }

    getColorForEmotionCategory (input) {
        var r = 0;
        var g = 0;
        var b = 0;
        
        if (input == "anger") {
            r = 175;
            g = 7;
            b = 7;
        }
        if (input == "sad") {
            r = 145;
            g = 169;
            b = 242;
        }
        if (input == "love") {
            r = 255;
            g = 0;
            b = 106;
        }
        if (input == "disgust") {
            r = 77;
            g = 170;
            b = 37;
        }
        if (input == "like") {
            r = 115;
            g = 239;
            b = 146;
        }
        if (input == "laughing") {
            r = 255;
            g = 255;
            b = 22;
        }
        if (input == "surprise") {
            r = 255;
            g = 170;
            b = 10;
        }

        return {
            r: r,
            g: g,
            b: b
        }
    }
}

/* ========================================================================== */
/* =========================== Variables ==================================== */

// init state
var prevOutput = "Hello";
var prevCs = "";

// add svg canvas to all modules
d3.selectAll(".module").append("svg")
                        .attr("width", "100%")
                        .attr("height", "100%");

var EM = new EmotionManager();

// module variables
var emGrid =  d3.select("#emotion-history-grid svg");
var emGradient =  d3.select("#emotion-gradient svg");
var emGradientBottom =  d3.select("#emotion-gradient-bottom svg");

// list of color blocks
var colorsList = [];
var blockAddDuration = 500;


// gradients 
var gradientBottom;
var gradient;
var gradientDuration = 500;

var particlesModule;
var intervalID

class Particles {
    constructor () {

        /* restarts the simulation */
        this.restart = () => {
          // Apply the general update pattern to the nodes.
          node = node.data(nodes);
          wall = wall.data(walls);
          node.exit().remove();
          wall.exit().remove();
          
          node = node.enter().append("circle").attr("fill", (d) => d.color).attr("r", nodeRadius).merge(node),
          wall = wall.enter().append("circle").attr("fill", (d) => "#000").attr("r", 50).merge(wall),

          // Update and restart the simulation.
          simulation.nodes(walls.concat(nodes));
          simulation.force("gravity", this.gravity);
          simulation.alpha(1).restart();
        }

        /* renders the canvas, every frame */
        this.ticked = () => {
            node.attr("cx", (d) => { return d.x = Math.max(width/-2 + nodeRadius, Math.min(width/2 - nodeRadius, d.x)); })
                .attr("cy", (d) => { return d.y = Math.max(height/-2 + nodeRadius, Math.min(height/2 - nodeRadius, d.y)); })
                .attr("r", (d) => d.radius);
            
            wall.attr("cx", (d) => d.fx)
                .attr("cy", (d) => d.fy)
                .attr("r", (d) => d.radius);
        }

        /* adds node to the canvas */
        this.addNode = (color, x, y) => {
            nodes.push({x: x, y: y, color: color, radius: nodeRadius, type: "node"});
            this.restart();
        }

        this.gravity = (alpha) => {
            for (var i = 0, n = nodes.length, node, k = alpha * 0.1; i < n; ++i) {
                node = nodes[i];
                node.vy += 1;
            }
        }

        this.dumpColors = (rectList) => {
            console.log(rectList);
            for (let i = 1; i < rectList.length; i++) {
                let rect = rectList[i];
                let x = rect.attr("x");
                let bbox = rect.node().getBoundingClientRect();
                console.log(bbox);
                setIntervalX( () => {
                    this.addNode(rect.attr("fill"), bbox.left + bbox.width/2 - width/2, height/-2)
                }, 100, 15);
            }
        }

        this.oscillate = () => {
            var intervalTime = 2000;

            // oscilate left ball
            setInterval (() => {
                this.setWallRadius(0, 1, 5);
            }, intervalTime)
            
            setTimeout (() => {
                setInterval (() => {
                    this.setWallRadius(0, 1, -5);
                }, intervalTime)
            }, intervalTime/2)

            // oscilate right ball
            setInterval (() => {
                this.setWallRadius(1, 1, 5);
            }, intervalTime*(2/3))
            
            setTimeout (() => {
                setInterval (() => {
                    this.setWallRadius(1, 1, -5);
                }, intervalTime*(2/3))
            }, intervalTime*(2/3)/2)
        }

        this.setWallRadius = (i, r, amount) => {
            setIntervalX ( () => {
                walls[i].radius += amount;
                this.restart();
            }, 20, 40);
        }

        /* ================================================================== */

        var svg = d3.select("#particles svg"),
            bbox = svg.node().getBoundingClientRect(),
            width = bbox.width,
            height = bbox.height,
            nodeRadius = 5,
            wallRadius = 250,
            floorRadius = 10000,
            floorY = floorRadius - 8 + height/2

        var nodes = [],
            walls = [{fx: width/-2 - wallRadius/1.5, fy: height/3, radius: wallRadius, fixed: true, id: 0}, // left wall
                     {fx: width/2 + wallRadius/1.5,  fy: height/3, radius: wallRadius, fixed: true, id: 1},  // right wall
                     {fx: 0, fy: floorY, radius: floorRadius, fixed: true, id: 2}];   // floor

        var aDecay = 0.1,
            vDecay = 0.05,
            chargeStrength = -10,
            gravityStrength = 0.03,
            collideStrength = 1.3,
            collideIterations = 5,
            nodeBuffer = 8

        var simulation = d3.forceSimulation(walls.concat(nodes))
            .alphaDecay(aDecay)
            .velocityDecay(vDecay)
            //.force("charge", d3.forceManyBody().strength(chargeStrength))
            .force("gravity", this.gravity(gravityStrength))
            .force("collide", d3.forceCollide().radius((d) => {
                if (d.type == "node") {
                    return d.radius + Math.random() * 0.25 + nodeBuffer
                } else return d.radius;
            }).iterations(collideIterations).strength((collideStrength)))
            .alphaTarget(1)
            .on("tick", this.ticked);

        var g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        var node = g.append("g").selectAll(".node");
        var wall = g.append("g").selectAll(".wall");

        this.restart();
    }
}


/* ========================================================================== */

/* listen for key presses*/
$(window).keypress(function(e) {
    if (e.which === 32) { // space bar
        getResponse();
    }
});

/* execute on page load*/
$(document).on("ready", function () {
    
    particlesModule = new Particles();
    particlesModule.oscillate();

    getResponse();
})

function dump () {
    particlesModule.dumpColors(colorsList);
}

/* 
  returns a JSON response from the cleverbot API using the prevOutpt as the input
*/
function getResponse () {
    //particlesModule.addNode(EM.getColorForEmotionIndex(Math.floor(Math.random() * 7)), 0, 0);
    //return;

    $(".loading-spinner").show();
    
    var stringWithoutSpaces = prevOutput.replace(/\s/g, '+');
    var url = "http://www.cleverbot.com/getreply?key=" + APIKEY + "&input=" + 
                stringWithoutSpaces + "&cs=" + prevCs + "&cb_settings_emotion=yes";
    
    $.getJSON(url, function(data) {
        $(".loading-spinner").hide();
        var emotionCategory = EM.getEmotionCategory(data.emotion);
        //var interactionCount = getInteractionCount(data.interaction_count);
        
        //console.log(data);
        console.log(data);
        console.log("OUTPUT: ", data.output);
        console.log("EMOTION: ", data.emotion);
        console.log("IN CATEGORY: ", emotionCategory);
        console.log("INTERACTION COUNT: ", data.interaction_count)

        $(".conversation-text").html(data.output);

        var newCol = rgbToHex(EM.getColorForEmotion(data.emotion));

        if (data.interaction_count > 0) {
            renderGradient(newCol);
            //particlesModule.setWallRadius(0, data.emotion_degree);
        }
        
        prevOutput = data.output;
        prevCs = data.cs;
    });
}

/*
  creates a gradient from the previous color to the current color
*/
function renderGradient (newCol) {
    var width = "100%";
    var prevCol = "#000";
    
    if(colorsList.length > 1) {
        var prevRect = colorsList[colorsList.length - 1];
        //console.log(prevRect)
        prevCol = colorsList[colorsList.length - 1].attr("fill");
    }
    
    var gradientTransition = d3.transition()
        .duration(gradientDuration)
        .ease(d3.easeSinInOut);
    
    gradientTransition.on("end", function() {
        console.log("ended");
        addToHistory(newCol);
    })

    d3.select("#emotion-gradient").style("width", "0%");
    d3.select("#emotion-gradient").transition(gradientTransition).style("width", "100%");

    //emGradient.remove();
    if (gradient) {
        gradient.remove();
    }

    if (gradientBottom) {
        gradientBottom.remove();
    }

    gradient = emGradient.append("linearGradient")
                        .attr("id", "gradient")
                        .attr("x1", "0")
                        .attr("y1", "0")
                        .attr("x2", width)
                        .attr("y2", "0")
                        .attr("spreadMethod", "pad");

    gradient.append("stop")
        .attr("offset", 0)
        .attr("stop-color", prevCol)
        .attr("stop-opacity", 1);

    gradient.append("stop")
        .attr("offset", width)
        .attr("stop-color", newCol)
        .attr("stop-opacity", 1);

    emGradient.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .style("fill", "url(#gradient)");
    
    var prevPrevCol = "#000";
    if (colorsList.length > 2) {
        prevPrevCol = colorsList[colorsList.length - 2].attr("fill");
    }
    //console.log(prevCol);
    
    gradientBottom = emGradientBottom.append("linearGradient")
                        .attr("id", "gradient-bottom")
                        .attr("x1", "0%")
                        .attr("y1", "0%")
                        .attr("x2", "100%")
                        .attr("y2", "0%")
                        .attr("spreadMethod", "pad");

    gradientBottom.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", prevPrevCol)
        .attr("stop-opacity", 1);

    gradientBottom.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", prevCol)
        .attr("stop-opacity", 1);

    emGradientBottom.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .style("fill", "url(#gradient-bottom)");
}

/*
  adds a color block to the conversation history module
*/
function addToHistory (newCol) {
    var len = colorsList.length;

    if (!len) {
        len = 1;
    }
    
    var width = 100 / len;
    var xPos = width * (len - 1);
    
    var t = d3.transition()
            .duration(blockAddDuration)
            .ease(d3.easeLinear);

    colorsList.forEach(function(rect, index) {
        rect.transition(t).attr("width", width + "%");
        rect.transition(t).attr("x", width * (index - 1) + "%");
    })
    
    var newRect = emGrid.append("rect")
            .attr("x", "100%")
            .attr("y", 0)
            .attr("width", 0)
            .attr("height", "100%")
            .attr("fill", newCol);

    newRect.transition(t).attr("width", width+"%");
    newRect.transition(t).attr("x", xPos + "%");
    
    colorsList.push(newRect);
}

/* ========================================================================== */

/* ========================================================================== */
$("#show-menu").on("click", function () {
    $("#menu").show();
})

/*
  helper for hex converter
*/
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

/* 
  converts {r,g,b} object to hex color
*/
function rgbToHex(col) {
    var r = col.r;
    var g = col.g;
    var b = col.b;

    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function setIntervalX(callback, delay, repetitions) {
    var x = 0;
    var intervalID = window.setInterval(function () {

       callback();

       if (++x === repetitions) {
           window.clearInterval(intervalID);
       }
    }, delay);
}



$(".enter-fullscreen").on("click", function () {
    toggleFullScreen();
});

function toggleFullScreen () {
  if (!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}