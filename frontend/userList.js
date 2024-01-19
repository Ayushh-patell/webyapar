let deleteBtn
let approveBtn
let rejectBtn

const approveUser = async(e) => {

    const userIDtoupdate = e.target.dataset.userid
    const approval = e.target.dataset.approve

  const response = await fetch("http://localhost:5000/approve", {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `${localStorage.getItem("Webyapar-token")}`
    },
    body: JSON.stringify({approval,userIDtoupdate}),
  });

  if(response.ok){
      await response.json()
      getUser()
  }
  else {
      const data =  await response.json()
      alert(data.error)
  }
}
const deleteUser = async(e) => {

    const userIDtodelete = e.target.dataset.userid

  const response = await fetch("http://localhost:5000/deleteUser", {
    method: "DELETE",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `${localStorage.getItem("Webyapar-token")}`
    },
    body: JSON.stringify({userIDtodelete}),
  });

  if(response.ok){
      const data = await response.json()
      getUser()
  }
  else {
      const data =  await response.json()
      alert(data.error)
  }
}

const getUser = async () => {

    const response = await fetch("http://localhost:5000/users", {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `${localStorage.getItem("Webyapar-token")}`
      },
    });
  
    if (response.ok) {
      const data = await response.json();
      console.log(data)
      const Bigtable = document.getElementById("bigScreenTable")
      const smalltable = document.getElementById("smallScreenTable")
      smalltable.innerHTML = ""
      Bigtable.querySelector("tbody").innerHTML =""
      
      data.map(user => {
        // big screen
        const row = document.createElement("tr")
      row.innerHTML = `
      <td class=" text-center border ">${user.userID}</td>
      <td class=" text-center border ">${user.name}</td>
      <td class=" text-center border "><img src="data:image/webp;base64,${user.profilePic}" style="height: 70px; width: 70px; object-fit: cover;" alt="${user.name} profile pic"></td>
      <td style="min-height:72px; place-content=center" class=" text-center border d-flex flex-column align-items-center justify-content-center">
      <button data-userID="${user.userID}" data-approve=true  class="approveBtn w-75 mb-1 ${user.updated ? "":"d-none"} btn btn-primary">Approve</button>
      <button data-userID="${user.userID}" data-approve=false class="rejectBtn w-75 mb-1 ${user.updated ? "":"d-none"} btn btn-primary">Reject</button>
      <button data-userID="${user.userID}" class="deleteBtn w-75 mb-1 btn btn-outline-primary">Delete</button>
      </td>
      `
      
      Bigtable.querySelector("tbody").appendChild(row)

        //small screen
        const div = document.createElement("div")
        div.className = "row bg-white w-75"
        div.innerHTML = `
        <div class="col-12 border bg-primary-subtle p-2 d-flex justify-content-center align-items-center">
        <span class="border-end"><span class="fw-semibold">User-ID:</span>${user.userID} </span>
        <span class=""><span class="fw-semibold ms-1">Name:</span>${user.name} </span>
    </div>
    <div class="d-flex justify-content-between p-2">
        <div>
            <span>Photo:</span>
            <img src="data:image/webp;base64,${user.profilePic}" style="height: 70px; width: 70px; object-fit: cover;" alt="">
        </div>
        <div>
            <p class="text-center">Actions:</p>
            <div class=" d-flex flex-column align-items-center ">
                <button style="min-width: fit-content;" data-userID="${user.userID}" data-approve=true  class="approveBtn w-75 mb-1 ${user.updated ? "":"d-none"} btn btn-primary">Approve</button>
                <button style="min-width: fit-content;" data-userID="${user.userID}" data-approve=false class="rejectBtn w-75 mb-1 ${user.updated ? "":"d-none"} btn btn-primary">Reject</button>
                <button style="min-width: fit-content;" data-userID="${user.userID}" class="deleteBtn w-75 mb-1 btn btn-outline-primary">Delete</button>
            </div>
        </div>
    </div>
        `
        smalltable.appendChild(div)
      })
      if(data.length<1){
        smalltable.innerHTML = "<span class='fs-4 text-secondary'>No User</span>"
      }
        console.log(data)
        deleteBtn = document.querySelectorAll(".deleteBtn")
        deleteBtn.forEach(btn => btn.addEventListener("click", deleteUser));
        approveBtn = document.querySelectorAll(".approveBtn")
        rejectBtn = document.querySelectorAll(".rejectBtn")
        deleteBtn.forEach(btn => btn.addEventListener("click", deleteUser));
        approveBtn.forEach(btn => btn.addEventListener("click", approveUser));
        rejectBtn.forEach(btn => btn.addEventListener("click", approveUser));

  
    } else {
      const data = await response.json();
      alert(data.error);
      if(data.error === "You are not authorized")  window.location.href = "/index.html";

    }
  }
  getUser()



