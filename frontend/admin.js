const getUser = async () => {
//fetch users
  const response = await fetch("http://localhost:5000/Adminusers", {
    method: "GET",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `${localStorage.getItem("Webyapar-token")}`
    },
  });

  if (response.ok) {
    const data = await response.json();
    const ul = document.getElementById("twouserlist")
    //fill values of the users
    if(data[0]) ul.querySelector("li:nth-child(1) p").innerHTML = data[0].userID
    if(data[1]) ul.querySelector("li:nth-child(2) p").innerHTML = data[1].userID

  } else {
    const data = await response.json();
    alert(data.error);
    if(data.error === "You are not authorized")  window.location.href = "/index.html";
  }
}

getUser()


const Createform = document.querySelector("#CreateForm");

const submitCreate = async (e) => {
    e.preventDefault();
    const userIDtocreate = document.getElementById("UserID").value;
    const password = document.getElementById("Password-create").value;
  
    if (password.length < 5) {
      alert("Password must be 5 characters long!");
    } else {
      const createData = {
        userIDtocreate,
          password
      };
  
      const response = await fetch("http://localhost:5000/Create", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `${localStorage.getItem("Webyapar-token")}`
        },
        body: JSON.stringify(createData),
      });
  
      if(response.ok){
          const data = await response.json()
          alert("User Created")
          getUser()
        }
      else {
          const data =  await response.json()
          alert(data.error)
      }
    }
  };
  Createform.addEventListener("submit", submitCreate);
  
