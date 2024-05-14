function renderCountryCharts(country, casesData, deathsData, recoveredData) {
	// render charts for the country
	renderBarChart(country, casesData, deathsData);
	renderLineChart(country, casesData, recoveredData);
}

function renderLineChart(country, recoveredData) {
	// Rendering line chart for recovered
	// Add your line chart rendering logic here
	// Select the SVG container for the line chart
	console.log(recoveredData);
	const svg = d3.select(`#${country}-line-chart`);

	// Set the dimensions of the SVG container
	const width = 600;
	const height = 800;

	// Set margins
	const margin = { top: 20, right: 20, bottom: 50, left: 50 };

	// Calculate inner width and height
	const innerWidth = width - margin.left - margin.right;
	const innerHeight = height - margin.top - margin.bottom;

	// Create X scale for years
	const xScale = d3
		.scaleBand()
		// .scaleLinear()
		// .scalePoint()
		// .scaleTime()
		.domain(Object.keys(recoveredData))
		.range([margin.left + 20, width - margin.right])
		.padding(0.4);
	console.log(Object.keys(recoveredData));

	// Create Y scale for recovered
	const yScale = d3
		.scaleLinear()
		.domain([0, d3.max(Object.values(recoveredData))])
		// .domain([0,d3.max(Object.values(recoveredData), function (d) {return +d.value})])
		.range([height - margin.bottom, margin.top]);

	// Create SVG element
	const g = svg
		.append("g")
		.attr("transform", `translate(${margin.left},${margin.top})`)
		.attr("width", 600)
		.attr("height", 500);

	// Define line function
	const line = d3
		.line()
		.x(([year]) => xScale(year) + xScale.bandwidth() / 2)
		// .x(([year]) => xScale(year))
		.y((recovered) => yScale(recovered))
		.curve(d3.curveLinear);

	// Render line for recovered
	g.append("path")
		.datum(Object.entries(recoveredData))
		.attr("fill", "none")
		.attr("stroke", "green")
		// .attr("stroke-linejoin","round").attr("stroke-linecap","round")
		.attr("stroke-width", 2)
		.attr("d", line);

	// Add X axis
	g.append("g")
		.attr("transform", `translate(0,${height - margin.bottom})`)
		.call(d3.axisBottom(xScale))
		.selectAll("text")
		.attr("transform", "rotate(-45)")
		.style("text-anchor", "end");

	// Add Y axis
	g.append("g")
		// .attr("transform", `translate(${margin.left},0)`)
		.call(d3.axisLeft(yScale));

	// Add chart title
	svg.append("text")
		.attr("x", width / 2)
		// .attr("x", 1)
		.attr("y", margin.top / 2)
		.attr("text-anchor", "middle")
		.text(`${country} - Total Recovered by Year`);
}

function extractYearFromDateTime(dateTime) {
	if (dateTime) {
		const date = new Date(dateTime);
		return date.getFullYear(); // Extract year from date
	}
	return null;
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
				if (!populationByCountry[country]) {
					populationByCountry[country] = {};
				}
				casesByCountry[country] += totalCases;
				deathsByCountry[country] += totalDeaths;
				deathsByCountryBar[country] = deathsByCountryBar[country] || {};
				deathsByCountryBar[country][year] =
					(deathsByCountryBar[country][year] || 0) + totalDeathsBar;

				// recoveredByCountry[country] = recoveredByCountry[country] || {};
				recoveredByCountry[country][year] =
					(recoveredByCountry[country][year] || 0) + totalRecovered;
				populationByCountry[country][year] =
					(populationByCountry[country][year] || 0) + totalPopulation;
				createLineChartContainer(country);
				createBarChartContainer(country);
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
		const populationData = Object.entries(populationByCountry).map(
			([country, totalPopulation]) => ({ country, totalPopulation })
		);

		// Sort data by total  cses (descending order)
		casesData.sort((a, b) => b.totalCases - a.totalCases);
		deathsData.sort((a, b) => b.totalDeaths - a.totalDeaths);
		recoveredData.sort((a, b) => b.totalRecovered - a.totalRecovered);
		deathsDataBar.sort((a, b) => b.totalDeathsBar - a.totalDeathsBar);
		populationData.sort((a, b) => b.totalPopulation - a.totalPopulation);

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

		// render charts for each countr
		Object.keys(recoveredByCountry, deathsByCountryBar).forEach((country) => {
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
				.attr("fill", "green");

			console.log();

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
	})
	.catch((error) => {
		console.error("Error fetching data", error);
	});

// renderLineChart(country, recoveredByCountry[country])

/*renderCountryCharts(
			country,
			casesByCountry[country],
			deathsByCountry[country],
			recoveredByCountry[country]
			// populationByCountry[country]
		);*/
