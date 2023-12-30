class Item {
    constructor(name, category, amount, enteredBy) {
        this.name = name,
        this.category = category,
        this.amount = amount,
        this.enteredBy = enteredBy
    }  
}

class ShoppingList {
    constructor() {
        this.items = []
    }

    addItem(newItem) {
        if (!this.isOnList(newItem)) {
            this.items.push(newItem)
        }
    }

    removeItem(itemName) {
        this.items = this.items.filter((item) => item.name !== itemName)
    }

    getItem(itemName) {
        return this.items.find((item) => item.name === itemName)
    }

    isOnList(itemToCheck) {
        return this.items.some((item) => item.name === itemToCheck.name)
    }
}

// UI
function setupNavbar(user) {
    if (user) {
        loggedIn.classList.add('active')
        loggedOut.classList.remove('active')
    } else {
        loggedIn.classList.remove('active')
        loggedOut.classList.add('active')
    }
    loadingRing.classList.remove('active')
}

function setupAccountModal(user) {
    if (user) {
        accountModal.innerHTML = `
        <p>Logged in as</p>
        <p><strong>${user.email.split('@')[0]}</strong></p>`
    } else {
        accountModal.innerHTML = ''
    }
}

// FireStore.
// Auth
const auth = firebase.auth()
const list = new ShoppingList()

function signIn() {
    const provider = new firebase.auth.GoogleAuthProvider()
    auth.signInWithPopup(provider)
}

function signOut() {
    auth.signOut()
}

function setupRealTimeListener() {
    unsubscribe = db
        .collection('shopping-list')
        .where('ownerID', '==', auth.currentUser.uid)
        .orderBy('createdAt')
        .onSnapshot((snapshot) => {
            list.items = snapshot.docs.map((doc) => new Item(
                doc.data().name,
                doc.data().category,
                doc.data().amount,
                doc.data().enteredBy
            ))
            updateBookGrid()
        })
}

// Main script.
// Global variables.

// Firebase and auth
const db = firebase.firestore()
let unsubscribe


// Events.

// restoreLocal()
// getBooksFromDB()

auth.onAuthStateChanged(async (user) => {
    if (user) {
        setupRealTimeListener()
    } else {
        if (unsubscribe) unsubscribe()

    }
    setupAccountModal(user)
    setupNavbar(user)
})