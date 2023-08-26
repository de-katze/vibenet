// Function to get the current time and day
function getCurrentTimeAndDay() {
    return new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Function to get the greeting based on the time of day
function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Guten Morgen";
    if (hour >= 12 && hour < 18) return "Guten Tag";
    return "Gute Nacht";
}

// Update greeting and time every minute
function updateGreetingAndTime() {
    const greetingElement = document.getElementById("greeting");
    const name = "Seth"; // Replace with the user's name
    const greeting = getGreeting();
    greetingElement.textContent = `${greeting}, ${name}`;

    const timeElement = document.getElementById("time");
    timeElement.textContent = getCurrentTimeAndDay();
}

// Initial update
updateGreetingAndTime();

// Update every minute
setInterval(updateGreetingAndTime, 60000);

// Handle search input
const searchInput = document.getElementById("search-input");

searchInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        const query = searchInput.value.trim();
        if (query !== "") {
            window.location.href = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
        }
    }
});