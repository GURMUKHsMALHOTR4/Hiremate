// app.js

document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');

    // Register Form Handling
    if (registerForm) {
        registerForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const roleElement = document.getElementById('role');
            const role = roleElement ? roleElement.value : "USER"; // If role exists, otherwise default to USER

            try {
                const response = await fetch('http://localhost:8080/users/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, email, password, role })
                });

                const message = await response.text();
                alert(message);

                if (response.ok && message.includes("successfully")) {
                    window.location.href = '/login.html'; // ✅ Redirect to login page
                }
            } catch (error) {
                console.error('Registration error:', error);
                alert('Registration failed. Please try again later.');
            }
        });
    }

    // Login Form Handling
    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('http://localhost:8080/users/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const message = await response.text();
                alert(message);

                if (response.ok && message.includes("successful")) {
                    window.location.href = '/jobs.html'; // ✅ Redirect to dashboard page
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Login failed. Please try again later.');
            }
        });
    }
});
