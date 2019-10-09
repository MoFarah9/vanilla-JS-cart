const cartBtn = document.querySelector(".cart-btn");
const cartColseBtn = document.querySelector(".cart .close-btn");
const cartOverlay = document.querySelector(".cart-overlay");
const cartDom = document.querySelector(".cart");
const productsGrid = document.querySelector(".products-gird");
const cartItems = document.querySelector(".cart .cart-items");
const cartCounter = document.querySelector(".navbar .counter");
const cartTotal = document.querySelector(".cart .cart-total span");
const clearCartBtn = document.querySelector(".cart .clear-cart-btn");

let cart = [];

class Products {
  static async getProducts() {
    const response = await fetch("./data.json");
    const data = await response.json();
    return data.items;
  }
}

class Cart {
  static removeItem(id) {
    cart = cart.filter(i => i.id != id);

    const addToCartBtns = document.querySelectorAll(".product .add-btn");
    addToCartBtns.forEach(btn => {
      if (btn.dataset.id == id) UI.changeAddToCartBtn(btn);
    });

    Storage.saveCart(cart);
    UI.updateTotal();
    UI.updateCounter();
  }
}

class UI {
  static displayProducts(products) {
    products.forEach(p => {
      const productDom = document.createElement("article");
      productDom.classList.add("product");
      productDom.innerHTML = `
        <article class="product">
          <div class="product-inner">
            <img src="${p.img}" alt="Product1"/>
            <div class="prodcut-overlay"></div>
            <button class="add-btn" data-id="${p.id}">Add to cart</button>
          </div>
          <h3 class="product-title">${p.title}</h3>
          <p class="price">$${p.price}</p>
        </article>`;
      productsGrid.appendChild(productDom);
    });
  }

  static displayItem(item) {
    const itemDom = document.createElement("div");
    itemDom.classList.add("cart-item");
    itemDom.innerHTML = `
          <img src="${item.img}" alt="Product1">
          <div class="item-details">
            <h4 class="item-name">${item.title}</h4>
            <p class="price">$${item.price}</p>
            <span class="remove-btn" data-id=${item.id}>remove</span>
          </div>
          <div class="item-amount-input">
            <i class="up" data-id=${item.id}>˄</i>
            <span class="item-amount">${item.amount}</span>
            <i class="down" data-id=${item.id}>˅</i>
          </div>`;
    cartItems.appendChild(itemDom);
  }

  static displayCartItmes(cart) {
    cart.forEach(i => UI.displayItem(i));
  }

  static updateTotal() {
    const total = cart.reduce((acc, i) => acc + i.amount * i.price, 0);
    cartTotal.textContent = total.toFixed(2);
  }

  static updateCounter() {
    cartCounter.textContent = cart.reduce((acc, i) => acc + i.amount, 0);
  }

  static showCart() {
    cartOverlay.classList.add("show-overlay");
    cartDom.classList.add("show-cart");
  }

  static hideCart() {
    cartOverlay.classList.remove("show-overlay");
    cartDom.classList.remove("show-cart");
  }

  static changeAddToCartBtn(btn, change) {
    if (change == "disable") {
      btn.textContent = "In Cart";
      btn.setAttribute("disabled", true);
    } else {
      btn.textContent = "Add To Cart";
      btn.removeAttribute("disabled");
    }
  }
}

class Storage {
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    const tempCart = localStorage.getItem("cart");
    return tempCart ? JSON.parse(tempCart) : [];
  }
}

async function setup() {
  // populate cart from local storage
  cart = Storage.getCart();

  // display cart items
  if (cart.length) UI.displayCartItmes(cart);

  UI.updateTotal();
  UI.updateCounter();

  // fetch and display all products
  const allProducts = await Products.getProducts();
  if (allProducts.length) UI.displayProducts(allProducts);

  // add event listener to cart btns
  cartColseBtn.addEventListener("click", () => {
    UI.hideCart();
  });
  cartBtn.addEventListener("click", () => {
    UI.showCart();
  });

  // add event listeners to add-to-cart buttons AND disable if already in cart
  const addToCartBtns = document.querySelectorAll(".product .add-btn");
  addToCartBtns.forEach(btn => {
    const id = btn.dataset.id;

    if (cart.findIndex(i => i.id == id) !== -1) {
      UI.changeAddToCartBtn(btn, "disable");
    }

    btn.addEventListener("click", () => {
      // add item to cart
      const item = allProducts.filter(p => p.id == id)[0];
      item.amount = 1;
      cart = [...cart, item];
      // update cart in local storage
      Storage.saveCart(cart);
      // display item in DOM
      UI.displayItem(item);
      UI.updateTotal();
      UI.updateCounter();
      UI.showCart();
      UI.changeAddToCartBtn(btn, "disable");
    });
  });

  // add event listener to cart item buttons
  cartItems.addEventListener("click", e => {
    if (e.target.classList.contains("remove-btn")) {
      // remove item
      const id = e.target.dataset.id;
      Cart.removeItem(id);
      const cartItem = e.target.parentElement.parentElement;
      cartItems.removeChild(cartItem);
    } else if (e.target.classList.contains("up")) {
      // increase item amount by one
      const id = e.target.dataset.id;
      let newAmount;
      cart.forEach(i => {
        if (i.id == id) newAmount = ++i.amount;
      });

      e.target.nextElementSibling.textContent = newAmount;

      Storage.saveCart(cart);
      UI.updateTotal();
      UI.updateCounter();
    } else if (e.target.classList.contains("down")) {
      // decrease item amount by one
      const id = e.target.dataset.id;
      let newAmount;
      cart.forEach(i => {
        if (i.id == id) {
          if (i.amount <= 1) {
            Cart.removeItem(id);
            const cartItem = e.target.parentElement.parentElement;
            cartItems.removeChild(cartItem);
          } else {
            newAmount = --i.amount;
            e.target.previousElementSibling.textContent = newAmount;
            Storage.saveCart(cart);
            UI.updateTotal();
            UI.updateCounter();
          }
        }
      });
    }
  });

  // add event listener to clear-cart btn
  clearCartBtn.addEventListener("click", e => {
    cart.forEach(i => {
      Cart.removeItem(i.id);
    });
    cartItems.innerHTML = "";
  });
}

document.addEventListener("DOMContentLoaded", setup);
