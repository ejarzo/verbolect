
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


// list of color blocks
//var colorsList = [];

// the modules
var particlesModule,
    historyModule,
    gradientModule;

/* ========================================================================== */
/* =========================== GRADIENT CLASS =============================== */

class Gradient {
    constructor () {

        this.emGradientTop = d3.select("#emotion-gradient svg");
        this.emGradientBottom =  d3.select("#emotion-gradient-bottom svg");

        this.gradientBottom;
        this.gradient;
        this.transitionDuration = 500;
    }

    renderNewGradient (newCol) {
        var width = "100%";
        var prevCol = "#000";
        
        var colorsList = historyModule.colorsList;

        if(colorsList.length > 1) {
            var prevRect = colorsList[colorsList.length - 1];
            //console.log(prevRect)
            prevCol = colorsList[colorsList.length - 1].attr("fill");
        }
        
        var gradientTransition = d3.transition()
            .duration(this.transitionDuration)
            .ease(d3.easeSinInOut);
        
        gradientTransition.on("end", function() {
            console.log("ended");
            historyModule.addToHistory(newCol);
        })

        d3.select("#emotion-gradient").style("width", "0%");
        d3.select("#emotion-gradient").transition(gradientTransition).style("width", "100%");

        if (this.gradient) {
            this.gradient.remove();
        }

        if (this.gradientBottom) {
            this.gradientBottom.remove();
        }

        // TODO CLEAN
        this.gradient = this.emGradientTop.append("linearGradient")
                            .attr("id", "gradient")
                            .attr("x1", "0")
                            .attr("y1", "0")
                            .attr("x2", width)
                            .attr("y2", "0")
                            .attr("spreadMethod", "pad");

        this.gradient.append("stop")
            .attr("offset", 0)
            .attr("stop-color", prevCol)
            .attr("stop-opacity", 1);

        this.gradient.append("stop")
            .attr("offset", width)
            .attr("stop-color", newCol)
            .attr("stop-opacity", 1);

        this.emGradientTop.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .style("fill", "url(#gradient)");
        
        var prevPrevCol = "#000";
        if (colorsList.length > 2) {
            prevPrevCol = colorsList[colorsList.length - 2].attr("fill");
        }
        
        this.gradientBottom = this.emGradientBottom.append("linearGradient")
                            .attr("id", "gradient-bottom")
                            .attr("x1", "0%")
                            .attr("y1", "0%")
                            .attr("x2", "100%")
                            .attr("y2", "0%")
                            .attr("spreadMethod", "pad");

        this.gradientBottom.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", prevPrevCol)
            .attr("stop-opacity", 1);

        this.gradientBottom.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", prevCol)
            .attr("stop-opacity", 1);

        this.emGradientBottom.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .style("fill", "url(#gradient-bottom)");
    }
}

/* ========================================================================== */
/* ====================== CONVERSATION HISTORY CLASS ======================== */

class History {
    constructor () {
        this.svg = d3.select("#emotion-history-grid svg");
        this.colorsList = [];
        this.blockAddDuration = 800;
        this.blockDumpDuration = 800;
    }


    /*
      adds a color block to the conversation history module
    */
    
    addToHistory (newCol) {
        var len = this.colorsList.length;
        if (!len) {len = 1;}

        var t = d3.transition()
                .duration(this.blockAddDuration)
                .ease(d3.easeLinear);

        var width = 100 / len;
        var xPos = width * (len - 1);

        this.colorsList.forEach((rect, index) => {
            rect.transition(t).attr("width", width + "%");
            rect.transition(t).attr("x", width * (index - 1) + "%");
        })
        
        var newRect = this.svg.append("rect")
                .attr("x", "100%")
                .attr("y", 0)
                .attr("width", 0)
                .attr("height", "100%")
                .attr("fill", newCol);

        newRect.transition(t).attr("width", width+"%");
        newRect.transition(t).attr("x", xPos + "%");
        
        this.colorsList.push(newRect);
    }

