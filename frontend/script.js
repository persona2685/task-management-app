const API_URL = "http://localhost:3000/api/tasks";
const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

// Load tasks when page opens
document.addEventListener("DOMContentLoaded", loadTasks);


// GET all tasks
async function loadTasks() {
    try {
        const response = await fetch(API_URL, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        
        const tasks = await response.json();
        allTasks = tasks;  

        displayTasks(tasks);
    } catch (error) {
        document.getElementById("taskList").innerHTML =
            "<p>Unable to load tasks.</p>";

        console.error(error);
    }
}


// Display tasks
function displayTasks(tasks) {
    // Update dashboard statistics
    document.getElementById("totalTasks").textContent = tasks.length;

    document.getElementById("pendingTasks").textContent =
        tasks.filter(task => task.status === "Pending").length;

    document.getElementById("progressTasks").textContent =
        tasks.filter(task => task.status === "In Progress").length;

    document.getElementById("completedTasks").textContent =
        tasks.filter(task => task.status === "Completed").length;
    const taskList = document.getElementById("taskList");

    if (tasks.length === 0) {
        taskList.innerHTML = "<p>No tasks yet. Add your first task!</p>";
        return;
    }

    taskList.innerHTML = tasks.map(task => `
        <div class="task-card">

            <h3>${task.title}</h3>

            <p>${task.description || "No description"}</p>

         <p>
    <strong>Status:</strong>
    <span class="status-badge ${task.status.replace(" ", "-").toLowerCase()}">
        ${task.status}
    </span>
</p>

            <p>
                <strong>Due Date:</strong>
                ${task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "Not set"}
            </p>

            <div class="task-actions">
               <select onchange="updateStatus('${task._id}', this.value)">
    <option value="Pending" ${task.status === "Pending" ? "selected" : ""}>
        Pending
    </option>
    <option value="In Progress" ${task.status === "In Progress" ? "selected" : ""}>
        In Progress
    </option>
    <option value="Completed" ${task.status === "Completed" ? "selected" : ""}>
        Completed
    </option>
</select>

                <button class="delete-btn"
                    onclick="deleteTask('${task._id}')">
                    Delete
                </button>
            </div>

        </div>
    `).join("");
}


// CREATE task
async function addTask() {

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const status = document.getElementById("status").value;
    const dueDate = document.getElementById("dueDate").value;

    if (!title) {
        alert("Please enter a task title.");
        return;
    }

    try {

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                description,
                status,
                dueDate: dueDate || undefined
            })
        });

        if (!response.ok) {
            throw new Error("Failed to create task");
        }

        // Clear form
        document.getElementById("title").value = "";
        document.getElementById("description").value = "";
        document.getElementById("status").value = "Pending";
        document.getElementById("dueDate").value = "";

        loadTasks();
        closeTaskForm();

    } catch (error) {
        console.error(error);
        alert("Unable to add task.");
    }
}



// UPDATE task status
async function updateStatus(id, newStatus) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                status: newStatus
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to update task");
        }

        loadTasks();

    } catch (error) {
        console.error(error);
        alert("Unable to update task.");
    }
}



// DELETE task
async function deleteTask(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to delete task");
        }

        loadTasks();

    } catch (error) {
        console.error(error);
        alert("Unable to delete task.");
    }
}
function openTaskForm() {
    document.getElementById("taskForm").style.display = "block";
}

function closeTaskForm() {
    document.getElementById("taskForm").style.display = "none";
}
let allTasks = [];

function filterTasks(status) {
    if (status === "all") {
        displayTasks(allTasks);
    } else {
        const filteredTasks = allTasks.filter(
            task => task.status === status
        );

        displayTasks(filteredTasks);
    }

    // Highlight selected menu item
    const links = document.querySelectorAll(".sidebar nav a");

    links.forEach(link => {
        link.classList.remove("active");
    });

    if (status === "Pending") {
        links[2].classList.add("active");
    } else if (status === "In Progress") {
        links[3].classList.add("active");
    } else if (status === "Completed") {
        links[4].classList.add("active");
    } else {
        links[0].classList.add("active");
    }
}
function searchTasks() {
    const searchText = document
        .getElementById("searchInput")
        .value
        .toLowerCase();

    const filteredTasks = allTasks.filter(task =>
        task.title.toLowerCase().includes(searchText) ||
        (task.description || "").toLowerCase().includes(searchText)
    );

    displayTasks(filteredTasks);
}
function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}