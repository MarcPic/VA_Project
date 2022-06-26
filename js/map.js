var MARGIN_MAP = {TOP: 0, RIGHT: 15, BOTTOM: 10, LEFT: 0},
    WIDTH_MAP = document.getElementById("map").clientWidth - MARGIN_MAP.LEFT - MARGIN_MAP.RIGHT 
    HEIGHT_MAP = document.getElementById("map").clientHeight - MARGIN_MAP.TOP - MARGIN_MAP.BOTTOM;
   
var path = d3.geoPath();
var dict = {}
var sum_total_cases = 0

const g_legend = d3.select("#legend").append("svg")
  .attr("width", WIDTH_MAP + MARGIN_MAP.LEFT + MARGIN_MAP.RIGHT)
  .attr("height", (HEIGHT_MAP + MARGIN_MAP.TOP + MARGIN_MAP.BOTTOM ))
  .append("g")
  .attr("transform", `translate(${MARGIN_MAP.LEFT}, ${MARGIN_MAP.TOP})`)

const svg_map = d3.select("#map").append("svg")
  .attr("width", WIDTH_MAP + MARGIN_MAP.LEFT + MARGIN_MAP.RIGHT)
  .attr("height", (HEIGHT_MAP + MARGIN_MAP.TOP + MARGIN_MAP.BOTTOM))
  .append("g")
  .attr("transform", `translate(${MARGIN_MAP.LEFT}, ${MARGIN_MAP.TOP})`)


// Show the info of regions
var tooltip_map = d3.select("#map")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("border-radius", "5px")
  .style("padding", "5px")

var tooltip_map_info = d3.select("#map-div")
  .append("div")
  .style("opacity", 0)
  .attr('id','map-div-info')
  .attr("class", "tooltip")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "1px")
  .style("border-radius", "5px")
  .style("padding", "5px")
  
// When I move the mouse on a region I show the name of the region 
// and I highlight the element in the scatterplot and parallel coordinate
// When I leave the mouse I restore everithing as before
// When I click a region I higlight the element in red and I trigger the 
// computation in the boxplot only for the region selected

var mouseover_map = function(d) {
  tooltip_map.style("opacity", 1)

  if (d3.select(this).style('stroke-width') == '2px'){
    d3.select(this).style("stroke-width", "4px")
    d3.select(this).style("stroke", "green")

    d3.select('.foreground').selectAll('path').each(function(v){
      if (d3.select(this).attr('name') == d.properties.reg_name){
        d3.select(this).style('stroke','green').attr('stroke-width','4px')
      }
    })

    d3.select('#scatterplot').selectAll('circle').each(function(v){
      if (d3.select(this).attr('name') == d.properties.reg_name){
        d3.select(this).style('fill','green').attr("r", 10)
      }
    })
  }
 
}
  
var mousemove_map = function(d) {
  tooltip_map.html('Region: ' + d.properties.reg_name + '<br>' + 'Total cases: ' +dict[d.properties.reg_name].toLocaleString())
    .style("left", (d3.mouse(this)[0]) + 10 + "px")
    .style("top", (d3.mouse(this)[1]) + "px") 
    .style('color','black')

  }

var mouseleave_map = function(d) {
  tooltip_map.style("opacity", 0)

  if (d3.select(this).style('stroke-width') == '4px'){
    d3.select(this).style("stroke-width", "2px")
    d3.select(this).style("stroke", "black")
    
    d3.select('.foreground').selectAll('path').each(function(v){
      if (d3.select(this).attr('name') == d.properties.reg_name){
        d3.select(this).style('stroke','dodgerblue').attr('stroke-width','2px')
      }
    })

    d3.select('#scatterplot').selectAll('circle').each(function(v){
      if (d3.select(this).attr('name') == d.properties.reg_name){
        d3.select(this).style('fill','dodgerblue').attr("r", 6)
      }
    })
  }
}

