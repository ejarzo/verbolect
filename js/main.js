/* ========================================================================== */
/* ============================ OPTIONS ===================================== */

const USE_OVERLAY           = 1,    // "eye" circle
      USE_RANDOM_MOVEMENTS  = 1,    // searching around
      USE_VOICE             = 1,    // audio
      USE_IMAGES            = 1,    // call image API
      USE_VIDEOS            = 1,    // call youtube API
      USE_SOUND_EFFECTS     = 0,    // call freesound API
      USE_IMAGE_EFFECT      = 0,    // pixelation effect
      USE_EDGES             = 1,    // lines connecting the spinners
      USE_LINE_DRAWING      = 0,    // svg line drawing effect
      USE_TEXT              = 1,    // text output overlay
      USE_CHAPTERS          = 1,    // shows one "chapter" at a time if true
      USE_GRAVITY           = 0,    // use gravity in the particle simulation
      USE_PRINTING          = 1;

let   INFINITE_REPEAT       = 1;    // run indefinitely 

const RESET_CS_MOD = 20;

const YOUTUBE_AUDIO_ON_TIME = 45000,
      MAX_TIME_BETWEEN_RESPONSES = 7000,
      MIN_TIME_BETWEEN_RESPONSES = 500;

const EYE_RADIUS            = 320,  // radius of roving eye
      EYE_SIZE_CHANGE_MOD   = 6;    // how often the eye changes size
      CHAPTER_SWITCH_MOD    = 5;    // how often the chapters change

const totalWidth = getViewport()[0],       // width of the view
      totalHeight = getViewport()[1];      // height of the view

let SEQUENCE_COUNT = 0,
    RESPOSNE_COUNT = 0,
    NUM_RESPONSES_FOR_SEQUENCE = parseInt(Math.random() * 50),
    MAX_RESPONSES_PER_PRINT = 150,
    MIN_RESPONSES_PER_PRINT = 5;

let currChapterIndex = 0,
    chapterCount = 0;

/* ========================================================================== */
/* ======================== KEYWORD MAPPINGS ================================ */

const keywordToAudioMapping = {
    "human": "ding/ding2.mp3",
    "robot": "ding/ding1.mp3",
    "bot": "ding/ding1.mp3",
    "i don't know": "error/error2.mp3",
    "haha": "laugh/laugh1.mp3",
    "hahaha": "laugh/laugh1.mp3",
    "hahahaha": "laugh/laugh1.mp3",
    "hahahahaha": "laugh/laugh1.mp3",
    "i love disco": "misc/i_love_disco.mp3",
    "animal": "animal/coyote.mp3",
    "already": "clear_throat/clear_throat1.mp3",
    "alive": "animal/bird.mp3",
    "dead": "technology/interference.mp3",
    "congratulations": "misc/applause.mp3",
    "nice job": "misc/applause.mp3",
    "what is your name?": "technology/phone1.mp3",
    "computer": "technology/typing.mp3",
    "cleverbot": "success/success1.mp3",
    "stop": "space/blackholes.mp3",
    "confused": "technology/calculating.mp3",
    "confuse": "technology/calculating.mp3",
    "four": "animal/bluejay.mp3",
    "4": "animal/bluejay.mp3",
    "blue": "animal/bluejay.mp3",
    "bathroom": "misc/flush.mp3",
    "house": "misc/fire.mp3",
    "dog": "animal/dog.mp3",
    "good job": "misc/applause.mp3",
    "great job": "misc/applause.mp3",
    "sad": "music/sad.mp3",
    "google": "misc/zap.mp3"
    // "he": "",
    // "she": "",
    // "they": "",
    // "i ": "",
    // "you": "",
}

const emotionGraphNoiseAmounts = {
    "flirty": 2, 
    "silly": 5,
    "amused": 1, 
    "shocked": 6, 
    "surprised": 5, 
    "jumpy": 8, 
    "crying": 3, 
    "very sad": 2, 
    "confused": 5, 
    "embarrassed": 3, 
    "reluctant": 2, 
    "concerned": 3, 
    "distracted": 6, 
    "lazy": 1, 
    "furious": 7,
    "infuriated": 9,
    "sarcastic": 3, 
}


/* ========================================================================== */
/* =========================== Variables ==================================== */

// emotion manager
let EM;

// init state
let prevOutput = "Hello";
let prevCs = "";
let prevInteractionCount = 0;

// the modules
let particlesModule,
    historyModule,
    gradientModule,
    imageModule,
    constellationModule,
    shapeDrawingModule,
    imageFlickerModule,
    overlayModule,
    natureImagesModule,
    faceImagesModule,
    localVideoModule,
    livestreamModule,
    videoPlayerModule;

// audio player
let audio = new Audio();
audio.volume = 0.4;

// modules that will show and hide
let dynamicModulesList;

/* ========================================================================== */
/* ======================= CLASS DEFINITIONS ================================ */


/* ===================== EMOTION MANAGER CLASS =================================
    
    Contains arrays for each major emotion that contain their sub-emotions.
    Includes methods for converting emotion to color, and finding emotion 
    categories from specific emotions and responses.
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

    /*  Returns the high level emotion category (like, love, laughing, surprise, 
        sad, anger, or disgust) that the input falls under */
    getEmotionCategory (input) {
        for (var i = 0; i < this.responseLists.length; i++) {
            var list = this.responseLists[i];
            var foundI = list.indexOf(input.trim());
            if (foundI >= 0) {
                return this.getEmotionCategoryName(i);
            }
        }
    }

    /* Returns the name of the emotion category at the given index */
    getEmotionCategoryName (index) {
        return this.responseNames[index];
    }
    
    /* Returns the color in {r,g,b} format for the given emotion */
    getColorForEmotion (input) {
        return this.getColorForEmotionCategory(this.getEmotionCategory(input));
    }

    /* Returns the color of the emotion at index i (in the responseNames array) */
    getColorForEmotionIndex (i) {
        return rgbToHex(this.getColorForEmotionCategory(this.responseNames[i]));
    }

    /*  Returns the color in {r,g,b} format for the input, which is a high 
        level emotion category */
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

        if (input == "") {
            return this.getColorForEmotion("like");
        }

        return {
            r: r,
            g: g,
            b: b
        }
    }

    getVoiceParamsForEmotionCategory (input) {
        if (input == "anger") 
            return {rate: 1.2, pitch: 0.5, volume: 1.1}; 
        else if (input == "sad") 
            return {rate: 0.6, pitch: 1.3, volume: 0.9}; 
        else if (input == "love") 
            return {rate: 0.8, pitch: 0.9, volume: 1}; 
        else if (input == "disgust") 
            return {rate: 0.7, pitch: 0.8, volume: 1}; 
        else if (input == "like") 
            return {rate: 1, pitch: 0.7, volume: 1}; 
        else if (input == "laughing") 
            return {rate: 1.2, pitch: 1.2, volume: 1}; 
        else if (input == "surprise") 
            return {rate: 1.3, pitch: 1.2, volume: 1.2};

        return {rate: 1, pitch: 1, volume: 1};
    }
}

/* =========================== GRADIENT CLASS ==================================
    Responsible for drawing the gradient slider, which represents the 
    transition from the previous emotion to the current emotion. Includes a
    method to add a color, which triggers the animation.
*/
class Gradient {
    constructor () {
        this.gradientTopSvg = d3.select("#emotion-gradient-top svg");
        this.gradientBottomSvg =  d3.select("#emotion-gradient-bottom svg");

        this.gradientTop;
        this.gradientBottom;
        this.transitionDuration = 500;

        this.prevCol = "#000";
        this.prevPrevCol = "#000";
    }

    disable () {
        $("#gradient-group").hide();
    }

    enable () {
        $("#gradient-group").show();
    }
    /* Adds a color to the gradient, animates from left to right */
    addColor (newCol) {
        var colorsList = historyModule.colorsList;        
        var gradientTransition = d3.transition()
            .duration(this.transitionDuration)
            .ease(d3.easeSinInOut)
            .on("end", () => {
                historyModule.addColor(newCol);
            })

        d3.select("#emotion-gradient-top").style("width", "0%");
        d3.select("#emotion-gradient-top").transition(gradientTransition).style("width", "100%");
        
        if (this.gradientTop) {this.gradientTop.remove();}
        if (this.gradientBottom) {this.gradientBottom.remove();}

        this.gradientTop = this.makeGradient(this.gradientTopSvg, "gradient-top", this.prevCol, newCol);
        this.gradientBottom = this.makeGradient(this.gradientBottomSvg, "gradient-bottom", this.prevPrevCol, this.prevCol);
        
        this.prevPrevCol = this.prevCol;
        this.prevCol = newCol;
    }

    /* Renders a gradient in the target svg */
    makeGradient(target, idName, startCol, endCol) {
        var width = "100%"
        var result = target.append("linearGradient")
                            .attr("id", "" + idName + "")
                            .attr("x1", "0")
                            .attr("y1", "0")
                            .attr("x2", "100%")
                            .attr("y2", "0")
                            .attr("spreadMethod", "pad");

        result.append("stop")
            .attr("offset", 0)
            .attr("stop-color", startCol)
            .attr("stop-opacity", 1);

        result.append("stop")
            .attr("offset", width)
            .attr("stop-color", endCol)
            .attr("stop-opacity", 1);

        target.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .style("fill", "url(#" + idName + ")");

        return result;
    }
}

