document.getElementById("file-upload").addEventListener("change", function () {
  var fileName = this.files[0].name;
  document.getElementById("file-name").textContent = fileName;
});

var dropArea = document.getElementById("drop-area");

dropArea.addEventListener("dragover", function (e) {
  e.preventDefault();
  e.stopPropagation();
  dropArea.classList.add("dragging");
});

dropArea.addEventListener("dragleave", function (e) {
  e.preventDefault();
  e.stopPropagation();
  dropArea.classList.remove("dragging");
});

dropArea.addEventListener("drop", function (e) {
  e.preventDefault();
  e.stopPropagation();
  dropArea.classList.remove("dragging");

  var files = e.dataTransfer.files;
  if (files.length > 0) {
    document.getElementById("file-upload").files = files;
    var fileName = files[0].name;
    document.getElementById("file-name").textContent = fileName;
  }
});

document
  .querySelector(".sketch-button-section button")
  .addEventListener("click", async function (e) {
    e.preventDefault();

    const fileInput = document.getElementById("file-upload");
    const file = fileInput.files[0];

    if (!file) {
      const dashedborderContainer = document.querySelector(
        ".custom-file-upload"
      );

      if (!dashedborderContainer.classList.contains("shake")) {
        dashedborderContainer.style.borderColor = "#f87171";
        dashedborderContainer.classList.add("shake");
        setTimeout(() => {
          dashedborderContainer.style.borderColor = "#d1d5db";
          dashedborderContainer.classList.remove("shake");
        }, 1000);
      }

      return;
    }

    const originalImage = document.querySelector(".original-image");

    const objectURL = URL.createObjectURL(file);
    originalImage.src = objectURL;

    originalImage.onload = async () => {
      console.log("hey2");
      const origImgWidth = originalImage.width / 3;
      const origImgHeight = originalImage.height / 3;
      console.log(origImgHeight);

      let formData = new FormData();
      formData.append("file", fileInput.files[0]);

      try {
        const response = await fetch("http://127.0.0.1:80/upload", {
          method: "POST",
          body: formData,
        });
        const json = await response.json();

        console.log(json);
        if (json.status === "success") {
          const imageUrl = json.data.image_url;

          const processedImage = document.getElementById("processed-image");
          processedImage.src = imageUrl;
          processedImage.width = origImgWidth;
          processedImage.height = origImgHeight;
        }
      } catch (e) {
        console.log("Error: ", e);
      }
    };
  });
