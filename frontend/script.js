const analyzeBtn = document.getElementById("analyzeBtn");
const resetBtn = document.getElementById("resetBtn");

analyzeBtn.onclick = analyze;
resetBtn.onclick = () => location.reload();

let lineChart, barChart;

function extractId(url) {
  const m = url.match(/(?:v=|\.be\/)([^&]+)/);
  return m ? m[1] : null;
}

function format(n) {
  if (n >= 1e9) return (n/1e9).toFixed(2)+"B";
  if (n >= 1e6) return (n/1e6).toFixed(2)+"M";
  return n;
}

async function analyze() {
  const url = document.getElementById("urlInput").value;
  const status = document.getElementById("status");
  const id = extractId(url);

  if (!id) {
    status.innerText = "Invalid YouTube link";
    return;
  }

  status.innerText = "Analyzing…";

  const res = await fetch(`http://127.0.0.1:5000/api/video/${id}`);
  const data = await res.json();

  if (data.error) {
    status.innerText = "Video not found";
    return;
  }

  document.getElementById("inputSection").hidden = true;
  document.getElementById("dashboardSection").hidden = false;

  document.getElementById("title").innerText = data.title;
  document.getElementById("views").innerText = format(data.views);
  document.getElementById("likes").innerText = format(data.likes);
  document.getElementById("comments").innerText = format(data.comments);

  const engagement = ((data.likes + data.comments)/data.views*100).toFixed(2);
  document.getElementById("engagement").innerText = engagement + "%";

  drawCharts(data);
}

function drawCharts(d) {
  if (lineChart) lineChart.destroy();
  if (barChart) barChart.destroy();

  // Line graph (trend-style)
  lineChart = new Chart(document.getElementById("lineChart"), {
    type: "line",
    data: {
      labels: ["Views", "Likes", "Comments"],
      datasets: [{
        data: [d.views, d.likes, d.comments],
        borderColor: "#6366f1",
        fill: false
      }]
    }
  });

  // Histogram-style bar chart
  barChart = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels: ["Views", "Likes", "Comments"],
      datasets: [{
        data: [d.views/1e6, d.likes/1e6, d.comments/1e6],
        backgroundColor: "#1e293b"
      }]
    }
  });
}
