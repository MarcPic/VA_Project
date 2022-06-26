var formattedData
var start_time = '2020-02-24'
var end_time = '2022-06-26'
var current_start_time =  new Date('2020-02-24')
var current_end_time = new Date('2020-02-24')

var years 
var dataset_covid
var dataset_mappa
var dataset_covid_filter
var NAME_REGION_BOXPLOT = []



// This function is used to select the data corresponding to the given interval time
function data_interval_time(data, start, end, years){
  index_start = years.indexOf(start)
  index_end = years.indexOf(end)
  subset_years = years.slice(index_start, index_end+1)
  interval_data = data.filter(function(d){return subset_years.includes(d.data)})
  interval_data = d3.nest()
    .key(function(d) {return d.denominazione_regione;})
    .rollup(function(v){return {
      hospitalized_with_symptoms: d3.sum(v, function(d){return d.hospitalized_with_symptoms}),
      intensive_care: d3.sum(v, function(d){return d.intensive_care}),
      total_hospitalized: d3.sum(v, function(d){return d.total_hospitalized}),
      home_isolation: d3.sum(v, function(d){return d.home_isolation}),
      total_positives: d3.sum(v, function(d){return d.total_positives}),
      discharged_healed: d3.sum(v, function(d){return d.discharged_healed}),
      deceased: d3.sum(v, function(d){return d.deceased}),
      total_cases: d3.sum(v, function(d){return d.total_cases}),
      swabs: d3.sum(v, function(d){return d.swabs}),
    }
  })
  .entries(interval_data)
  return interval_data
}
// Function to compute min, q1, median, q3, max and mean of the data in the selected interval of time and about the selected region in the variable NAME REGION BOXPLOT
// When no region is selected than I consider all the regions togheter
function compute_boxplot(data, start, end, years){
  index_start = years.indexOf(start)
  index_end = years.indexOf(end)
  subset_years = years.slice(index_start, index_end+1)
  interval_data = data.filter(function(d){return subset_years.includes(d.data)})
  if (NAME_REGION_BOXPLOT.length != 0){
    interval_data = interval_data.filter(function(d){return (NAME_REGION_BOXPLOT.includes(d.denominazione_regione))})
  }
  data_boxplot = d3.nest()
    .rollup(function(v){
      //swabs
      q1_swabs = d3.quantile(v.map(function(g) { return g.swabs;}).sort(d3.ascending),.25)
      median_swabs = d3.quantile(v.map(function(g) { return g.swabs;}).sort(d3.ascending),.5)
      q3_swabs = d3.quantile(v.map(function(g) { return g.swabs;}).sort(d3.ascending),.75)
      min_swabs = d3.min(v.map(function(g){return g.swabs}))
      max_swabs = d3.max(v.map(function(g){return g.swabs}))
      mean_swabs = Math.round(d3.sum(v, function(d){return d.swabs}) / v.length)

      //deceased
      q1_deceased = d3.quantile(v.map(function(g) { return g.deceased;}).sort(d3.ascending),.25)
      median_deceased = d3.quantile(v.map(function(g) { return g.deceased;}).sort(d3.ascending),.5)
      q3_deceased = d3.quantile(v.map(function(g) { return g.deceased;}).sort(d3.ascending),.75)
      min_deceased = d3.min(v.map(function(g){return g.deceased}))
      max_deceased = d3.max(v.map(function(g){return g.deceased}))
      mean_deceased = Math.round(d3.sum(v, function(d){return d.deceased}) / v.length)

      // TOTALE CASI  
      q1_total_cases = d3.quantile(v.map(function(g) { return g.total_cases;}).sort(d3.ascending),.25)
      median_total_cases = d3.quantile(v.map(function(g) { return g.total_cases;}).sort(d3.ascending),.5)
      q3_total_cases = d3.quantile(v.map(function(g) { return g.total_cases;}).sort(d3.ascending),.75)
      min_total_cases = d3.min(v.map(function(g){return g.total_cases}))
      max_total_cases = d3.max(v.map(function(g){return g.total_cases}))
      mean_total_cases = Math.round(d3.sum(v, function(d){return d.total_cases}) / v.length)

      return({q1_swabs: q1_swabs, median_swabs: median_swabs, q3_swabs: q3_swabs, min_swabs: min_swabs, max_swabs: max_swabs, mean_swabs: mean_swabs,
        q1_deceased: q1_deceased, median_deceased: median_deceased, q3_deceased: q3_deceased, min_deceased: min_deceased, max_deceased: max_deceased, mean_deceased: mean_deceased,
        q1_total_cases: q1_total_cases, median_total_cases: median_total_cases, q3_total_cases: q3_total_cases, min_total_cases:min_total_cases, max_total_cases:max_total_cases, mean_total_cases: mean_total_cases

      })
    })
  .entries(interval_data)
  return data_boxplot
}

