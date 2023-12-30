class Item {
    constructor(name, amount, category, enteredBy = auth.user ? email : '') {
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

    sortByCategory() {
        const sortOrder = ['fruit', 'meat', 'deli', 'aisles', 'dairy', 'baby', 'freezer']
        this.items.sort((a, b) => { return sortOrder.indexOf(a.category) - sortOrder.indexOf(b.category) })
    }

}

// UI
function createItem(item) {
    const itemDiv = document.createElement('div')
    const itemName = document.createElement('p')
    const itemAmount = document.createElement('p')
    const itemCategory = document.createElement('p')

    itemDiv.classList.add('item')
    itemName.classList.add('item-name')
    itemAmount.classList.add('item-amount')
    itemCategory.classList.add('item-category')

    itemName.textContent = item.name
    itemAmount.textContent = item.amount
    itemCategory.textContent = item.category

    switch (item.category) {
        case 'fruit':
            itemCategory.classList.add('cat-fruit')
            break
        case 'meat':
            itemCategory.classList.add('cat-meat')
            break
        case 'deli':
            itemCategory.classList.add('cat-deli')
            break
        case 'aisles':
            itemCategory.classList.add('cat-aisles')
            break
        case 'dairy':
            itemCategory.classList.add('cat-dairy')
            break
        case 'baby':
            itemCategory.classList.add('cat-baby')
            break

        case 'freezer':
            itemCategory.classList.add('cat-freezer')
            break

    }

    itemDiv.appendChild(itemName)
    itemDiv.appendChild(itemAmount)
    itemDiv.appendChild(itemCategory)
    shoppingListDiv.insertBefore(itemDiv, document.getElementById('inputForm'))
}

function updateShoppingList() {
    resetShoppingList()
    list.sortByCategory()
    for (let item of list.items) {
        createItem(item)
    }
}

function addItem() {
    // e.preventDefault()
    const item = new Item('test', 2, 'deli');

    list.addItem(item)
    updateShoppingList()
}

function resetShoppingList() {
    shoppingListDiv.innerHTML =
    `<form id="inputForm">
    <input type="text" class="input-name" id="inputName" placeholder="Add Item?">
    <input type="text" class="input-amount" id="inputAmount" placeholder="1">
    <input type="text" class="input-category" id="inputCategory" placeholder="aisles">
    <input type="submit" hidden="true"/>
</form>`

    inputForm = document.getElementById('inputForm')
    inputForm.onsubmit = addItem
}

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

function handleKeyboardInput(e) {
    if (e.key === 'Enter') addItem()
}

// FireStore.
// Auth


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
const auth = firebase.auth()
const db = firebase.firestore()
let unsubscribe

const list = new ShoppingList()

const shoppingListDiv = document.getElementById('shoppingList')
let inputForm = document.getElementById('inputForm')


// Events.
window.onkeydown = handleKeyboardInput
inputForm.onsubmit = addItem

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


// testing
list.addItem(new Item('milk', 200, 'dairy'))
list.addItem(new Item('nappies', 5, 'baby'))
list.addItem(new Item('ham', '200 grams', 'deli'))
list.addItem(new Item('chicken breast', 99, 'meat'))
list.addItem(new Item('ice cream', 99, 'freezer'))
list.addItem(new Item('rice', 99, 'aisles'))
list.addItem(new Item('apples', 99, 'fruit'))

updateShoppingList()
