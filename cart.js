function confirmOrder() {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const deliveryAddress = document.getElementById('address').value;
    const tipAmount = document.getElementById('tip-amount').value;

    // Calculate total amount with GST and tip
    let totalAmount = calculateTotalAmount(cartItems);
    totalAmount += parseInt(tipAmount); // Add tip to the total amount

    // Data to be sent to the backend
    const data = {
        cartItems: cartItems,
        deliveryAddress: deliveryAddress,
        totalAmount: totalAmount
    };

    // Send data to the backend
    fetch('/cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            // Order confirmed successfully
            console.log('Order confirmed successfully');
            // Optionally, clear the cart after successful order confirmation
            localStorage.removeItem('cartItems');
        } else {
            // Handle errors
            console.error('Error confirming order');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function calculateTotalAmount(cartItems) {
    // Calculate the total amount based on the items in the cart
    let totalAmount = 0;
    cartItems.forEach(item => {
        totalAmount += item.quantity * item.price;
    });
    // Apply GST (if applicable)
    totalAmount *= 1.18; // Assuming 18% GST
    return totalAmount;
}
