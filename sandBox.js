const productContainer = document.getElementById("products");
const categoryContainer = document.getElementById("categories");

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchProduct");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageInfo = document.getElementById("pageInfo"); 

const cartButton = document.getElementById("cartButton");
const cartCount = document.getElementById("cartCount");
const cartPanel = document.getElementById("cartPanel");
const closeCartBtn = document.getElementById("closeCartBtn");
const cartItemsContainer = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            thumbnail: product.thumbnail,
            quantity: 1
        });
    }

    saveCart();
    renderCart();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
}

function updateQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }

    item.quantity = newQuantity;
    saveCart();
    renderCart();
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function getCartItemCount() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function renderCart() {

    cartCount.innerText = getCartItemCount();

    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<p class="text-gray-500 text-sm">Your cart is empty.</p>`;
    } else {
        cart.forEach(item => {
            const row = document.createElement("div");
            row.className = "flex items-center gap-3 border-b py-3";

            row.innerHTML = `
                <img src="${item.thumbnail}" alt="${item.title}" class="w-14 h-14 object-cover rounded">
                <div class="flex-1">
                    <p class="font-medium text-sm">${item.title}</p>
                    <p class="text-gray-600 text-sm">$${item.price} x ${item.quantity}</p>
                </div>
                <div class="flex items-center gap-2">
                    <button class="decrease-btn border rounded px-2">-</button>
                    <span>${item.quantity}</span>
                    <button class="increase-btn border rounded px-2">+</button>
                    <button class="remove-btn text-red-600 ml-2">Remove</button>
                </div>
            `;

            row.querySelector(".decrease-btn").addEventListener("click", () => {
                updateQuantity(item.id, item.quantity - 1);
            });

            row.querySelector(".increase-btn").addEventListener("click", () => {
                updateQuantity(item.id, item.quantity + 1);
            });

            row.querySelector(".remove-btn").addEventListener("click", () => {
                removeFromCart(item.id);
            });

            cartItemsContainer.appendChild(row);
        });
    }

    cartTotalEl.innerText = `$${getCartTotal().toFixed(2)}`;
}


cartButton.addEventListener("click", () => {
    cartPanel.classList.remove("hidden");
});

closeCartBtn.addEventListener("click", () => {
    cartPanel.classList.add("hidden");
});

let currentPage = 1;
const limit = 20;
let totalProducts = 0;
let currentCategory = null;
let currentSearchTerm = null; 

function getSkip() {
    return (currentPage - 1) * limit;
}

function updatePaginationControls() {
    const totalPages = Math.max(1, Math.ceil(totalProducts / limit));

    if (pageInfo) {
        pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;
    }

    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
}

function displayProducts(products) {

    productContainer.innerHTML = "";

    if (products.length === 0) {
        productContainer.innerHTML = `<p class="col-span-full text-center text-gray-500">No products found.</p>`;
        return;
    }

    products.forEach(product => {

        const card = document.createElement("div");

        card.className = "bg-white rounded-lg shadow p-4";

        card.innerHTML = `
            <img src="${product.thumbnail}" 
                 alt="${product.title}" 
                 class="w-full h-48 object-cover rounded">

            <h2 class="text-xl font-bold mt-3">
                ${product.title}
            </h2>

            <p class="text-gray-600">
                $${product.price}
            </p>

            <div class="flex gap-2 mt-3">
                <button class="view-details-btn flex-1 bg-teal-700 text-white px-4 py-2 rounded">
                    View Details
                </button>
                <button class="add-to-cart-btn flex-1 bg-white text-teal-700 border-4 border-teal-900 px-4 py-2 rounded">
                    Add to cart
                </button>
            </div>
        `;

        const detailBtn = card.querySelector(".view-details-btn");
        detailBtn.addEventListener("click", () => {
            showProductDetail(product.id);
        });

        const addToCartBtn = card.querySelector(".add-to-cart-btn");
        addToCartBtn.addEventListener("click", () => {
            addToCart(product);

         
            addToCartBtn.innerText = "Added!";
            setTimeout(() => {
                addToCartBtn.innerText = "Add to cart";
            }, 1000);
        });

        productContainer.appendChild(card);
    });
}

async function getProducts() {

    try {

        const response = await fetch(
            `https://dummyjson.com/products?limit=${limit}&skip=${getSkip()}`
        );

        const data = await response.json();

        totalProducts = data.total;

        displayProducts(data.products);
        updatePaginationControls();

    } catch (error) {
        console.log(error);
    }
}

