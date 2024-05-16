function renderBarChart(country, casesData, deathsData) {
	// Rendering bar chart for deaths
	// Add your bar chart rendering logic here
	// Select the SVG container for the bar chart
	console.log(deathsData);
	const svg = d3.select(`#${country}-bar-chart`);

	// Set the dimensions of the SVG container
	const width = 400;
	const height = 300;

	// Set margins
	const margin = { top: 20, right: 20, bottom: 50, left: 50 };

	// Calculate inner width and height
	const innerWidth = width - margin.left - margin.right;
	const innerHeight = height - margin.top - margin.bottom;

	// Create X scale for years
	const xScale = d3
		.scaleBand()
		.domain(Object.keys(casesData))
		.range([0, innerWidth])
		.padding(0.1);
	console.log(Object.keys(deathsData));

	// Create Y scale for deaths
	const yScale = d3
		.scaleLinear()
		.domain([0, d3.max(Object.values(deathsData))])
		.range([innerHeight, 0]);

	// Create SVG element
	const g = svg
		.append("g")
		.attr("transform", `translate(${margin.left},${margin.top})`);

	// Render bars for deaths
	g.selectAll("rect")
		.data(Object.entries(deathsData))
		.enter()
		.append("rect")
		.attr("x", ([year]) => xScale(year))
		.attr("y", ([, value]) => yScale(value))
		.attr("width", xScale.bandwidth())
		.attr("height", ([, value]) => innerHeight - yScale(value))
		.attr("fill", "red");

	// Add X axis
	g.append("g")
		.attr("transform", `translate(0,${innerHeight})`)
		.call(d3.axisBottom(xScale))
		.selectAll("text")
		.attr("transform", "rotate(-45)")
		.style("text-anchor", "end");

	// Add Y axis
	g.append("g").call(d3.axisLeft(yScale));

	// Add chart title
	svg.append("text")
		.attr("x", width / 2)
		.attr("y", margin.top / 2)
		.attr("text-anchor", "middle")
		.text(`${country} - Total Deaths by Year`);
}
function extractYearFromDateTime(dateTime) {
	if (dateTime) {
		const date = new Date(dateTime);
		return date.getFullYear(); // Extract year from date
	}
	return null;
}
function extractMonthFromDateTime(dateTime) {
	if (dateTime) {
		const date = new Date(dateTime);
		return date.getMonth();
	}
}

// Function to dynamically create line chart containers
function createLineChartContainer(country) {
	// Check if the container already exists
	if (!document.getElementById(`${country}-line-chart`)) {
		const lineChartDiv = document.createElement("div");
		lineChartDiv.id = `${country}-line-chart`;
		document.body.appendChild(lineChartDiv);
	}
}
// Function to dynamically create bar chart containers
function createBarChartContainer(country) {
	// Check if the container already exists
	if (!document.getElementById(`${country}-bar-chart`)) {
		const barChartDiv = document.createElement("div");
		barChartDiv.id = `${country}-bar-chart`;
		document.body.appendChild(barChartDiv);
	}
}
function createPopChartContainer(country) {
	// Check if the container already exists
	if (!document.getElementById(`${country}-population-chart`)) {
		const populationChartDiv = document.createElement("div");
		populationChartDiv.id = `${country}-population-chart`;
		document.body.appendChild(populationChartDiv);
	}
}


/*function updateVisualization(selectedOption) {
	d3.select("#chart").selectAll("*").remove();
	d3.select("#deaths-chart").selectAll("*").remove();
	d3.select("#population-chart").selectAll("*").remove();

	switch (selectedOption) {
		case "cases":
			visualizeCases();
			break;

		default:
			break;
	}
}
function visualizeCases(casesData) {
	const svg = d3
		.select("#chart")
		.append("svg")
		.attr("width", 400)
		.attr("height", 450); //changed height to 600

	// create a bar chart of cumulative total cases by country
	const casesXScale = d3
		.scaleBand()
		.domain(casesData.map((d) => d.country))
		.range([75, 400])
		.padding(0.1);

	const casesYScale = d3
		.scaleLinear()
		.domain([0, d3.max(casesData, (d) => d.totalCases)])
		.range([380, 30]);

	// create bars for cumulative total cases
	svg.selectAll(".case-bar")
		.data(casesData)
		.enter()
		.append("rect")
		.attr("class", "case-bar")
		.attr("x", (d) => casesXScale(d.country))
		.attr("y", (d) => casesYScale(d.totalCases))
		.attr("width", casesXScale.bandwidth())
		.attr("height", (d) => 400 - casesYScale(d.totalCases))
		.attr("fill", "steelblue");

	// Add x-axis for cases
	svg.append("g")
		.attr("transform", "translate(0," + 400 + ")")
		.call(d3.axisBottom(casesXScale))
		.selectAll("text")
		.attr("transform", "rotate(0)")
		.style("text-anchor", "end");

	// add y-axis for cases
	svg.append("g")
		.call(d3.axisLeft(casesYScale))
		.attr("transform", "translate(75,20)");

	// Add title for cases bar chart
	svg.append("text")
		.attr("x", 200)
		.attr("y", 20)
		.attr("text-anchor", "middle")
		.style("font-size", "20px")
		.text("COVID-19 Total Cases by Country");
}*/
// Fetch COVID-19 data from the backend API