// Function to trigger the execution of the analysis by the boxplot each time a region is selected from the graphs
function execute_boxplot(){
  new_data_interval_boxplot = compute_boxplot(dataset_covid, date_to_string(current_start_time), date_to_string(current_end_time), years)
  update_boxplot(new_data_interval_boxplot)
}

// Function thatgiven a date return a string 
function formatDate(date) {
  var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];
  var monthIndex = date.getMonth();
  var year = date.getFullYear();
  var day = date.getDate()
  return day + ' ' + monthNames[monthIndex] + ' ' + year;
}
// Function to convert a date in input to string in output
function date_to_string(date){
  var year = date.getFullYear()
  var month = String(Number(date.getMonth())+1)
  if (month.length == 1){month = '0'+month}
  var day = String(date.getDate())
  if (day.length == 1){day = '0'+day}
  return year+'-'+month+'-'+day
}
// I load the data about the map of italy and about the covid
d3.queue()
  .defer(d3.json, 'data/region.json')
  .defer(d3.csv, "data/final_dataset.csv")
  .awaitAll(ready);

// When the datasets are loaded I execute this function
function ready(error, data_queue) {
  dataset_mappa
  var map_data = data_queue[0]
  var covid_data = data_queue[1]

  // I convert all the values in integer
  dimensions = d3.keys(covid_data[0]).filter(function(d){return (d != '' && d !='data' && d != 'denominazione_regione')})
	covid_data.forEach(function(d){
    d.hospitalized_with_symptoms = Number(d.hospitalized_with_symptoms)
    d.intensive_care = Number(d.intensive_care)
    d.total_hospitalized = Number(d.total_hospitalized)
    d.home_isolation = Number(d.home_isolation)
    d.total_positives = Number(d.total_positives)
    d.discharged_healed = Number(d.discharged_healed)
    d.deceased = Number(d.deceased)
    d.total_cases = Number(d.total_cases)
    d.swabs = Number(d.swabs)
	})
  
  formattedData = d3.nest()
    .key(function(d) {return d.data;})
    .map(covid_data)
  years = formattedData.keys()

  data_interval = data_interval_time(covid_data, '2020-02-24', '2020-02-24', years)
  data_interval_boxplot = compute_boxplot(covid_data, '2020-02-24', '2020-02-24', years)
  
  // I match the name of the region in the map dataset with the name of the regions in the covid dataset since those three names are differents.
  map_data.features[1].properties.reg_name = "Valle d'Aosta"
  map_data.features[3].properties.reg_name = "Trentino-Alto Adige"
  map_data.features[5].properties.reg_name = "Friuli Venezia Giulia"
  
  dataset_mappa = map_data
  dataset_covid = covid_data

  // I update all the graphs 
  update(map_data, data_interval)
  update_par_coo(data_interval)
  update_boxplot(data_interval_boxplot)
  var m = compute_matrix(data_interval)
  compute_MDS(m)
}

