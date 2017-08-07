// block by monfera
  
var width = 1500
var height = 500

var interactionCount
var particleCount = getInteractionCount()
console.log(particleCount)

// some of the settings change on every reload
var particleRadius = 10 + Math.random() * 3
var paintSizeRatio = 0.8 + 0.4 * Math.random()
var sideWallRadius = height / 3 // confining balls on the sides
var planetRadius = 100000 // 'planet' underneath, almost no curvature
var recycle = true // lost liquid rains back
var amplCycle = 30000 // 30s

// utilities
var radius = function(element) { return element.r }
var startMs = Date.now()
var getMs = performance && performance.now
            ? function() { return performance.now() }
            : function() { return Date.now() - startMs }
var TAU = 2 * Math.PI

// please turn off your mobile phones


// initial render setup
var ctx = document.querySelector('canvas').getContext('2d')
ctx.transform(1, 0, 0, -1, width / 2, height / 2) // I ❤ WebGL-like projection
ctx.fillStyle = "rgba(0,0,0,1)"
ctx.rect(-width / 2, - height / 2, width, height)
ctx.fill()
ctx.lineWidth = particleRadius / 2 * paintSizeRatio
ctx.fillStyle = "rgba(0,0,0,0.05)"

// particle data
var particles = d3.range(particleCount).map(function(d, i) {
  return {
    x: (i < particleCount >> 1 ? -1 : 1) * (Math.random() * width / 2 ) / 2,
    y:  particleRadius / 30 * Math.random() * height - height / 2 + 40,
    r: particleRadius
  }
})


// liquid container walls - one circle per side and one 'planet' underneath
var walls = [
  {r: sideWallRadius},
  {r: sideWallRadius},
  {r: planetRadius}
]

// this is an imperfect way of constraining the container walls
var lockWallsInPlace = function() {
  var t = getMs()
  var amplitude = 0.75 + 0.25 * Math.sin((t % amplCycle) / amplCycle * TAU)
  walls[0].x = - width / 2 + sideWallRadius / 3
               * Math.pow(amplitude, 3) * Math.cos(t / TAU / 100)
  walls[0].y = - height / 4
  walls[1].x = width / 2  + sideWallRadius / 3
               * Math.pow(amplitude, 3) * Math.cos(t / TAU / 100)
  walls[1].y = - height / 4
  walls[2].x = 0
  walls[2].y = - height / 2 - planetRadius + 40 // let's see some of it
  walls[0].vx = walls[0].vy = 0
  walls[1].vx = walls[1].vy = 0
  walls[2].vx = walls[2].vy = 0
}
lockWallsInPlace()

// gravity-like force ... with rain cycle, if needed
function gravity() {
  var p
  for (var i = 0; i < particles.length; i++) {
    p = particles[i]
    p.vy -= Math.min(0.5, Math.max(0, (p.y - (- height / 2 + 40)) / height ))
    if(recycle && p.y < - height / 2) {
      p.x = 2 * width * (Math.random() - 0.5) // double wide area for slow rain
      p.vx = Math.random() - 0.5
      p.vy = -10
      p.y = height / 2
    }
  }
}

// simulation setup
d3.forceSimulation(walls.concat(particles))
  .alphaDecay(0)
  .velocityDecay(0)
  .force("gravity", gravity)
  .force("collide", d3.forceCollide().radius(radius).iterations(1)
    .strength(0.05 + Math.random() * 0.25))
  .force("lockInPlace", lockWallsInPlace)
  .on("tick", render)

// coloring setup
var cycleLen1 = 5000 + Math.random() * 55000
var cycleLen2 = 5000 + Math.random() * 55000

var palettes = [
  d3.interpolateViridis,
  d3.interpolateMagma,
  d3.interpolatePlasma,
  d3.interpolateWarm,
  d3.interpolateCool,
  d3.interpolateRainbow,
  d3.interpolateCubehelixDefault
]

// pick from the new continuous color palettes
var palette1 = palettes[Math.floor(palettes.length * Math.random())]
var palette2 = palettes[Math.floor(palettes.length * Math.random())]
// var palette1 = getResponse.newCol
// var palette2 = getResponse.newCol

// canvas render - plenty fast for this, no need for WebGL
// palettes are traversed both ways to avoid disruption
function render() {

  var i
  var particle
  var t = getMs()

  // vary how much trail the particles leave
  ctx.beginPath()
  ctx.fillStyle = "rgba(0,0,0," + Math.pow((0.25 + 0.75
                  * (1 + Math.sin(t / cycleLen1 * TAU)) / 2), 2)  + ")"
  ctx.rect(-width / 2, - height / 2, width, height)
  ctx.fill()

  // draw one half of the particles with a color
  ctx.strokeStyle = palette1(Math.abs(2 * (t % cycleLen1) / cycleLen1 - 1))
  ctx.strokeStyle = palette1
  ctx.beginPath()
  for(i = 0; i < (particleCount >> 1); i++) {
    particle = particles[i]
    ctx.moveTo(particle.x - particle.r * .25 * paintSizeRatio, particle.y)
    ctx.lineTo(particle.x + particle.r * .25 * paintSizeRatio, particle.y)
  }
  ctx.stroke()

  // draw the other half of the particles with another color
  ctx.strokeStyle = palette2(Math.abs(2 * (t % cycleLen2) / cycleLen2 - 1))
  ctx.strokeStyle = palette2
  ctx.beginPath()
  for(i = (particleCount >> 1); i < particleCount; i++) {
    particle = particles[i]
    ctx.moveTo(particle.x - particle.r * .25 * paintSizeRatio, particle.y)
    ctx.lineTo(particle.x + particle.r * .25 * paintSizeRatio, particle.y)
  }
  ctx.stroke()

  // draw the side circles, making it look a bit reflective
  ctx.beginPath()
  ctx.fillStyle = "rgba(0,0,0,0.5)"
  for(i = 0; i < 2; i++) {
    particle = walls[i]
    ctx.moveTo(particle.x + particle.r, particle.y)
    ctx.arc(particle.x, particle.y, particle.r, 0, TAU)
  }
  ctx.fill()

/*
  // this block, if switched on, hides the fact that the nodes can overlap,
  // here with the planet-like container bottom circle, because
  // the collision iterator count is kept minimal due to the need for speed
  context.beginPath()
  context.fillStyle = "rgba(0,0,0,1)"
  for(i = 2; i < 3; i++) {
    particle = walls[i]
    context.moveTo(particle.x + particle.r, particle.y)
    context.arc(particle.x, particle.y, particle.r, 0, tau)
  }
  context.fill()*/

}

function getInteractionCount (input) {
  return parseInt (input)
}    