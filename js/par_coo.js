var MARGIN_PAR = {TOP: 30, RIGHT: 40, BOTTOM: 10, LEFT: 60},
    WIDTH_PAR = document.getElementById("par-coo").clientWidth - MARGIN_PAR.LEFT - MARGIN_PAR.RIGHT 
    HEIGHT_PAR = document.getElementById("par-coo").clientHeight - MARGIN_PAR.TOP - MARGIN_PAR.BOTTOM;

const svg_par_coo = d3.select("#par-coo").append("svg")
  .attr("width", WIDTH_PAR + MARGIN_PAR.LEFT + MARGIN_PAR.RIGHT)
  .attr("height", HEIGHT_PAR + MARGIN_PAR.TOP + MARGIN_PAR.BOTTOM)
  .append("g")
  .attr("transform", `translate(${MARGIN_PAR.LEFT}, ${MARGIN_PAR.TOP})`)

// Variable use to store all the parallel coordinates
var y = {}

// Show the name of the region when the path is selected
var tooltip_par = d3.select("#par-coo")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("border-radius", "5px")
  
// When the path is selected of pointed I show the name and also all the info in a different tooltip inside the div os the map
// I also higlight the corrisponding region in the map and the point in the scatterplot
// When I click I add the region and I trigger the computation of the analysis for the boxplot
var mouseover_par = function(d) {
  tooltip_par.style("opacity", 1)
  tooltip_map_info.style('opacity',1)

  if (d3.select(this).style('stroke') == "dodgerblue"){
    d3.select(this).style("stroke", "green").attr('stroke-width','4px')

    d3.select('#map').selectAll('path').each(function(v){
      if (d3.select(this).attr('name') == d.key){
        d3.select(this).style('stroke-width','4px')
        d3.select(this).style('stroke','green')
      }
    })

    d3.select('#scatterplot').selectAll('circle').each(function(v){
      if (d3.select(this).attr('name') == d.key){
        d3.select(this).style('fill','green').attr("r", 10)
      }
    })
  }
}

var mousemove_par = function(d) {
  tooltip_par.html(d.key)
    .style("left", (d3.mouse(this)[0]) + "px")
    .style("top", (d3.mouse(this)[1]) + "px")
    .style('color','black')

  tooltip_map_info.html('Region : ' + d.key 
  + '<br>' + 'Total cases: ' + d.value.total_cases.toLocaleString() 
  + '<br>' + 'Hospitalized with symptoms: ' + d.value.hospitalized_with_symptoms.toLocaleString()
  + '<br>' + 'Intensive care: ' + d.value.intensive_care.toLocaleString()
  + '<br>' + 'Total hospitalized: ' + d.value.total_hospitalized.toLocaleString()
  + '<br>' + 'Home isolation: ' + d.value.home_isolation.toLocaleString()
  + '<br>' + 'Total positives: ' + d.value.total_positives.toLocaleString()
  + '<br>' + 'Discharged healed: ' + d.value.discharged_healed.toLocaleString()
  + '<br>' + 'Deceased: ' + d.value.deceased.toLocaleString() 
  + '<br>' + 'Swabs: ' + d.value.swabs.toLocaleString())
  .style('color','black')
  }

var mouseleave_par = function(d) {
  tooltip_par.style("opacity", 0)
  tooltip_map_info.style('opacity',0)

  if (d3.select(this).style('stroke') == 'green'){

    d3.select(this).style("stroke", "dodgerblue").attr('stroke-width','2px')

    d3.select('#map').selectAll('path').each(function(v){
      if (d3.select(this).attr('name') == d.key){
        d3.select(this).style('stroke-width','2px')
        d3.select(this).style('stroke','black')
      }
    })

    d3.select('#scatterplot').selectAll('circle').each(function(v){
      if (d3.select(this).attr('name') == d.key){
        d3.select(this).style('fill','dodgerblue').attr("r", 6)
      }
    })
  }
}


var click_par = function(d){
  if (d3.select(this).style('stroke') != 'red'){
    d3.select(this).style('stroke','red').attr('stroke-width','4px')

    if (!NAME_REGION_BOXPLOT.includes(d.key)){
      NAME_REGION_BOXPLOT.push(d.key)
    }

    execute_boxplot()

    d3.select('#map').selectAll('path').each(function(v){
      if (d3.select(this).attr('name') == d.key){
        d3.select(this).style('stroke-width','5px')
        d3.select(this).style('stroke','red')
      }
    })

    d3.select('#scatterplot').selectAll('circle').each(function(v){
      if (d3.select(this).attr('name') == d.key){
        d3.select(this).style('fill','red').attr("r", 10)
      }
    })
  }
  else{
    d3.select(this).style('stroke','dodgerblue').attr('stroke-width','2px')

    if (NAME_REGION_BOXPLOT.includes(d.key)){
      var i = NAME_REGION_BOXPLOT.indexOf(d.key)
      NAME_REGION_BOXPLOT.splice(i,1)
    }
    
    execute_boxplot()

    d3.select('#map').selectAll('path').each(function(v){
      if (d3.select(this).attr('name') == d.key){
        d3.select(this).style('stroke-width','2px')
        d3.select(this).style('stroke','black')
      }
    })

    d3.select('#scatterplot').selectAll('circle').each(function(v){
      if (d3.select(this).attr('name') == d.key){
        d3.select(this).style('fill','dodgerblue').attr("r", 6)
      }
    })
  }
}

