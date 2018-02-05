// Register service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js")
    .then(registration => {
      console.log("[ServiceWorker] Registered", registration.scope)
    })
    .catch(err => {
      console.log("[ServiceWorker] Register failed", err)
    })
}

// Setup IndexedDB
var db = new Dexie("database")
db.version(1).stores({
  contacts: "name,email,phone"
})

// Add close button for toastr
toastr.options.closeButton = true

// Detect when switching between online and offline
window.addEventListener("offline", event => {
  toastr.info("You are offline, but you can keep on working")
  $("#search input, #search button").prop("disabled", true)
})
window.addEventListener("online", event => {
  $("#search input, #search button").prop("disabled", false)
  toastr.info("You are back online")
  db.contacts.count()
    .then(function (count) {
      if (!count) {
        return
      }
      db.contacts.each(saveContact)
        .then(() => {
          db.contacts.clear()
          toastr.info(`Sent ${count} offline telephone number/s`)
        }).catch(() => {
          toastr.error("There was an error when sending offline telephone numbers")
        })
    })
})

function saveContact(contact) {
  return $.post("/api/contacts", contact)
}

function createContact() {
  var contact = {}
  // Save each input as an attribute of the contact
  $("form#new-contact input").each(function () {
    contact[this.name] = this.value
  })

  // If online, post directly to the API
  if (navigator.onLine) {
    saveContact(contact)
  } else { // Otherwise store it in IndexedDB
    db.contacts.put(contact)
      .then(() => {
        toastr.info("Telephone number stored locally. It will be sent when you're back online")
      })
      .catch(err => {
        console.error(err)
        toastr.error("Could not save telephone number locally. Please go online.")
      })
  }

  // Prevent form submission and page reload
  return false
}
