let cropper;

document.getElementById("profilePic").addEventListener("change", (event) => {
  const input = event.target;

  if (input.files && input.files[0]) {
    const reader = new FileReader();

    reader.onload = function (e) {
      if (cropper) {
        cropper.destroy();
      }

      // Initialize CropperJS on the image
      cropper = new Cropper(document.getElementById("croppedImage"), {
        aspectRatio: 1,
        viewMode: 1,
        autoCropArea: 1,
        crop: function (e) {},
      });

      // Set the image source
      cropper.replace(e.target.result);
    };

    reader.readAsDataURL(input.files[0]);
  }
});


const getuserInfo = async() => {
  
  const response = await fetch("http://localhost:5000/userInfo", {
    method: "GET",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `${localStorage.getItem("Webyapar-token")}`
    },
  });

  if (response.ok) {
    const viewBtn = document.getElementById("viewApproval")
    const data = await response.json();
    if(data.updated || data.status!==null) {
      viewBtn.classList.remove("d-none")
    }
    const offcanvaBbody = document.querySelector(".offcanvas-body")

    offcanvaBbody.innerHTML = `
    <label for="approval-name" class="fs-6">Name:</label>
            <input class="w-100 p-2 form-control mb-3" type="text" id="approval-name" name="name" value="${data.name}" readonly>
            <img class=" updateImg w-100" style="aspect-ratio: 1/1; object-fit: cover;" src="data:image/webp;base64,${data.profilePic}" alt="">
            ${data.status ===null? '<p class=" text-warning">Approval still pending</p>':data.status ===true ? '<p class=" text-success">Approved by Admin</p>':'<p class=" text-danger">Not approved by Admin</p>'}
            
    `

  } else {
    const data = await response.json();
    alert(data.error);
  }
}

async function updateUser() {
  const name = document.getElementById("name").value;

  if (!name || !cropper) {
    alert("Please provide both a name and a cropped image.");
    return;
  }

  // Get the cropped canvas as a blob
  const croppedBlob = await getCroppedBlob(cropper);

  // Convert the blob to WebP format
  const webpBlob = await convertToWebP(croppedBlob);

  // Create FormData to send data 
  const formData = new FormData();
  formData.append("name", name);
  formData.append("profilePic", webpBlob, "profile.webp");

  const response = await fetch("http://localhost:5000/updateuser", {
    method: "POST",
    headers: {
      authorization: `${localStorage.getItem("Webyapar-token")}`,
    },
    body: formData,
  })
  const data = await response.json();

if(response.ok){
  console.log(data)
  alert("Updated successfully, waiting for approval")
  getuserInfo()
}
else {
  console.log(data)
}
}

function getCroppedBlob(cropper) {
  return new Promise((resolve) => {
    cropper.getCroppedCanvas().toBlob((blob) => {
      resolve(blob);
    }, "image/jpeg"); 
  });
}

function convertToWebP(blob) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0);

      canvas.toBlob((webpBlob) => {
        resolve(webpBlob);
      }, "image/webp");
    };
    image.src = URL.createObjectURL(blob);
  });
}

getuserInfo()



