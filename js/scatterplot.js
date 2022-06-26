var MARGIN_SCATTER = {TOP: 30, RIGHT: 40, BOTTOM: 30, LEFT: 75},
  WIDTH_SCATTER = document.getElementById("scatterplot").clientWidth - MARGIN_SCATTER.LEFT - MARGIN_SCATTER.RIGHT 
  HEIGHT_SCATTER = document.getElementById("scatterplot").clientHeight - MARGIN_SCATTER.TOP - MARGIN_SCATTER.BOTTOM;

const svg_scatter = d3.select("#scatterplot").append("svg")
  .attr("width", WIDTH_SCATTER + MARGIN_SCATTER.LEFT + MARGIN_SCATTER.RIGHT)
  .attr("height", HEIGHT_SCATTER + MARGIN_SCATTER.TOP + MARGIN_SCATTER.BOTTOM)
  .append("g")
  .attr("transform", "translate(" + MARGIN_SCATTER.LEFT + "," + MARGIN_SCATTER.TOP + ")");

// Show the name of the region
var tooltip_scatter = d3.select("#scatterplot")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("border-radius", "5px")

// When I select or point the point I show the name of the region and I higlight the region in the map and the path in the parallel coordinates
// If some points are selected the analysis of the boxplot is triggered
var mouseover_scatter = function(d) {
  tooltip_scatter.style("opacity", 1)
  if (d3.select(this).style('fill') == "dodgerblue"){
    
    d3.select(this).style("fill", "green").attr("r", 10)

    d3.select('#map').selectAll('path').each(function(v){
      if (d3.select(this).attr('name') == d){
        d3.select(this).style('stroke-width','4px')
        d3.select(this).style('stroke','green')
      }
    })

    d3.select('.foreground').selectAll('path').each(function(v){
      if (d3.select(this).attr('name') == d){
        d3.select(this).style('stroke','green').attr('stroke-width','4px')
      }
    })
  }
}
var mousemove_scatter = function(d) {
  tooltip_scatter.html(d)
    .style("top", (d3.mouse(this)[1]) + "px")
    .style("left", (d3.mouse(this)[0]) + "px") 
    .style('color','black')
}

var mouseleave_scatter = function(d) {
  tooltip_scatter.style("opacity", 0)
  if (d3.select(this).style('fill') == "green"){
    
    d3.select(this).style("fill", "dodgerblue").attr("r", 6)

    d3.select('#map').selectAll('path').each(function(v){
      if (d3.select(this).attr('name') == d){
        d3.select(this).style('stroke-width','2px')
        d3.select(this).style('stroke','black')
      }
    })

    d3.select('.foreground').selectAll('path').each(function(v){
      if (d3.select(this).attr('name') == d){
        d3.select(this).style('stroke','dodgerblue').attr('stroke-width','2px')
      }
    })
  }
}

var click_scatter = function(d){
  if (d3.select(this).style('fill') != 'red'){
    d3.select(this).style('fill','red').attr("r", 10)

    if (!NAME_REGION_BOXPLOT.includes(d)){
      NAME_REGION_BOXPLOT.push(d)
      execute_boxplot()
    }

    d3.select('#map').selectAll('path').each(function(v){
      if (d3.select(this).attr('name') == d){
        d3.select(this).style('stroke-width','5px')
        d3.select(this).style('stroke','red')
      }
    })

    d3.select('.foreground').selectAll('path').each(function(v){
      if (d3.select(this).attr('name') == d){
        d3.select(this).style('stroke','red').attr('stroke-width','4px')
      }
    })
  }
  else{
    d3.select(this).style('fill','dodgerblue').attr("r", 6)

    if (NAME_REGION_BOXPLOT.includes(d)){
      var i = NAME_REGION_BOXPLOT.indexOf(d)
      NAME_REGION_BOXPLOT.splice(i,1)
    }
    
    execute_boxplot()

    d3.select('#map').selectAll('path').each(function(v){
      if (d3.select(this).attr('name') == d){
        d3.select(this).style('stroke-width','2px')
        d3.select(this).style('stroke','black')
      }
    })

    d3.select('.foreground').selectAll('path').each(function(v){
      if (d3.select(this).attr('name') == d){
        d3.select(this).style('stroke','dodgerblue').attr('stroke-width','2px')
      }
    })
  }
}

