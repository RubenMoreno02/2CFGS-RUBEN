document.addEventListener("DOMContentLoaded", function() {
    new Chart(document.getElementById("pie-chart"), {
        type: 'pie',
        data: {
            labels: ["Africa", "Asia", "Amèrica"],
            datasets: [{
                label: "Population (millions)",
                backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f"],
                data: [150, 300, 50]
            }]
        },
        options: {
            plugins: {               
            }
        }
    });
});