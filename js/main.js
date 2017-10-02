/* ========================================================================== */
/* ============================ OPTIONS ===================================== */

const USE_OVERLAY           = 0;    // "eye" circle
const USE_RANDOM_MOVEMENTS  = 0;    // searching around
const USE_VOICE             = 1;    // audio
const USE_IMAGES            = 1;    // call image API
const USE_VIDEOS            = 1;    // call youtube API
const USE_SOUND_EFFECTS     = 0;    // call freesound API
const USE_IMAGE_EFFECT      = 0;    // pixelation effect
const USE_EDGES             = 0;    // lines connecting the spinners
const USE_LINE_DRAWING      = 0;    // svg line drawing effect
const USE_TEXT              = 0;    // text output overlay
const USE_CHAPTERS          = 0;    // shows one "chapter" at a time if true
const USE_GRAVITY           = 1;    // use gravity in the particle simulation

const EYE_RADIUS            = 320;  // radius of roving eye
const EYE_SIZE_CHANGE_MOD   = 5;    // how often the eye changes size

const totalWidth = $(".dynamic-modules").width(); // width of the view
const totalHeight = 800;                    // height of the view


/* ========================================================================== */
/* =========================== Variables ==================================== */

// emotion manager
let EM;

// init state
let prevOutput = "Nice to meet you";
let prevCs = "";

// youtube player
let ytPlayer;                               

// the modules
let particlesModule,
    historyModule,
    gradientModule,
    imageModule,
    constellationModule,
    shapeDrawingModule,
    imageFlickerModule,
    overlayModule;

// modules that will show and hide
let dynamicModulesList = [
        () => $("#ytplayer"), 
        () => $("#gradient-group"),
        () => $("#emotion-history-grid"),
        () => $("#particles"),
        () => $("#canvas-sketch")
    ];

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

        return {
            r: r,
            g: g,
            b: b
        }
    }
}

