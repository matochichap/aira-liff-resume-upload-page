import './index.css'
import liff from '@line/liff'

var axios = require("axios")
var RESUME_UPLOAD_ENDPOINT = "https://aira-dev-fn-line-changefeed.azurewebsites.net/api/resume/upload/"

var status = document.getElementById("status")
var warn = document.getElementById("warn")
var form = document.getElementById("form")
var fileUploadInput = document.getElementById("fileUploadInput")
var fileUploadBtn = document.getElementById("fileUploadBtn")
var spinWrapper = document.querySelector(".spin-wrapper")

document.addEventListener("DOMContentLoaded", () => {
  liff
    .init({ liffId: process.env.LIFF_ID })
    .then(() => {
        if (!liff.isLoggedIn()) {
            liff.login()
      }})
    .then(() => {
        console.log("LIFF init success.")
    })
    .catch((error) => {
        console.log(error)
    })
})

// manage states

var setInvalidFileTypeState = () => {
    warn.textContent = "Please upload a pdf file."
    warn.classList.remove("hidden")
}

var setUploadState = () => {
    status.textContent = "Uploading..."
    warn.textContent = "Do not close the window!"
    warn.classList.remove("hidden")
    fileUploadInput.classList.add("hidden")
    fileUploadBtn.classList.add("hidden")
    spinWrapper.classList.remove("hidden")
}

var setCompletedState = () => {
    status.textContent = "Upload complete!"
    warn.textContent = "Aira will send the resume feedback shortly."
    spinWrapper.classList.add("hidden")
}

var setErrorState = () => {
    status.textContent = "An error occured, please try again."
    warn.classList.add("hidden")
    fileUploadInput.classList.add("hidden")
    fileUploadBtn.classList.add("hidden")
    spinWrapper.classList.add("hidden")
}

var getUserId = async () => {
    try {
        const profile = await liff.getProfile()
        return profile.userId
    } catch (err) {
        console.log(err)
    }
}

var printUserId = async () => {
    console.log(await getUserId())
}

var uploadFile = async (formData) => {
    console.log("Started upload")
    const userId = await getUserId()
    const res = await axios.post(`${RESUME_UPLOAD_ENDPOINT}${userId}`, formData)
    console.log(res)
    console.log("Completed upload")
}

var delayCloseWindow = async (delay) => {
    await new Promise((resolve) => setTimeout(resolve, delay))
    console.log("closing window")
    liff.closeWindow()
}

form.addEventListener("submit", e => {
    e.preventDefault()
    const formData = new FormData()
    const file = fileUploadInput.files[0]
    const extension = file.name.split(".").pop().toLowerCase()
    // // restrict to only pdf
    // if (extension !== "pdf") {
    //     setInvalidFileTypeState()
    //     return
    // }
    formData.append(file.name, file)
    liff.ready
    .then(() => setUploadState())
    .then(() => uploadFile(formData))
    .then(() => setCompletedState())
    .catch(err => {
        console.error(err)
        setErrorState()
    })
})