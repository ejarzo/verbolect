
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

// emotion manager
var EM = new EmotionManager();

// the modules
var particlesModule,
    historyModule,
    gradientModule,
    imageModule,
    canvasSketchModule;

var overlayModule;

const totalWidth = 2000;

/* ========================================================================== */
/* =========================== OPTIONS ==================================== */
const USE_OVERLAY = true;          // "eye" circle
const USE_VOICE = true;
const USE_IMAGES = true;           // call image database
const USE_IMAGE_EFFECT = false;     // pixelation effect
const USE_EDGES = false;            // lines connecting the spinners

/* ========================================================================== */
/* =========================== GRADIENT CLASS =============================== */

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

    /*
        adds a color to the gradient, animates from left to right
    */
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

    /*
        renders a gradient in the target svg
    */
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

        this.initSimulation = () => {
            spinner = spinner.data(spinners);
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
          for (var i = 0; i < nodes.length; i++) {
            let p = nodes[i]
            
            // bound within box
            p.x = Math.max(nodeRadius, Math.min(width - nodeRadius, p.x));
            p.y = Math.max(nodeRadius, Math.min(height - nodeRadius, p.y));

            // gravity
            p.vy += Math.min(0.5, Math.max(0, (p.y - (- height / 2 - 20)) / height ))
          }
        }

        this.dumpColors = (rectList) => {
            for (let i = 1; i < rectList.length; i++) {
                const rect = rectList[i],
                      bbox = rect.node().getBoundingClientRect(),
                      combinedRadius = nodeRadius + nodeBuffer,
                      numNodesPerColor = Math.floor(totalWidth / (2 * combinedRadius));

                setIntervalX( () => {
                    for (let i = 0; i < numNodesPerColor; i++) {
                        const x = 0 + i * 2 * (combinedRadius);
                        const y = height/-2 + combinedRadius;
                        this.addNode(rect.attr("fill"), x, y)
                    }
                }, 100, 5);
            }
        }

        this.clear = () => {
            nodes.length = 0;
            this.restart();
        }

        this.setSpinnerRadius = (i, r) => {

        }
        
        this.setSpinnerSpeed = (i, s) => {
            if (i == 0) {
                spinner1Speed = s;
            } else {
                spinner2Speed = s;
            }
        } 
        
        this.setSpinnerPos = () => {
            var circle1Center = getCircleCenter(d3.select(".spinner1"))
            var circle2Center = getCircleCenter(d3.select(".spinner2"))
            
            floors[0].x = midX;
            floors[0].y = floorY;

            spinners[0].x = circle1Center.x;
            spinners[0].y = circle1Center.y;
            
            spinners[1].x = circle2Center.x;
            spinners[1].y = circle2Center.y;  
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
                .attr("cy", height / 2 - spinner1Radius)
                .attr("class", "spinner1");

            var spinner2 = spinnerCircles.append("circle")
                .attr("r", 15)
                .attr("cx", cx2)
                .attr("cy", height / 2 - spinner2Radius)
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

            if (USE_EDGES) {
                edges.attr("stroke-width", 2);
            } else {
                edges.attr("stroke-width", 0);
            }
        }

        this.animateSpinners = () => {
            if (mode === 0) {
                d3.timer(function() {
                    var angle1 = ((Date.now() - start) / spinner1Speed);
                    var angle2 = ((Date.now() - start) / spinner2Speed);
                    
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
            width = $(".modules").width(),
            height = 400,
            midX = width / 2,
            midY = height / 2,
            nodeRadius = 8,
            nodeBuffer = 1,
            spinnerRadius = 50,
            floorRadius = 10000,
            floorY = floorRadius + height - 8;

        // items in the simulation
        var nodes = [],
            spinners = [
                {radius: spinnerRadius},   // left wall
                {radius: spinnerRadius}    // right wall
            ],
            floors = [
                {radius: floorRadius},
                //{fx: width/2,  fy: 0, rx: floorRadius, ry: 10},
            ],
            platforms = this.generatePlatform(0, 40, 200, 100).concat(
                        this.generatePlatform(width, 40, width - 200, 100)).concat(
                        this.generatePlatform(midX - 50, midY, midX + 50, midY));

        // combine simulation items into single array
        var getForceNodes = () => platforms.concat(floors.concat(spinners.concat(nodes)));

        // simulation vars
        var aDecay = 0.1,
            vDecay = 0.05,
            chargeStrength = 0,
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

        /* ------------------------------------------------------------------ */

        // spinners
        var rotateElements = svg.append("g"),
            mode = 0,
            start = Date.now(),
            animateSpinnersActive = true,
            spinner1Speed = 9,
            spinner2Speed = 10,
            spinner1Radius = 100,
            spinner2Radius = 50;
        /* ------------------------------------------------------------------ */

        // intit 
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
}

/* ========================================================================== */
/* ============================ IMAGE CLASS ================================= */

class ImageDisplay {
    constructor () {
        this.drawPoint = (p) => {
            var c;
            if (p[0] < this.width/2) {
                c = this.getColorAtPoint(p[0], p[1], this.imageLeft);

            } else {
                c = this.getColorAtPoint(p[0], p[1], this.imageRight);
            }
            ctx.fillStyle = c;
            ctx.fillRect(p[0],p[1],10,10);
        };

        this.step = () => {
            //ctx.fillStyle = "rgba(255,255,255,0.3)";
            //ctx.fillStyle = "rgba(0,0,0,0.02)";
            //ctx.fillRect(0,0,width,height);
            //ctx.fillStyle = "rgba(0,0,0,0.1)";
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

        var bbox = d3.select("#image-module").node().getBoundingClientRect();
        this.width = totalWidth;
        this.height = 400;
        this.canvas = d3.select("#image-module").append("canvas")
            .attr("width", totalWidth)
            .attr("height", 400);

        this.context = this.canvas.node().getContext("2d");
        this.imageLeft;
        this.imageRight;

        var num = 500;
        //var canvas = document.getElementById("canvas");
        var width = totalWidth;
        var height = 400;
        //var ctx = this.canvas.getContext("2d");
        var ctx = this.context;

        var particles = d3.range(num).map(function(i) {
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


class CanvasSketch {
    constructor () {

        const width = this.width = totalWidth;
        const height = this.height = 400;
        this.image;
        this.images = [];

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
            
            if(this.images.length > 0) {
                var imgXPos = Math.random()*totalWidth/2 + 1;
                var imgWidth = Math.random()*totalWidth + 1;

                //imgXPos = 0;
                //imgWidth = 200;
                this.context.globalAlpha = 0.5;
                this.context.drawImage(this.images[this.images.length-1], imgXPos, 0, imgWidth, this.height);
                var imgData = this.context.getImageData(0,0, imgWidth, 400);
                var data = imgData.data;

                // Rescale the colors.
                for (var i = 0, n = imgWidth * this.height * 4, d = data; i < n; i += 4) {
                  d[i + 0] += 0; // r
                  d[i + 1] += 0; // g
                  d[i + 2] += 0; // b
                }

                this.context.putImageData(imgData, imgXPos, 0);
            }


            //for (var i = this.xPos; i < width; i += 10) {
            this.context.fillStyle = "rgba(200,0,0,1)";
            this.context.fillRect(this.xPos, 10, 10, this.height);
            this.xPos++;
            //}
        };

        // setup
        this.xPos = 10;

        // start
        d3.timer(this.step);


    }

    addImage (url, isRight) {

        
        this.getImage(url, (image) => {
            this.images.push(image);
        });     
    }

    getImage(path, callback) {
      var imgObj = new Image;
      imgObj.onload = function() { callback(imgObj); };
      imgObj.src = path;
      imgObj.setAttribute('crossOrigin', '');
    }
}



/* ========================================================================== */
/* ============================ OVERLAY CLASS =============================== */

class Overlay {
    constructor () {
        this.ctx = overlay.getContext('2d');
        this.radius;
        if (USE_OVERLAY) {
            this.renderOverlay();
        }
        this.currScale = 1;
    }

    renderOverlay() {
        const vp = getViewport();
        overlay.width = 3 * vp[0];
        overlay.height = 3 * vp[1];
        $("#overlay").css({"left": -0.33 * overlay.width, "top": -0.33 * overlay.height});
        this.radius = 200;
        this.ctx.fillStyle = '#000';
        
        this.ctx.fillRect(-1*overlay.width, -1*overlay.height, overlay.width*2, overlay.height*2);
        this.clipArc(this.ctx, overlay.width/2, overlay.height/2, this.radius, 10);
    }

    clipArc(ctx, x, y, r, f) {
        ctx.globalCompositeOperation = 'destination-out';

        ctx.filter = "blur(40px)";  // "feather"
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fill();

        // reset comp. mode and filter
        ctx.globalCompositeOperation = 'destination-out';
        ctx.filter = "none";
    }

    setOverlayPos(x, y) {
        //$("#overlay").animate({"left": x}, 1500);
        var xBuffer = -0.5*overlay.width;
        var yBuffer = -0.5*overlay.height;
        const animateTime = 300;
        $("#overlay").animate({"left": x + xBuffer, "top" : y + yBuffer}, animateTime);
    }
    
    setModulesPos(x, y) {
        var xBuffer = totalWidth / -2;
        var yBuffer = $(".modules").height()/-2;
        $(".modules").css({"left": x + xBuffer, "top" : y + yBuffer});
    }

    animateZoomTo (amount) {
        console.log("sda");
        this.currScale += amount;
        const newTrans = "scale3d("+this.currScale+","+this.currScale+","+this.currScale+")";
        $(".modules").css("transform", newTrans);  
    }
}

/* ========================================================================== */
/* ========================== DOCUMENT READY ================================ */

/* execute on page load*/
$(document).on("ready", function () {  

    // add svg canvas to all modules
    d3.selectAll(".module").append("svg")
                            .attr("width", "100%")
                            .attr("height", "100%");

    // init modules
    gradientModule = new Gradient();
    historyModule = new History();
    particlesModule = new Particles();
    imageModule = new ImageDisplay();
    canvasSketchModule = new CanvasSketch();
    overlayModule = new Overlay();


    // random eye movements
    (function loop() {
        var rand = Math.round(Math.random() * (3000 - 500)) + 500;
        setTimeout(function() {
                moveEyeToRandomLocation();
                loop();  
        }, rand);
    }());

    // start with one response
    getResponse();

    (function loop() {
        var rand = Math.round(Math.random() * (3000 - 500)) + 500;
        setTimeout(function() {
                moveModuleToRandomLocation();
                loop();  
        }, rand);
    }());
})

function moveEyeToRandomLocation () {
    var vp = getViewport();
    var width = vp[0];
    var height = vp[1];
    var x = Math.random() * vp[0];
    var y = Math.random() * vp[1];
/*    if (x > width-width/4 || x < width/4) {
        x = (x * Math.random() * .8) + (width / 2);
    }

    if (y > height-height/4 || x < height/4) {
        y = (y * Math.random() * .8) + (height / 2);
    }*/

    overlayModule.setOverlayPos(x, y)
}

function moveModuleToRandomLocation() {
    var vp = getViewport();
    var width = vp[0];
    var height = $(".modules").height();
    height = height * 2 - height/2;
    var x = Math.random() * width;
    var y = Math.random() * height;

    overlayModule.setModulesPos(x, y)
}


/* ========================================================================== */
/* ============================= HANDLERS =================================== */

/* handler for key presses */
$(window).keypress(function(e) {

    if (e.which === 32) { // space bar
        getResponse();
    }
    if (e.which === 122) { // z
        overlayModule.animateZoomTo(-0.3)
        //overlayModule.zoomIn();
    }
    if (e.which === 120) { // x
        overlayModule.animateZoomTo(0.3)
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

$(document).on("mousemove", function(e) {
    //overlayModule.setOverlayPos(e.clientX, e.clientY);
    //overlayModule.setModulesPos(e.clientX, e.clientY);
})

/* ========================================================================== */
/* =========================== GET RESPONSE ================================= */

/* 
  returns a JSON response from the cleverbot API using the prevOutpt as the input
*/
function getResponse () {

    $(".loading-spinner").show();
    
    var stringWithoutSpaces = encodeURIComponent(prevOutput)
    //.replace(/\s/g, '+');
    var url = "http://www.cleverbot.com/getreply?key=" + APIKEY + "&input=" + 
                stringWithoutSpaces + "&cs=" + prevCs + "&cb_settings_emotion=yes";
    
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
        let isRight = true;
        if (data.interaction_count % 2) {
            typeWriter(".text-output-l", data.output, 0)
            isRight = false;
            
            particlesModule.setSpinnerSpeed(0, (data.emotion_degree + 1) / 20);
        } else {
            typeWriter(".text-output-r", data.output, 0)
            
            particlesModule.setSpinnerSpeed(1, (data.emotion_degree + 1) / 20);
        }


        // get color
        var newCol = rgbToHex(EM.getColorForEmotion(data.emotion));
        if (data.interaction_count > 0) {
            gradientModule.addColor(newCol);
        }

        // speak
        if (USE_VOICE) {
            responsiveVoice.speak(data.output);
            //sayText();
        }

        // call image API
        if (USE_IMAGES) {
            var imageQuery = data.emotion;
            var imageUrl = "https://pixabay.com/api/?key="+PIXABAY_API_KEY+"&q="+encodeURIComponent(data.emotion);
            
            $.getJSON(imageUrl, function(data){
                if (parseInt(data.totalHits) > 0){
                    let max = (data.totalHits >= 20) ? 20 : data.totalHits;
                    let index = Math.floor(Math.random() * max);
                    //console.log(data.hits[index]);
                    imageModule.addImage(data.hits[index].webformatURL, isRight);
                    canvasSketchModule.addImage(data.hits[index].webformatURL, isRight);
                    /*$.each(data.hits, function(i, hit){
                        console.log(hit.webformatURL); 
                    });*/
                }
                else
                    console.log('No hits');
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
//    cleverbot.ttsfile = ttsfile; cleverbot.playTTS();

    var el = document.getElementById ('showcommand');
    var obj = new XMLHttpRequest(); //start a new request
    obj.onreadystatechange = function() {
       if (obj.readyState!=4) return;
       if (obj.status==200) el.innerHTML = obj.responseText;
    };
    obj.open ('GET', ttsfile + '&debug=1', true); //run again but with debug=1 to get the command output
    obj.send(); //send the parameters
    
/*    $.getJSON(ttsfile, function(data){
        console.log(data);
    });*/
}

function generateNRandomNodes (n) {
    var i = 0;
    while (i++ < n) {
        particlesModule.addNode(EM.getColorForEmotionIndex(Math.floor(Math.random() * 7)), 0, 0);
        //particlesModule.addNode("#00f", 0, 0);
    }
}
/*
  hex to rgb and vice versa
*/
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