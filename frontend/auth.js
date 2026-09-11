const API_URL = "https://task-management-app-j2ji.onrender.com/api";

let isLogin = false;

document.getElementById("authForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const message = document.getElementById("message");

    try {
        const endpoint = isLogin ? "/login" : "/register";

        const body = isLogin
            ? { email, password }
            : { name, email, password };

        const response = await fetch(API_URL + endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message;
            return;
        }

        if (isLogin) {
            localStorage.setItem("token", data.token);
            window.location.href = "index.html";
        } else {
            message.textContent = "Registration successful! Please login.";
            toggleForm();
        }

    } catch (error) {
        console.error(error);
        message.textContent = "Unable to connect to server.";
    }
});


function toggleForm() {
    isLogin = !isLogin;

    document.getElementById("formTitle").textContent =
        isLogin ? "Welcome Back" : "Create Account";

    document.getElementById("formSubtitle").textContent =
        isLogin ? "Login to manage your tasks" : "Register to manage your tasks";

    document.getElementById("submitBtn").textContent =
        isLogin ? "Login" : "Register";

    document.getElementById("switchText").textContent =
        isLogin ? "Don't have an account?" : "Already have an account?";

    document.getElementById("switchLink").textContent =
        isLogin ? "Register" : "Login";

    document.getElementById("message").textContent = "";

    document.getElementById("name").style.display =
        isLogin ? "none" : "block";
}