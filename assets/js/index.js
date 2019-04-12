/* Global constants */
const JSON_URL = {"EDUCATION": "https://raw.githubusercontent.com/ilixandr/iwannaweb.ro/master/projects/rawdata/for_user_education.json", "COUNTIES": "https://raw.githubusercontent.com/ilixandr/iwannaweb.ro/master/projects/rawdata/counties.json"}

const WIDTH = 960
const HEIGHT = 600
const PADDING = 100
const COLORS = {"COLOR1": "#0000FF", "COLOR2": "#00BFFF", "COLOR3": "#00FF80", "COLOR4": "#FFFF00", "COLOR5": "#FF8000", "COLOR6": "#FF0000"}
const ANIMATION_DURATION = 200
const OPACITY_VISIBLE = 0.85
const OPACITY_INVISIBLE = 0
const LEGEND_DIM = {"WIDTH": 6 * 25, "HEIGHT": 25, "CELL_SIZE": 25, "PADDING": 40}

/* Helper functions */
const mapColorToValue = (value) => {
  return value <= 10 ? COLORS.COLOR1 : (value <= 20 ? COLORS.COLOR2 : (value <= 30 ? COLORS.COLOR3 : (value <= 40 ? COLORS.COLOR4 : (value <= 50 ? COLORS.COLOR5 : COLORS.COLOR6))));
  return "#000"
}
const getEducationData = (id, education) => {
  // education[i].fips
  let temp = education.filter((x) => x.fips === id);
  if (temp.length > 0) {
    return temp[0].bachelorsOrHigher;
  }
  return 0;
}
const getTooltipData = (id, education) => {
  let temp = education.filter((x) => x.fips === id);
  if (temp.length > 0) {
    return {"state": temp[0].state, "area_name": temp[0].area_name, "bachelors": temp[0].bachelorsOrHigher}
  }
  return {"state": "Unknown", "area_name": "Unknown", "bachelors": "Unknown"}
}

/* SVG definitions */
const canvas = d3.select("#canvas")
                 .append("svg")
                 .attr("width", WIDTH + PADDING)
                 .attr("height", HEIGHT + PADDING);
const tooltip = d3.select("#tooltip");
const legend = d3.select("#legend")
                 .append("svg")
                 .attr("width", LEGEND_DIM.WIDTH + LEGEND_DIM.PADDING)
                 .attr("height", LEGEND_DIM.HEIGHT + LEGEND_DIM.PADDING);
var path = d3.geoPath();

/* Read JSON data now <> use Promise.all */
Promise.all([d3.json(JSON_URL.COUNTIES), d3.json(JSON_URL.EDUCATION)]).then((content) => {
    /* content[0] & content[1] hold json files' content */
    canvas.append("g")
          .selectAll("path")
          .data(topojson.feature(content[0], content[0]["objects"]["counties"]).features)
          .enter()
          .append("path")
          .attr("class", "county")
          .attr("data-fips", (d) => d.id)
          .attr("data-education", (d) => getEducationData(d.id, content[1]))
          .attr("fill", (d) => mapColorToValue(getEducationData(d.id, content[1])))
          .attr("d", path)
          .on("mouseover", (d) => {
      tooltip.transition()
             .duration(ANIMATION_DURATION)
             .style("opacity", OPACITY_VISIBLE);
      tooltip.html(() => {
        let info = getTooltipData(d.id, content[1]);
        return "State: " + info.state + "<br/>County: " + info.area_name + "<br/><hr>" + "Bachelor's or higher: " + info.bachelors + "&percnt;";
      })
             .attr("data-education", getEducationData(d.id, content[1]))
             .style("left", (d3.event.pageX + 10) + "px")
             .style("top", (d3.event.pageY - 25) + "px");
    })
          .on("mouseout", () => {
      tooltip.transition()
             .duration(ANIMATION_DURATION)
             .style("opacity", OPACITY_INVISIBLE);
    });
    canvas.append("path")
          .attr("class", "county-borders")
          .attr("d", path(topojson.mesh(content[0], content[0].objects.counties, function(a, b) { return a !== b; })));  
  
}).catch(function(error) {
    /* handle errors here */
    document.getElementById("error").innerHTML = error;
});

legend.selectAll("rect")
      .data(["#0000FF", "#00BFFF", "#00FF80", "#FFFF00", "#FF8000", "#FF0000"])
      .enter()
      .append("rect")
      .attr("width", LEGEND_DIM.CELL_SIZE)
      .attr("height", LEGEND_DIM.CELL_SIZE)
      .attr("x", (d, i) => LEGEND_DIM.PADDING / 2 + i * LEGEND_DIM.CELL_SIZE)
      .attr("y", LEGEND_DIM.PADDING / 2)
      .attr("fill", (d) => d);
legendXScale = d3.scaleLinear()
                   .domain([0, 60])
                   .range([0, LEGEND_DIM.WIDTH]);
  legendXAxis = d3.axisBottom(legendXScale).ticks(7);
  legend.append("g")
        .attr("transform", "translate(" + LEGEND_DIM.PADDING / 2 + ", " + (LEGEND_DIM.CELL_SIZE + LEGEND_DIM.PADDING / 2) + ")").call(legendXAxis);