// Function used to compute the MDS 
function classic(distances, dimensions) {
  dimensions = dimensions || 2;
  // square distances
  var M = numeric.mul(-0.5, numeric.pow(distances, 2));
  // double centre the rows/columns
  function mean(A) { return numeric.div(numeric.add.apply(null, A), A.length); }
  var rowMeans = mean(M),
      colMeans = mean(numeric.transpose(M)),
      totalMean = mean(rowMeans);

  for (var i = 0; i < M.length; ++i) {
      for (var j =0; j < M[0].length; ++j) {
          M[i][j] += totalMean - rowMeans[i] - colMeans[j];
      }
  }
  // take the SVD of the double centred matrix, and return the
  // points from it
  var ret = numeric.svd(M),
      eigenValues = numeric.sqrt(ret.S);
  return ret.U.map(function(row) {
      return numeric.mul(row, eigenValues).splice(0, dimensions);
  });
};

// Function to compute the euclidean distance between two arrays
function euclidean_distance(ar1,ar2){
  var dis = 0
  for(var i = 0; i < ar1.length; i++){
      dis = dis + Math.pow(ar1[i]-ar2[i],2)
  }
  return Math.sqrt(dis)
}

var labels = []


// Compute and plot the result of the MDS using the scatterplot
function compute_MDS(matrix){
  var locationCoordinates = numeric.transpose(classic(matrix));               
  drawScatterPlot(locationCoordinates, labels)
}

// Compute the dissimilarity matrix using all the attributes
function compute_matrix(data){
  labels = []
  var dissM= [];
  size = data.length
  for(var i=0; i< size.length; i++) {
    dissM[i] = [];
    for(var j=0; j< size.length; j++) {
      dissM[i][j] = 0;
    }
  }
  for (var l= 0; l< size; l++){
    labels.push(data[l].key)
  }

  var vector = []
  for (var i =0; i< size; i++){
    vector[i] = []
    for (var index in data[i].value){
      vector[i].push(data[i].value[index])
    }
  }
  for (var i = 0; i <size; i++){
    dissM[i] = []
    for (var j=0; j < size; j++){
      dissM[i][j] = ~~(euclidean_distance(vector[i],vector[j]))
    }
  }
  return dissM
}

