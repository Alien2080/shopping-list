class Item {
    constructor(
        name,
        amount = '1',
        category = 'aisles',
        // enteredBy = auth.user ? email : ''
    ) {
        this.name = name
        if (amount) {
            this.amount = amount
        }
        else {
            this.amount = '1'
        }
        if (category) {
            this.category = category
        }
        else {
            this.category = 'aisles'
        }
        // this.enteredBy = enteredBy
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
        const sortOrder = ['fruit', 'deli', 'meat', 'dairy', 'aisles', 'baby', 'freezer']
        this.items.sort((a, b) => {
            if (sortOrder.indexOf(a.category) === sortOrder.indexOf(b.category)) {
                if (a.name < b.name) {
                    return -1;
                }
                if (a.name > b.name) {
                    return 1;
                }
                return 0;
            }
            else {
                return sortOrder.indexOf(a.category) - sortOrder.indexOf(b.category)
            }
        })
    }
}

// UI
function createItem(item) {
    const itemDiv = document.createElement('div')
    const itemName = document.createElement('p')
    const itemAmount = document.createElement('p')
    const itemCategory = document.createElement('p')

    const deleteIcon = document.createElement('span')
    deleteIcon.classList.add('material-icons')
    deleteIcon.textContent = 'delete'
    deleteIcon.addEventListener('click', (e) => {
        itemDiv.remove()
        list.removeItem(itemName.textContent)
        if (auth.currentUser) {
            removeItemFromDB(itemName.textContent)
        } else {
            saveLocal()
        }
               
    })

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

    itemDiv.addEventListener("click", () => {
        itemDiv.classList.toggle('strikthrough')
    })

    itemDiv.appendChild(itemName)
    itemDiv.appendChild(itemAmount)
    itemDiv.appendChild(itemCategory)
    itemDiv.appendChild(deleteIcon)
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
    const name = document.getElementById('inputName')
    const amount = document.getElementById('inputAmount')
    const category = document.getElementById('inputCategory')
    const newItem = new Item(name.value, amount.value, category.value)

    if (list.isOnList(newItem)) {
        alert("Item already on list")
    }
    list.addItem(newItem)

    if (auth.currentUser) {
        saveItemToDB(newItem)
    } else {
        saveLocal()

    }

    updateShoppingList()
}

function resetShoppingList() {
    shoppingListDiv.innerHTML = ''
    shoppingListDiv.appendChild(createFormHtml())
}

function clearList() {
    list = new ShoppingList()
    if (auth.currentUser) removeListFromDB()
    updateShoppingList()
}

function createFormHtml() {
    const form = document.createElement('form')
    const name = document.createElement('input')
    const amount = document.createElement('input')
    const category = document.createElement('select')
    const submit = document.createElement('input')

    form.id = 'inputForm'

    name.id = 'inputName'
    name.type = 'text'
    name.classList.add('input-name')
    name.placeholder = 'Add Item?'

    amount.id = 'inputAmount'
    amount.type = 'text'
    amount.classList.add('input-amount')
    amount.placeholder = '1'

    category.id = 'inputCategory'
    category.classList.add('input-category')
    // Add options for the dropdown
    const categoryOptions = ['fruit', 'meat', 'deli', 'aisles', 'dairy', 'baby', 'freezer'];
    categoryOptions.forEach((option) => {
        const categoryOption = document.createElement('option');
        categoryOption.value = option;
        categoryOption.textContent = option.charAt(0).toUpperCase() + option.slice(1);
        category.appendChild(categoryOption);
    });
    category.value = 'aisles';  // Set default value to 'aisles'

    name.addEventListener('blur', submitForm)
    amount.addEventListener('blur', submitForm)
    category.addEventListener('blur', submitForm)

    submit.type = 'submit'
    submit.hidden = true

    form.appendChild(name)
    form.appendChild(amount)
    form.appendChild(category)
    form.appendChild(submit)

    return form
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

function openAccountModal() {
    accountModal.classList.add('active')
    overlay.classList.add('active')
}

function closeAccountModal() {
    accountModal.classList.remove('active')
    overlay.classList.remove('active')
}

function closeAllModals() {
    closeAccountModal()
}

function submitForm() {
    addItem()
}

function handleKeyboardInput(e) {
    if (e.key === 'Enter') addItem()
}

// Local Storage functions.
function saveLocal() {
    localStorage.setItem('shopping-list', JSON.stringify(list.items))
}

function restoreLocal() {
    const newList = JSON.parse(localStorage.getItem('shopping-list'))
    if (newList) {
        list.items = newList.map((item) => JSONToItem(item))
    } else {
        list.items = []
    }
    updateShoppingList()
}


// FireStore.
// Auth
function saveItemToDB(item) {
    db.collection('shopping-list').add({
        ownerID: auth.currentUser.uid,
        name: item.name,
        amount: item.amount,
        category: item.category,
        // enteredBy: item.enteredBy,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
}

async function removeItemFromDB(name) {
    db.collection('shopping-list').doc(await getItemIDFromName(name)).delete()
    updateShoppingList()
}

async function removeListFromDB() {
    let snapshot = await db.collection('shopping-list')
        .where('ownerID', '==', auth.currentUser.uid)
        .get()
    snapshot.forEach((doc) => {
        doc.ref.delete()    
    })
    updateShoppingList()
}

async function getItemIDFromName(name) {
    const snapshot = await db
        .collection('shopping-list')
        .where('name', '==', name)
        .where('ownerID', '==', auth.currentUser.uid)
        .get()
    if (snapshot.docs.length > 1) {
        throw "more than 1 item with name in collection"
    }
    const itemID = snapshot.docs.map((doc) => doc.id).join('')
    return itemID
}

async function getItemsFromDB() {
    let snapshot = await db.collection('shopping-list').get()

    list.items = snapshot.docs.map((doc) => new Item(
        doc.data().name,
        doc.data().amount,
        doc.data().category
        // doc.data().enteredBy
    ))

    updateShoppingList()
}



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
                doc.data().amount,
                doc.data().category
                // doc.data().enteredBy
            ))
            updateShoppingList()
        })
}

// Helper functions.
function JSONToItem(item) {
    return new Item(item.name, item.amount, item.category, item.enteredBy)
}


// Main script.
// Global variables.

// Firebase and auth
const auth = firebase.auth()
const db = firebase.firestore()
let unsubscribe

let list = new ShoppingList()

const shoppingListDiv = document.getElementById('shoppingList')
const logInBtn = document.getElementById('logInBtn')
const logOutBtn = document.getElementById('logOutBtn')
const accountBtn = document.getElementById('accountBtn')
const accountModal = document.getElementById('accountModal')
const overlay = document.getElementById('overlay')
const loggedIn = document.getElementById('loggedIn')
const loggedOut = document.getElementById('loggedOut')
const loadingRing = document.getElementById('loadingRing')

// Events.
overlay.onclick = closeAllModals
accountBtn.onclick = openAccountModal
window.onkeydown = handleKeyboardInput
logInBtn.onclick = signIn
logOutBtn.onclick = signOut


auth.onAuthStateChanged(async (user) => {
    if (user) {
        setupRealTimeListener()
    } else {
        if (unsubscribe) unsubscribe()
        restoreLocal()
        updateShoppingList()
    }
    setupAccountModal(user)
    setupNavbar(user)
})
