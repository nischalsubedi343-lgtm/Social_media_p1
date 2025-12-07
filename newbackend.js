// SELECT BACKEND ======================
// A = Firebase, B = Node, C = PHP
const BACKEND = "A";  
// ======================================


// MAIN LOGIN FUNCTION
function login() {
    const name = document.getElementById("username").value.trim();
    const error = document.getElementById("error");

    if (!name) {
        error.innerText = "Username cannot be empty!";
        return;
    }

    if (BACKEND === "A") loginFirebase(name);
    if (BACKEND === "B") loginNode(name);
    if (BACKEND === "C") loginPHP(name);
}


// -------------------------------------
// A) FIREBASE BACKEND
// -------------------------------------
function loginFirebase(name) {
    fetch("https://<your-project-id>.firebaseio.com/users.json")
        .then(res => res.json())
        .then(users => {

            let exists = false;
            for (let id in users) {
                if (users[id].username === name) exists = true;
            }

            if (exists) {
                document.getElementById("error").innerText =
                    "Username already exists!";
                return;
            }

            fetch("https://<your-project-id>.firebaseio.com/users.json", {
                method: "POST",
                body: JSON.stringify({ username: name })
            });

            localStorage.setItem("currentUser", name);
            window.location.href = "home.html";
        });
}



// -------------------------------------
// B) NODE.JS + EXPRESS + MONGO BACKEND
// -------------------------------------
function loginNode(name) {
    fetch("https://your-node-server.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "duplicate") {
            document.getElementById("error").innerText =
                "Username already exists!";
            return;
        }

        localStorage.setItem("currentUser", name);
        window.location.href = "home.html";
    });
}



// -------------------------------------
// C) PHP + MYSQL BACKEND
// -------------------------------------
function loginPHP(name) {
    fetch("login.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "username=" + name
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "duplicate") {
            document.getElementById("error").innerText =
                "Username already exists!";
            return;
        }

        localStorage.setItem("currentUser", name);
        window.location.href = "home.html";
    });
}
