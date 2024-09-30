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
    submitBtn.addEventListener('click', function () {
        const apiResponse= callAPI(transcriptArea.value);
        renderCharts(apiResponse.data);
    });

    function callAPI(recordedText) {
        const apiUrl = 'http://172.18.71.12:8000/chartData'; // Replace with actual API endpoint
            // Make the POST request to the API
        fetch(apiUrl, {
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

        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    // Handle listen button click
    listenBtn.addEventListener('click', function () {
        const utterance = new SpeechSynthesisUtterance(resultText.text);
        window.speechSynthesis.speak(utterance);
    });

    // Render charts
        function renderCharts(data) {
        const ctxBar = document.getElementById('barChart').getContext('2d');
        const ctxPie = document.getElementById('pieChart').getContext('2d');

        const labels = data.map(item => item.label);
        const values = data.map(item => item.Value);

        // Bar Chart
        const barChart = new Chart(ctxBar, {
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
        const pieChart=new Chart(ctxPie, {
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
        document.getElementById('downloadBtn').addEventListener('click', function() {
            // Ensure the charts have rendered before trying to download
            if (barChart && pieChart) {
                const barChartImage = barChart.toBase64Image();
                const pieChartImage = pieChart.toBase64Image();
                createPDF(barChartImage, pieChartImage);
            }
        });
    }

   
    
    // Function to create PDF with charts
    function createPDF(barChartImage, pieChartImage) {
        const pdf = new jsPDF();
        
        pdf.setFontSize(16);
        pdf.text('Report',100,10);
        pdf.setFontSize(12);
        pdf.text('Query:',10,20);
        const queryTexts= document.getElementById('transcript').value;
        pdf.text(queryTexts,10,30);
        pdf.setFontSize(12);
        pdf.text('Result:',10,40);
        const resultTexts= document.getElementById('resultText').innerText;
        pdf.text(resultTexts,10,50);
        // Add Bar Chart
        pdf.addImage(barChartImage, 'PNG', 10, 80, 180, 80);
        
        // Add Pie Chart
        pdf.addImage(pieChartImage, 'PNG', 10, 170, 180, 80);
        
        // Save PDF
        pdf.save('charts.pdf');
    }
    
});
    


