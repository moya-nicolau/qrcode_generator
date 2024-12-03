const homeElement = document.getElementById("home");
const qrCodeElement = document.getElementById("qrcode");
const inputElement = document.getElementById("input-field");
const firstStepElement = document.getElementById("first-step");
const secondStepElement = document.getElementById("second-step");
const shareButtonElement = document.getElementById("share-button");
const submitButtonElement = document.getElementById("submit-button");
const errorMessageElement = document.getElementById("error-message");
const downloadButtonElement = document.getElementById("download-button");
const shareButtonTextElement = document.getElementById("share-button-text");
const shareButtonIconElement = document.getElementById("share-button-icon");

let qrCode = null;
let qrCodeText = null;

function isUrlValid(userInput) {
  const regexQuery = "^(https?:\\/\\/)?((([-a-z0-9]{1,63}\\.)*?[a-z0-9]([-a-z0-9]{0,253}[a-z0-9])?\\.[a-z]{2,63})|((\\d{1,3}\\.){3}\\d{1,3}))(:\\d{1,5})?((\\/|\\?)((%[0-9a-f]{2})|[-\\w\\+\\.\\?\\/@~#&=])*)?$";
  const url = new RegExp(regexQuery,"i");

  return url.test(userInput);
}

function addWhiteBorderToQRCode(canvas, borderSize) {
  const originalWidth = canvas.width;
  const originalHeight = canvas.height;

  const newCanvas = document.createElement("canvas");
  const newContext = newCanvas.getContext("2d");

  newCanvas.width = originalWidth + borderSize * 2;
  newCanvas.height = originalHeight + borderSize * 2;

  newContext.fillStyle = "#ffffff";
  newContext.fillRect(0, 0, newCanvas.width, newCanvas.height);

  newContext.drawImage(canvas, borderSize, borderSize);

  return newCanvas;
}

async function copyQRCodeToClipboard(canvasElement) {
  try {
    let intervalId = null;

    const canvasWithBorder = addWhiteBorderToQRCode(canvasElement, 20);

    const blob = await new Promise(resolve => canvasWithBorder.toBlob(resolve, "image/png"));

    const clipboardItem = new ClipboardItem({ "image/png": blob });

    await navigator.clipboard.write([clipboardItem]);

    shareButtonTextElement.textContent = 'Copied!'
    shareButtonIconElement.style.display = 'none';

    intervalId = setInterval(() => {
      clearInterval(intervalId);

      shareButtonTextElement.textContent = 'Copy'
      shareButtonIconElement.style.display = 'inline-block';
    }, 3000)
  } catch (error) {
    alert(`Falha ao copiar QR Code: ${error}`);
  }
}

submitButtonElement.addEventListener("click", () => {
  if(!isUrlValid(inputElement.value)) return errorMessageElement.style.display = "inline-block";

  firstStepElement.style.display = "none";
  secondStepElement.style.display = "flex";
  
  if(qrCode) return qrCode.makeCode(inputElement.value);

  const size = Math.min(window.innerWidth, window.innerHeight) * 0.30;

  qrCodeText = inputElement.value;

  qrCode = new QRCode(qrCodeElement, {
    text: inputElement.value,
    width: size,
    height: size,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
  })
})

inputElement.addEventListener("keypress", (event) => {
  if(event.key != 'Enter') return;

  submitButtonElement.click();
})

inputElement.addEventListener("input", (event) => {
  if(isUrlValid(event.target.value)) return errorMessageElement.style.display = "none";

  errorMessageElement.style.display = "inline-block";
})

downloadButtonElement.addEventListener("click", () => {
  const canvasElement = qrCodeElement.querySelector("canvas");

  if (canvasElement) {
    const canvasWithBorder = addWhiteBorderToQRCode(canvasElement, 20);
    const dataUrl = canvasWithBorder.toDataURL("image/png");

    const sanitizedFilename = qrCodeText.replace(/[^a-zA-Z0-9_\-\.]/g, "_");
    const link = document.createElement("a");
    
    link.href = dataUrl;
    link.download = `${sanitizedFilename || "qrcode"}.png`;
    link.click();
  } else {
    alert("QR Code não encontrado!");
  }
});

shareButtonElement.addEventListener("click", async () => {
  const canvasElement = qrCodeElement.querySelector("canvas");

  if (canvasElement) {
    copyQRCodeToClipboard(canvasElement);
  } else {
    alert("QR Code não encontrado!");
  }
});

homeElement.addEventListener("click", () => {
  firstStepElement.style.display = "flex";
  secondStepElement.style.display = "none";
  qrCode.clear();
});