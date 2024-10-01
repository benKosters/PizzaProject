
//Warpper function that waits until all html content is loaded
//not necessarily needed if <script> is at bottom of HTML page
document.addEventListener("DOMContentLoaded", function () {

    //array of pizza types, needed for adding containers to the checkout
    const pizzas = [
        { id: 1, name: "Classic Cheese", basePrice: 8.00 },
        { id: 2, name: "Pepperoni", basePrice: 9.00 },
        { id: 3, name: "Tangy Barbecue", basePrice: 10.00 },
        { id: 4, name: "The Hawaiian", basePrice: 11.00 }
    ];

    const checkoutContainer = document.querySelector(".checkout-only-container"); //gets checkout container
    let cartTotal = 0; // Total price of all items in the cart
    let cartItems = []; // Array to hold the pizza objects in the cart

    // Create "Confirm order" button, hidden by default -- created by JS, not in HTML
    let proceedButton = document.createElement("button");
    proceedButton.id = "checkout-btn";
    proceedButton.style.display = "none";
    checkoutContainer.appendChild(proceedButton);

    // Function to update the total price in the "Confirm Order" button
    function updateCheckoutTotal() {
        //toFixed(2) returns string representation of number to 2 desimal places
        //the ` are used to make template string,
        proceedButton.textContent = `Confirm Order: $${cartTotal.toFixed(2)}`;
    }


    //itterate through pizza, runs once as part of initialization process to set up listeners below
    pizzas.forEach(pizza => {
        const sizeSelect = document.getElementById(`size-select-${pizza.id}`);
        const crustSelect = document.getElementById(`crust-select-${pizza.id}`);
        const addToCartBtn = document.getElementById(`add-to-cart-btn-${pizza.id}`);

        // Function to update the "Add to Cart" button display and price
        function updateAddToCartButton() {
            //get the price, size, and total price of a pizza
            const sizePrice = parseFloat(sizeSelect.selectedOptions[0].dataset.price) || 0; //shortcircuit or
            const crustPrice = parseFloat(crustSelect.selectedOptions[0].dataset.price) || 0;
            const totalPrice = (pizza.basePrice + sizePrice + crustPrice).toFixed(2);

            // Ensure that both size and crust are selected
            if (sizeSelect.selectedIndex > 0 && crustSelect.selectedIndex > 0) {
                addToCartBtn.style.display = "block";
                addToCartBtn.textContent = `Add to Cart: $${totalPrice}`;
            } else {
                addToCartBtn.style.display = "none";
            }
        }

        // Listen for changes in size and crust selections for all pizzas
        sizeSelect.addEventListener("change", updateAddToCartButton);
        crustSelect.addEventListener("change", updateAddToCartButton);

        // listen for clicks to add item to the cart
        addToCartBtn.addEventListener("click", function () {
            //get values required
            const sizeText = sizeSelect.selectedOptions[0].textContent;
            const crustText = crustSelect.selectedOptions[0].textContent;
            const sizePrice = parseFloat(sizeSelect.selectedOptions[0].dataset.price) || 0;
            const crustPrice = parseFloat(crustSelect.selectedOptions[0].dataset.price) || 0;
            const itemPrice = pizza.basePrice + sizePrice + crustPrice;

            // Create a pizza object of the selected pizza
            const pizzaItem = {
                id: pizza.id,
                name: pizza.name,
                size: sizeText,
                crust: crustText,
                price: itemPrice,
                quantity: 1
            };

            // Check if the pizza with the same ID, size, and crust already exists in the cart
            //this is used to prevent another container from being created for the same type of pizza
            const existingPizzaIndex = cartItems.findIndex(item =>
                item.id === pizzaItem.id &&
                item.size === pizzaItem.size &&
                item.crust === pizzaItem.crust
            );
            //if the pizza is in the cart...
            if (existingPizzaIndex !== -1) {
                //increase quantity
                cartItems[existingPizzaIndex].quantity++;
                cartTotal += itemPrice; // Update total price
                updateCheckoutTotal(); // Update checkout total

                // Update the display for the existing pizza
                const cartItem = checkoutContainer.querySelectorAll(".checkout-items")[existingPizzaIndex];
                cartItem.querySelector(".quantity").textContent = cartItems[existingPizzaIndex].quantity;
                cartItem.querySelector(".item-price").textContent = (cartItems[existingPizzaIndex].price * cartItems[existingPizzaIndex].quantity).toFixed(2);
            } else {
                // New pizza, add to the cart
                cartItems.push(pizzaItem);
                cartTotal += itemPrice; // Update total price
                updateCheckoutTotal(); // Update checkout total

                const cartItem = document.createElement("div");
                cartItem.className = "checkout-items";

                // Create HTML for the cart item
                //<p><strong>${pizzaItem.name}</strong> <br> ${pizzaItem.size}, ${pizzaItem.crust} <br> $<span class="item-price">${itemPrice.toFixed(2)}</span></p>
                cartItem.innerHTML = `
                     <p class = "cart-item-title">${pizzaItem.name}</p>
                     <p> ${pizzaItem.size}, ${pizzaItem.crust} <br> Subtotal: $<span class="item-price">${itemPrice.toFixed(2)}</span></p>
                    <div>
                        <button class="decrease-quantity">-</button>
                        <span class="quantity">${pizzaItem.quantity}</span>
                        <button class="increase-quantity">+</button>
                    </div>
                `;

                // Add item to the checkout container before the "Confirm Order" button
                checkoutContainer.insertBefore(cartItem, proceedButton);
                proceedButton.style.display = "block"; // Show "Confirm Order" button

                // Create event listener for increasing/decreasing quantity of pizzas using - or +
                cartItem.querySelector(".increase-quantity").addEventListener("click", function () {
                    //assign the index if all conditions are met
                    const itemIndex = cartItems.findIndex(item =>
                        item.name === pizzaItem.name &&
                        item.size === pizzaItem.size &&
                        item.crust === pizzaItem.crust
                    );

                    if (itemIndex !== -1) {
                        // Increment the quantity of the specific pizza in the cart
                        cartItems[itemIndex].quantity++;
                        cartTotal += cartItems[itemIndex].price; // Update total price
                        updateCheckoutTotal(); // Update checkout total

                        // Update the display for the quantity and price
                        cartItem.querySelector(".quantity").textContent = cartItems[itemIndex].quantity;
                        cartItem.querySelector(".item-price").textContent = (cartItems[itemIndex].price * cartItems[itemIndex].quantity).toFixed(2);
                    }
                });

                // Handle quantity decrease or removal
                cartItem.querySelector(".decrease-quantity").addEventListener("click", function () {
                    const itemIndex = cartItems.findIndex(item =>
                        item.name === pizzaItem.name &&
                        item.size === pizzaItem.size &&
                        item.crust === pizzaItem.crust
                    );

                    if (itemIndex !== -1) {
                        if (cartItems[itemIndex].quantity > 1) {
                            // subtract one of the pizzas
                            cartItems[itemIndex].quantity--;
                            cartTotal -= cartItems[itemIndex].price; // Update total price
                            updateCheckoutTotal(); // Update checkout total

                            // Update the display for the quantity and price
                            cartItem.querySelector(".quantity").textContent = cartItems[itemIndex].quantity;
                            cartItem.querySelector(".item-price").textContent = (cartItems[itemIndex].price * cartItems[itemIndex].quantity).toFixed(2);
                        } else {
                            // If quantity is 1, remove the item from the cart
                            cartTotal -= cartItems[itemIndex].price; // Subtract price from total
                            cartItems.splice(itemIndex, 1); // Remove from cart
                            cartItem.remove(); // Remove from display
                            updateCheckoutTotal(); // Update checkout total

                            // If no items are left in the cart, hide the proceed button
                            if (checkoutContainer.querySelectorAll(".checkout-items").length === 0) {
                                proceedButton.style.display = "none";
                            }
                        }
                    }
                });
            }

            // Reset selections and hide the "Add to Cart" button
            sizeSelect.value = "0";
            crustSelect.value = "0";
            addToCartBtn.style.display = "none";
        });
    });

    // Handle "Confirm Order" button click
    proceedButton.addEventListener("click", function () {
        alert("Thank you for your order!");
        // Reset cart and hide the proceed button
        checkoutContainer.innerHTML = "<h3>Your Cart:</h3>";
        checkoutContainer.appendChild(proceedButton); // Re-attach the button after clearing the cart
        proceedButton.style.display = "none";
        cartTotal = 0; // Reset total price
        cartItems = []; // Reset cart items
        updateCheckoutTotal(); // Reset button text
    });
});