// search bar
async function searchProducts(searchTerm) {

    try {

        const response = await fetch(
            `https://dummyjson.com/products/search?q=${encodeURIComponent(searchTerm)}&limit=${limit}&skip=${getSkip()}`
        );

        const data = await response.json();

        totalProducts = data.total;

        displayProducts(data.products);
        updatePaginationControls();

    } catch (error) {

        console.log(error);

    }
}

searchButton.addEventListener("click", () => {

    const searchTerm = searchInput.value.trim();

    if (!searchTerm) return;

    currentPage = 1;
    currentCategory = null;
    currentSearchTerm = searchTerm;

    searchProducts(searchTerm);

});

// categories
async function getCategories() {

    try {

        const response = await fetch(
            "https://dummyjson.com/products/categories"
        );

        const categories = await response.json();

        categoryContainer.innerHTML = ""; 

        const allBtn = document.createElement("button");
        allBtn.innerText = "All";
        allBtn.className = "bg-teal-900 text-white px-4 py-2 rounded cursor-pointer";
        allBtn.addEventListener("click", () => {
            currentCategory = null;
            currentSearchTerm = null;
            currentPage = 1;
            setActiveCategoryButton(allBtn);
            getProducts();
        });
        categoryContainer.appendChild(allBtn);

        categories.forEach(category => {

            const button = document.createElement("button");

            button.innerText = category.name;

            button.className =
                "bg-teal-800 text-white px-4 py-2 rounded cursor-pointer";

            button.addEventListener("click", () => {
                currentCategory = category.slug;
                currentSearchTerm = null;
                currentPage = 1;
                setActiveCategoryButton(button);
                getProductsByCategory(category.slug);
            });

            categoryContainer.appendChild(button);

        });


    } catch (error) {

        console.log(error);
    }
}


function setActiveCategoryButton(activeBtn) {
    const buttons = categoryContainer.querySelectorAll("button");
    buttons.forEach(btn => btn.classList.remove("ring-2", "ring-offset-2", "ring-teal-500"));
    activeBtn.classList.add("ring-2", "ring-offset-2", "ring-teal-500");
}


async function getProductsByCategory(category) {

    try {

        const response = await fetch(
            `https://dummyjson.com/products/category/${category}?limit=${limit}&skip=${getSkip()}`
        );

        const data = await response.json();

        totalProducts = data.total;

        displayProducts(data.products);
        updatePaginationControls();

    } catch (error) {

        console.log(error);

    }

}

async function showProductDetail(id) {

    try {

        const response = await fetch(`https://dummyjson.com/products/${id}`);
        const product = await response.json();

     
        alert(`${product.title}\n\n${product.description}\n\nPrice: $${product.price}`);

    } catch (error) {

        console.log(error);

    }

}

function goToNextPage() {
    currentPage++;
    refetchCurrentView();
}

function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        refetchCurrentView();
    }
}

function refetchCurrentView() {
    if (currentSearchTerm) {
        searchProducts(currentSearchTerm);
    } else if (currentCategory) {
        getProductsByCategory(currentCategory);
    } else {
        getProducts();
    }
}

nextBtn.addEventListener("click", goToNextPage);
prevBtn.addEventListener("click", goToPrevPage);

getProducts();
getCategories();
renderCart();