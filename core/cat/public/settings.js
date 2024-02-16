const catChat = document.querySelector("#cat-chat")

catChat.settings = {
    authKey: 'meow',
    baseUrl: 'localhost',
    port: '1865',
    ws: {
        onFailed: (error) => {
            console.log(error.description)
        }
    },
    callback: (message) => {
        console.log("Callback called.")
        return `${message}`
    },
    defaults: ['Ci sono vulnerabilità su Kitty?', 'Quali sono le vulnerabilità di wireshark?'],
    features: ['reset'],
    files: [],
    why: true
}

catChat.addEventListener("message", ({ detail }) => {
    console.log("Message:", detail.text)
})

catChat.addEventListener("upload", ({ detail }) => {
    console.log("Uploaded content:", detail instanceof File ? detail.name : detail)
})

catChat.addEventListener("notification", ({ detail }) => {
    console.log("Notification:", detail.text)
})