// When the time slider change I select the right portion odìf the dataset and I update the visual representation
$("#date-slider").slider({
	min: new Date('2020-02-24').getTime(),
  max: new Date('2022-06-26').getTime(),
	step: 1,
  range: true,
  
  slide: function(event, ui) {
    current_start_time = new Date(ui.values[0])
    current_end_time = new Date(ui.values[1])
    $( "#year" ).text( formatDate(new Date(ui.values[0])) + " - " + formatDate(new Date(ui.values[1])) );
    new_data_interval = data_interval_time(dataset_covid, date_to_string(current_start_time), date_to_string(current_end_time), years)
    new_data_interval_boxplot = compute_boxplot(dataset_covid, date_to_string(current_start_time), date_to_string(current_end_time), years)
    NAME_REGION_BOXPLOT = []
    d3.select('#scatterplot').selectAll('circle').style('fill','dodgerblue').attr("r", 6)
    update(dataset_mappa, new_data_interval)
    update_par_coo(new_data_interval)
    update_boxplot(new_data_interval_boxplot)
  }
})

// When I push the botton I perform the computation of the MDS regarding the interval of time
function execute(){
  d3.select("#scatterplot").selectAll(".axis").remove()
  d3.select("#scatterplot").selectAll("circle").remove()
  d = data_interval_time(dataset_covid, date_to_string(current_start_time), date_to_string(current_end_time), years)
  var r = compute_matrix(d)
  compute_MDS(r)
}

// When the size of the window changes than all the visualization are adapted
function resize(){
  WIDTH_MAP = document.getElementById("map").clientWidth - MARGIN_MAP.LEFT - MARGIN_MAP.RIGHT 
  HEIGHT_MAP = document.getElementById("map").clientHeight - MARGIN_MAP.TOP - MARGIN_MAP.BOTTOM

  WIDTH_PAR = document.getElementById("par-coo").clientWidth - MARGIN_PAR.LEFT - MARGIN_PAR.RIGHT 
  HEIGHT_PAR = document.getElementById("par-coo").clientHeight - MARGIN_PAR.TOP - MARGIN_PAR.BOTTOM

  WIDTH_SCATTER = document.getElementById("scatterplot").clientWidth - MARGIN_SCATTER.LEFT - MARGIN_SCATTER.RIGHT 
  HEIGHT_SCATTER = document.getElementById("scatterplot").clientHeight - MARGIN_SCATTER.TOP - MARGIN_SCATTER.BOTTOM

  WIDTH_BOX = document.getElementById("boxplot-div").clientWidth - MARGIN_BOX.LEFT - MARGIN_BOX.RIGHT 
  HEIGHT_BOX = document.getElementById("boxplot-div").clientHeight - MARGIN_BOX.TOP - MARGIN_BOX.BOTTOM

    
d3.select('#map-div').selectAll('svg')
  .attr("width", WIDTH_MAP + MARGIN_MAP.LEFT + MARGIN_MAP.RIGHT)
  .attr("height", (HEIGHT_MAP + MARGIN_MAP.TOP + MARGIN_MAP.BOTTOM ))

d3.select('#par-coo').selectAll('svg')
  .attr("width", WIDTH_PAR + MARGIN_PAR.LEFT + MARGIN_PAR.RIGHT)
  .attr("height", HEIGHT_PAR + MARGIN_PAR.TOP + MARGIN_PAR.BOTTOM)

d3.select('#scatterplot').selectAll('svg')
  .attr("width", WIDTH_SCATTER + MARGIN_SCATTER.LEFT + MARGIN_SCATTER.RIGHT)
  .attr("height", HEIGHT_SCATTER + MARGIN_SCATTER.TOP + MARGIN_SCATTER.BOTTOM)

d3.select('#boxplot-div').selectAll('svg')
  .attr("width", (WIDTH_BOX + MARGIN_BOX.LEFT + MARGIN_BOX.RIGHT)/3)
  .attr("height", HEIGHT_BOX + MARGIN_BOX.TOP + MARGIN_BOX.BOTTOM)

update(dataset_mappa, data_interval_time(dataset_covid, date_to_string(current_start_time), date_to_string(current_end_time), years))
update_par_coo(data_interval_time(dataset_covid, date_to_string(current_start_time), date_to_string(current_end_time), years))
update_boxplot(compute_boxplot(dataset_covid, date_to_string(current_start_time), date_to_string(current_end_time), years))
}