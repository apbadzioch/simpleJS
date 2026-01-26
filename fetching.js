/*
-- basic fetch example
fetch("http://www.example.com")
    .then(response => {
        if (!response.ok) {
            // Handle HTTP error status (e.g., 404, 500)
            throw new Error(`Status: ${response.status} ${response.statusText}`)
        }
        // Parse the response body as JSON or text. Use  .text() for raw text/HTML.
        return response.json();
    })
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error('Error fetching data:', error)
    });
 */

async function getInfo(){
    const url = "https://www.onebadev.com";
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const result = await response.text();
        console.log(result);
    }   catch(error) {
        console.log(error.message);
    }
}
getInfo();