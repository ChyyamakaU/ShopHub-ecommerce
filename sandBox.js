const productContainer = document.getElementById("products");
const categoryContainer = document.getElementById("categories");

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchProduct");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

// Display products
function displayProducts(products) {

    productContainer.innerHTML = "";

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

            <button class="mt-3 bg-teal-700 text-white px-4 py-2 rounded">
                View Details
            </button>
        `;

        productContainer.appendChild(card);

    });

}


// Get all products


async function getProducts() {

    try {

  
        const response = await fetch("https://dummyjson.com/products");

        const data = await response.json();

        displayProducts(data.products);

    } catch (error) {

        console.log(error);

    }

}


// Search products
async function searchProducts(searchTerm) {

    try {

        const response = await fetch(
            `https://dummyjson.com/products/search?q=${searchTerm}`
        );

        const data = await response.json();

        displayProducts(data.products);

    } catch (error) {

        console.log(error);

    }

}



searchButton.addEventListener("click", () => {

    const searchTerm = searchInput.value;

    searchProducts(searchTerm);

});


// Get categories
async function getCategories() {

    try {

        const response = await fetch(
            "https://dummyjson.com/products/categories"
        );

        const categories = await response.json();


        categories.forEach(category => {

            const button = document.createElement("button");

            button.innerText = category.name;

            button.className =
                "bg-teal-800 text-white px-4 py-2 rounded";


            button.addEventListener("click", () => {

                getProductsByCategory(category.slug);

            });


            categoryContainer.appendChild(button);

        });


    } catch (error) {

        console.log(error);

    }

}


// Get products by category
async function getProductsByCategory(category) {

    try {

        const response = await fetch(
            `https://dummyjson.com/products/category/${category}`
        );

        const data = await response.json();

        displayProducts(data.products);

    } catch (error) {

        console.log(error);

    }

}

getProducts();
getCategories();






nextBtn.addEventListener("click", () => {

    currentPage++;

    getProducts();

});


prevBtn.addEventListener("click", () => {

    if (currentPage > 1) {

        currentPage--;

        getProducts();

    }

});