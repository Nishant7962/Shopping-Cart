// cart.js

class ShoppingCart {
    constructor() {
        this.products = {
            "Product A": { price: 20, quantity: 0, giftWrap: 0 },
            "Product B": { price: 40, quantity: 0, giftWrap: 0 },
            "Product C": { price: 50, quantity: 0, giftWrap: 0 },
        };
        this.rules = {
            flat_10_discount: { threshold: 200, discount: 10 },
            bulk_5_discount: { threshold: 10, discount: 0.05 },
            bulk_10_discount: { threshold: 20, discount: 0.10 },
            tiered_50_discount: { quantityThreshold: 30, singleProductThreshold: 15, discount: 0.50 },
        };
        this.giftWrapFee = 1;
        this.shippingFeePerPackage = 5;
        this.unitsPerPackage = 10;
    }

    applyDiscount(totalQuantity) {
        let applicableDiscounts = {};

        // Check for flat $10 discount
        if (totalQuantity > this.rules.flat_10_discount.threshold) {
            applicableDiscounts.flat_10_discount = this.rules.flat_10_discount.discount;
        }

        // Check for bulk 10% discount
        if (totalQuantity > this.rules.bulk_10_discount.threshold) {
            applicableDiscounts.bulk_10_discount = this.rules.bulk_10_discount.discount;
        }

        // Check for tiered 50% discount
        for (const product of Object.values(this.products)) {
            if (product.quantity > this.rules.tiered_50_discount.singleProductThreshold) {
                applicableDiscounts.tiered_50_discount = this.rules.tiered_50_discount.discount;
            }
        }

        // Check for bulk 5% discount on individual products
        for (const product of Object.values(this.products)) {
            if (product.quantity > this.rules.bulk_5_discount.threshold) {
                applicableDiscounts.bulk_5_discount = this.rules.bulk_5_discount.discount;
                break; // Apply discount only on one product
            }
        }

        // Choose the most beneficial discount
        if (Object.keys(applicableDiscounts).length > 0) {
            const maxDiscount = Math.max(...Object.values(applicableDiscounts));
            const discountName = Object.keys(applicableDiscounts).find(key => applicableDiscounts[key] === maxDiscount);
            return [discountName, maxDiscount];
        } else {
            return [null, 0];
        }
    }

    calculateTotal() {
        const totalQuantity = Object.values(this.products).reduce((sum, product) => sum + product.quantity, 0);
        const [discountName, discountAmount] = this.applyDiscount(totalQuantity);

        let subtotal = 0;
        for (const product of Object.values(this.products)) {
            subtotal += product.quantity * product.price;
        }

        let total = subtotal - discountAmount;

        const shippingFee = Math.floor(totalQuantity / this.unitsPerPackage) * this.shippingFeePerPackage;
        const giftWrapFee = Object.values(this.products).reduce((sum, product) => sum + (product.giftWrap ? product.quantity * this.giftWrapFee : 0), 0);

        total += shippingFee + giftWrapFee;

        return [totalQuantity, subtotal, discountName, discountAmount, shippingFee, giftWrapFee, total];
    }
}

function main() {
    const cart = new ShoppingCart();

    for (const product in cart.products) {
        const quantity = parseInt(prompt(`Enter quantity for ${product}:`), 10);
        const giftWrap = prompt(`Is ${product} wrapped as a gift? (yes/no):`).toLowerCase() === "yes";
        cart.products[product].quantity = quantity;
        cart.products[product].giftWrap = giftWrap;
    }

    const [totalQuantity, subtotal, discountName, discountAmount, shippingFee, giftWrapFee, total] = cart.calculateTotal();

    console.log("\nOrder Summary:");
    for (const [productName, details] of Object.entries(cart.products)) {
        console.log(`${productName}: ${details.quantity} units - $${details.quantity * details.price}`);
    }

    console.log(`\nSubtotal: $${subtotal}`);
    console.log(`Discount Applied (${discountName}): -$${discountAmount}`);
    console.log(`Shipping Fee: $${shippingFee}`);
    console.log(`Gift Wrap Fee: $${giftWrapFee}`);
    console.log(`\nTotal: $${total}`);
}

main();