// I can brush each coordinates to highlight the corrsiponding region, not only in the parrallel corrdinates graph but also
// in the map and in the scatterplot
function brush() {  
  d3.select('.foreground').selectAll('path').style('stroke','dodgerblue').attr("stroke-width", '2px')
  d3.select('#scatterplot').selectAll('circle').style('fill','dodgerblue').attr("r", 6)
  d3.select('#map').selectAll('path').style('stroke-width','2px')
  d3.select('#map').selectAll('path').style('stroke','black')
  var path_selected = []
  NAME_REGION_BOXPLOT = []

  svg_par_coo.selectAll(".brush")
    .filter(function(d) {
    y[d].brushSelectionValue = d3.brushSelection(this);
    return d3.brushSelection(this);
  })
    .each(function(d) {
      path_selected.push({
        domain: d,
        length: d3.brushSelection(this).map(y[d].invert)
      });
    });
  svg_par_coo.selectAll(".selection").style("stroke","red")
  var brushed = []
  foreground.style("display", function(d) {
    let highlighted = path_selected.every(function(s) {
      result = s.length[1] <= d.value[s.domain] && d.value[s.domain] <= s.length[0];
      return result;
    });
    if (highlighted){
      brushed.push(d)
      NAME_REGION_BOXPLOT.push(d.key)
    }
    return (highlighted) ? null : "none";
  });
return brushed
}

function brush_end(){
  var region_brushed= brush();
  if (NAME_REGION_BOXPLOT.length == 20){NAME_REGION_BOXPLOT = []}
  
  execute_boxplot()
  var name_regions = []
  region_brushed.forEach(function(d){name_regions.push(d.key)})

  //MAP
  var name_region_selected = d3.select('#map').selectAll('path').filter(function(d){
    return name_regions.includes( d3.select(this).attr('name') );
  })
  var name_region_unselected = d3.select('#map').selectAll('path').filter(function(d){
    return !name_regions.includes( d3.select(this).attr('name') );
  })
  name_region_selected.style('stroke-width','2px')
  name_region_selected.style('opacity','1')
  name_region_unselected.style('stroke-width','0.09px')
  name_region_unselected.style('opacity','0.2')

  //SCATTERPLOT
  var name_point_selected = d3.select('#scatterplot').selectAll('circle').filter(function(d){
    return name_regions.includes( d3.select(this).attr('name') );
  })
  var name_point_unselected = d3.select('#scatterplot').selectAll('circle').filter(function(d){
    return !name_regions.includes( d3.select(this).attr('name') );
  })
  name_point_selected.style('stroke-width','1px')
  name_point_selected.style('opacity','1')
  //name_point_unselected.style('stroke-width','0px')
  name_point_unselected.style('opacity','0.1')
}

// When the time slider change I update the graph
function update_par_coo(data){
  for (i in dimensions) {
    name = dimensions[i]
    y[name] = d3.scaleLinear()
      .domain(d3.extent(data, function(d) { return +d.value[''+name]; }) )
      .range([HEIGHT_PAR, 0])
  }
 
  x = d3.scalePoint()
    .range([0, WIDTH_PAR])
    .domain(dimensions);
  
  function path(d) {
    return d3.line()(dimensions.map(function(p) { 
      return [x(p), y[p](d.value[p])]; }));
    }
  
  svg_par_coo.selectAll(".foreground").remove() 
  svg_par_coo.selectAll(".background").remove() 

  background = svg_par_coo.append("g")
    .attr("class", "background")
    .selectAll("path")
    .data(data)
    .enter()
    .append("path")
    .attr('name', function(d){return d.key})
    .attr("d", path);
     
  foreground = svg_par_coo.append("g")
    .attr("class", "foreground")
    .selectAll("path")
    .data(data)
    .enter().append("path")
    .on("mouseover", mouseover_par)
    .on("mousemove", mousemove_par)
    .on("mouseleave", mouseleave_par)
    .on('click',click_par)
    .attr("d", path)
    .attr('name', function(d){return d.key})
    .attr('stroke-width','2px')
    .style('stroke','dodgerblue');

    
  svg_par_coo.selectAll(".x-axis").remove()
 
  svg_par_coo.selectAll("axis")
    .data(dimensions).enter()
    .append("g")
    .attr('class','x-axis')
    .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
    //.style('stroke','white')
    .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
    .append("text")
      .style("text-anchor", "middle")
      .attr("x", 5.5)
      .attr("y", -10)
      .text(function(d) { return d; })
      .style("fill", "white")
      
  d3.select('#par-coo').selectAll('.domain').style('stroke','white')
  d3.select('#par-coo').selectAll('.tick').selectAll('text').style('fill','white')
  d3.select('#par-coo').selectAll('.tick').selectAll('line').style('stroke','white')
    
  svg_par_coo.selectAll('.x-axis').append("g")
    .attr("class", "brush")
    .each(function(d) {
      d3.select(this).call(y[d].brush = d3.brushY()
        .extent([[-10,0], [10,HEIGHT_PAR]])
        .on("brush", brush)
        .on("end", brush_end));
      })
    .selectAll("rect")
    .attr("x", -8)
    .attr("width", 16);
  
}






  