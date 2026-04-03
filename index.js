let routes = [
    {id:"R001", from:"Chennai", to:"Bangalore", fare:450, seats:30},
    {id:"R002", from:"Chennai", to:"Hyderabad", fare:650, seats:30},
    {id:"R003", from:"Bangalore", to:"Hyderabad", fare:500, seats:25}
];

let tickets = JSON.parse(localStorage.getItem("tickets")) || [];

function showSection(id){
    document.querySelectorAll("section").forEach(s => s.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
}

function displayRoutes(){
    let html = "<h2>Routes</h2><table border='1'><tr><th>ID</th><th>From</th><th>To</th><th>Fare</th></tr>";
    routes.forEach(r=>{
        html += `<tr><td>${r.id}</td><td>${r.from}</td><td>${r.to}</td><td>${r.fare}</td></tr>`;
    });
    html += "</table>";
    document.getElementById("routes").innerHTML = html;

    let select = document.getElementById("routeSelect");
    select.innerHTML = "";
    routes.forEach(r=>{
        select.innerHTML += `<option value="${r.id}">${r.id}</option>`;
    });
}

function generateID(){
    return "TKT" + Math.floor(Math.random()*10000);
}

function bookTicket(){
    let name = document.getElementById("name").value;
    let route = document.getElementById("routeSelect").value;
    let seats = parseInt(document.getElementById("seats").value);

    if(!name || seats < 1 || seats > 6){
        alert("Invalid input");
        return;
    }

    let routeObj = routes.find(r=>r.id === route);
    let fare = routeObj.fare * seats;

    let ticket = {
        id: generateID(),
        name: name,
        route: route,
        seats: seats,
        fare: fare,
        cancelled: false
    };

    tickets.push(ticket);
    localStorage.setItem("tickets", JSON.stringify(tickets));

    alert("Booked! Ticket ID: " + ticket.id);
}

function searchTicket(){
    let id = document.getElementById("searchId").value;
    let t = tickets.find(x => x.id === id);

    let result = document.getElementById("searchResult");

    if(!t){
        result.innerHTML = "Not found";
        return;
    }

    result.innerHTML = `
        <p>Name: ${t.name}</p>
        <p>Route: ${t.route}</p>
        <p>Seats: ${t.seats}</p>
        <p>Fare: ${t.fare}</p>
        <p>Status: ${t.cancelled ? "Cancelled":"Active"}</p>
        <button onclick="cancelTicket('${t.id}')">Cancel</button>
    `;
}

function cancelTicket(id){
    let t = tickets.find(x => x.id === id);
    if(t){
        t.cancelled = true;
        localStorage.setItem("tickets", JSON.stringify(tickets));
        alert("Cancelled");
    }
}

function revenueReport(){
    let map = {};
    tickets.forEach(t=>{
        if(!t.cancelled){
            map[t.route] = (map[t.route] || 0) + t.fare;
        }
    });

    let html = "";
    for(let r in map){
        html += `<p>${r} : ₹${map[r]}</p>`;
    }

    document.getElementById("reportData").innerHTML = html;
}

displayRoutes();