    dumpColors () {
        var t = d3.transition()
                .duration(this.blockDumpDuration)
                .ease(d3.easePolyOut);

        this.colorsList.forEach((rect, index) => {
            rect.transition(t).attr("y", "100%");
        })

        this.colorsList.length = 1;
    }
}

/* ========================================================================== */
/* ========================== PARTICLES CLASS =============================== */

class Particles {
    constructor () {

        /* --------------------------- FUNCTIONS ---------------------------- */

        /* restarts the simulation */
        this.restart = () => {
            // Apply the general update pattern to the nodes.
            node = node.data(nodes);
            spinner = spinner.data(spinners);
            floor = floor.data(floors);

            node.exit().remove();
            spinner.exit().remove();
            floor.exit().remove();

            node = node.enter().append("circle").attr("fill", (d) => d.color).attr("r", nodeRadius).merge(node);
            spinner = spinner.enter().append("circle").attr("fill", "#000").attr("stroke", "#fff").attr("stroke-width", 0).merge(spinner);
            floor = floor.enter().append("circle").attr("fill", "#fff").merge(floor);

            // Update and restart the simulation.
            simulation.nodes(floors.concat(spinners.concat(nodes)));
            simulation.force("gravity", this.gravity);
            simulation.force("setSpinnerPos", this.setSpinnerPos)

            simulation.alpha(1).restart();
        }

        /* renders the canvas, every frame */
        this.ticked = () => {
            node.attr("cx", (d) => { return d.x = Math.max(width/-2 + nodeRadius, Math.min(width/2 - nodeRadius, d.x)); })
                .attr("cy", (d) => { return d.y = Math.max(height/-2 + nodeRadius, Math.min(height/2 - nodeRadius, d.y)); })
                .attr("r", (d) => d.radius);
            
            spinner.attr("cx", (d) => d.x)
                .attr("cy", (d) => d.y)
                .attr("r", (d) => d.radius);

            floor.attr("cx", (d) => d.x)
                .attr("cy", (d) => d.y)
                .attr("rx", (d) => d.radius)
                .attr("ry", 10);
        }

        /* adds node to the canvas */
        this.addNode = (color, x, y) => {
            nodes.push({x: x, y: y, color: color, radius: nodeRadius, type: "node"});
            this.restart();
        }

        this.gravity = (alpha) => {
          for (var i = 0; i < nodes.length; i++) {
            let p = nodes[i]
            p.vy += Math.min(0.5, Math.max(0, (p.y - (- height / 2 - 10)) / height ))
            /*if(recycle && p.y < - height / 2) {
              p.x = 2 * width * (Math.random() - 0.5) // double wide area for slow rain
              p.vx = Math.random() - 0.5
              p.vy = -10
              p.y = height / 2
            }*/
          }
        }

        this.dumpColors = (rectList) => {
            console.log(rectList);
            


            for (let i = 1; i < rectList.length; i++) {
                let rect = rectList[i];
                let x = rect.attr("x");
                let bbox = rect.node().getBoundingClientRect();
                let combinedRadius = nodeRadius + nodeBuffer;
                let numNodesPerColor = Math.floor(bbox.width / (2 * combinedRadius))
                
                console.log(numNodesPerColor);
                console.log(bbox);
                
                setIntervalX( () => {
                    for (var i = 0; i < numNodesPerColor; i++) {
                        var x = bbox.left + i * 2 * (combinedRadius);
                        var y = height/-2;
                        x = x-width/2 + combinedRadius;
                        console.log(x);
                        this.addNode(rect.attr("fill"), x, y)
                    }
                }, 100, 7);
            }

        }

        this.clear = () => {
            nodes.length = 0;
            this.restart();
        }

        this.setSpinnerRadius = (i, r, amount) => {
           /* setIntervalX ( () => {
                walls[i].radius += amount;
                this.restart();
            }, 20, 40);*/
        }
        
        this.setSpinnerPos = () => {
            var circle1Center = getCircleCenter(d3.select(".spinner1"))
            var circle2Center = getCircleCenter(d3.select(".spinner2"))
            
            floors[0].x = 0;
            floors[0].y = floorY;
            
            spinners[0].x = circle1Center.x - width / 2;
            spinners[0].y = circle1Center.y - height / 2;
            
            spinners[1].x = circle2Center.x - width / 2;
            spinners[1].y = circle2Center.y - height / 2;  
        }

        /* ------------------------------------------------------------------ */
        
        /*
            Initiates the spinning "mixers" and the lines that connect them
            The spinners are not actually part of the simulation, but their 
            position dictates the position of the circles below them ( the 
            black ones that move through and actually mix the colored nodes)
        */
        this.initSpinners = () => {
            
            // center of rotation for left circle
            var cx1 = width / 4;
            var cy1 = height / 2;
            
            // center of rotation for right circle
            var cx2 = width - width / 4;
            var cy2 = height / 2;

            // spinning circles
            var spinnerCircles = rotateElements.append("g").attr("fill", "#fff");
            
            var spinner1 = spinnerCircles.append("circle")
                .attr("r", 15)
                .attr("cx", cx1)
                .attr("cy", 30)
                .attr("class", "spinner1");

            var spinner2 = spinnerCircles.append("circle")
                .attr("r", 15)
                .attr("cx", cx2)
                .attr("cy", 30)
                .attr("class", "spinner2");

            // the lines tha connect the circles
            var edges = rotateElements.append("g").attr("stroke", "white").attr("stroke-width", "2");
            
            edges.append("line")
                .attr("class", "edge-middle")
                
            edges.append("line")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("class", "edge-top-left")
            
            edges.append("line")
                .attr("x1", 0)
                .attr("y1", height)
                .attr("class", "edge-bottom-left")
            
            edges.append("line")
                .attr("x1", width)
                .attr("y1", 0)
                .attr("class", "edge-top-right")
            
            edges.append("line")
                .attr("x1", width)
                .attr("y1", height)
                .attr("class", "edge-bottom-right")

            // begin animation
            this.animateSpinners();
        }

        this.animateSpinners = () => {
            if (mode === 0) {
                d3.timer(function() {
                    var angle1 = ((Date.now() - start) / 10);
                    var angle2 = ((Date.now() - start) / 9);
                    
                    var transformCircle1 = function() {
                        return "rotate(" + angle1 + "," + width / 4 + "," + height / 2 +")";
                    };
                    var transformCircle2 = function() {
                        return "rotate(" + angle2 + "," + (width - width / 4) + "," + height / 2 +")";
                    };
                    
                    // animate circles
                    var circle1 = d3.select(".spinner1");
                    var circle2 = d3.select(".spinner2");

                    circle1.attr("transform", transformCircle1);
                    circle2.attr("transform", transformCircle2);
                    
                    // lock edge ends to circle centers
                    var circle1Center = getCircleCenter(circle1);
                    var circle2Center = getCircleCenter(circle2);

                    d3.select(".edge-middle")
                        .attr("x2", circle1Center.x)
                        .attr("y2", circle1Center.y)
                        .attr("x1", circle2Center.x)
                        .attr("y1", circle2Center.y);
                    
                    d3.select(".edge-top-left")
                        .attr("x2", circle2Center.x)
                        .attr("y2", circle2Center.y)
                    
                    d3.select(".edge-bottom-left")
                        .attr("x2", circle2Center.x)
                        .attr("y2", circle2Center.y)
                    
                    d3.select(".edge-top-right")
                        .attr("x2", circle1Center.x)
                        .attr("y2", circle1Center.y)
                    
                    d3.select(".edge-bottom-right")
                        .attr("x2", circle1Center.x)
                        .attr("y2", circle1Center.y)
                    
                    return (mode === 0) ? true : false;
                });
                mode = 1;
            } else {
                mode = 0;
            }
        }
        /* --------------------------- VARIABLES ---------------------------- */
        
        // setup
        var svg = d3.select("#particles svg"),
            bbox = svg.node().getBoundingClientRect(),
            width = bbox.width,
            height = bbox.height,
            nodeRadius = 6,
            spinnerRadius = 50,
            floorRadius = 10000,
            floorY = floorRadius - 8 + height/2

        // items in the simulation
        var nodes = [],
            spinners = [
                {radius: spinnerRadius},   // left wall
                {radius: spinnerRadius}    // right wall
            ],
            floors = [
                {radius: floorRadius},
                //{fx: width/2,  fy: 0, rx: floorRadius, ry: 10},
            ];

        // simulation vars
        var aDecay = 0.1,
            vDecay = 0.05,
            chargeStrength = -1,
            gravityStrength = 0.03,
            collideStrength = 1.3,
            collideIterations = 5,
            nodeBuffer = 4

        // the simulation
        var simulation = d3.forceSimulation(floors.concat(spinners.concat(nodes)))
            .alphaDecay(aDecay)
            .velocityDecay(vDecay)
            //.force("charge", d3.forceManyBody().strength(chargeStrength))
            .force("gravity", this.gravity(gravityStrength))
            .force("setSpinnerPos", this.setSpinnerPos)
            .force("collide", d3.forceCollide().radius((d) => {
                return (d.type == "node") ? (d.radius + /*Math.random() * 0.25 +*/ nodeBuffer) : d.radius;
            }).iterations(collideIterations).strength((collideStrength)))
            .alphaTarget(1)
            .on("tick", this.ticked);

        var g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")"),
            node = g.append("g").selectAll(".node"),
            spinner = g.append("g").selectAll(".spinner"),
            floor = g.append("g").selectAll(".floor");