/* =========================== GRADIENT CLASS ==================================
    Responsible for drawing the gradient slider, which represents the 
    transition from the previous emotion to the current emotion. Includes a
    method to add a color, which triggers the animation.
*/
class Gradient {
    constructor () {
        this.gradientTopSvg = d3.select("#emotion-gradient svg");
        this.gradientBottomSvg =  d3.select("#emotion-gradient-bottom svg");

        this.gradientTop;
        this.gradientBottom;
        this.transitionDuration = 500;

        this.prevCol = "#000";
        this.prevPrevCol = "#000";
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

        d3.select("#emotion-gradient").style("width", "0%");
        d3.select("#emotion-gradient").transition(gradientTransition).style("width", "100%");
        
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
        this.addNode = (color, x, y) => {
            nodes.push({x: x, y: y, color: color, radius: nodeRadius, type: "node"});
            this.restart();
        }

        this.gravity = (alpha) => {
            if (USE_GRAVITY) {
                for (var i = 0; i < nodes.length; i++) {
                    let p = nodes[i]

                    // bound within box
                    p.x = Math.max(nodeRadius, Math.min(width - nodeRadius, p.x));
                    p.y = Math.max(nodeRadius, Math.min(height - nodeRadius, p.y));

                    // gravity
                    p.vy += Math.min(0.5, Math.max(0, (p.y - (- height / 2 - 20)) / height ))
                }
            }
        }

        this.dumpColors = (rectList) => {
            for (let i = 1; i < rectList.length; i++) {
                const rect = rectList[i],
                      bbox = rect.node().getBoundingClientRect(),
                      combinedRadius = nodeRadius + nodeBuffer,
                      numNodesPerColor = Math.floor(bbox.width / (2 * combinedRadius));
                //console.log(rect)
                setIntervalX( () => {
                    for (let i = 0; i < numNodesPerColor; i++) {
                        const x = bbox.left + i * 2 * (combinedRadius);
                        //const y = height/-2 + combinedRadius;
                        const y = 2*combinedRadius;

                        //console.log("-----", i,x,y);
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
        }
        
        this.setSpinnerSpeed = (i, s) => {
            // invert
            var speed = 100 / s; 
            spinners[i].speed = 100 / s
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

            if (USE_EDGES) {
                edges.attr("stroke-width", 2);
            } else {
                edges.attr("stroke-width", 0);
            }
        }

        this.animateSpinners = () => {
            if (mode === 0) {
                d3.timer(function() {
                    
                    spinners.forEach((spinner) => {
                        spinner.elem.attr("cy", height / 2 - spinner.radius)
                    })

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

            platforms = this.generateRect(30, 30, 50, 50).concat(
                        this.generateRect(230, 30, 50, 50).concat(
                        this.generateRect(430, 30, 50, 50).concat(
                        this.generateRect(630, 30, 50, 50).concat(
                        this.generateRect(830, 30, 50, 50).concat(
                        this.generateRect(1030, 30, 50, 50).concat(
                        this.generateRect(totalWidth-80, 30, 50, 50).concat(
                        this.generateRect(midX-25, midY-25, 50, 50))))))));

        // combine simulation items into single array
        var getForceNodes = () => platforms.concat(floors.concat(spinnerFollowers.concat(nodes)));

        // simulation vars
        var aDecay = 0.1,
            vDecay = 0.05,
            chargeStrength = 0.1,
            gravityStrength = 0.03,
            collideStrength = 1.3,
            collideIterations = 3;

        // the simulation
        var simulation = d3.forceSimulation(getForceNodes())
            .alphaDecay(aDecay)
            .velocityDecay(vDecay)
            .force("charge", d3.forceManyBody().strength(chargeStrength))
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
            this.images.push(image);
        });     
    }

    getImage(path, callback) {
      var imgObj = new Image;
      imgObj.onload = function() { callback(imgObj); };
      imgObj.src = path;
      imgObj.setAttribute('crossOrigin', '');
    }

    toggleActive () {
        if (this.isActive) {
            this.timer.stop();
        } else {
            this.timer = d3.timer(this.step);
        }
        this.isActive = !this.isActive;
    }
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
        const x = convertRange( ed, [ 0, 80 ], [ 0, this.width ] );
        const y = convertRange( rd, [ 0, 80 ], [ 0, this.height ] );
        
        this.targetX = x;
        this.targetY = y;

        this.context.strokeStyle = "rgba(255, 255, 255, 1)";
        this.context.stroke()

        this.context.fillStyle = color;
        this.context.fillRect(x-1, y-1, 3, 3);
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

        this.canvas = d3.select("#shape-drawing").append("canvas")
            .attr("width", width)
            .attr("height", height);
        this.context = this.canvas.node().getContext("2d");

        this.isRight = () => this.count % 2;
        
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
            widthMod: 0
        }

        this.rightShapeData = {
            currX: totalWidth,
            currY: 0,
            prevCol: initColor,
            targetCol: initColor,
            widthMod: totalWidth
        }

        this.shapeDatas = [this.leftShapeData, this.rightShapeData];

        // start
        d3.timer(this.step);
    }

    addPoint (ed, rd, color, text) {
        this.percentage = 0;
        const x = convertRange(ed, [0, 100], [0, this.width]);
        const y = convertRange(rd, [0, 100], [0, this.height]);
        
        //var shapeDataIndex = this.count % 2;

        if (this.count == 1) {
            this.leftShapeData.currX = x;
            this.leftShapeData.currY = y;
        } else if (this.count == 2) {
            this.rightShapeData.currX = totalWidth - x;
            this.rightShapeData.currY = y;
        }
        this.targetX = x;
        this.targetY = y;

        if (this.isRight()) {
            this.context.strokeText(text,x,y);
            this.shapeDatas[0].prevCol = this.shapeDatas[0].targetCol;
            this.shapeDatas[0].targetCol = color;
        } else {
            this.context.strokeText(text,totalWidth-x,y);
            this.shapeDatas[1].prevCol = this.shapeDatas[1].targetCol;
            this.shapeDatas[1].targetCol = color;
        }
        
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
        
        data.currX += xDiff / 100;
        data.currY += yDiff / 100;

        var minCount = data.widthMod ? 3 : 2;

        if (this.count > minCount) {
            this.context.fillStyle = col;
            this.context.fillRect(data.currX, data.currY, 3, 3);
        }
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

        if (USE_OVERLAY) {
            this.renderOverlay();
        }
        this.currScale = 1;
    }

    /* initialize the overlay */
    renderOverlay() {
        const vp = getViewport();
        overlay.width = 3 * vp[0];
        overlay.height = 3 * vp[1];

        $("#overlay").css({"left": -0.33 * overlay.width, "top": -0.33 * overlay.height});
        this.ctx.fillStyle = '#000';
        
        this.ctx.fillRect(-1*overlay.width, -1*overlay.height, overlay.width*2, overlay.height*2);
        this.clipArc(this.ctx, overlay.width/2, overlay.height/2, this.radius, this.radius, 10, this.blurAmount);
    }

    /* Draw cutout circle */
    clipArc(ctx, x, y, rx, ry, f, blurAmount) {
        ctx.globalCompositeOperation = 'destination-out';

        ctx.filter = "blur("+blurAmount+"px)";  // "feather"
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI);
        ctx.fill();

        // reset comp. mode and filter
        ctx.globalCompositeOperation = 'destination-out';
        ctx.filter = "none";
    }

    blink () {
        var speed = 100;
        var closedTime = 200;

        var count = speed;
        if (USE_OVERLAY) {
            var t = d3.timer(() => {
                if (this.radius - count < 0) {
                    t.stop();
                    
                    imageFlickerModule.toggleActive();
                    this.blinkClosed(this.radius);
                    
                    const randIndex = parseInt(Math.random() * dynamicModulesList.length);
                    switchChapter(randIndex);
                   
                    count = this.radius;
                    var t2 = d3.timer((elapsed) => {
                        if (elapsed > closedTime) {
                            if (count <= 0) {
                                t2.stop();
                                this.blinkClosed(0);
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
            }, 0);
        }
    }
   
    blinkClosed (count) {
        const vp = getViewport();
        overlay.width = 3 * vp[0];
        overlay.height = 3 * vp[1];

        this.ctx.fillRect(-1*overlay.width, -1*overlay.height, overlay.width*2, overlay.height*2);
        this.clipArc(this.ctx, overlay.width/2, overlay.height/2, this.radius, this.radius - count, 10, this.blurAmount);
    }
    
    setEyeRadius (targetR) {
        var diff = targetR - this.radius;
        var speed = 6;
        var count = (diff > 0) ? speed : -1 * speed;

        var t = d3.timer(() => {
            if (diff > 0) {
                if (this.radius + count >= targetR) {
                    t.stop();
                    //this.animateRadius(targetR);
                    this.radius = targetR;
                } else {
                    this.animateRadius(count);
                    count += speed; 
                }
            } else {
                if (this.radius + count <= targetR) {
                    t.stop();
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

        this.ctx.fillRect(-1*overlay.width, -1*overlay.height, overlay.width*2, overlay.height*2);
        this.clipArc(this.ctx, overlay.width/2, overlay.height/2, targetR, targetR, 10, this.blurAmount);
    }

    /* animate the overlay center to x, y coordinates */
    setOverlayPos(x, y) {
        var xBuffer = -0.5*overlay.width;
        var yBuffer = -0.5*overlay.height;
        const animateTime = 300;
        $("#overlay").animate({"left": x + xBuffer, "top" : y + yBuffer}, animateTime);
    }
    
    /* animate the whole canvas under the eye to x, y coordinates */
    setModulesPos(x, y) {
        var xBuffer = totalWidth / -2;
        var yBuffer = $(".dynamic-modules").height()/-2;
        $(".dynamic-modules").css({"left": x + xBuffer, "top" : y + yBuffer});
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

    /* moves modules to random position */
    moveModulesToRandomLocation () {
        var vp = getViewport();
        var width = vp[0];
        var height = $(".dynamic-modules").height();
        height = height * 2 - height/2;
        var x = Math.random() * width;
        var y = Math.random() * height;

        this.setModulesPos(x, y)
    }

    /* animate the scale (zoom) of the canvas beneath the eye */
    animateZoomTo (amount) {
        this.currScale += amount;
        const newTrans = "scale3d("+this.currScale+","+this.currScale+","+this.currScale+")";
        $(".dynamic-modules").css("transform", newTrans);  
    }
}

/* ========================================================================== */
/* ========================== DOCUMENT READY ================================ */

/* execute on page load */
$(document).on("ready", function () {  

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
    imageFlickerModule = new ImageFlicker();
    constellationModule = new Constellation();
    shapeDrawingModule = new ShapeDrawing();
    overlayModule = new Overlay();

    if (USE_CHAPTERS) {
        $(".dynamic-modules .module-section").hide();
    }

    // start with one response
    getResponse();
    overlayModule.blink();

    // Start random eye movements
    if (USE_RANDOM_MOVEMENTS) {
        loop(5000, 2000, () => overlayModule.moveEyeToRandomLocation());      
        //loop(5000, 2000, () => overlayModule.moveModulesToRandomLocation());      
    }
})

/* initialize the youtube player iframe */
function onYouTubeIframeAPIReady() {
    ytPlayer = new YT.Player('ytplayer', {
        videoId: '0', // YouTube Video ID
        width: totalWidth,               // Player width (in px)
        height: totalHeight,              // Player height (in px)
        playerVars: {
            autoplay: 1,        // Auto-play the video on load
            controls: 0,        // Show pause/play buttons in player
            showinfo: 0,        // Hide the video title
            modestbranding: 1,  // Hide the Youtube Logo
            rel: 0,
            loop: 0,            // Run the video in a loop
            fs: 0,              // Hide the full screen button
            cc_load_policy: 0,  // Hide closed captions
            iv_load_policy: 3,  // Hide the Video Annotations
            autohide: 1         // Hide video controls when playing
        },
        events: {
            onReady: function(e) {
                e.target.mute();
            }
        }
    });
}

/* ========================================================================== */
/* ============================= HANDLERS =================================== */

/* Keyboard shortcuts */
$(window).keypress(function(e) {
    console.log(e.which);
    if (e.which === 99) { // c
        getResponse();
    }
    if (e.which === 122) { // z
        overlayModule.animateZoomTo(-0.3)
    }
    if (e.which === 120) { // x
        overlayModule.animateZoomTo(0.3)
    } 
    if (e.which === 98) { // b
        if (USE_OVERLAY) {
            overlayModule.blink();
        } else {
            switchChapter(parseInt(Math.random() * dynamicModulesList.length))
        }
    } 
    if (e.which === 110) { // n
        overlayModule.setEyeRadius(800);
    }
    if (e.which === 100) { // d
        dump();
    }
    if (e.which === 102) {  // f
        clearParticles();
    }
});

function dump () {
    console.log("dumping", historyModule.colorsList);
    particlesModule.dumpColors(historyModule.colorsList);
    historyModule.dumpColors();
}

function clearParticles () {
    particlesModule.clear();
}

function switchChapter (i) {
    if (USE_CHAPTERS) {
        console.log("SWITCHING TO ", i);
        $(".dynamic-modules .module-section").hide();
        dynamicModulesList[i]().show();
    }
}
/* ========================================================================== */
/* =========================== GET RESPONSE ================================= */

/* 
  returns a JSON response from the cleverbot API using the prevOutpt as the input
*/
function getResponse () {

    $(".loading-spinner").show();
    if (USE_LINE_DRAWING) {
        addSvg(parseInt(Math.random()*11) + 1);
    }

    var url = "http://www.cleverbot.com/getreply?key=" + CLEVERBOT_API_KEY + "&input=" + 
                encodeURIComponent(prevOutput) + "&cs=" + prevCs + "&cb_settings_emotion=yes";
    
    // call cleverbot API
    $.getJSON(url, function(data) {        
        if (true) {
            //console.log(data);
            //console.log("INTERACTION COUNT: ", data.interaction_count)
            console.log("OUTPUT: ", data.output);
            console.log("EMOTION: ", data.emotion);
            console.log("IN CATEGORY: ", emotionCategory);
            console.log("Emotion Degree: ", data.emotion_degree);
            console.log("Reaction Degree: ", data.reaction_degree);
        }

        $(".loading-spinner").hide();
        var emotionCategory = EM.getEmotionCategory(data.emotion);
        
        // left or right
        let botIndex = 1;

        if (data.interaction_count % 2) {
            botIndex = 0;
            isRight = false;
        }

        // text output
        if (USE_TEXT) {
            typeWriter(".text-output-"+botIndex, data.output, 0)
        }

        // spinner speed and radius
        const newSpinnerSpeed = convertRange(data.emotion_degree, [0, 80], [1, 70]);
        const newSpinnerRadius = convertRange(data.reaction_degree, [0, 80], [1, 200]);

        particlesModule.setSpinnerSpeed(botIndex, newSpinnerSpeed);
        particlesModule.setSpinnerRadius(botIndex, newSpinnerRadius);

        // set eye size
        if (data.interaction_count % EYE_SIZE_CHANGE_MOD == 0 && USE_OVERLAY) {
            overlayModule.setEyeRadius(Math.random() * totalHeight + 10);
        }

        // get color
        var newCol = rgbToHex(EM.getColorForEmotion(data.emotion));
        constellationModule.addPoint(data.emotion_degree, data.reaction_degree, newCol)
        shapeDrawingModule.addPoint(data.emotion_degree, data.reaction_degree, newCol, data.output)

        // gradient
        if (data.interaction_count > 0) {
            gradientModule.addColor(newCol);
        }

        // speak
        if (USE_VOICE) {
            responsiveVoice.speak(data.output, "UK English Male"/*, {rate: Math.random()*2, pitch: Math.random()*1.9+0.1, volume: 1}*/);
            //sayText();
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
                    imageFlickerModule.addImage(data.hits[index].webformatURL, botIndex, data.hits[index].tags);
                }
                else
                    console.log('No hits');
            });
        }

        // call youtube API
        if (USE_VIDEOS) {
          const videoUrl = "https://www.googleapis.com/youtube/v3/search?key="+YOUTUBE_API_KEY+"&part=snippet&q="+encodeURIComponent(data.output);
          $.getJSON(videoUrl, function(data){
              const id = data.items[0].id.videoId;
              if (ytPlayer) {
                ytPlayer.loadVideoById(id);
              }
          });
        }

        prevOutput = data.output;
        prevCs = data.cs;
    });
}

/* ========================================================================== */
/* ============================== HELPER ==================================== */

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
        particlesModule.addNode(EM.getColorForEmotionIndex(Math.floor(Math.random() * 7)), 0, 0);
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
    var x = 0;
    var intervalID = window.setInterval(function () {

       callback();

       if (++x === repetitions) {
           window.clearInterval(intervalID);
       }
    }, delay);
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

function typeWriter(target, text, n) {
  if (n < (text.length)) {
    $(target).html(text.substring(0, n+1));
    n++;
    setTimeout(function() {
      typeWriter(target, text, n)
    }, 100);
  }
}

$('.start').click(function(e) {
  e.stopPropagation();
  
  var text = $('.test').data('text');
  
  typeWriter(text, 0);
});

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