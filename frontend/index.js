const Loginform = document.querySelector("#loginform");

const submitLogin = async (e) => {
  e.preventDefault();
  const userID = document.getElementById("userID").value;
  const password = document.getElementById("password").value;

  if (password.length < 5) {
    alert("Password must be 5 characters long!");
  } else {
    const loginData = {
        userID,
        password
    };

    const response = await fetch("http://localhost:5000/login", {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    if(response.ok){
        const data = await response.json()
        localStorage.removeItem("Webyapar-token")
        localStorage.setItem("Webyapar-token", data.token)
       if(data.role === "admin") {
        window.location.href = "/admin.html"
       }
       else {
        window.location.href = "/update.html"

       }
    }
    else {
        const data =  await response.json()
        alert(data.error)
    }
  }
};
Loginform.addEventListener("submit", submitLogin);
