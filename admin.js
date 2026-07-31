const titleInput = document.getElementById("productTitle");
const priceInput = document.getElementById("productPrice");
const addButton = document.getElementById("addProduct");

const productContainer = document.getElementById("adminProducts");
const activityContainer = document.getElementById("activityLog");

const totalProductsEl = document.getElementById("totalProducts");
const totalValueEl = document.getElementById("totalValue");
const totalActionsEl = document.getElementById("totalActions");

let products = [];

let editingProductId = null;

let activityLog = [];

async function getAdminProducts() {

    try {

        const response = await fetch(
            "https://dummyjson.com/products"
        );

        const data = await response.json();

        products = data.products;

        displayAdminProducts();


    } catch (error) {

        console.log(error);
    }
}

function displayAdminProducts() {

    productContainer.innerHTML = "";

    updateSummary();

    products.forEach(product => {

        const card = document.createElement("div");

        card.className =
            "border border-teal-100 bg-white shadow rounded-xl p-4 mb-4 flex gap-4 items-center";


        card.innerHTML = `

            <img src="${product.thumbnail}" alt="${product.title}"
                class="w-16 h-16 object-cover rounded-lg border border-teal-100">

            <div class="flex-1">
                <h3 class="font-bold text-teal-900">
                    ${product.title}
                </h3>

                <p class="text-teal-700">
                    $${product.price}
                </p>
            </div>

            <div class="flex gap-2">
                <button class="edit-btn border border-teal-700 text-teal-800 font-medium px-3 py-1.5 rounded hover:bg-teal-50 text-sm">
                    Edit
                </button>

                <button class="patch-btn border border-amber-600 text-amber-700 font-medium px-3 py-1.5 rounded hover:bg-amber-50 text-sm">
                    Price update
                </button>

                <button class="delete-btn bg-red-600 text-white font-medium px-3 py-1.5 rounded hover:bg-red-700 text-sm">
                    Delete
                </button>
            </div>

        `;

        //  edit
        card.querySelector(".edit-btn")
            .addEventListener("click", () => {

                startEdit(product.id);

            });

        // PATCH
        card.querySelector(".patch-btn")
            .addEventListener("click", () => {

                quickUpdatePrice(product.id);

            });

        // DELETE 

        card.querySelector(".delete-btn")
            .addEventListener("click", () => {

                deleteProduct(product.id);

            });



        productContainer.appendChild(card);
    });
}

function updateSummary() {

    totalProductsEl.innerText = products.length;

    const totalValue = products.reduce(
        (sum, product) => sum + product.price,
        0
    );

    totalValueEl.innerText = `$${totalValue.toFixed(2)}`;

    totalActionsEl.innerText = activityLog.length;

}


// post
async function addProduct() {

    const newProduct = {
        title: titleInput.value,
        price: Number(priceInput.value),

        thumbnail:
            "https://placehold.co/300x300"

    };
    try {
        const response = await fetch(

            "https://dummyjson.com/products/add",

            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"

                },

                body: JSON.stringify(newProduct)

            }

        );

        const data = await response.json();


        products.push(data);

        displayAdminProducts();

        addActivity(
            `Added ${data.title}`
        );

        clearForm();

    } catch (error) {

        console.log(error);

    }
}

function startEdit(id) {

    const product = products.find(
        product => product.id === id
    );

    titleInput.value = product.title;

    priceInput.value = product.price;

    editingProductId = id;

    addButton.textContent =
        "Update Product";
}

// put
async function updateProduct() {

    const updatedProduct = {

        title: titleInput.value,

        price: Number(priceInput.value)
    };

    try {
        const response = await fetch(

            `https://dummyjson.com/products/${editingProductId}`,

            {
                method: "PUT",

                headers: {

                    "Content-Type": "application/json"
                },

                body: JSON.stringify(updatedProduct)

            }
        );

        const data = await response.json();
        const index = products.findIndex(

            product =>
                product.id === editingProductId

        );

        products[index] = {

            ...products[index],

            ...data
        };

        displayAdminProducts();

        addActivity(
            `Updated ${data.title}`
        );

        clearForm();

    } catch (error) {

        console.log(error);

    }
}
// patch

async function quickUpdatePrice(id) {

    const newPrice = prompt(
        "Enter new price"
    );

    if (!newPrice) return;
    const product = products.find(

        product => product.id === id
    );

    const oldPrice = product.price;

    product.price = Number(newPrice);

    displayAdminProducts();

    try {
        const response = await fetch(

            `https://dummyjson.com/products/${id}`,

            {

                method: "PATCH",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    price: Number(newPrice)
                })
            }
        );

        const data = await response.json();
        addActivity(

            `Changed price of ${data.title}`
        );

    } catch (error) {
        product.price = oldPrice;

        displayAdminProducts();

        console.log(error);
    }
}

async function deleteProduct(id) {
    const deletedProduct =
        products.find(

            product => product.id === id

        );

    const backup = [...products];

    products = products.filter(

        product => product.id !== id

    );

    displayAdminProducts();

    try {

        await fetch(

            `https://dummyjson.com/products/${id}`,

            {
                method: "DELETE"
            }
        );

        addActivity(

            `Deleted ${deletedProduct.title}`
        );

    } catch (error) {
        // rollback

        products = backup;

        displayAdminProducts();

        console.log(error);
    }
}

function addActivity(message) {

    activityLog.push({
        message,
        time: new Date().toLocaleTimeString()
    });

    displayActivity();

    updateSummary();
}

function displayActivity() {

    activityContainer.innerHTML = "";

    [...activityLog].reverse().forEach(activity => {

        activityContainer.innerHTML += `

            <div class="flex justify-between items-center bg-teal-50 border border-teal-100 rounded-lg px-3 py-2 mb-2 text-sm">
                <p class="text-teal-900">
                    ${activity.message}
                </p>
                <span class="text-teal-500 text-xs">
                    ${activity.time}
                </span>
            </div>
        `;
    });
}

function clearForm() {
    titleInput.value = "";

    priceInput.value = "";

    editingProductId = null;

    addButton.textContent =
        "Add Product";
}

addButton.addEventListener(
    "click",
    () => {

        if (editingProductId === null) {

            addProduct();
        }

        else {

            updateProduct();
        }
    });

getAdminProducts();