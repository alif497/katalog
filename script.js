function getCart() {
    try {
        return JSON.parse(localStorage.getItem("keranjangElectronic")) || [];
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem("keranjangElectronic", JSON.stringify(cart));
}

function formatRupiah(harga) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(harga);
}

function updateCartCount() {
    const countElement = document.getElementById("cartCount");

    if (countElement) {
        const cart = getCart();
        const total = cart.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        countElement.textContent = total;
    }
}

function addProduct(button) {
    const card = button.closest(".detailcard");

    if (!card) return;

    const id = card.dataset.id;
    const name = card.dataset.name;
    const price = Number(card.dataset.price);

    // PERBAIKAN: ambil alamat gambar dari tag img halaman detail
    const imageElement = card.querySelector("img");
    const image = imageElement
        ? imageElement.getAttribute("src")
        : card.dataset.image;

    const quantityInput = card.querySelector(".quantityinput");
    const quantity = Number(quantityInput.value);

    if (!image) {
        alert("Gambar produk tidak ditemukan.");
        return;
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        alert("Masukkan jumlah produk antara 1 sampai 99.");
        return;
    }

    const cart = getCart();
    const existing = cart.find(item => item.id === id);

    if (existing) {
        if (existing.quantity + quantity > 99) {
            alert("Jumlah maksimum produk adalah 99.");
            return;
        }

        existing.quantity += quantity;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            image: image,
            quantity: quantity
        });
    }

    saveCart(cart);
    updateCartCount();

    alert(name + " berhasil ditambahkan ke keranjang.");
}

function renderCart() {
    const cartItems = document.getElementById("cartItems");

    if (!cartItems) return;

    const cart = getCart();
    cartItems.replaceChildren();

    let total = 0;

    if (cart.length === 0) {
        const message = document.createElement("p");
        message.textContent = "Keranjang belanja masih kosong.";
        cartItems.appendChild(message);
    }

    cart.forEach((item, index) => {
        total += item.price * item.quantity;

        const row = document.createElement("article");
        row.className = "cartitem";

        const image = document.createElement("img");

        // Alamat gambar yang tersimpan di keranjang
        image.src = item.image;
        image.alt = item.name;

        const info = document.createElement("div");
        info.className = "cartiteminfo";

        const name = document.createElement("h3");
        name.textContent = item.name;

        const price = document.createElement("p");
        price.textContent = formatRupiah(
            item.price * item.quantity
        );

        const quantity = document.createElement("p");
        quantity.textContent = "Jumlah: " + item.quantity;

        info.append(name, price, quantity);

        const removeButton = document.createElement("button");
        removeButton.className = "removebutton";
        removeButton.textContent = "Hapus";

        removeButton.addEventListener("click", function () {
            const updatedCart = getCart();
            updatedCart.splice(index, 1);

            saveCart(updatedCart);
            renderCart();
            updateCartCount();
        });

        row.append(image, info, removeButton);
        cartItems.appendChild(row);

        // Tampilkan jika alamat gambar memang tidak ditemukan
        image.addEventListener("error", function () {
            console.error(
                "Gambar gagal dimuat:",
                item.image
            );
        });
    });

    const totalElement = document.getElementById("cartTotal");

    if (totalElement) {
        totalElement.textContent = formatRupiah(total);
    }

    const checkoutButton = document.getElementById("checkoutButton");

    if (checkoutButton) {
        checkoutButton.disabled = cart.length === 0;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    updateCartCount();
    renderCart();

    const searchInput = document.getElementById("searchInput");
    const sortSelect = document.getElementById("sortSelect");
    const productGrid = document.getElementById("productGrid");
    const resultCount = document.getElementById("resultCount");
    const emptyState = document.getElementById("emptyState");

    let selectedCategory = "Semua";

    function filterProducts() {
        if (!productGrid) return;

        const cards = Array.from(
            productGrid.querySelectorAll(".productcard")
        );

        const keyword = searchInput.value.toLowerCase().trim();

        let visibleCards = cards.filter(card => {
            const name = card.dataset.name.toLowerCase();
            const category = card.dataset.category;

            return name.includes(keyword) &&
                (selectedCategory === "Semua" ||
                category === selectedCategory);
        });

        if (sortSelect.value === "low") {
            visibleCards.sort((a, b) =>
                Number(a.dataset.price) - Number(b.dataset.price)
            );
        } else if (sortSelect.value === "high") {
            visibleCards.sort((a, b) =>
                Number(b.dataset.price) - Number(a.dataset.price)
            );
        } else if (sortSelect.value === "az") {
            visibleCards.sort((a, b) =>
                a.dataset.name.localeCompare(b.dataset.name, "id")
            );
        }

        cards.forEach(card => {
            card.hidden = true;
        });

        visibleCards.forEach(card => {
            card.hidden = false;
            productGrid.appendChild(card);
        });

        if (resultCount) {
            resultCount.textContent =
                visibleCards.length + " produk ditemukan";
        }

        if (emptyState) {
            emptyState.hidden = visibleCards.length > 0;
        }
    }

    if (searchInput && sortSelect && productGrid) {
        searchInput.addEventListener("input", filterProducts);
        sortSelect.addEventListener("change", filterProducts);

        document.querySelectorAll(".category").forEach(button => {
            button.addEventListener("click", function () {
                document.querySelectorAll(".category").forEach(item => {
                    item.classList.remove("active");
                });

                button.classList.add("active");
                selectedCategory = button.dataset.category;

                filterProducts();
            });
        });

        filterProducts();
    }

    const cartButton = document.getElementById("cartButton");
    const bottomCartButton =
        document.getElementById("bottomCartButton");
    const catalogPage = document.getElementById("catalogPage");
    const cartPage = document.getElementById("cartPage");
    const backButton = document.getElementById("backButton");

    function showCart() {
        if (!catalogPage || !cartPage) return;

        catalogPage.hidden = true;
        cartPage.hidden = false;

        renderCart();
        window.scrollTo(0, 0);
    }

    if (cartButton) {
        cartButton.addEventListener("click", showCart);
    }

    if (bottomCartButton) {
        bottomCartButton.addEventListener("click", showCart);
    }

    if (backButton) {
        backButton.addEventListener("click", function () {
            if (!catalogPage || !cartPage) return;

            cartPage.hidden = true;
            catalogPage.hidden = false;

            window.scrollTo(0, 0);
        });
    }

    const productTab = document.getElementById("productTab");

    if (productTab) {
        productTab.addEventListener("click", function (event) {
            event.preventDefault();

            const grid = document.getElementById("productGrid");

            if (grid) {
                grid.scrollIntoView({
                    behavior: "smooth"
                });
            }
        });
    }

    const checkoutButton =
        document.getElementById("checkoutButton");

    if (checkoutButton) {
        checkoutButton.addEventListener("click", function () {
            const cart = getCart();

            if (cart.length === 0) {
                alert("Keranjang masih kosong.");
                return;
            }

            alert(
                "Checkout simulasi berhasil. Belum ada pembayaran nyata."
            );

            saveCart([]);
            renderCart();
            updateCartCount();
        });
    }
});