/* ====================== CONVERSATION HISTORY CLASS ===========================
    Responsible for the blocks of color that represents the conversation's 
    history. Each response adds its emotion (color) to the history list, 
    which is displayed as a series of color bars. The more colors added, the 
    thinner each color becomes. Includes methods to dd a color, and to dump, 
    or clear, the colors and reset the list.
*/
class History {
    constructor () {
        this.svg = d3.select("#emotion-history-grid svg");
        this.colorsList = [];
        this.blockAddDuration = 800;
        this.blockDumpDuration = 800;
    }
    
    disable () {
        $("#emotion-history-grid").hide();
        this.blockAddDuration = 0;
    }

    enable () {
        $("#emotion-history-grid").show();
        this.blockAddDuration = 800;
    }

    /* Adds a color block to the conversation history module */
    addColor (newCol) {
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

    /* Animates the whole module down and out of the frame, resets the list to 0 */
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

/* ========================== PARTICLES CLASS ==================================
    Responsible for the "ball pit" of colors. Uses a D3 force simulation to 
    represent the mixing of emotions. Colored circles represent emotions, which 
    are mixed by rotating spinners, which represnt the two sides of the 
    conversation. Includes methods to add nodes, update the spinner radius and 
    speed, and clear the simulation, 
*/
class Particles {
    constructor () {

        /* --------------------------- FUNCTIONS ---------------------------- */

        this.initSimulation = () => {
            spinner = spinner.data(spinnerFollowers);
            floor = floor.data(floors);
            platform = platform.data(platforms);

            spinner.exit().remove();
            floor.exit().remove();
            platform.exit().remove();

            spinner = spinner.enter().append("circle").attr("fill", "#000").attr("stroke", "#fff").attr("stroke-width", 0).merge(spinner);
            floor = floor.enter().append("circle").attr("fill", "#fff").merge(floor);
            platform = platform.enter().append("circle").attr("fill", (d) => d.fill).merge(platform);
        }

        this.disable = () => {
            $("#particles").hide();
            //simulation.stop();
        }

        this.enable = () => {
            $("#particles").show();
            //simulation.restart();
        }
        /* restarts the simulation */
        this.restart = () => {
            // Apply the general update pattern to the nodes.
            node = node.data(nodes);
            node.exit().remove();
            node = node.enter().append("circle").attr("fill", (d) => d.color).attr("r", nodeRadius).merge(node);
            
            // Update and restart the simulation.
            simulation.nodes(getForceNodes());
            simulation.force("gravity", this.gravity);
            simulation.force("setSpinnerPos", this.setSpinnerPos)

            simulation.alpha(1).restart();
        }

        /* renders the canvas, every frame */
        this.ticked = () => {
            node.attr("cx", (d) => { return d.x})
                .attr("cy", (d) => { return d.y})
                .attr("r", (d) => d.radius)
                .attr("fill", (d) => {
                    var rgb = hexToRgb(d.color);
                    // add flicker
                    return rgbToHex({
                        r: parseInt(rgb.r * ((Math.random() * 0.5 + .5))),
                        g: parseInt(rgb.g * ((Math.random() * 0.5 + .5))),
                        b: parseInt(rgb.b * ((Math.random() * 0.5 + .5)))
                    });
                });
            
            spinner.attr("cx", (d) => d.x)
                .attr("cy", (d) => d.y)
                .attr("r", (d) => d.radius);

            floor.attr("cx", (d) => d.x)
                .attr("cy", (d) => d.y)
                .attr("rx", (d) => d.radius)
                .attr("ry", 10);

            platform.attr("cx", (d) => d.x)
                .attr("cy", (d) => d.y)
                .attr("r", (d) => d.radius);
        }

        /* adds node to the canvas */
        this.addNode = (color, x, y, emotionCategory) => {

            if (emotionCategory == "love") {
                this.setNodeChargeStrength(3);
            } else if (emotionCategory == "anger") {
                this.setNodeChargeStrength(-3);
            } else if (emotionCategory == "laughing") {
                this.setNodeChargeStrength(-50);
                setTimeout(() => {
                    //this.setSpinnnerChargeStrength(200);
                    this.setNodeChargeStrength(50);
                }, 1000)

            } 
            else {
                this.setNodeChargeStrength(0);
            }

            nodes.push({x: x, y: y, color: color, radius: nodeRadius, type: "node"});
            this.restart();
        }

        this.gravity = (alpha) => {
            for (var i = 0; i < nodes.length; i++) {
                let p = nodes[i]
                // bound within box
                p.x = Math.max(nodeRadius, Math.min(width - nodeRadius, p.x));
                p.y = Math.max(nodeRadius, Math.min(height - nodeRadius, p.y));
                
                if (USE_GRAVITY) {
                    // gravity
                    p.vy += Math.min(0.5, Math.max(0, (p.y - (- height / 2 - 20)) / height ))
                }
            }
        }

        this.radiusGravity = (d, i) => {
            if (d.type == "node") {
                return 2;
            } else {
                return 10;
            }
        }

        this.dumpColors = (rectList) => {
            //console.log("RECTLIST", rectList)
            const rectWidth = totalWidth / rectList.length;
            const combinedRadius = nodeRadius + nodeBuffer;
            const numNodesPerColor = Math.floor(rectWidth / (2 * combinedRadius));
            
            for (let i = 0; i < rectList.length; i++) {

                const rect = rectList[i];
             
                setIntervalX((elapsed) => {
                    //console.log(elapsed);
                    for (let j = 0; j < numNodesPerColor; j++) {
                        const x = rectWidth * (i - 1) + j * 2 * (combinedRadius);
                        const y = 2 * combinedRadius;

                        this.addNode(rect.attr("fill"), x, y)
                    }
                }, 100, 2);
            }
        }

        this.clear = () => {
            nodes.length = 0;
            this.restart();
        }

        this.setSpinnerRadius = (i, r) => {
            spinners[i].radius = r;
            spinners[i].elem.transition().duration(5000).attr("cy", height / 2 - r)

        }
        
        this.setSpinnerSpeed = (i, s) => {
            this.interval = 0;
            const newSpeed = parseInt(100/s);
            spinners[i].speed = newSpeed;
        } 
        
        this.setSpinnerPos = () => {
            floors[0].x = midX;
            floors[0].y = floorY;
            spinners.forEach((spinner, i) => {
                if (spinner.elem) {
                    var center = getCircleCenter(spinner.elem);
                    spinnerFollowers[i].x = center.x;
                    spinnerFollowers[i].y = center.y;
                }
            })
        }

        /* ------------------------------------------------------------------ */
        
        /*
            Initiates the spinning "mixers" and the lines that connect them
            The spinners are not actually part of the simulation, but their 
            position dictates the position of the circles below them ( the 
            black ones that move through and actually mix the colored nodes)
        */
        this.initSpinners = () => {
            
            // center points
            var cxs = [width/4, width - width/4];

            // spinning circles
            var spinnerCircles = rotateElements.append("g").attr("fill", "#fff");
            
            spinners.forEach((spinner, i) => {
                spinner.elem = spinnerCircles.append("circle")
                    .attr("r", 15)
                    .attr("cx", cxs[i])
                    .attr("cy", height / 2 - spinner.radius)
            })


            // the lines tha connect the circles
            this.edges = rotateElements.append("g").attr("stroke", "white").attr("stroke-width", "2");
            
            this.edges.append("line")
                .attr("class", "edge-middle")
                
            // edges.append("line")
            //     .attr("x1", 0)
            //     .attr("y1", 0)
            //     .attr("class", "edge-top-left")
            
            // edges.append("line")
            //     .attr("x1", 0)
            //     .attr("y1", height)
            //     .attr("class", "edge-bottom-left")
            
            // edges.append("line")
            //     .attr("x1", width)
            //     .attr("y1", 0)
            //     .attr("class", "edge-top-right")
            
            // edges.append("line")
            //     .attr("x1", width)
            //     .attr("y1", height)
            //     .attr("class", "edge-bottom-right")

            if (USE_EDGES) {
                this.edges.attr("stroke-width", 6);
            } else {
                this.edges.attr("stroke-width", 0);
            }
        }

        this.setEdgeStrokeWidth = (width) => {
            //this.edges.transition().duration(3000).attr("stroke-width", width);
        }

        this.setEdgeOpacity = (opacity) => {
            //this.edges.transition().duration(3000).attr("opacity", opacity);
        }

        this.setNodeChargeStrength = (val) => {
            chargeStrength = val;
        }

        this.setSpinnerChargeStrength = (val) => {
            spinnerChargeStrength = val;
        }

        this.animateSpinners = () => {
            
            let stepAmound = 0.1;
            var i2 = d3.interpolateNumber(0, 1);
            if (mode === 0) {
                d3.timer(() => {
                  
                    var angle1 = ((Date.now() - start) / spinners[0].speed);
                    var angle2 = ((Date.now() - start) / spinners[1].speed);

                    var transformCircle1 = function() {
                        return "rotate(" + angle1 + "," + width / 4 + "," + height / 2 +")";
                    };
                    var transformCircle2 = function() {
                        return "rotate(" + angle2 + "," + (width - width / 4) + "," + height / 2 +")";
                    };
                    
                    // animate circles
                    var circle1 = spinners[0].elem;
                    var circle2 = spinners[1].elem;

                    circle1.attr("transform", transformCircle1);
                    circle2.attr("transform", transformCircle2);
                    
                    // lock edge ends to circle centers
                    var circle1Center = getCircleCenter(circle1);
                    var circle2Center = getCircleCenter(circle2);

                    let distance = distanceBetweenPoints(circle2Center.x, circle2Center.y, circle1Center.x, circle1Center.y);
                    //console.log(distance);
                    distance = parseInt(distance);
                    distance = circle2Center.x - circle1Center.x;
                    this.edges.attr("stroke-width", 5000/distance);

                    d3.select(".edge-middle")
                        .attr("x2", circle1Center.x)
                        .attr("y2", circle1Center.y)
                        .attr("x1", circle2Center.x)
                        .attr("y1", circle2Center.y);
                    
                    // d3.select(".edge-top-left")
                    //     .attr("x2", circle2Center.x)
                    //     .attr("y2", circle2Center.y)
                    
                    // d3.select(".edge-bottom-left")
                    //     .attr("x2", circle2Center.x)
                    //     .attr("y2", circle2Center.y)
                    
                    // d3.select(".edge-top-right")
                    //     .attr("x2", circle1Center.x)
                    //     .attr("y2", circle1Center.y)
                    
                    // d3.select(".edge-bottom-right")
                    //     .attr("x2", circle1Center.x)
                    //     .attr("y2", circle1Center.y)
                    
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
            width = totalWidth,
            height = totalHeight,
            midX = width / 2,
            midY = height / 2,
            nodeRadius = 8,
            nodeBuffer = 1,
            spinnerRadius = 50,
            floorRadius = 10000,
            floorY = floorRadius + height - 8;

        // items in the simulation
        var nodes = [],
            spinnerFollowers = [
                {radius: spinnerRadius},   // left wall
                {radius: spinnerRadius}    // right wall
            ],
            floors = [{radius: floorRadius}],

           /* platforms = this.generatePlatform(0, 40, 200, 100).concat(
                        this.generatePlatform(width, 40, width - 200, 100)).concat(
                        this.generatePlatform(midX - 50, midY, midX + 50, midY));*/

            platforms = /*this.generateRect(30, 30, 50, 50).concat(
                        this.generateRect(230, 30, 50, 50).concat(
                        this.generateRect(430, 30, 50, 50).concat(
                        this.generateRect(630, 30, 50, 50).concat(
                        this.generateRect(830, 30, 50, 50).concat(
                        this.generateRect(1030, 30, 50, 50).concat(*/
                        //this.generateRect(totalWidth-80, 30, 50, 50).concat(
                        //this.generateRect(midX-25, midY-25, 50, 50)
                        //)))))));
                        [];

        // combine simulation items into single array
        var getForceNodes = () => platforms.concat(floors.concat(spinnerFollowers.concat(nodes)));

        // simulation vars
        var aDecay = 0.1,
            vDecay = 0.05,
            chargeStrength = 0,
            spinnerChargeStrength = 20,
            gravityStrength = 0.03,
            collideStrength = 1.3,
            collideIterations = 3;

        // the simulation
        var simulation = d3.forceSimulation(getForceNodes())
            .alphaDecay(aDecay)
            .velocityDecay(vDecay)
            .force("charge", d3.forceManyBody().strength((d,i) => d.type == "node" ? chargeStrength : spinnerChargeStrength))
            .force("gravity", this.gravity(gravityStrength))
            .force("setSpinnerPos", this.setSpinnerPos)
            //.force("collide", rectangleCollide)
            .force("collide", d3.forceCollide().radius((d) => {
                return (d.type == "node") ? (d.radius + nodeBuffer) : d.radius;
            }).iterations(collideIterations).strength((collideStrength)))
            .alphaTarget(1)
            .on("tick", this.ticked);

        // simulation groups
        var g        = svg.append("g"),
            node     = g.append("g").selectAll(".node"),
            spinner  = g.append("g").selectAll(".spinner"),
            floor    = g.append("g").selectAll(".floor"),
            platform = g.append("g").selectAll(".platform");

        // spinner
        var rotateElements = svg.append("g"),
            mode = 0,
            start = Date.now(),
            animateSpinnersActive = true,
            spinner1Speed = 9,
            spinner2Speed = 10,
            spinner1Radius = 100,
            spinner2Radius = 50;

        var spinners = [
            {
                elem: null,
                radius: 100,
                speed: 10 
            }, {
                elem: null,
                radius: 100,
                speed: 10 
            }
        ];

        this.targetSpeeds = [0, 0]
        // init
        this.initSimulation();
        this.initSpinners();
        this.setSpinnerPos();

        if (animateSpinnersActive) {
            this.animateSpinners();
        }
        
        this.restart();
    }

    /*
        returns an array of circles that, together, form a line that can be used
        as a platform in the simulation
    */
    generatePlatform (x1, y1, x2, y2) {
        var distance = Math.hypot(x2 - x1, y2 - y1),
            xStep = (x2 - x1) / distance,
            yStep = (y2 - y1) / distance,
            radius = 1,
            numPts = distance / radius,
            result = [];
        
        // start point
        //result.push({fx: x1,fy: y1,radius: 5,fill: "#F00"})
        
        for (var i = 0; i < numPts; i++) {
            result.push({
                fx: i * xStep + x1,
                fy: i * yStep + y1,
                radius: 3,
                fill: "#FFF"
            })
        }

        // end point
        //result.push({fx: x2,fy: y2,radius: 5,fill: "#F00"})

        return result;
    }

    generateRect (x, y, w, h) {
        return this.generatePlatform(x, y, x+w, y).concat(
               this.generatePlatform(x, y, x, y+h).concat(
               this.generatePlatform(x, y+h, x+w, y+h).concat(
               this.generatePlatform(x+w, y, x+w, y+h))));
    }
}

/* ============================ IMAGE CLASS ====================================
    Responsible for displaying and manipulating images. These images are 
    retrieved for each response by searching for that response's emotion using
    the PixaBay API.
*/
class ImageDisplay {
    constructor () {
        this.drawPoint = (p) => {
            var c;
            if (p[0] < this.width/2) {
                c = this.getColorAtPoint(p[0], p[1], this.imageLeft);

            } else {
                c = this.getColorAtPoint(p[0], p[1], this.imageRight);
            }
            this.context.fillStyle = c;
            this.context.fillRect(p[0],p[1],10,10);
        };

        // pixel moving effect
        this.step = () => {
            particles.forEach((p) => {
                p[0] += Math.round(2*Math.random()-1);
                p[1] += Math.round(2*Math.random()-1);
                if (p[0] < 0) p[0] = width;
                if (p[0] > width) p[0] = 0;
                if (p[1] < 0) p[1] = height;
                if (p[1] > height) p[1] = 0;
                this.drawPoint(p);
            });
        };

        var width = this.width = totalWidth;
        var height = this.height = totalHeight;
        
        this.canvas = d3.select("#image-module").append("canvas")
            .attr("width", totalWidth)
            .attr("height", totalHeight);

        this.context = this.canvas.node().getContext("2d");
        this.imageLeft;
        this.imageRight;

        //var canvas = document.getElementById("canvas");
        //var width = totalWidth;
        //var height = 400;
        //var ctx = this.canvas.getContext("2d");
        //var ctx = this.context;

        var numParticles = 500;
        var particles = d3.range(numParticles).map(function(i) {
          return [Math.round(width*Math.random()), Math.round(height*Math.random())];
        }); 
        if (USE_IMAGE_EFFECT) {
            d3.timer(this.step);
        }
    }

    disable () {
        $("#image-module").hide();
    }

    enable () {
        $("#image-module").show();
    }

    addImage (url, isRight) {
        var xPos = 0;
        var imgWidth = this.width/2;

        if (isRight) {
            xPos = this.width/2;
        }
        
        this.getImage(url, (image) => {
            //console.log(image);
            this.context.drawImage(image, xPos, 0, imgWidth, this.height);
            if (isRight) {
                this.imageRight = this.context.getImageData(xPos, 0, imgWidth, this.height);
            } else {
                this.imageLeft = this.context.getImageData(xPos, 0, imgWidth, this.height);
            }
            
            // Rescale the colors.
            // for (var i = 0, n = imgWidth * this.height * 4, d = this.image.data; i < n; i += 4) {
            //   d[i + 0] += 0;
            //   d[i + 1] += 0;
            //   d[i + 2] += 0;
            // }

            //this.context.putImageData(this.image, xPos, 0);
        });       
    }

    getImage(path, callback) {
      var imgObj = new Image;
      imgObj.onload = function() { callback(imgObj); };
      imgObj.src = path;
      imgObj.setAttribute('crossOrigin', '');
      //image.src = path;
    }

    getColorAtPoint(x, y, imageData) {
        if (imageData) {
            var pixelData = this.context.getImageData(x, y, 1, 1).data;
            return "rgba(" + pixelData[0] + "," +  pixelData[1] + "," +  pixelData[2] + "," +  1 + ")";
        }
        return "#000";
    }
}

/* ========================= SECOND IMAGE CLASS=================================
    The second class responsible for the display and manipulation of images.
    The images (same ones as used in the ImageDisplay class) are displayed in 
    a flickering, film-like manner.
*/
class ImageFlicker {
    constructor () {

        const width = this.width = totalWidth;
        const height = this.height = totalHeight;
        this.imageRight;
        this.imageLeft;
        this.images = [];

        this.tagsRight = [];
        this.tagsLeft = [];

        this.isActive = true;

        this.canvas = d3.select("#canvas-sketch").append("canvas")
            .attr("width", width)
            .attr("height", height);
        this.context = this.canvas.node().getContext("2d");

        this.clearBackground = () => {
          this.context.fillStyle = "rgba(0,0,0,.2)";
          this.context.fillRect(0, 0, width, height);
        }

        // draw
        this.step = () => {
            this.clearBackground();
            
            var imgXPos = Math.random()*totalWidth/2 + 1;
            var imgWidth = Math.random()*totalWidth + 1;

            this.context.globalAlpha = 0.1;
            //this.context.drawImage(this.imageLeft, imgXPos, 0, imgWidth, this.height);
            //this.context.drawImage(this.imageRight, totalWidth - imgXPos - imgWidth, 0, imgWidth, this.height);

            this.images.forEach((image) => {
                this.context.drawImage(image, Math.random()*totalWidth/2 + 1, 0, Math.random()*totalWidth + 1, this.height);
            })
            //var imgData = this.context.getImageData(0,0, imgWidth, height);
            //var data = imgData.data;

            // Rescale the colors.
            // TODO
           /* for (var i = 0, n = imgWidth * this.height * 4, d = data; i < n; i += 4) {
              d[i + 0] += 0; // r
              d[i + 1] += 0; // g
              d[i + 2] += 0; // b
            }*/

            //this.context.putImageData(imgData, imgXPos, 0);

            // TODO
            this.context.globalAlpha = 0.5;

            this.context.fillStyle = "rgba(255,255,255,0.8)";
            this.context.fillRect(this.xPos, 0, 5, this.height);
            
            this.context.fillStyle = "rgba(255,255,255,0.8)";
            this.context.fillRect(this.xPos2, 0, 5, this.height);

            this.context.strokeStyle = "rgba(255,255,255,0.3)";
            this.context.strokeWidth = 1;
            this.context.font="30px Inconsolata";

            //console.log(this.tags);

            //var rand1 = parseInt(Math.random() * this.tags.length);
            //var rand2 = parseInt(Math.random() * this.tags.length);
            //console.log("====", rand1);

            const numWords = 5;

            // red line
            this.context.textAlign = "right";
            
            if (this.tagsRight.length > 0) {
                for (var i = 0; i < numWords; i++) {
                    this.context.strokeText(this.tagsRight[parseInt(Math.random() * this.tagsRight.length)], this.xPos, Math.random()*this.height);
                }
            }
           
            // blue line
            this.context.textAlign = "left";
            if (this.tagsLeft.length > 0) {
                for (var i = 0; i < numWords; i++) {
                    this.context.strokeText(this.tagsLeft[parseInt(Math.random() * this.tagsLeft.length)], this.xPos2, Math.random()*this.height);
                }
            }

            this.xPos += 2;
            this.xPos2 -= 2;

            // reset position when reaches end
            if (this.xPos > width) {
                this.xPos = 0;
            }
            if (this.xPos2 < 0) {
                this.xPos2 = width;
            }
        };

        // setup
        this.xPos = 0;
        this.xPos2 = width;

        // start
        this.timer = d3.timer(this.step);
    }

    addImage (url, isRight, tags) {
        this.getImage(url, (image) => {
            if (isRight) {
                this.tagsRight = tags.split(',');
                this.imageRight = image;
            } else {
                this.tagsLeft = tags.split(',');
                this.imageLeft = image;
            }
            if (this.images.length >= 20) {
                this.images.length = 0;
            }
            this.images.push(image);
        });     
    }

    getImage(path, callback) {
      var imgObj = new Image;
      imgObj.onload = function() { callback(imgObj); };
      imgObj.src = path;
      imgObj.setAttribute('crossOrigin', '');
    }

    disable () {
        $("#canvas-sketch").hide()
        //this.timer.stop();
        //this.isActive = !this.isActive;
    }

    enable() {
        $("#canvas-sketch").show()
        /*if (this.isActive) {
            this.timer.restart(this.step);
        }*/
        //this.isActive = !this.isActive;
    }

    toggleActive () {
        if (this.isActive) {
            this.timer.stop();
            this.disable();
        } else {
            this.timer.restart(this.step);
            this.enable();
        }
        this.isActive = !this.isActive;
    }
}

/* ========================= VIDEO PLAYER CLASS=================================
    Responsible for the Youtube player module. Includes methods to load videos,
    adjust volume.
*/
class VideoPlayer {
    constructor () {
        this.isReady = false;
        this.player;
    }

    enable () {
        //this.player.play();
        $("#ytplayer").show();
    }

    disable () {
        //this.player.stop();
        $("#ytplayer").hide();
    }

    unMute () {
        this.player.unMute();
        //INFINITE_REPEAT = false;
    }

    mute () {
        this.player.mute();
        //INFINITE_REPEAT = true;
        //getResponse();

    }
}

/* initialize the youtube player iframe */
function onYouTubeIframeAPIReady() {
    console.log("ON YT READY");
    videoPlayerModule = new VideoPlayer();
    
    videoPlayerModule.player = new YT.Player('ytplayer', {
        videoId: '0', // YouTube Video ID
        width: totalWidth,               // Player width (in px)
        height: totalHeight,             // Player height (in px)
        playerVars: {
            autoplay: 1,        // Auto-play the video on load
            controls: 0,        // Show pause/play buttons in player
            showinfo: 0,        // Hide the video title
            modestbranding: 1,  // Hide the Youtube Logo
            enablejsapi: 1,
            rel: 0,
            loop: 0,            // Run the video in a loop
            fs: 0,              // Hide the full screen button
            cc_load_policy: 0,  // Hide closed captions
            iv_load_policy: 3,  // Hide the Video Annotations
            autohide: 1         // Hide video controls when playing
        },
        events: {
            onReady: (e) => {
                e.target.mute();
                videoPlayerModule.isReady = true;
                dynamicModulesList.push(videoPlayerModule);
            },
            onStateChange: (e) => {
                // if (e.data === 1) {
                //     $("#ytplayer").css({"opacity": 1});
                // } else {
                //     $("#ytplayer").css({"opacity": 0});
                // }
            }
        }
    });
}

/* ======================== CONSTELLATION CLASS ================================

    Responsible for the Constellation effect. Every response has a emotion 
    degree and a reaction degree. This class offers a method to draw one pixel 
    for each response, using two numbers as the (x,y) coordinates, and the 
    response's color as the fill color.
*/
class Constellation {
    constructor () {

        const width = this.width = totalWidth;
        const height = this.height = totalHeight;

        this.canvas = d3.select("#constellation").append("canvas")
            .attr("width", width)
            .attr("height", height);
        this.context = this.canvas.node().getContext("2d");

        this.clearBackground = () => {
            this.context.fillStyle = "rgba(0,0,0,.001)";
            this.context.fillRect(0, 0, width, height);
        }

        // draw
        this.step = () => {
            this.clearBackground();
            var yDiff = this.targetY - this.currY;
            var xDiff = this.targetX - this.currX;
            var slope = yDiff / xDiff;

            this.currX += xDiff / 100;
            this.currY += yDiff / 100;

            this.context.fillStyle = "#FFF";
            this.context.fillRect(this.currX, this.currY, 3, 3);
        };

        // setup
        
        this.context.beginPath();

        this.currX = 0;
        this.currY = 0;

        this.targetX = 0;
        this.targetY = 0;
        
        // start
        //d3.timer(this.step);
    }

    addPoint (ed, rd, color) {
        /*this.context.fillStyle = "rgba(0, 0, 0, 0.6)";
        this.context.fillRect(0, 0, this.width, this.height);*/
        const x = convertRange( ed, [ 0, 80 ], [ 0, this.width - 10 ] );
        const y = convertRange( rd, [ 0, 80 ], [ 0, this.height - 10 ] );
        
        this.targetX = x;
        this.targetY = y;

        this.context.strokeStyle = "rgba(255, 255, 255, 1)";
        this.context.stroke()

        this.context.fillStyle = color;
        this.context.fillRect(x-1, y-1, 3, 3);
    }

    enable () {
        $("#constellation").show();
    }

    disable () {
        $("#constellation").hide();
    }
}

/* ======================== SHAPE DRAWING CLASS ================================
    
    Responsible for the animated polygon effect. Every response calls addPoint,
    which, swithcing off between two shapes, animates a line to the next point.
    Each point is (like the in constellation) using the emotion and reaction 
    degrees as coordinates. For the right shape, the coordinates are flipped 
    over the y axis. Each point also shows the response text that point. The
    lines animate from their current color (emotion) to the next 
    color (emotion).
*/
class ShapeDrawing {
    constructor () {
        this.count = 0;
        const width = this.width = totalWidth;
        const height = this.height = totalHeight;
        this.isPaused = false;

        this.canvas = d3.select("#shape-drawing").append("canvas")
            .attr("width", width)
            .attr("height", height);
        this.context = this.canvas.node().getContext("2d");
        this.currEmotion = "";

        this.isRight = () => this.count % 2;

        this.context.font = "12px Inconsolata";
        this.context.strokeText(this.getSequenceLabel(), 10, 10);

        this.clearBackground = () => {
            this.context.fillStyle = "rgba(0,0,0,.005)";
            this.context.fillRect(0, 0, width, height);
        }

        // draw
        this.step = () => {
            if (!this.isRight()) {
                this.drawLine(0)
            }
            else {
                this.drawLine(1)
            }
        };

        // setup
        this.context.beginPath();
        var initColor = "#000000";

        this.targetX = 0;
        this.targetY = 0;

        this.leftShapeData = {
            currX: 0,
            currY: 0,
            prevCol: initColor,
            targetCol: initColor,
            widthMod: 0,
            isInPosition: true
        }

        this.rightShapeData = {
            currX: totalWidth,
            currY: 0,
            prevCol: initColor,
            targetCol: initColor,
            widthMod: totalWidth,
            isInPosition: true
        }

        this.shapeDatas = [this.rightShapeData, this.leftShapeData];

        // start
        this.timer = d3.timer(this.step);
    }

    addPoint (ed, rd, color, text, emotion) {
        if (this.isPaused) {
            this.timer = d3.timer(this.step);
            this.isPaused = !this.isPaused;
        }
        this.currEmotion = emotion;
        this.percentage = 0;

        const x = convertRange(ed, [0, 80], [0, this.width - 10]);
        const y = convertRange(rd, [0, 80], [0, this.height - 10]);
        
        //var shapeDataIndex = this.count % 2;

        if (this.count == 0) {
            this.leftShapeData.currX = x;
            this.leftShapeData.currY = y;
        } else if (this.count == 1) {
            this.rightShapeData.currX = totalWidth - x;
            this.rightShapeData.currY = y;
        }

        this.targetX = x;
        this.targetY = y;

        let isDoneTyping = () => false;
        let isInPosition = () => false;

        const targetIndex = this.isRight() ? 0 : 1;
        const targetElem = $(".text-output-"+targetIndex);
        const newX = this.isRight() ? totalWidth - x : x;

        targetElem.css({"left": newX - 10, "top": this.targetY - 17});
        targetElem.css({"opacity": 1});
        // targetElem.css({"background": "#000"});
        // targetElem.css({"color": "#fff"});

        typeWriter(".text-output-"+targetIndex, text, 0, () => {
            isDoneTyping = () => true;
            if (isInPosition()) {
                setTimeout(() => {
                    this.context.strokeText(text,newX,y);
                    targetElem.css({"opacity": 0});
                }, 1500)
            }
        })

        setTimeout(() => {
            isInPosition = () => true;
            if (isDoneTyping()) {
                this.context.strokeText(text,newX,y);
                targetElem.css({"opacity": 0});
            }
        }, 4000)

        this.shapeDatas[targetIndex].prevCol = this.shapeDatas[targetIndex].targetCol;
        this.shapeDatas[targetIndex].targetCol = color;

        this.count++;
    }

    drawLine (i) {
        var data = this.shapeDatas[i];
        var targetX = data.widthMod ? data.widthMod - this.targetX : this.targetX;

        var yDiff = this.targetY - data.currY;
        var xDiff = targetX - data.currX;
        var slope = yDiff / xDiff;
        
        this.percentage += 0.02;

        var rgb1 = hexToRgb(data.prevCol);
        var rgb2 = hexToRgb(data.targetCol);

        var col = blendColors(rgb1.r, rgb1.g, rgb1.b, rgb2.r, rgb2.g, rgb2.b, this.percentage)
        col = rgbToHex(col);
        
        let randomModifier = emotionGraphNoiseAmounts[this.currEmotion] * 0.9;
        let xMod = 0,
            yMod = 0;

        if (randomModifier) {
            xMod =  Math.random() * randomModifier - randomModifier/2;
            yMod =  Math.random() * randomModifier - randomModifier/2;
        }

        data.currX += xDiff / 100 + xMod;
        data.currY += yDiff / 100 + yMod;

        var minCount = data.widthMod ? 3 : 2;

        if (this.count > minCount) {
            this.context.fillStyle = col;
            this.context.fillRect(data.currX, data.currY, 3, 3);
        }
    }

    getSequenceLabel () {
        const d = new Date();
        const datestring = ("0" + d.getDate()).slice(-2) + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" +
            d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
        return datestring;
    }

    takeSnapshot (onEnd) {
        $("#shape-drawing").css({"background": "rgba(255,255,255,1)"});

        setTimeout(() => {
            // stop drawing
            this.timer.stop();
            this.isPaused = true;
            
            // save image as pdf   
            const date = new Date();     
            const imgData = $("#shape-drawing canvas")[0].toDataURL("image/png", 1.0);
            const printSizeRatio = 6.9;
            
            const doc = new jsPDF({
                orientation: 'landscape',
            });

            doc.addImage(imgData, 'PNG', 10, 20, totalWidth/printSizeRatio, totalHeight/printSizeRatio);
            doc.save("VERBOLECT_SEQUENCE_" + SEQUENCE_COUNT + "_" + date + ".pdf");

            // clear modules
            historyModule.dumpColors();
            particlesModule.clear();

            // set number of responses for next sequence
            NUM_RESPONSES_FOR_SEQUENCE = parseInt(Math.random() * MAX_RESPONSES_PER_PRINT + MIN_RESPONSES_PER_PRINT);

            $("#print-alert").html("\
                PRINTING SEQUENCE " + SEQUENCE_COUNT + "<br>\
                NEXT PRINTOUT IN " + NUM_RESPONSES_FOR_SEQUENCE + " RESPONSES")
            
            $("#print-alert").show();

            setTimeout(() => {
                $("#print-alert").hide();
                this.context.clearRect(0, 0, totalWidth, totalHeight);
                this.context.strokeText(this.getSequenceLabel(), 10, 10);
                onEnd();
            }, 5000)

            setTimeout(() => {
                $("#shape-drawing").css({"background": "rgba(255,255,255,0)"});
            }, 10000)

        }, 10000)

    }
}

/* ======================== NATURE IMAGE CLASS =================================
    
    Responsible for the selection of nature images
*/
class NatureImages {
    constructor(){
        this.elem = $("#nature-image-module");
        this.elem.css("background", "url(img/nature_images/nature1.jpg)");
    } 
    
    enable () {
        this.elem.show();
    }

    disable () {
        this.elem.hide();
    }

    changeImage () {
        const index = parseInt(Math.random()*100);
        this.elem.css("background", "url(img/nature_images/nature"+index+".jpg) no-repeat center center fixed");
        this.elem.css("background-size", "cover");
    }
}

/* ========================== FACE IMAGE CLASS =================================
    
    Responsible for Face image collage
*/
class FaceImages {
    constructor(folder){
        this.elem = $("#face-image-module");
        this.elem.css("background", "url(img/faces/face_collage.jpg)");
        this.elem.css("background-size", "10%");
    } 
    
    enable () {
        this.elem.show();
        if (USE_LINE_DRAWING) {
            $("#svg-drawing").show();
        }
    }

    disable () {
        this.elem.hide();
        if (USE_LINE_DRAWING) {
            $("#svg-drawing").hide();
        }

    }
}

/* ======================= LOCAL VIDEO IMAGE CLASS =============================
    
    Responsible for video of the boiler room 
*/
class LocalVideo {
    constructor () {
        this.elem = $("#local-video-module");
        this.elem.append("<video id='localVideo' loop src='video/boiler2.mp4'></video>");
        this.vidElem = document.getElementById("localVideo"); 
    }

    enable () {
        this.vidElem.play();
        this.elem.show();
    }

    disable () {
        this.vidElem.pause();
        this.elem.hide();
    }
}

/* ======================= LOCAL VIDEO IMAGE CLASS =============================
    
    Responsible for the NEST livestream 
*/
class Livestream {
    constructor () {
        this.elem = $("#livestream-module");
        this.elem.append('<iframe src="https://video.nest.com/embedded/live/DVkQ5chGch" allowfullscreen webkitallowfullscreen mozallowfullscreen frameborder="0"\
                            width="'+totalWidth+'" height="'+totalHeight+'"></iframe>');
    }

    enable () {
        //$("#livestream-module iframe").attr("src", "https://video.nest.com/embedded/live/DVkQ5chGch")
        //this.vidElem.play();
        this.elem.show();
    }

    disable () {
        //$("#livestream-module iframe").attr("src", "")
        //this.vidElem.pause();
        this.elem.hide();
    }
}

/* ============================ OVERLAY CLASS ==================================
    
    Responsible for the "roving eye" effect which represents examination and 
    searching for answers. The Overlay is a black rectangle with a circle cut 
    out. Includes methods to move to certain coordinates, and to "Blink", which
    switches the module that the eye is looking at. 
*/
class Overlay {
    constructor () {
        this.ctx = overlay.getContext('2d');
        this.radius = EYE_RADIUS;
        this.blurAmount = 40;
        this.fillStyle = "#000";
        this.height = 3 * totalHeight;
        this.width = 3 * totalWidth;
        this.currScale = 1;

        this.blinkTimer;
        this.expandTimer;

        this.isBlinking = false;
        this.isChangingSize = false;

        if (USE_OVERLAY) {
            this.renderOverlay();
        }
    }

    /* Toggle between black and white background */
    toggleColor() {
        if (this.fillStyle == "#000") {
            this.fillStyle = "#FFF";
        } else {
            this.fillStyle = "#000";
        }
    }

    /* initialize the overlay */
    renderOverlay() {
        const vp = getViewport();
        overlay.width = 3 * vp[0];
        overlay.height = 3 * vp[1];

        $("#overlay").css({"left": -0.33 * overlay.width, "top": -0.33 * overlay.height});
        this.ctx.fillStyle = this.fillStyle;
        
        this.ctx.fillRect(-1*overlay.width, -1*overlay.height, overlay.width*2, overlay.height*2);
        this.clipArc(this.ctx, overlay.width/2, overlay.height/2, this.radius, this.radius, 10, this.blurAmount);
    }

    /* Draw cutout circle */
    clipArc(ctx, x, y, rx, ry, f, blurAmount) {
        ctx.globalCompositeOperation = 'destination-out';

        // cant do negative TODO
        if (rx < 0) rx = 10;
        if (ry < 0) ry = 10;

        ctx.filter = "blur("+blurAmount+"px)";  // "feather"
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI);
        ctx.fill();

        // reset comp. mode and filter
        ctx.globalCompositeOperation = 'destination-out';
        ctx.filter = "none";
    }

    blink (onClosed, onEnd) {
        //d3.timerFlush();
        if (this.expandTimer) {
            this.expandTimer.stop()
            this.clearBackground();
            this.clipArc(this.ctx, overlay.width/2, overlay.height/2, this.radius, this.radius, 10, this.blurAmount);
        }

        const speed = this.radius/4;
        const closedTime = 200;
        let count = speed;
        
        if (USE_OVERLAY) {
            this.blinkTimer = d3.timer(() => {
                
                if (this.radius - count < 0) { 
                    this.blinkClosed(this.radius);
                    count = this.radius;
                    if (onClosed) {
                        onClosed();
                    }

                    this.blinkTimer.restart((elapsed) => {
                        if (elapsed > closedTime) {
                            if (count <= 0) {
                                this.blinkTimer.stop();
                                this.blinkClosed(0);
                                this.isBlinking = false;

                                if (onEnd) {
                                    onEnd();
                                }
                            } else {
                                this.blinkClosed(count);
                                count -= speed;
                            }                
                        }
                    })
                } else {
                    this.blinkClosed(count);
                    count += speed;
                }
            });
        }
    }

    clearBackground () {
        this.ctx.fillStyle = this.fillStyle;
        this.ctx.fillRect(-1*overlay.width, -1*overlay.height, overlay.width*2, overlay.height*2);
    }

    blinkClosed (count) {
        const vp = getViewport();
        overlay.width = 3 * vp[0];
        overlay.height = 3 * vp[1];
        
        this.clearBackground();
        this.clipArc(this.ctx, overlay.width/2, overlay.height/2, this.radius, this.radius - count, 10, this.blurAmount);
    }
    
    setEyeRadius (targetR) {
        //d3.timerFlush();
        var diff = targetR - this.radius;
        var speed = 6;
        var count = (diff > 0) ? speed : -1 * speed;

        this.expandTimer = d3.timer(() => {
            if (diff > 0) {
                if (this.radius + count >= targetR) {
                    this.expandTimer.stop();
                    //this.animateRadius(targetR);
                    this.radius = targetR;
                } else {
                    this.animateRadius(count);
                    count += speed; 
                }
            } else {
                if (this.radius + count <= targetR) {
                    this.expandTimer.stop();
                    this.isChangingSize = false;

                    //this.animateRadius(targetR);
                    this.radius = targetR;
                } else {
                    this.animateRadius(count);
                    count -= speed;
                }
            }
        })
    }

    animateRadius (count) {
        const vp = getViewport();
        overlay.width = 3 * vp[0];
        overlay.height = 3 * vp[1];

        var targetR = this.radius + count;
        this.blurAmount = targetR*0.1;
        this.ctx.fillStyle = this.fillStyle;

        this.ctx.fillRect(-1*overlay.width, -1*overlay.height, overlay.width*2, overlay.height*2);
        this.clipArc(this.ctx, overlay.width/2, overlay.height/2, targetR, targetR, 10, this.blurAmount);
    }

    reset() {
        this.blinkTimer.stop();
        this.expandTimer.stop();
        this.clearBackground();
        this.radius = 100;
        this.clipArc(this.ctx, overlay.width/2, overlay.height/2, this.radius, this.radius, 10, this.blurAmount);
    }

    /* sets speed of eye based on emotion */
    setEyeSpeed (emotionCategory) {
        let time = 2;

        if (emotionCategory == "anger") 
            time = 0.5;
        else if (emotionCategory == "sad") 
            time = 10;
        else if (emotionCategory == "love") 
            time = 3;
        else if (emotionCategory == "disgust") 
            time = 4;
        else if (emotionCategory == "like") 
            time = 8;
        else if (emotionCategory == "laughing") 
            time = 2;
        else if (emotionCategory == "surprise") 
            time = 1;

        $("#overlay").css("transition", "all "+time+"s");
    }

  
    /* animate the overlay center to x, y coordinates */
    setOverlayPos(x, y) {
        var xBuffer = -0.5*overlay.width;
        var yBuffer = -0.5*overlay.height;
        const animateTime = 300;
        //$("#overlay").animate({"left": x + xBuffer, "top" : y + yBuffer}, animateTime);
        $("#overlay").css({"left": x + xBuffer, "top" : y + yBuffer});
    }
    /* moves eye to random position */
      moveEyeToRandomLocation () {
          var vp = getViewport();
          var width = vp[0];
          var height = vp[1];
          var x = Math.random() * vp[0];
          x = (x < EYE_RADIUS) ? EYE_RADIUS : x;
          x = (x > width - EYE_RADIUS) ? width - EYE_RADIUS : x;
          y = (y < EYE_RADIUS) ? EYE_RADIUS : y;
          y = (y > height - EYE_RADIUS) ? height - EYE_RADIUS : y;

          var y = Math.random() * vp[1];
          // if (x > width-width/4 || x < width/4) {
          //     x = (x * Math.random() * .8) + (width / 2);
          // }

          // if (y > height-height/4 || x < height/4) {
          //     y = (y * Math.random() * .8) + (height / 2);
          // }

          this.setOverlayPos(x, y)
      }

    /* animate the whole canvas under the eye to x, y coordinates */
    setModulesPos(x, y) {
        var xBuffer = totalWidth / -2;
        var yBuffer = $(".dynamic-modules").height()/-2;
        $(".dynamic-modules").css({"left": x + xBuffer, "top" : y + yBuffer});
    }
}


/* ========================================================================== */
/* ========================== DOCUMENT READY ================================ */

/* execute on page load */
$(document).on("ready", function () {  
    $(".module-section").css({"width": totalWidth, "height": totalHeight});
    $(".module").css({"width": totalWidth, "height": totalHeight});

    // add svg canvas to all modules
    d3.selectAll(".svg-module").append("svg")
                            .attr("width", "100%")
                            .attr("height", "100%");

    // init modules
    EM = new EmotionManager();
    
    gradientModule = new Gradient();
    historyModule = new History();
    particlesModule = new Particles();
    imageModule = new ImageDisplay();
    //imageFlickerModule = new ImageFlicker();
    constellationModule = new Constellation();
    shapeDrawingModule = new ShapeDrawing();
    overlayModule = new Overlay();
    natureImagesModule = new NatureImages();
    faceImagesModule = new FaceImages();
    localVideoModule = new LocalVideo();
    livestreamModule = new Livestream();

    dynamicModulesList = [
            gradientModule,
            historyModule,
            particlesModule,
            imageModule,
            natureImagesModule, 
            faceImagesModule,
            constellationModule,
            livestreamModule,
            localVideoModule
        ];

    // start with one response
    getResponse();

    if (USE_CHAPTERS) {
        $(".dynamic-modules .module-section").hide();
    }

    if (USE_RANDOM_MOVEMENTS) {
        // eye roving
        loop(5000, 2000, () => overlayModule.moveEyeToRandomLocation());  

        // nature images zoom    
        loop(5000, 2000, () => {
            if (currChapterIndex == 4) {
                $("#nature-image-module").css({
                    "transform": "scale("+(Math.random() * 10 + 1)+")",
                })
            }
        });

        // faces zoom and pan
        loop(10000, 5000, () => {
            if (currChapterIndex == 5) {
                $("#face-image-module").css({
                    "background-size": Math.random()*800 + "% ",
                    "background-position": Math.random()*100 + "% " + Math.random()*100 + "%"
                })
            }
           
        });
    }
})


/* ========================================================================== */
/* ============================= HANDLERS =================================== */

/* Keyboard shortcuts */
$(window).keypress(function(e) {
    console.log(e.which);

    // if (e.which === 122) { // z
    //     shapeDrawingModule.takeSnapshot();
    // }

    // if (e.which === 110) { // n
    //     overlayModule.setEyeRadius(100);
    // }
   
    // if (e.which === 109) { // n
    //    overlayModule.blink(() => {

    //    });
    // }

    // if (e.which === 103) {
    //     blurText(0, 10);
    //     blurText(1, 100);
    // }

    // if (e.which === 100) {          // d : generate 
    //     generateNRandomNodes(200);
    // }

    if (e.which === 99) {           // c : get response
        getResponse();
    }
    
    if (e.which === 98) {           // b : switch chapter
        switchChapter(parseInt(Math.random() * dynamicModulesList.length))
    } 

    if (e.which === 102) {          // f : clear particles
        clearParticles();
    } 

    if (e.which === 112) {          // p : unmute youtube
        if (videoPlayerModule) {
            videoPlayerModule.unMute();
        }
    }

    if (e.which === 111) {          // o : mute youtube
        if (videoPlayerModule) {
            videoPlayerModule.mute();
        }
    }

    if (e.which === 113) {          // q : toggle infinite repeat
        INFINITE_REPEAT = !INFINITE_REPEAT;
    }

    if (e.which === 114) {          // r : print and reset
        printAndReset();
    }

    if (e.which === 119) {          // w : activate backupt chapter switcher
        activateBackupSwitcher();
    }

    if (e.which === 101) {          // e : deactivate backup switcher
        deactivateBackupSwitcher();
    }


});

function dump () {
    //console.log("dumping", historyModule.colorsList);
    particlesModule.dumpColors(historyModule.colorsList);
    historyModule.dumpColors();
}

function clearParticles () {
    particlesModule.clear();
}

function switchChapter (i) {
    if (USE_CHAPTERS) {
        currChapterIndex = i;
        console.log("SWITCHING TO ", i);

        dynamicModulesList.forEach((module, index) => {
            if (index != i) {
                module.disable();
            } else {
                module.enable();
            }
        })
    }
}

function playSong (name) {
    //audio.src = 'audio/'+name+'.mp3';
    audio.play();
}


/* ========================================================================== */
/* =========================== GET RESPONSE ================================= */
let changeEyeSizeNext = false;

function cleverbotResponseSuccess(data) {
    $(".loading-spinner").hide();
    
    // increment interaciont count
    RESPOSNE_COUNT++;
    prevInteractionCount++;

    //switchChapter(2);
    const emotionData = {
        name: data.emotion,
        degree: parseInt(data.emotion_degree) ? data.emotion_degree : parseInt(Math.random() * 50),
        tone: data.emotion_tone,
        values: data.emotion_values.split(",")
    }

    const reactionData = {
        name: data.reaction,
        degree: parseInt(data.reaction_degree) ? data.reaction_degree : parseInt(Math.random() * 50),
        tone: data.reaction_tone,
        values: data.reaction_values.split(",")
    }

    // get emotion category and corresponding color
    let emotionCategory = EM.getEmotionCategory(data.emotion);
    if (!emotionCategory) {
        emotionCategory = EM.getEmotionCategory(data.reaction);
    }

    if (!emotionCategory) {
        emotionCategory = "anger";
    }


    if (true) {
        console.log(data);
        //console.log("INTERACTION COUNT: ", data.interaction_count)
        console.log("%c OUTPUT: " + data.output, 'background: #FFF; color: #222; font-size: 20px');
        //'%c Oh my heavens! ', 'background: #222; color: #bada55')
        console.log("EMOTION: ", data.emotion);
        console.log("IN CATEGORY: ", emotionCategory);
        console.log("Emotion Degree: ", data.emotion_degree);
        console.log("Reaction Degree: ", data.reaction_degree);
        console.log("EMOTION: ", emotionData, "REACTION: ", reactionData);
        console.log("==========================");
        console.log("NEXT PRINTOUT: ", NUM_RESPONSES_FOR_SEQUENCE - RESPOSNE_COUNT);
    }




    const emotionColor = rgbToHex(EM.getColorForEmotion(data.emotion));

    // left or right
    const botIndex = prevInteractionCount % 2 ? 0 : 1;

    // gradient
    if (prevInteractionCount > 0) {
        gradientModule.addColor(emotionColor);
    }

    // "type" text 
    if (USE_TEXT) {
        //typeWriter(".text-output-"+botIndex, data.output, 0)
        //blurText(0, Math.random() * 100);
        //blurText(1, Math.random() * 100);
    }

    // time to switch chapters
    console.log("INTERACTION:", prevInteractionCount);
    if (prevInteractionCount % CHAPTER_SWITCH_MOD == 0 && USE_CHAPTERS) {
        console.log("SWITCHING CHAPTER")
        // loop back to first
        if (chapterCount >= numDynamicModules()) {
            chapterCount = 0;
            overlayModule.toggleColor();
        }

        const c = chapterCount;
        overlayModule.blink(() => {
            switchChapter(c);
            CHAPTER_SWITCH_MOD = parseInt(Math.random() * 11 + 1);
        }, () => {
            // set eye size
            if (changeEyeSizeNext) {
                overlayModule.setEyeRadius(Math.random() * totalHeight + 10);
                changeEyeSizeNext = false;
            }
        })

        chapterCount++;
    }

    // set eye speed
    overlayModule.setEyeSpeed(emotionCategory);
    
    // set eye size
    if (prevInteractionCount % EYE_SIZE_CHANGE_MOD == 0 && USE_OVERLAY) {
        changeEyeSizeNext = true;
        //overlayModule.setEyeRadius(Math.random() * totalHeight + 10);
    }
   
    // add to constellation
    constellationModule.addPoint(emotionData.degree, reactionData.degree, emotionColor)

    // add to shape drawer
    shapeDrawingModule.addPoint(emotionData.degree, reactionData.degree, emotionColor, data.output, emotionData.name)

    // add to particles
    setIntervalX(() => {
        particlesModule.addNode(emotionColor, totalWidth/2, 10, emotionCategory);
    }, 500, 3)

    // nature images
    natureImagesModule.changeImage();

    // set spinner speed and radius
    const newSpinnerSpeed = convertRange(emotionData.degree, [0, 80], [1, 70]);
    const newSpinnerRadius = convertRange(reactionData.degree, [0, 80], [1, 200]);

    particlesModule.setSpinnerSpeed(botIndex, newSpinnerSpeed);
    particlesModule.setSpinnerRadius(botIndex, newSpinnerRadius);

    //particlesModule.setEdgeStrokeWidth(parseInt(Math.random() * 10));

    // speak
    const voiceParams = EM.getVoiceParamsForEmotionCategory(emotionCategory)

    if (USE_VOICE) {
        responsiveVoice.speak(data.output, prevInteractionCount % 2 ? "UK English Male" : "US English Female", {
            rate: voiceParams.rate,
            pitch: prevInteractionCount % 2 ? voiceParams.pitch : voiceParams.pitch/4,
            volume: voiceParams.volume,
            onend: () => {
                // check for substrings
                playAudioForResponse(data.output);

                if (data.output.toLowerCase().indexOf("favorite") >= 0 || 
                        data.output.toLowerCase().indexOf("favourite") >= 0 || 
                        data.output.toLowerCase().indexOf("music") >= 0 ||
                        data.output.toLowerCase().indexOf("movie") >= 0) { 
                        if (videoPlayerModule) {
                            videoPlayerModule.unMute();
                            
                        }
                    
                    setTimeout(() => {
                        if (videoPlayerModule) {
                            videoPlayerModule.mute();    
                        }

                    }, YOUTUBE_AUDIO_ON_TIME)
                } 

                if (USE_PRINTING && RESPOSNE_COUNT >= NUM_RESPONSES_FOR_SEQUENCE) {
                    printAndReset();

                } else if (INFINITE_REPEAT) {
                    setTimeout(function () {
                        getResponse();
                    }, Math.random() * 10000 + 1000)
                }
            }
        });
    }

    // call image API
    if (USE_IMAGES) {
        const imageUrl = "https://pixabay.com/api/?key="+PIXABAY_API_KEY+"&q="+encodeURIComponent(data.emotion);            
        $.getJSON(imageUrl, function(data){
            if (parseInt(data.totalHits) > 0){
                const max = (data.totalHits >= 20) ? 20 : data.totalHits;
                const index = Math.floor(Math.random() * max);

                // add to modules
                imageModule.addImage(data.hits[index].webformatURL, botIndex);
                console.log("IMAGE TAGS ====================" ,data.hits[index]);
                console.log(prevOutput);
                //prevOutput += " " + data.hits[index].tags;
                //imageFlickerModule.addImage(data.hits[index].webformatURL, botIndex, data.hits[index].tags);
            }
            else
                console.log('No hits');
        });
    }

    // call youtube API
    if (USE_VIDEOS && prevInteractionCount > 1) {
        
        const videoUrl = "https://www.googleapis.com/youtube/v3/search?key="+YOUTUBE_API_KEY+"&part=snippet&maxResults=5&q="+encodeURIComponent(data.output);
        

        $.getJSON(videoUrl, function(data){
            //console.log(videoPlayerModule);
            //console.log("YOUTUBE DATA", data);
            
            const index = Math.floor(Math.random() * 5);
            const description = data.items[index].snippet.description;
            const title = data.items[index].snippet.description;
            const id = data.items[index].id.videoId;

            console.log("YOUTUBE DESCRIPTION:", description);

            //prevOutput += " " + description;

            if (id && videoPlayerModule && videoPlayerModule.isReady) {
                videoPlayerModule.player.loadVideoById(id);
            }

            const commentsUrl = "https://www.googleapis.com/youtube/v3/commentThreads";

            $.ajax({
                dataType: "json",
                url: commentsUrl,
                data: {
                    key: YOUTUBE_API_KEY,
                    videoId: id,
                    part: "snippet", 
                    textFormat: "plainText",
                    order: "relevance",
                    maxResults: 5
                },
                success: (data) => {
                    //console.log("COMMENTS =====================", data);
                    if (data.items[0]) {
                        const firstComment = data.items[0].snippet.topLevelComment.snippet.textDisplay;
                        console.log("FIRST YOUTUBE COMMENT: ", firstComment);
                    }
                    //prevOutput += " " + firstComment;
                },
                timeout: 1000
            }).fail( function(xhr, status) {
                if( status == "timeout" ) {
                    console.log("YOUTUBE TIMEOUT");
                } else {
                    xhr.abort();
                }
            });

        });
    }
    
    // store previous reply
    prevOutput = data.output;
    prevCs = data.interaction_count % RESET_CS_MOD == 0 ? "" : data.cs;
}

/* 
  returns a JSON response from the cleverbot API using the prevOutpt as the input
*/
function getResponse () {

    $(".loading-spinner").show();
    
    if (USE_LINE_DRAWING) {
        addSvg(parseInt(Math.random()*11) + 1);
    }

    prevOutput = prevOutput.replace(/[^\w\s?.]|_/g, "");

    console.log("ENCODING:", prevOutput);
    //console.log("TO:", encodeURIComponent(prevOutput.replace(/[^\w\s?.]|_/g, "")));

    const cleverbotUrl = "http://www.cleverbot.com/getreply";

    var request = $.ajax({
        dataType: "json",
        url: cleverbotUrl,
        data: {
            key: CLEVERBOT_API_KEY,
            input: encodeURIComponent(prevOutput),
            cs: prevCs,
            interaction_count: prevInteractionCount,
            cb_settings_emotion: "yes",
            cb_settings_tweak1: 50,
            cb_settings_tweak2: 50
        },
        success: cleverbotResponseSuccess,
        timeout: 10000
    }).fail(function(xhr, status, error) {
        if( status == "timeout" ) {
            // try agian if it takes too long
            console.log("TIMEOUT");
            getResponse();
        } else {
            request.abort();
            console.log("ALERT STATUS: ", status + " " + error);
            prevOutput = "Change of subject.";
            prevCs = "";
            getResponse();
        }
    });
}


function printAndReset () {
    console.log("PRINTING SEQUENCE: ", SEQUENCE_COUNT);

    shapeDrawingModule.takeSnapshot(() => {
        SEQUENCE_COUNT++;
        RESPOSNE_COUNT = 0;
        getResponse();
        console.clear();

        console.log("======================= NEW SEQUENCE =======================");
        console.log("WILL GO FOR ", NUM_RESPONSES_FOR_SEQUENCE, " RESPONSES");
        if (SEQUENCE_COUNT >= 8) {
            location.reload();
        }
        
    });
}

let backupSwitcherInterval;

function activateBackupSwitcher () {
    backupSwitcherInterval = setInterval(function() {
        switchChapter(parseInt(Math.random() * numDynamicModules()))
    }, 40 * 1000);
}

function deactivateBackupSwitcher () {
    clearInterval(backupSwitcherInterval);
}

/* ========================================================================== */
/* ============================== HELPER ==================================== */

function playAudioForResponse (input) {
    jQuery.each(keywordToAudioMapping, function(i, val) {
        //console.log(i);
        if (input.toLowerCase().indexOf(i) >= 0) { 
            audio.src = 'audio/' + val;
            audio.play();
        } 
    });
}

function numDynamicModules () {
    return dynamicModulesList.length;
}

function blurText (i, amount) {
    $(".text-output-"+i).css({
        //"font-size": Math.random() * 200 + 30,
        "color": "transparent",
        "text-shadow": "0 0 "+amount+"px rgba(255,255,255,0.5)"
    })
}

function sayText () {
    var voice = "BRITISHDANIEL";
    var sentence = "hello there";
    var ttsfile = "http://87.117.198.123:7777/ttsmakeavatartest.php?voice=" + voice;
    //if (voice == 'PEWDIEPIE') ttsfile = "http://78.129.245.15:7777/ttsmakeavatartest.php?voice=" + voice; //use Ayeaye for Pewdiepie 16/12/2016
    ttsfile += "&sx=" + "" +  + "&jsonp=?" + "&sentence=" + "HELLO" /*encodeURIComponent (sentence)*/;
    // cleverbot.ttsfile = ttsfile; cleverbot.playTTS();

    var el = document.getElementById ('showcommand');
    var obj = new XMLHttpRequest(); //start a new request
    obj.onreadystatechange = function() {
       if (obj.readyState!=4) return;
       if (obj.status==200) el.innerHTML = obj.responseText;
    };
    obj.open ('GET', ttsfile + '&debug=1', true); //run again but with debug=1 to get the command output
    obj.send(); //send the parameters
    
    // $.getJSON(ttsfile, function(data){
    //     console.log(data);
    // });
}

function generateNRandomNodes (n) {
    var i = 0;
    while (i++ < n) {
        particlesModule.addNode(EM.getColorForEmotionIndex(Math.floor(Math.random() * 7)), totalWidth/2, i);
        //particlesModule.addNode("#00f", 0, 0);
    }
}

/* hex to rgb and vice versa */
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(col) {
    var r = col.r;
    var g = col.g;
    var b = col.b;

    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function setIntervalX(callback, delay, repetitions) {
    let count = 0;
    let t = d3.interval(() => {
        if (count >= repetitions) {
            t.stop();
        } else {
            callback();
        }
        count++;
    }, delay)

    /*var x = 0;
    var intervalID = window.setInterval(function () {

       callback();

       if (++x === repetitions) {
           window.clearInterval(intervalID);
       }
    }, delay);*/
}

function loop (maxTime, minTime, callback) {
    var rand = Math.round(Math.random() * (maxTime - minTime)) + minTime;
    setTimeout(function() {
        callback();
        loop(maxTime, minTime, callback);  
    }, rand);
}

/* returns the center point of a circle, used for circles that are transformed */
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

function typeWriter(target, text, n, onEnd) {
    if (n < (text.length)) {
        $(target).html(text.substring(0, n+1));
            n++;
            setTimeout(function() {
              typeWriter(target, text, n, onEnd)
        }, 100);
    } else {
        onEnd()
    }
}

/*$('.start').click(function(e) {
  e.stopPropagation();
  
  var text = $('.test').data('text');
  
  typeWriter(text, 0);
});*/

/* toggles browser fullscreen mode */
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

function getViewport() {

    var viewPortWidth;
    var viewPortHeight;

    // the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
    if (typeof window.innerWidth != 'undefined') {
        viewPortWidth = window.innerWidth,
        viewPortHeight = window.innerHeight
    }

    // IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
    else if (typeof document.documentElement != 'undefined'
    && typeof document.documentElement.clientWidth !=
    'undefined' && document.documentElement.clientWidth != 0) {
        viewPortWidth = document.documentElement.clientWidth,
        viewPortHeight = document.documentElement.clientHeight
    }

    // older versions of IE
    else {
        viewPortWidth = document.getElementsByTagName('body')[0].clientWidth,
        viewPortHeight = document.getElementsByTagName('body')[0].clientHeight
    }
    return [viewPortWidth, viewPortHeight];
}

function addSvg (name) {
    xhr = new XMLHttpRequest();
    xhr.open("GET","../img/svgs/"+name+".svg",false);
    xhr.send("");
    $("#svg-drawing").html(xhr.responseXML.documentElement)
    
    var path = document.querySelector('path');
    if (path) {
        var length = path.getTotalLength();
    }
    
    $("#svg-drawing path").css({
        "stroke-dasharray": length,
        "stroke-dashoffset": length
    })
}

function convertRange( value, r1, r2 ) { 
    return ( value - r1[ 0 ] ) * ( r2[ 1 ] - r2[ 0 ] ) / ( r1[ 1 ] - r1[ 0 ] ) + r2[ 0 ];
}

function blendColors(r1,g1,b1,r2,g2,b2,balance) {
    var bal = Math.min(Math.max(balance,0),1);
    var nbal = 1-bal;
    return {
            r : Math.floor(r1*nbal + r2*bal),
            g : Math.floor(g1*nbal + g2*bal),
            b : Math.floor(b1*nbal + b2*bal)
           };
} 

function shadeColor2(color, percent) {   
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

function distanceBetweenPoints(x1,y1,x2,y2) {
    return Math.hypot(x2-x1, y2-y1)
}