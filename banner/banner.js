/**
 * This file contains the js code for the banners inside the iframe. This is not the code to embed the banner!
 */

var BASE_URL = "https://www.digitalstreik.fridaysforfuture.de";

function initalizeCloseButton() {
  window.addEventListener("message", function (message) {
    if (
      message.data.FRIDAYS_FOR_FUTURE_BANNER &&
      message.data.action === "create_close_button"
    ) {
      var buttonWrapper = document.getElementById("close-button");
      buttonWrapper.hidden = false;
    }
  });

  function handleCloseEvent(event) {
    event.preventDefault();
    event.stopPropagation();
    window.parent.postMessage(
      {
        FRIDAYS_FOR_FUTURE_BANNER: true,
        action: "close",
      },
      "*"
    );
  }

  var button = document.getElementById("close-button");
  button.addEventListener("click", handleCloseEvent);
  button.addEventListener("tap", handleCloseEvent);
  button.addEventListener("keydown", handleCloseEvent);
}


function loadImages() {
  return fetch(BASE_URL + "/rest/banner")
    .then(function (res) {
      return res.json();
    })
}

/**
 * Selects a random image from the array.
 */
function randomImage(images) {
  return images[Math.floor(Math.random() * images.length)];
}

/**
 * Use some of the given images for the banner.
 */
function updateImages(images) {
  var imageElements = document.getElementsByClassName("updatableImage")

  for (var imageElement of imageElements) {
    imageElement.style.backgroundImage =
      "url('" + BASE_URL + randomImage(images).imagePath + "')";
  }
}

function showOverlay() {
  document.getElementById("overlay").style.display = "block";
}

function initialize() {
  initalizeCloseButton();

  window.parent.postMessage(
    {
      FRIDAYS_FOR_FUTURE_BANNER: true,
      action: "loaded",
    },
    "*"
  );

  loadImages().then(function (images) {
    updateImages(images);
    showOverlay();

    window.setInterval(function () {
      updateImages(images);
    }, 15000);
  });
}

initialize();
