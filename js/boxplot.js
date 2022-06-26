var MARGIN_BOX = {TOP: 20, RIGHT: 0, BOTTOM: 30, LEFT: 90},
    WIDTH_BOX = document.getElementById("boxplot-div").clientWidth - MARGIN_BOX.LEFT - MARGIN_BOX.RIGHT 
    HEIGHT_BOX = document.getElementById("boxplot-div").clientHeight - MARGIN_BOX.TOP - MARGIN_BOX.BOTTOM;

// I define the svg for the three boxplots
const svg_box1 = d3.select("#boxplot-1").append("svg")
  .attr("width", (WIDTH_BOX + MARGIN_BOX.LEFT + MARGIN_BOX.RIGHT)/3)
  .attr("height", HEIGHT_BOX + MARGIN_BOX.TOP + MARGIN_BOX.BOTTOM)
  .append("g")
  .attr("transform", `translate(${MARGIN_BOX.LEFT}, ${MARGIN_BOX.TOP})`)


const svg_box2 = d3.select("#boxplot-2").append("svg")
  .attr("width", (WIDTH_BOX + MARGIN_BOX.LEFT + MARGIN_BOX.RIGHT)/3)
  .attr("height", HEIGHT_BOX + MARGIN_BOX.TOP + MARGIN_BOX.BOTTOM)
  .append("g")
  .attr("transform", `translate(${MARGIN_BOX.LEFT}, ${MARGIN_BOX.TOP})`)

const svg_box3 = d3.select("#boxplot-3").append("svg")
  .attr("width", (WIDTH_BOX + MARGIN_BOX.LEFT + MARGIN_BOX.RIGHT)/3)
  .attr("height", HEIGHT_BOX + MARGIN_BOX.TOP + MARGIN_BOX.BOTTOM)
  .append("g")
  .attr("transform", `translate(${MARGIN_BOX.LEFT}, ${MARGIN_BOX.TOP})`)

// Tooltip to show information of the analysis computed
var tooltip_boxplot = d3.select("#boxplot-div")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("border-radius", "5px")
  .style('padding','5px')
  .style('color','black')
  
var mouseover_boxplot = function(d) {
  tooltip_boxplot.style("opacity", 1)
}

var mouseleave_boxplot = function(d) {
  tooltip_boxplot.style("opacity", 0) 
}
  
// When the slider change or a region is selected the boxplots are updated
function update_boxplot(data){
  svg_box1.selectAll("g").remove()
  svg_box1.selectAll("line").remove()
  svg_box1.selectAll("rect").remove()

  svg_box2.selectAll("g").remove()
  svg_box2.selectAll("line").remove()
  svg_box2.selectAll("rect").remove()

  svg_box3.selectAll("g").remove()
  svg_box3.selectAll("line").remove()
  svg_box3.selectAll("rect").remove()

  var y_swabs = d3.scaleLinear()
    .domain([0, data.max_swabs])
    .range([HEIGHT_BOX,0])

  var y_deceased = d3.scaleLinear()
    .domain([0, data.max_deceased])
    .range([HEIGHT_BOX,0])

  var y_total_cases = d3.scaleLinear()
    .domain([0, data.max_total_cases])
    .range([HEIGHT_BOX,0])

  svg_box1.append("g")
    .call(d3.axisLeft(y_swabs))

  svg_box2.append("g")
    .call(d3.axisLeft(y_deceased))

  svg_box3.append("g")
    .call(d3.axisLeft(y_total_cases))

  array_swabs = [data.min_swabs, data.q1_swabs, data.median_swabs, data.q3_swabs, data.max_swabs, data.mean_swabs]
  array_deceased = [data.min_deceased, data.q1_deceased, data.median_deceased, data.q3_deceased, data.max_deceased, data.mean_deceased]
  array_total_cases = [data.min_total_cases, data.q1_total_cases, data.median_total_cases, data.q3_total_cases, data.max_total_cases, data.mean_total_cases]

  draw_boxplot(svg_box1, y_swabs, array_swabs)
  draw_boxplot(svg_box2, y_deceased, array_deceased)
  draw_boxplot(svg_box3, y_total_cases, array_total_cases)
}
 