var click_map = function(d){
  if (d3.select(this).style('stroke-width') != '5px' ){
    d3.select(this).style("stroke-width",'5px')
    d3.select(this).style("stroke",'red')

    if (!NAME_REGION_BOXPLOT.includes(d.properties.reg_name)){
      NAME_REGION_BOXPLOT.push(d.properties.reg_name)
    }
    execute_boxplot()

    d3.select('.foreground').selectAll('path').each(function(v){
      if (d3.select(this).attr('name') == d.properties.reg_name){
        d3.select(this).style('stroke','red').attr('stroke-width','4px')
      }
    })

    d3.select('#scatterplot').selectAll('circle').each(function(v){
      if (d3.select(this).attr('name') == d.properties.reg_name){
        d3.select(this).style('fill','red').attr("r", 10)
      }
    })
  }
  else{
    d3.select(this).style("stroke-width",'2px')
    d3.select(this).style("stroke",'black')

    if (NAME_REGION_BOXPLOT.includes(d.properties.reg_name)){
      var i = NAME_REGION_BOXPLOT.indexOf(d.properties.reg_name)
      NAME_REGION_BOXPLOT.splice(i,1)
    }
    execute_boxplot()

    d3.select('.foreground').selectAll('path').each(function(v){
      if (d3.select(this).attr('name') == d.properties.reg_name){
        d3.select(this).style('stroke','dodgerblue').attr('stroke-width','2px')
      }
    })

    d3.select('#scatterplot').selectAll('circle').each(function(v){
      if (d3.select(this).attr('name') == d.properties.reg_name){
        d3.select(this).style('fill','dodgerblue').attr("r", 6)
      }
    })
  }
}

// Create a dictionaty to have for each region the number of total cases
function create_dictionary(database){
  dict = {}
  sum_total_cases = 0
  database.forEach(function(d){
    dict[d.key] = d.value.total_cases
    sum_total_cases += d.value.total_cases
  })
  return dict
}

// Update the legend when the time slider change
function updateLegend(min,max){
  range_interval = (max - min)/5
  var domain_interval = []
  for (i=0; i<5; i++){
    value_bottom = min + (range_interval*i)
    value_top = value_bottom + range_interval
    var s = (Math.round(value_bottom)).toLocaleString() + ' - ' + (Math.round(value_top)).toLocaleString()
    domain_interval.push(s)
  }

  var color_legend = d3.scaleOrdinal()
    .domain(domain_interval)
    .range(['#fef0d9','#fdcc8a','#fc8d59','#e34a33','#b30000'])

  var size_rect = 20
  
  g_legend.selectAll('rect').remove()
  g_legend.selectAll('text').remove()

  g_legend.append('text')
    .attr('x',10)
    .attr('y',20)
    .text('Total cases')
    .style('fill','white')

  g_legend.selectAll('dots')
    .data(domain_interval)
    .enter()
    .append('rect')
      .attr('x',10)
      .attr('y', function(d,i){ return 30 + i*(size_rect+5)})
      .attr("width", size_rect)
    .attr("height", size_rect)
    .style("fill", function(d){ return color_legend(d)})
    .style('stroke', 'black')
  
  g_legend.selectAll('mylabels')
    .data(domain_interval)
    .enter()
    .append('text')
    .attr("x", 10 + size_rect*1.2)
    .attr("y", function(d,i){ return 35 + i*(size_rect+5) + (size_rect/2)}) 
    .text(function(d){ return d})
      .style("alignment-baseline", "middle")
      .style('fill','white')

  g_legend.append('text')
    .attr('x',10)
    .attr('y',170)
    .text('Total cases in Italy: ' + sum_total_cases.toLocaleString())
    .style('fill','white')
      
}

// Update the map each time the time slider change
function update(map_data, covid_data){

  var projection = d3.geoMercator()
    .scale(WIDTH_MAP * 4)
    .center([12.368775000000001, 42.9451139])
    .translate([WIDTH_MAP / 2, HEIGHT_MAP / 2])

  var dict = create_dictionary(covid_data)
  var values = Object.values(dict)

  var max = Math.max(...values)
  var min = Math.min(...values)
  var color_domain = d3.extent([min,max])

  var colorScale = d3.scaleQuantile()
  .domain(color_domain)
  .range(['#fef0d9','#fdcc8a','#fc8d59','#e34a33','#b30000'])


  d3.select('#map').selectAll('path').remove()

  var region = svg_map
    .selectAll("path")
    .data(map_data.features)

  region.enter()
    .append("path")
    .style("stroke", "black")
    .style('stroke-width','2px')
    .on("mouseover", mouseover_map)
    .on("mousemove", mousemove_map)
    .on("mouseleave", mouseleave_map)
    .on('click',click_map)
    .attr("d", d3.geoPath().projection(projection))
    .attr('name', function(d){return d.properties.reg_name})
    .attr("fill", function (d) {
        d.total = dict[d.properties.reg_name] || 0;
        return colorScale(d.total);
      });
    updateLegend(min, max)
}
