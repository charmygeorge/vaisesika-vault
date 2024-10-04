document.addEventListener('DOMContentLoaded', function () {
    const resultText = document.getElementById('resultText');
    const recordBtn = document.getElementById('recordBtn');
    const transcriptArea = document.getElementById('transcript');
    const submitBtn = document.getElementById('submitBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const listenBtn = document.getElementById('listenBtn');
    const statusText=document.getElementById('statusText');

    const chartsSection = document.querySelector('.charts-section');
const powerBiSection = document.getElementById('powerBiSection');
const powerBiMenuItem = document.querySelector('.menu li:nth-child(2)'); // Assuming Power BI is the second menu item
const chartsMenuItem = document.querySelector('.menu li:first-child'); // Assuming Charts is the first menu item

let barChart, pieChart, lineChart;
// Show charts section
chartsMenuItem.addEventListener('click', function () {
    chartsSection.style.display = 'flex'; // or 'block', depending on your layout
    powerBiSection.style.display = 'none';
});

// Show Power BI section
powerBiMenuItem.addEventListener('click', function () {
    chartsSection.style.display = 'none';
    powerBiSection.style.display = 'block';
});
   

    let isRecording = false;
    let recognition;

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true; // Show text simultaneously
        recognition.lang = 'en-US';

        recognition.onstart = function () {
            recordBtn.textContent = 'Listening...';
        };

        recognition.onresult = function (event) {
            const transcript = event.results[0][0].transcript;
            transcriptArea.value = transcript;
        };

        recognition.onerror = function () {
            recordBtn.textContent = 'Click to Speak';
        };

        recognition.onend = function () {
            isRecording = false;
            recordBtn.textContent = 'Click to Speak';
        };
    }

    // Handle recording button click
    recordBtn.addEventListener('click', function () {
        if (!isRecording) {
            isRecording = true;
            recognition.start();
            statusText.textContent='Listening..';
            recordBtn.classList.add('hidden');
            pauseBtn.classList.remove('hidden');
            resetBtn.classList.remove('hidden');
        } else {
            recognition.stop();
            isRecording = false;
        }
    });

    pauseBtn.addEventListener('click', function () {
        recognition.stop();
        isRecording = false;
        statusText.textContent = 'Click to Speak....';
        pauseBtn.classList.add('hidden');
        recordBtn.classList.remove('hidden');        
        resetBtn.classList.remove('hidden');
    });

    resetBtn.addEventListener('click', function () {
        transcriptArea.value = '';
        resultText.textContent = 'No results yet.';
        statusText.textContent = 'Click to Speak....';        
        recordBtn.classList.remove('hidden');  
        pauseBtn.classList.add('hidden');      
        resetBtn.classList.add('hidden');
    });

    // Handle submit button click
    submitBtn.addEventListener('click', async function () {
        const apiResponse= await callAPI(transcriptArea.value);
        if(apiResponse){
        renderCharts(apiResponse.data,apiResponse.type);
        }
    });

    function callAPI(recordedText) {
       const apiUrl="https://b21c74c3-b0ea-4373-b485-35678a15a55b.mock.pstmn.io/test";// Make the POST request to the API
        return fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: recordedText }) // Send the recorded text in the request body
            
        })
        .then(response => response.json())
        .then(data => {
            // Assuming the result format is the same as the mock API
            const result = data.text;
    
            // Update the result section in the UI
            document.getElementById('resultText').innerText = result;
            return data;

        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    // Handle listen button click
    listenBtn.addEventListener('click', function () {
        const listenText= document.getElementById('resultText').innerText
        const utterance = new SpeechSynthesisUtterance(listenText);
        window.speechSynthesis.speak(utterance);
    });

    // Render charts
        function renderCharts(data,chartType) {
        const ctxBar = document.getElementById('barChart').getContext('2d');
        const ctxPie = document.getElementById('pieChart').getContext('2d');
        const ctxLine = document.getElementById('lineChart').getContext('2d');

        const labels = data.map(item => item.label);
        const values = data.map(item => item.value);
        if (typeof barChart !== 'undefined' && barChart !== null) {
            barChart.destroy();
        }
        
        if (typeof pieChart !== 'undefined' && pieChart !== null) {
            pieChart.destroy();
        }
        
        if (typeof lineChart !== 'undefined' && lineChart !== null) {
            lineChart.destroy();
        }

    if(chartType===1){
    document.getElementById('barChartContainer').style.display='block';
    document.getElementById('pieChartContainer').style.display='block';
    document.getElementById('lineChartContainer').style.display='none';
        // Bar Chart
        barChart = new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Sum',
                    data: values,
                    backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#FF9F40', '#4BC0C0'],
                    borderColor: '#fff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                devicePixelRatio:window.devicePixelRatio*2,
                scales:{
                    y:{
                        beginAtZero:true
                    }
                }
            }
        });

        // Pie Chart
         pieChart=new Chart(ctxPie, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#FF9F40', '#4BC0C0'],
                    borderColor: '#fff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                devicePixelRatio:window.devicePixelRatio*2
            }
        });
    }
    else if(chartType===2)
    {
    document.getElementById('barChartContainer').style.display='none';
    document.getElementById('pieChartContainer').style.display='none';
    document.getElementById('lineChartContainer').style.display='block';
        // Line Chart
        lineChart = new Chart(ctxLine, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Trend',
                    data: values,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
   
    document.getElementById('downloadBtn').addEventListener('click', function() {
    debugger;
        let barChartImage, pieChartImage, lineChartImage;
        if (typeof barChart !== 'undefined' && barChart !== null) {
            barChartImage = barChart.toBase64Image();
        }
        
        if (typeof pieChart !== 'undefined' && pieChart !== null) {
            pieChartImage = pieChart.toBase64Image();
        }
        
        if (typeof lineChart !== 'undefined' && lineChart !== null) {
            lineChartImage = lineChart.toBase64Image();
        }
    
        createPDF(barChartImage, pieChartImage, lineChartImage);
    });
    }

   
    
    // Function to create PDF with charts
    function createPDF(barChartImage, pieChartImage,lineChartImage) {
        const pdf = new jsPDF();
        pdf.setFontSize(16);
        pdf.text('Report', 100, 10);
        pdf.setFontSize(12);
        pdf.text('Query:', 10, 20);
        const queryTexts = document.getElementById('transcript').value;
        pdf.text(queryTexts, 10, 30);
        pdf.setFontSize(12);
        pdf.text('Result:', 10, 40);
        const resultTexts = document.getElementById('resultText').innerText;
        pdf.text(resultTexts, 10, 50);
    
        // Add charts based on their presence
        if (barChartImage) 
            pdf.addImage(barChartImage, 'PNG', 10, 80, 180, 80);
        if (pieChartImage)
             pdf.addImage(pieChartImage, 'PNG', 10, 170, 180, 80);
        if (lineChartImage) 
            pdf.addImage(lineChartImage, 'PNG', 10, 80, 180, 80); // Adjust y position as needed
    
        // Save PDF
        pdf.save('charts.pdf');
    }
    
});
    