        /* ------------------------------------------------------------------ */

        var rotateElements = svg.append("g");
        var mode = 0;
        var start = Date.now();

        /* ------------------------------------------------------------------ */

        this.initSpinners();
        this.setSpinnerPos();
        
        this.restart();
    }
}

/* ========================================================================== */
/* ========================== DOCUMENT READY ================================ */

/* execute on page load*/
$(document).on("ready", function () {
    
    // init modules
    gradientModule = new Gradient();
    historyModule = new History();
    particlesModule = new Particles();
    

    // add a bunch of nodes for testing
/*    var i = 0;
    while (i++ < 400) {
        particlesModule.addNode(EM.getColorForEmotionIndex(Math.floor(Math.random() * 7)), 0, 0);
        //particlesModule.addNode("#00f", 0, 0);
    }*/

    getResponse();
})

/* ========================================================================== */
/* ============================= HANDLERS =================================== */

/* handler for key presses */
$(window).keypress(function(e) {
    if (e.which === 32) { // space bar
        getResponse();
    }
});

function dump () {
    particlesModule.dumpColors(historyModule.colorsList);
    historyModule.dumpColors();
}

function clearParticles () {
    particlesModule.clear();
}

$(".enter-fullscreen").on("click", function () {
    toggleFullScreen();
});

/* ========================================================================== */
/* =========================== GET RESPONSE ================================= */

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
            gradientModule.renderNewGradient(newCol);
            //particlesModule.setSpinnerRadius(0, data.emotion_degree);
        }
        
        prevOutput = data.output;
        prevCs = data.cs;
    });
}


/* ========================================================================== */
/* ============================== HELPER ==================================== */


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

/*
    executes the callback function "repetitions" times, after a delay
*/
function setIntervalX(callback, delay, repetitions) {
    var x = 0;
    var intervalID = window.setInterval(function () {

       callback();

       if (++x === repetitions) {
           window.clearInterval(intervalID);
       }
    }, delay);
}

/*
    returns the center point of a circle, used for circles that are transformed
*/
function getCircleCenter (circle) {
    var ctm = circle.node().getCTM();
    var cx = circle.attr('cx');
    var cy = circle.attr('cy');
    var x = cx * ctm.a + cy * ctm.c + ctm.e;
    var y = cx * ctm.b + cy * ctm.d + ctm.f;
    return {
        x: x,
        y: y
    }
}

/*
    toggles browser fullscreen mode
*/
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