// Draw the result of the MDS in the scatterplot
function drawScatterPlot(coordinates, labels){

  var brush = d3.brush()
   .on("brush", highlight_region)
   .on('end',highlight_region_end)
  xPos = coordinates[0]
  yPos = coordinates[1]

  var xDomain = [Math.min.apply(null, xPos),Math.max.apply(null, xPos)]
  var yDomain = [Math.max.apply(null, yPos), Math.min.apply(null, yPos)]
  var pointRadius = 6
  
  var xScale = d3.scaleLinear()
    .domain(xDomain)
    .range([0, WIDTH_SCATTER])

  var yScale = d3.scaleLinear()
    .domain(yDomain)
    .range([HEIGHT_SCATTER, 0])

  var xAxis = d3.axisBottom(xScale)
      .ticks(3)

  var yAxis = d3.axisLeft(yScale)
      .ticks(3)

  svg_scatter.append("g")
    .attr("class", "axis")
    .attr("id", "xaxis")
    .attr("transform", "translate(" + 0 + "," + HEIGHT_SCATTER+ ")")
    .call(xAxis);

  svg_scatter.append("g")
    .attr("class", "axis")
    .attr("id", "yaxis")
    .call(yAxis);


  svg_scatter.append("g")
    .attr("class", "mdsbrush")
    .call(brush);

  d3.select('#scatterplot').selectAll('.domain').style('stroke','white')
  d3.select('#scatterplot').selectAll('.tick').selectAll('text').style('fill','white')
  d3.select('#scatterplot').selectAll('.tick').selectAll('line').style('stroke','white')


  var points = svg_scatter.selectAll("circle")
      .data(labels)
      .enter()
  
  points.append("circle")
      .attr("r", pointRadius)
      .attr("cx", function(d, i) {return xScale(xPos[i]); })
      .attr("cy", function(d, i) { return yScale(yPos[i]); })
      .attr('name', function(d){return d})
      .style('fill','dodgerblue')
      .style('stroke','white')
      .on("mouseover", mouseover_scatter)
      .on("mousemove", mousemove_scatter)
      .on("mouseleave", mouseleave_scatter)
      .on("click", click_scatter)


  function highlight_region() {
    d3.select('#map').selectAll('path').style('stroke-width','2px').style("stroke", "black")
    d3.select('#scatterplot').selectAll('circle').style('fill','dodgerblue').attr("r", 6)
    d3.select('.foreground').selectAll('path').style('display','inline')
    d3.select('.foreground').selectAll('path').style('stroke','dodgerblue').attr('stroke-width','2px')
    NAME_REGION_BOXPLOT = []

    var name_selected = []
    var brush_coords = d3.brushSelection(this)
    points.selectAll("circle").filter(function (){
      var cx = d3.select(this).attr("cx")
      var cy = d3.select(this).attr("cy")
      if (isBrushed(brush_coords, cx, cy)){
        if (!name_selected.includes(d3.select(this).attr('name'))){
          name_selected.push(d3.select(this).attr('name'))
          NAME_REGION_BOXPLOT.push(d3.select(this).attr('name'))
        }
      }
    })
    
    // STATTERPLOT
    d3.select('#scatterplot').selectAll('circle').each(function(v){
      if(name_selected.includes(d3.select(this).attr('name'))){
        d3.select(this).style('opacity','1')
      }
      else{
        d3.select(this).style('opacity','0.2')
      }
    })
    d3.select('.selection').attr('fill-opacity',0)
  }

  function highlight_region_end(){
    
    var brush_coords = d3.brushSelection(this)
    var name_selected = []
    if (brush_coords == null){

      d3.select('#map').selectAll('path')
        .style('stroke-width','2px')
        .style('opacity','1')
        
      d3.select('#scatterplot').selectAll('circle').style('opacity','1')
      
      d3.select('.foreground').selectAll('path').style('display','inline')

      NAME_REGION_BOXPLOT = []
      
      execute_boxplot()
    }
    else {
      execute_boxplot()
      points.selectAll("circle").filter(function (){
        var cx = d3.select(this).attr("cx")
        var cy = d3.select(this).attr("cy")
        if (isBrushed(brush_coords, cx, cy)){
          if (!name_selected.includes(d3.select(this).attr('name'))){
            name_selected.push(d3.select(this).attr('name'))
          }
        }
      })
      //MAP
      d3.select('#map').selectAll('path').each(function(v){
        if(!name_selected.includes(d3.select(this).attr('name'))){
          d3.select(this).style('stroke-width','0.09px')
          d3.select(this).style('opacity','0.2')
        }
        else{
          d3.select(this).style('stroke-width','2px')
          d3.select(this).style('opacity','1')
        }
      })
      //PARALLE COORDINATES
      d3.select('.foreground').selectAll('path').each(function(v){
        if(!name_selected.includes(d3.select(this).attr('name'))){
          d3.select(this).style('display','none')
        }
        else{
          d3.select(this).style('display','inline')
        }
      })
    }
  }
}
// Check the points inside the region brushed
function isBrushed(brush_coords, cx, cy) {
  var x0 = brush_coords[0][0]
  var x1 = brush_coords[1][0]
  var y0 = brush_coords[0][1]
  var y1 = brush_coords[1][1]
  return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
}