fetch("fhir-data")
	.then((response) => response.json())
	.then((data) => {
		// where new erecent code start
		// Extract cumulative total cases and deaths by country
		const casesByCountry = {};
		const deathsByCountry = {};
		const deathsByCountryBar = {};
		const recoveredByCountry = {};
		const populationByCountry = {};
		data.forEach((entry) => {
			const country = entry.subject.display;
			const totalCases =
				entry.valueQuantity.find((val) => val.unit === "cases")
					?.value || 0;
			const totalDeaths =
				entry.valueQuantity.find((val) => val.unit === "deaths")
					?.value || 0;

			const totalRecovered = parseInt(
				entry.valueQuantity.find((val) => val.unit === "recovered")
					?.value || 0
			);
			const totalDeathsBar = parseInt(
				entry.valueQuantity.find((val) => val.unit === "deaths")
					?.value || 0
			);

			const totalPopulation = parseInt(
				entry.valueQuantity.find((val) => val.unit === "people")
					?.value || 0
			);

			// console.log(totalPopulation);
			const year = extractYearFromDateTime(entry.effectiveDateTime);
			const month = extractMonthFromDateTime(entry.effectiveDateTime);
			// console.log(`Country: ${country}, Year: ${year}, Cases: ${totalCases}, Deaths: ${totalDeaths}, Recovered: ${totalRecovered}, Population: ${totalPopulation}`);

			if (year) {
				if (!casesByCountry[country]) {
					casesByCountry[country] = 0;
				}
				if (!deathsByCountry[country]) {
					deathsByCountry[country] = 0;
				}
				if (!deathsByCountryBar[country]) {
					deathsByCountryBar[country] = {};
				}
				if (!recoveredByCountry[country]) {
					recoveredByCountry[country] = {};
				}
				casesByCountry[country] += totalCases;
				deathsByCountry[country] += totalDeaths;
				deathsByCountryBar[country] = deathsByCountryBar[country] || {};
				deathsByCountryBar[country][year] =
					(deathsByCountryBar[country][year] || 0) + totalDeathsBar;

				// recoveredByCountry[country] = recoveredByCountry[country] || {};
				recoveredByCountry[country][year] =
					(recoveredByCountry[country][year] || 0) + totalRecovered;
				createLineChartContainer(country);
				createBarChartContainer(country);
			}
			if (year && month) {
				if (!populationByCountry[country]) {
					populationByCountry[country] = {};
				}
				if (!populationByCountry[country][year]) {
					populationByCountry[country][year] = {};
				}
				if (!populationByCountry[country][year][month]) {
					populationByCountry[country][year][month] = 0;
				}
				populationByCountry[country][year][month] += totalPopulation;
				createPopChartContainer(country);
			}
		});

		console.log(casesByCountry);
		console.log(deathsByCountry);
		console.log(recoveredByCountry);
		console.log(deathsByCountryBar);
		console.log("=====>");
		console.log(populationByCountry);
		// convert casesByCountry objects to arrays of objects
		const casesData = Object.entries(casesByCountry).map(
			([country, totalCases]) => ({ country, totalCases })
		);
		const deathsData = Object.entries(deathsByCountry).map(
			([country, totalDeaths]) => ({ country, totalDeaths })
		);
		const recoveredData = Object.entries(recoveredByCountry).map(
			([country, totalRecovered]) => ({ country, totalRecovered })
		);
		const deathsDataBar = Object.entries(deathsByCountryBar).map(
			([country, totalDeathsBar]) => ({ country, totalDeathsBar })
		);

		// Sort data by total  cses (descending order)
		casesData.sort((a, b) => b.totalCases - a.totalCases);
		deathsData.sort((a, b) => b.totalDeaths - a.totalDeaths);
		recoveredData.sort((a, b) => b.totalRecovered - a.totalRecovered);
		deathsDataBar.sort((a, b) => b.totalDeathsBar - a.totalDeathsBar);
		// populationData.sort((a, b) => b.totalPopulation - a.totalPopulation);
		// Sort population data by country, year, and month

		// end of new added code
		const svg = d3
			.select("#chart")
			.append("svg")
			.attr("width", 400)
			.attr("height", 450); //changed height to 600

		// create a bar chart of cumulative total cases by country
		const casesXScale = d3
			.scaleBand()
			.domain(casesData.map((d) => d.country))
			.range([75, 400])
			.padding(0.1);

		const casesYScale = d3
			.scaleLinear()
			.domain([0, d3.max(casesData, (d) => d.totalCases)])
			.range([380, 30]);

		// create bars for cumulative total cases
		svg.selectAll(".case-bar")
			.data(casesData)
			.enter()
			.append("rect")
			.attr("class", "case-bar")
			.attr("x", (d) => casesXScale(d.country))
			.attr("y", (d) => casesYScale(d.totalCases))
			.attr("width", casesXScale.bandwidth())
			.attr("height", (d) => 400 - casesYScale(d.totalCases))
			.attr("fill", "steelblue");

		// Add x-axis for cases
		svg.append("g")
			.attr("transform", "translate(0," + 400 + ")")
			.call(d3.axisBottom(casesXScale))
			.selectAll("text")
			.attr("transform", "rotate(0)")
			.style("text-anchor", "end");

		// add y-axis for cases
		svg.append("g")
			.call(d3.axisLeft(casesYScale))
			.attr("transform", "translate(75,20)");

		// Add title for cases bar chart
		svg.append("text")
			.attr("x", 200)
			.attr("y", 20)
			.attr("text-anchor", "middle")
			.style("font-size", "20px")
			.text("COVID-19 Total Cases by Country");

		// Create a tooltip div
		/*const tooltip = d3
			.select("body")
			.append("div")
			.attr("class", "tooltip")
			.style("opacity", 0)
			.style("position", "absolute")
			.style("background-color", "white")
			.style("border", "1px solid #ddd")
			.style("border-radius", "5px")
			.style("padding", "10px");*/

		// Add mouseover and mouseout event listeners to bars
		svg.selectAll(".case-bar")
			.on("mouseover", (event, d) => {
				tooltip.transition().duration(200).style("opacity", 0.9);
				tooltip
					.html(
						`<strong>${d.country}</strong><br/>Total Cases: ${d.totalCases}`
					)
					.style("left", event.pageX + 10 + "px")
					.style("top", event.pageY - 28 + "px");
			})
			.on("mouseout", () => {
				tooltip.transition().duration(500).style("opacity", 0);
			});

		// Create a tooltip div
		const tooltip = d3
			.select("body")
			.append("div")
			.attr("class", "tooltip")
			.style("opacity", 0)
			.style("position", "absolute")
			.style("background-color", "white")
			.style("border", "1px solid #ddd")
			.style("border-radius", "5px")
			.style("padding", "10px");
		// create SVG container for deaths bar chart
		/*const deathsSvg = d3
			.select("#deaths-chart")
			.append("svg")
			.attr("width", 600)
			.attr("height", 500);

		// x and y-axis for deaths
		const deathsXScale = d3
			.scaleBand()
			.domain(deathsData.map((d) => d.country))
			.range([75, 600])
			.padding(0.1);

		const deathsYScale = d3
			.scaleLinear()
			.domain([0, d3.max(deathsData, (d) => d.totalDeaths)])
			.range([480, 30]);

		// Create bars for cumulative total deaths below the cases bars
		deathsSvg
			.selectAll(".death-bar")
			.data(deathsData)
			.enter()
			.append("rect")
			.attr("class", "death-bar")
			.attr("x", (d) => deathsXScale(d.country))
			.attr("y", (d) => deathsYScale(d.totalDeaths))
			.attr("width", deathsXScale.bandwidth())
			.attr("height", (d) => 480 - deathsYScale(d.totalDeaths))
			.attr("fill", "red");

		// Add x-axis for deaths
		deathsSvg
			.append("g")
			.attr("transform", "translate(0," + 480 + ")")
			.call(d3.axisBottom(deathsXScale))
			.selectAll("text")
			.attr("transform", "rotate(0)")
			.style("text-anchor", "end");

		// Add y-axis for deaths
		deathsSvg
			.append("g")
			.call(d3.axisLeft(deathsYScale))
			.attr("transform", "translate(75,0)");

		// add title for deaths bar chart
		deathsSvg
			.append("text")
			.attr("x", 200)
			.attr("y", 20)
			.attr("text-anchor", "middle")
			.style("font-size", "20px")
			.text("COVID-19 Total Deaths by Country");

		deathsSvg
			.selectAll(".death-bar")
			.on("mouseover", (event, d) => {
				tooltip.transition().duration(200).style("opacity", 0.9);
				tooltip
					.html(
						`<strong>${d.country}</strong><br/>Total Cases: ${d.totalDeaths}`
					)
					.style("left", event.pageX + 10 + "px")
					.style("top", event.pageY - 28 + "px");
			})
			.on("mouseout", () => {
				tooltip.transition().duration(500).style("opacity", 0);
			});*/

		// render charts for each countr
		/*Object.keys(recoveredByCountry).forEach((country) => {
			const recoveredData = recoveredByCountry[country];
			const years = Object.keys(recoveredData);
			// console.log(deathsDataBarCountry);
			const recoveredValues = Object.values(recoveredData);

			const recoveredSvg = d3
				.select(`#${country}-line-chart`)
				.append("svg")
				.attr("width", 600)
				.attr("height", 650);

			// x and y-axis for deaths
			const recoveredXScale = d3
				.scaleBand()
				.domain(years)
				.range([75, 600])
				.padding(0.1);

			// console.log(years);
			const recoveredYScale = d3
				.scaleLinear()
				.domain([40, d3.max(recoveredValues)])
				.nice()
				.range([600, 30]);

			const line = d3
				.line()
				.x(
					(d, i) =>
						recoveredXScale(years[i]) +
						recoveredXScale.bandwidth() / 2
				)
				.y((d) => recoveredYScale(d))
				.curve(d3.curveLinear);
			recoveredSvg
				.append("path")
				.datum(recoveredValues)
				.attr("fill", "none")
				.attr("stroke", "#F28E2B")
				.attr("stroke-width", 2)
				.attr("d", line);

			// Define the tooltip function for recovered cases
			const recoveredTooltip = d3
				.select(`#${country}-line-chart`)
				.append("div")
				.attr("class", "tooltip")
				.style("opacity", 0)
				.style("position", "absolute")
				.style("background-color", "white")
				.style("border", "1px solid #ddd")
				.style("border-radius", "5px")
				.style("padding", "10px");

			recoveredSvg
				.selectAll("dot")
				.data(recoveredValues)
				.enter()
				.append("circle")
				.attr(
					"cx",
					(d, i) =>
						recoveredXScale(years[i]) +
						recoveredXScale.bandwidth() / 2
				)
				.attr("cy", (d) => recoveredYScale(d))
				.attr("r", 4)
				.attr("fill", "green")
				.on("mouseover", (event, d, i) => {
					console.log(i);
					const year = years[i]; // Retrieve the year using the index
					recoveredTooltip
						.transition()
						.duration(200)
						.style("opacity", 0.9);
					recoveredTooltip
						.html(
							`<strong>${country}</strong><br/><br/>Recovered Cases: ${d}`
						)
						.style("left", event.pageX + "px")
						.style("top", event.pageY - 28 + "px");
				})
				.on("mouseout", function () {
					recoveredTooltip
						.transition()
						.duration(500)
						.style("opacity", 0);
				});

			recoveredSvg
				.append("g")
				.attr("transform", `translate(0,${600})`)
				.call(d3.axisBottom(recoveredXScale))
				.selectAll("text")
				.style("text-anchor", "end")
				.attr("transform", "rotate(0)");

			recoveredSvg
				.append("g")
				.attr("transform", `translate(75)`)
				.call(d3.axisLeft(recoveredYScale));

			recoveredSvg
				.append("text")
				.attr("x", 600 / 2)
				.attr("y", 20)
				.attr("text-anchor", "middle")
				.style("font-size", "16px")
				.text(`Recovered Cases Over Time - ${country}`);
		});*/
		/*Object.keys(deathsByCountryBar).forEach((country) => {
			const deathsDataBar = deathsByCountryBar[country];
			const yearsBar = Object.keys(deathsDataBar);
			console.log(yearsBar);
			const deathsValuesBar = Object.values(deathsDataBar);

			const deathsBarSvg = d3
				.select(`#${country}-bar-chart`)
				.append("svg")
				.attr("width", 600)
				.attr("height", 500);

			const deathsXScale = d3
				.scaleBand()
				.domain(yearsBar)
				.range([75, 600])
				.padding(0.1);
			const deathsYScale = d3
				.scaleLinear()
				.domain([0, d3.max(deathsValuesBar)])
				.range([480, 30]);

			// Create bars for cumulative total deaths per country
			deathsBarSvg
				.selectAll(".deaths-bar")
				.data(deathsValuesBar)
				.enter()
				.append("rect")
				.attr("x", (d, i) => deathsXScale(yearsBar[i]))
				.attr("y", (d) => deathsYScale(d))
				.attr("width", deathsXScale.bandwidth())
				.attr("height", (d) => 480 - deathsYScale(d))
				.attr("fill", "red");

			// Add x-axis for deaths
			deathsBarSvg
				.append("g")
				.attr("transform", "translate(0," + 480 + ")")
				.call(d3.axisBottom(deathsXScale))
				.selectAll("text")
				.attr("transform", "rotate(0)")
				.style("text-anchor", "end");

			// Add y-axis for deaths
			deathsBarSvg
				.append("g")
				.call(d3.axisLeft(deathsYScale))
				.attr("transform", "translate(75,0)");
			// Add title for deaths bar chart
			deathsBarSvg
				.append("text")
				.attr("x", 200)
				.attr("y", 20)
				.attr("text-anchor", "middle")
				.style("font-size", "20px")
				.text(`COVID-19 Total Deaths Over Time - ${country}`);

			// add tooltip for deaths bar chart
			deathsBarSvg
				.selectAll("rect")
				.on("mouseover", (event, d) => {
					tooltip.transition().duration(200).style("opacity", 0.9);
					tooltip
						.html(
							`<strong>${country}</strong><br/>Total Deaths: ${d}`
						)
						.style("left", event.pageX + 10 + "px")
						.style("top", event.pageY - 28 + "px");
				})
				.on("mouseout", () => {
					tooltip.transition().duration(500).style("opacity", 0);
				});
		});*/
		/*Object.keys(populationByCountry).forEach((country) => {
			const populationData = populationByCountry[country];
			const years = Object.keys(populationData);
			const months = [...Array(12).keys()].map((i) => (i + 1).toString());

			// Flatten population data into an array of objects for easy processing
			const flattenedData = [];
			years.forEach((year) => {
				months.forEach((month) => {
					flattenedData.push({
						year,
						month,
						population: populationData[year][month] || 0,
					});
				});
			});

			// Create SVG container for population line chart
			const populationSvg = d3
				.select(`#${country}-population-chart`)
				.append("svg")
				.attr("width", 600)
				.attr("height", 550);

			// Define x and y scales for population line chart
			const populationXScale = d3
				.scaleBand()
				.domain(flattenedData.map((d) => `${d.year}-${d.month}`))
				.range([75, 600])
				.padding(0.1);

			const populationYScale = d3
				.scaleLinear()
				.domain([0, d3.max(flattenedData, (d) => d.population)])
				.nice()
				.range([480, 30]);

			// Define line function for population line chart
			const line = d3
				.line()
				.x(
					(d) =>
						populationXScale(`${d.year}-${d.month}`) +
						populationXScale.bandwidth() / 2
				)
				.y((d) => populationYScale(d.population))
				.curve(d3.curveLinear);

			// Plot the population data on the line chart
			populationSvg
				.append("path")
				// .datum(Object.values(populationData))
				.datum(flattenedData)
				.attr("fill", "none")
				.attr("stroke", "steelblue")
				.attr("stroke-width", 1.5)
				.attr("d", line);

			// Add circles for data points on the line chart
			populationSvg
				.selectAll("circle")
				// .data(Object.values(populationData))
				.data(flattenedData)
				.enter()
				.append("circle")
				.attr(
					"cx",
					(d, i) =>
						populationXScale(`${d.year}-${d.month}`) +
						populationXScale.bandwidth() / 2
				)
				.attr("cy", (d) => populationYScale(d.population))
				.attr("r", 2)
				.attr("fill", "steelblue");

			// Add x-axis to the line chart
			populationSvg
				.append("g")
				.attr("transform", `translate(${-10}, ${480})`)
				.call(d3.axisBottom(populationXScale))
				.selectAll("text")
				.attr("transform", "rotate(-90)")
				.style("text-anchor", "start");

			// Add y-axis to the line chart
			populationSvg
				.append("g")
				.attr("transform", "translate(75)")
				.call(d3.axisLeft(populationYScale));

			// Add title to the line chart
			populationSvg
				.append("text")
				.attr("x", 600 / 2)
				.attr("y", 20)
				.attr("text-anchor", "middle")
				.style("font-size", "16px")
				.text(`Population Over Time - ${country}`);
			// Add tooltip for population line chart
			populationSvg
				.selectAll("circle")
				.on("mouseover", (event, d) => {
					const yearMonth = `${d.year}-${d.month}`;
					tooltip.transition().duration(200).style("opacity", 0.9);
					tooltip
						.html(
							`<strong>${country}</strong><br/>Population: ${d.population}<br/>Year-Month: ${yearMonth}`
						)
						.style("left", event.pageX + 10 + "px")
						.style("top", event.pageY - 28 + "px");
				})
				.on("mouseout", () => {
					tooltip.transition().duration(500).style("opacity", 0);
				});
		});*/
		const dataDropdown = document.getElementById("data-dropdown");
		dataDropdown.addEventListener("change", (event) => {
			const selectedOption = event.target.value;
			updateVisualization(selectedOption);
		});

		function updateVisualization(selectedOption) {
			d3.select("#chart").selectAll("*").remove();
			d3.select("#deaths-chart").selectAll("*").remove();
			d3.select("#Germany-population-chart").selectAll("*").remove();
			d3.select("#UK-population-chart").selectAll("*").remove();
			d3.select("#Germany-line-chart").selectAll("*").remove();
			d3.select("#UK-line-chart").selectAll("*").remove();
			d3.select("#Germany-bar-chart").selectAll("*").remove();
			d3.select("#UK-bar-chart").selectAll("*").remove();

			switch (selectedOption) {
				case "cases":
					visualizeCases(casesData);
					break;
				case "deaths":
					visualizeDeaths(deathsData);
					break;
				case "deathsByYear":
					// Code to visualize deaths by country based on years
					visualizeDeathsByYear(deathsDataBar);
					break;
				case "recovered":
					// Code to visualize recovered cases
					visualizeRecovered(recoveredData);
					break;
				case "population":
					// Code to visualize population data
					visualizePopulation(populationByCountry);
					break;

				default:
					break;
			}
		}
		function visualizeCases(casesData) {
			const svg = d3
				.select("#chart")
				.append("svg")
				.attr("width", 400)
				.attr("height", 450); //changed height to 600

			// create a bar chart of cumulative total cases by country
			const casesXScale = d3
				.scaleBand()
				.domain(casesData.map((d) => d.country))
				.range([75, 400])
				.padding(0.1);

			const casesYScale = d3
				.scaleLinear()
				.domain([0, d3.max(casesData, (d) => d.totalCases)])
				.range([380, 30]);

			// create bars for cumulative total cases
			svg.selectAll(".case-bar")
				.data(casesData)
				.enter()
				.append("rect")
				.attr("class", "case-bar")
				.attr("x", (d) => casesXScale(d.country))
				.attr("y", (d) => casesYScale(d.totalCases))
				.attr("width", casesXScale.bandwidth())
				.attr("height", (d) => 400 - casesYScale(d.totalCases))
				.attr("fill", "steelblue");

			// Add x-axis for cases
			svg.append("g")
				.attr("transform", "translate(0," + 400 + ")")
				.call(d3.axisBottom(casesXScale))
				.selectAll("text")
				.attr("transform", "rotate(0)")
				.style("text-anchor", "end");

			// add y-axis for cases
			svg.append("g")
				.call(d3.axisLeft(casesYScale))
				.attr("transform", "translate(75,20)");

			// Add title for cases bar chart
			svg.append("text")
				.attr("x", 200)
				.attr("y", 20)
				.attr("text-anchor", "middle")
				.style("font-size", "20px")
				.text("COVID-19 Total Cases by Country");

			// Add mouseover and mouseout event listeners to bars
			svg.selectAll(".case-bar")
				.on("mouseover", (event, d) => {
					tooltip.transition().duration(200).style("opacity", 0.9);
					tooltip
						.html(
							`<strong>${d.country}</strong><br/>Total Cases: ${d.totalCases}`
						)
						.style("left", event.pageX + 10 + "px")
						.style("top", event.pageY - 28 + "px");
				})
				.on("mouseout", () => {
					tooltip.transition().duration(500).style("opacity", 0);
				});

			/*const svg = d3
			.select("#chart")
			.append("svg")
			.attr("width", 400)
			.attr("height", 450); //changed height to 600
		
		  // create a bar chart of cumulative total cases by country
		  const casesXScale = d3
			.scaleBand()
			.domain(casesData.map((d) => d.country))
			.range([75, 400])
			.padding(0.1);
		
		  const casesYScale = d3
			.scaleLinear()
			.domain([0, d3.max(casesData, (d) => d.totalCases)])
			.range([380, 30]);
		
		  // create bars for cumulative total cases
		  svg.selectAll(".case-bar")
			.data(casesData)
			.enter()
			.append("rect")
			.attr("class", "case-bar")
			.attr("x", (d) => casesXScale(d.country))
			.attr("y", (d) => casesYScale(d.totalCases))
			.attr("width", casesXScale.bandwidth())
			.attr("height", (d) => 400 - casesYScale(d.totalCases))
			.attr("fill", "steelblue");
		
		  // Add x-axis for cases
		  svg.append("g")
			.attr("transform", "translate(0," + 400 + ")")
			.call(d3.axisBottom(casesXScale))
			.selectAll("text")
			.attr("transform", "rotate(0)")
			.style("text-anchor", "end");
		
		  // add y-axis for cases
		  svg.append("g")
			.call(d3.axisLeft(casesYScale))
			.attr("transform", "translate(75,20)");
		
		  // Add title for cases bar chart
		  svg.append("text")
			.attr("x", 200)
			.attr("y", 20)
			.attr("text-anchor", "middle")
			.style("font-size", "20px")
			.text("COVID-19 Total Cases by Country");*/
		}
		function visualizeDeaths(deathsData) {
			// create SVG container for deaths bar chart
			const deathsSvg = d3
				.select("#deaths-chart")
				.append("svg")
				.attr("width", 600)
				.attr("height", 500);

			// x and y-axis for deaths
			const deathsXScale = d3
				.scaleBand()
				.domain(deathsData.map((d) => d.country))
				.range([75, 600])
				.padding(0.1);

			const deathsYScale = d3
				.scaleLinear()
				.domain([0, d3.max(deathsData, (d) => d.totalDeaths)])
				.range([480, 30]);

			// Create bars for cumulative total deaths below the cases bars
			deathsSvg
				.selectAll(".death-bar")
				.data(deathsData)
				.enter()
				.append("rect")
				.attr("class", "death-bar")
				.attr("x", (d) => deathsXScale(d.country))
				.attr("y", (d) => deathsYScale(d.totalDeaths))
				.attr("width", deathsXScale.bandwidth())
				.attr("height", (d) => 480 - deathsYScale(d.totalDeaths))
				.attr("fill", "red");

			// Add x-axis for deaths
			deathsSvg
				.append("g")
				.attr("transform", "translate(0," + 480 + ")")
				.call(d3.axisBottom(deathsXScale))
				.selectAll("text")
				.attr("transform", "rotate(0)")
				.style("text-anchor", "end");

			// Add y-axis for deaths
			deathsSvg
				.append("g")
				.call(d3.axisLeft(deathsYScale))
				.attr("transform", "translate(75,0)");

			// add title for deaths bar chart
			deathsSvg
				.append("text")
				.attr("x", 200)
				.attr("y", 20)
				.attr("text-anchor", "middle")
				.style("font-size", "20px")
				.text("COVID-19 Total Deaths by Country");

			deathsSvg
				.selectAll(".death-bar")
				.on("mouseover", (event, d) => {
					tooltip.transition().duration(200).style("opacity", 0.9);
					tooltip
						.html(
							`<strong>${d.country}</strong><br/>Total Cases: ${d.totalDeaths}`
						)
						.style("left", event.pageX + 10 + "px")
						.style("top", event.pageY - 28 + "px");
				})
				.on("mouseout", () => {
					tooltip.transition().duration(500).style("opacity", 0);
				});
		}
		function visualizeDeathsByYear(deathsDataBar) {
			Object.keys(deathsByCountryBar).forEach((country) => {
				const deathsDataBar = deathsByCountryBar[country];
				const yearsBar = Object.keys(deathsDataBar);
				console.log(yearsBar);
				const deathsValuesBar = Object.values(deathsDataBar);

				const deathsBarSvg = d3
					.select(`#${country}-bar-chart`)
					.append("svg")
					.attr("width", 600)
					.attr("height", 500);

				const deathsXScale = d3
					.scaleBand()
					.domain(yearsBar)
					.range([75, 600])
					.padding(0.1);
				const deathsYScale = d3
					.scaleLinear()
					.domain([0, d3.max(deathsValuesBar)])
					.range([480, 30]);

				// Create bars for cumulative total deaths per country
				deathsBarSvg
					.selectAll(".deaths-bar")
					.data(deathsValuesBar)
					.enter()
					.append("rect")
					.attr("x", (d, i) => deathsXScale(yearsBar[i]))
					.attr("y", (d) => deathsYScale(d))
					.attr("width", deathsXScale.bandwidth())
					.attr("height", (d) => 480 - deathsYScale(d))
					.attr("fill", "red");

				// Add x-axis for deaths
				deathsBarSvg
					.append("g")
					.attr("transform", "translate(0," + 480 + ")")
					.call(d3.axisBottom(deathsXScale))
					.selectAll("text")
					.attr("transform", "rotate(0)")
					.style("text-anchor", "end");

				// Add y-axis for deaths
				deathsBarSvg
					.append("g")
					.call(d3.axisLeft(deathsYScale))
					.attr("transform", "translate(75,0)");
				// Add title for deaths bar chart
				deathsBarSvg
					.append("text")
					.attr("x", 200)
					.attr("y", 20)
					.attr("text-anchor", "middle")
					.style("font-size", "20px")
					.text(`COVID-19 Total Deaths Over Time - ${country}`);

				// add tooltip for deaths bar chart
				deathsBarSvg
					.selectAll("rect")
					.on("mouseover", (event, d) => {
						tooltip
							.transition()
							.duration(200)
							.style("opacity", 0.9);
						tooltip
							.html(
								`<strong>${country}</strong><br/>Total Deaths: ${d}`
							)
							.style("left", event.pageX + 10 + "px")
							.style("top", event.pageY - 28 + "px");
					})
					.on("mouseout", () => {
						tooltip.transition().duration(500).style("opacity", 0);
					});
			});
		}
		function visualizeRecovered(recoveredData) {
			// render charts for each countr
			Object.keys(recoveredByCountry).forEach((country) => {
				const recoveredData = recoveredByCountry[country];
				const years = Object.keys(recoveredData);
				// console.log(deathsDataBarCountry);
				const recoveredValues = Object.values(recoveredData);

				const recoveredSvg = d3
					.select(`#${country}-line-chart`)
					.append("svg")
					.attr("width", 600)
					.attr("height", 650);

				// x and y-axis for deaths
				const recoveredXScale = d3
					.scaleBand()
					.domain(years)
					.range([75, 600])
					.padding(0.1);

				// console.log(years);
				const recoveredYScale = d3
					.scaleLinear()
					.domain([40, d3.max(recoveredValues)])
					.nice()
					.range([600, 30]);

				const line = d3
					.line()
					.x(
						(d, i) =>
							recoveredXScale(years[i]) +
							recoveredXScale.bandwidth() / 2
					)
					.y((d) => recoveredYScale(d))
					.curve(d3.curveLinear);
				recoveredSvg
					.append("path")
					.datum(recoveredValues)
					.attr("fill", "none")
					.attr("stroke", "#F28E2B")
					.attr("stroke-width", 2)
					.attr("d", line);

				// Define the tooltip function for recovered cases
				const recoveredTooltip = d3
					.select(`#${country}-line-chart`)
					.append("div")
					.attr("class", "tooltip")
					.style("opacity", 0)
					.style("position", "absolute")
					.style("background-color", "white")
					.style("border", "1px solid #ddd")
					.style("border-radius", "5px")
					.style("padding", "10px");

				recoveredSvg
					.selectAll("dot")
					.data(recoveredValues)
					.enter()
					.append("circle")
					.attr(
						"cx",
						(d, i) =>
							recoveredXScale(years[i]) +
							recoveredXScale.bandwidth() / 2
					)
					.attr("cy", (d) => recoveredYScale(d))
					.attr("r", 4)
					.attr("fill", "green")
					.on("mouseover", (event, d, i) => {
						console.log(i);
						const year = years[i]; // Retrieve the year using the index
						recoveredTooltip
							.transition()
							.duration(200)
							.style("opacity", 0.9);
						recoveredTooltip
							.html(
								`<strong>${country}</strong><br/><br/>Recovered Cases: ${d}`
							)
							.style("left", event.pageX + "px")
							.style("top", event.pageY - 28 + "px");
					})
					.on("mouseout", function () {
						recoveredTooltip
							.transition()
							.duration(500)
							.style("opacity", 0);
					});

				recoveredSvg
					.append("g")
					.attr("transform", `translate(0,${600})`)
					.call(d3.axisBottom(recoveredXScale))
					.selectAll("text")
					.style("text-anchor", "end")
					.attr("transform", "rotate(0)");

				recoveredSvg
					.append("g")
					.attr("transform", `translate(75)`)
					.call(d3.axisLeft(recoveredYScale));

				recoveredSvg
					.append("text")
					.attr("x", 600 / 2)
					.attr("y", 20)
					.attr("text-anchor", "middle")
					.style("font-size", "16px")
					.text(`Recovered Cases Over Time - ${country}`);
			});
		}
		function visualizePopulation(populationData) {
			Object.keys(populationByCountry).forEach((country) => {
				const populationData = populationByCountry[country];
				const years = Object.keys(populationData);
				const months = [...Array(12).keys()].map((i) => (i + 1).toString());
	
				// Flatten population data into an array of objects for easy processing
				const flattenedData = [];
				years.forEach((year) => {
					months.forEach((month) => {
						flattenedData.push({
							year,
							month,
							population: populationData[year][month] || 0,
						});
					});
				});
	
				// Create SVG container for population line chart
				const populationSvg = d3
					.select(`#${country}-population-chart`)
					.append("svg")
					.attr("width", 600)
					.attr("height", 550);
	
				// Define x and y scales for population line chart
				const populationXScale = d3
					.scaleBand()
					.domain(flattenedData.map((d) => `${d.year}-${d.month}`))
					.range([75, 600])
					.padding(0.1);
	
				const populationYScale = d3
					.scaleLinear()
					.domain([0, d3.max(flattenedData, (d) => d.population)])
					.nice()
					.range([480, 30]);
	
				// Define line function for population line chart
				const line = d3
					.line()
					.x(
						(d) =>
							populationXScale(`${d.year}-${d.month}`) +
							populationXScale.bandwidth() / 2
					)
					.y((d) => populationYScale(d.population))
					.curve(d3.curveLinear);
	
				// Plot the population data on the line chart
				populationSvg
					.append("path")
					// .datum(Object.values(populationData))
					.datum(flattenedData)
					.attr("fill", "none")
					.attr("stroke", "steelblue")
					.attr("stroke-width", 1.5)
					.attr("d", line);
	
				// Add circles for data points on the line chart
				populationSvg
					.selectAll("circle")
					// .data(Object.values(populationData))
					.data(flattenedData)
					.enter()
					.append("circle")
					.attr(
						"cx",
						(d, i) =>
							populationXScale(`${d.year}-${d.month}`) +
							populationXScale.bandwidth() / 2
					)
					.attr("cy", (d) => populationYScale(d.population))
					.attr("r", 2)
					.attr("fill", "steelblue");
	
				// Add x-axis to the line chart
				populationSvg
					.append("g")
					.attr("transform", `translate(${-10}, ${480})`)
					.call(d3.axisBottom(populationXScale))
					.selectAll("text")
					.attr("transform", "rotate(-90)")
					.style("text-anchor", "start");
	
				// Add y-axis to the line chart
				populationSvg
					.append("g")
					.attr("transform", "translate(75)")
					.call(d3.axisLeft(populationYScale));
	
				// Add title to the line chart
				populationSvg
					.append("text")
					.attr("x", 600 / 2)
					.attr("y", 20)
					.attr("text-anchor", "middle")
					.style("font-size", "16px")
					.text(`Population Over Time - ${country}`);
				// Add tooltip for population line chart
				populationSvg
					.selectAll("circle")
					.on("mouseover", (event, d) => {
						const yearMonth = `${d.year}-${d.month}`;
						tooltip.transition().duration(200).style("opacity", 0.9);
						tooltip
							.html(
								`<strong>${country}</strong><br/>Population: ${d.population}<br/>Year-Month: ${yearMonth}`
							)
							.style("left", event.pageX + 10 + "px")
							.style("top", event.pageY - 28 + "px");
					})
					.on("mouseout", () => {
						tooltip.transition().duration(500).style("opacity", 0);
					});
			});
		}
	})
	.catch((error) => {
		console.error("Error fetching data", error);
	});

