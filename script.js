// --- Data Structure Initialization ---
const routes = [
    { id: "R001", from: "Chennai", to: "Bangalore", fare: 450.0, capacity: 30 },
    { id: "R002", from: "Chennai", to: "Hyderabad", fare: 650.0, capacity: 30 },
    { id: "R003", from: "Bangalore", to: "Hyderabad", fare: 500.0, capacity: 25 }
];

let tickets = JSON.parse(localStorage.getItem('bus_tickets')) || [];
let selectedSeats = [];

// --- Logic Functions ---

function showSection(sectionId) {
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    if(sectionId === 'routes-section') renderRoutes();
}

function renderRoutes() {
    let html = `<table><tr><th>ID</th><th>From</th><th>To</th><th>Fare</th><th>Available</th></tr>`;
    routes.forEach(r => {
        const bookedCount = getBookedSeats(r.id).length;
        html += `<tr><td>${r.id}</td><td>${r.from}</td><td>${r.to}</td><td>Rs.${r.fare}</td><td>${r.capacity - bookedCount}</td></tr>`;
    });
    html += `</table>`;
    document.getElementById('routes-container').innerHTML = html;
}

function getBookedSeats(routeId) {
    let booked = [];
    tickets.filter(t => t.routeID === routeId && !t.cancelled)
           .forEach(t => booked = booked.concat(t.seats));
    return booked;
}

function renderSeatMap() {
    const routeId = document.getElementById('route-select').value;
    const container = document.getElementById('seat-map-container');
    const route = routes.find(r => r.id === routeId);
    selectedSeats = [];
    
    if (!route) { container.innerHTML = ""; return; }

    const booked = getBookedSeats(routeId);
    let html = `<div class="seat-grid">`;
    for (let i = 1; i <= route.capacity; i++) {
        const isBooked = booked.includes(i);
        html += `<div class="seat ${isBooked ? 'booked' : 'available'}" 
                 onclick="toggleSeat(${i}, ${isBooked})" id="seat-${i}">${i}</div>`;
    }
    html += `</div>`;
    container.innerHTML = html;
}

function toggleSeat(seatNo, isBooked) {
    if (isBooked) return;
    const el = document.getElementById(`seat-${seatNo}`);
    if (selectedSeats.includes(seatNo)) {
        selectedSeats = selectedSeats.filter(s => s !== seatNo);
        el.classList.remove('selected');
    } else {
        if (selectedSeats.length >= 6) { alert("Max 6 seats per booking"); return; }
        selectedSeats.push(seatNo);
        el.classList.add('selected');
    }
}

function confirmBooking() {
    const routeId = document.getElementById('route-select').value;
    const name = document.getElementById('passenger-name').value;
    const route = routes.find(r => r.id === routeId);

    if (!route || !name || selectedSeats.length === 0) {
        alert("Please complete all fields and select seats.");
        return;
    }

    const newTicket = {
        ticketID: "TKT" + (1000 + tickets.length + 1),
        routeID: routeId,
        passengerName: name,
        seats: [...selectedSeats],
        fare: route.fare * selectedSeats.length,
        cancelled: false
    };

    tickets.push(newTicket);
    localStorage.setItem('bus_tickets', JSON.stringify(tickets));
    alert(`Booking Successful! ID: ${newTicket.ticketID}`);
    location.reload(); // Refresh to update state
}

function searchTicket() {
    const id = document.getElementById('search-id').value.toUpperCase();
    const t = tickets.find(t => t.ticketID === id);
    const area = document.getElementById('ticket-display-area');

    if (!t) { area.innerHTML = "<p>Ticket not found.</p>"; return; }

    area.innerHTML = `
        <div class="ticket-card ${t.cancelled ? 'cancelled' : ''}">
            <h3>${t.ticketID} - ${t.passengerName}</h3>
            <p>Route: ${t.routeID} | Seats: ${t.seats.join(', ')}</p>
            <p>Total Fare: Rs.${t.fare.toFixed(2)}</p>
            <p>Status: ${t.cancelled ? 'CANCELLED' : 'ACTIVE'}</p>
            ${!t.cancelled ? `<button onclick="cancelTicket('${t.ticketID}')" style="background:red; color:white; border:none; padding:5px 10px; cursor:pointer">Cancel Ticket</button>` : ''}
        </div>
    `;
}

function cancelTicket(id) {
    if (!confirm("Are you sure you want to cancel?")) return;
    const index = tickets.findIndex(t => t.ticketID === id);
    if (index !== -1) {
        tickets[index].cancelled = true;
        localStorage.setItem('bus_tickets', JSON.stringify(tickets));
        alert("Ticket cancelled and seats released.");
        searchTicket();
    }
}

function updateRevenue() {
    let revMap = {};
    let countMap = {};
    routes.forEach(r => { revMap[r.id] = 0; countMap[r.id] = 0; });

    tickets.filter(t => !t.cancelled).forEach(t => {
        revMap[t.routeID] += t.fare;
        countMap[t.routeID]++;
    });

    let html = `<table><tr><th>Route</th><th>Bookings</th><th>Revenue</th></tr>`;
    let maxB = 0, topR = "N/A";

    routes.forEach(r => {
        html += `<tr><td>${r.id}</td><td>${countMap[r.id]}</td><td>Rs.${revMap[r.id].toFixed(2)}</td></tr>`;
        if (countMap[r.id] > maxB) { maxB = countMap[r.id]; topR = r.id; }
    });
    html += `</table>`;
    
    document.getElementById('revenue-table-container').innerHTML = html;
    document.getElementById('popular-route').innerText = maxB > 0 ? `Most Popular: ${topR} (${maxB} bookings)` : "";
}

// Initial Setup
window.onload = () => {
    const select = document.getElementById('route-select');
    routes.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.id;
        opt.textContent = `${r.id}: ${r.from} -> ${r.to}`;
        select.appendChild(opt);
    });
    renderRoutes();
};
