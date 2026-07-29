const titleInput = document.getElementById("productTitle");
const priceInput = document.getElementById("productPrice");
const addButton = document.getElementById("addProduct");

let products = [];

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

    const container = document.getElementById("adminProducts");

    container.innerHTML = "";

    products.forEach(product => {

        container.innerHTML += `
            <div class="border p-4 rounded mb-3">
                <h3>${product.title}</h3>
                <p>$${product.price}</p>
            </div>
        `;

    });

}


async function addProduct() {

    if (titleInput.value.trim() === "" || priceInput.value.trim() === "") {
        alert("Please enter a product title and price.");
        return;
    }

    const newProduct = {

        title: titleInput.value,
        price: Number(priceInput.value)

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

        titleInput.value = "";
        priceInput.value = "";

        console.log("Product added:", data);

    } catch (error) {

        console.log(error);

    }

}
addButton.addEventListener("click", addProduct);

getAdminProducts();