// Draw the boxplots with the info in input
function draw_boxplot(svg, y_scale, array_values){
//array values contains in order -> min[0], q1[1], median[2], q3[3], max[4], mean[5]
  
  var center = ((WIDTH_BOX + MARGIN_BOX.LEFT + MARGIN_BOX.RIGHT)/3)/4
  var width = ((WIDTH_BOX + MARGIN_BOX.LEFT + MARGIN_BOX.RIGHT)/3)/4

  if (svg == svg_box1){
    var mousemove_boxplot = function(d) {
      tooltip_boxplot
        .style("left", (d3.mouse(this)[0] +100) + "px")
        .style("top", (d3.mouse(this)[1]) + "px") 
        .html('Max: ' + array_values[4].toLocaleString() 
        + '<br>'  + 'Second quartile: ' + array_values[3].toLocaleString() 
        + '<br>'+ 'Median: ' + array_values[2].toLocaleString()
        + '<br>'+ 'First quartile: ' + array_values[1].toLocaleString() 
        + '<br>'+ 'Min: ' + array_values[0].toLocaleString()
        + '<br>'+ 'Mean: ' + array_values[5].toLocaleString())  
    }
  }
  else if(svg == svg_box2){
    var mousemove_boxplot = function(d) {
      tooltip_boxplot
        .style("left", (d3.mouse(this)[0] +300)  + "px")
        .style("top", (d3.mouse(this)[1]) + "px") 
        .html('Max: ' + array_values[4].toLocaleString() 
        + '<br>'  + 'Second quartile: ' + array_values[3].toLocaleString() 
        + '<br>'+ 'Median: ' + array_values[2].toLocaleString()
        + '<br>'+ 'First quartile: ' + array_values[1].toLocaleString() 
        + '<br>'+ 'Min: ' + array_values[0].toLocaleString()
        + '<br>'+ 'Mean: ' + array_values[5].toLocaleString()) 
    }
  }
  else{
    var mousemove_boxplot = function(d) {
      tooltip_boxplot
        .style("left", (d3.mouse(this)[0] + 300)  + "px")
        .style("top", (d3.mouse(this)[1]) + "px") 
        .html('Max: ' + array_values[4].toLocaleString() 
        + '<br>'  + 'Second quartile: ' + array_values[3].toLocaleString() 
        + '<br>'+ 'Median: ' + array_values[2].toLocaleString()
        + '<br>'+ 'First quartile: ' + array_values[1].toLocaleString() 
        + '<br>'+ 'Min: ' + array_values[0].toLocaleString()
        + '<br>'+ 'Mean: ' + array_values[5].toLocaleString())    
    }
  }

  svg
    .append("line")
    .attr('class','line_tamponi')
    .attr("x1", center)
    .attr("x2", center)
		.attr("y1", y_scale(array_values[0]))
		.attr("y2", y_scale(array_values[4]))
		.attr("stroke", "white")
		.style("width", '40px')

  svg
    .append("rect")
    .attr("x", center - width/2)
    .attr("y", y_scale(array_values[3]) )
    .attr("height", y_scale(array_values[1])-y_scale(array_values[3])) 
    .attr("width", width )
    .attr("stroke", "white")
    .style("fill", "green")
    .on("mouseover", mouseover_boxplot)
    .on("mouseleave", mouseleave_boxplot)
    .on("mousemove", mousemove_boxplot)
    
// show median, min and max horizontal lines
  svg
    .append("line")
    .attr("x1", center-width/2)
    .attr("x2", center+width/2)
    .attr("y1", y_scale(array_values[4]) )
    .attr("y2", y_scale(array_values[4]) )
    .attr("stroke", "white")

  svg
    .append("line")
    .attr("x1", center-width/2)
    .attr("x2", center+width/2)
    .attr("y1", y_scale(array_values[0]) )
    .attr("y2", y_scale(array_values[0]) )
    .attr("stroke", "white")

  svg
    .append("line")
    .attr("x1", center-width/2)
    .attr("x2", center+width/2)
    .attr("y1", y_scale(array_values[2]) )
    .attr("y2", y_scale(array_values[2]) )
    .attr("stroke", "white")

  d3.select('#boxplot-div').selectAll('.domain').style('stroke','white')
  d3.select('#boxplot-div').selectAll('.tick').selectAll('text').style('fill','white')
  d3.select('#boxplot-div').selectAll('.tick').selectAll('line').style('stroke','white')
}














  