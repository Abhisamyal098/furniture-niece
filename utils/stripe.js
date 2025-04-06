const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create payment intent
const createPaymentIntent = async (amount, currency = 'usd') => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            automatic_payment_methods: {
                enabled: true
            }
        });

        return {
            success: true,
            clientSecret: paymentIntent.client_secret
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Create customer
const createCustomer = async (email, name) => {
    try {
        const customer = await stripe.customers.create({
            email,
            name
        });

        return {
            success: true,
            customer
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Create payment method
const createPaymentMethod = async (paymentMethodId) => {
    try {
        const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

        return {
            success: true,
            paymentMethod
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Attach payment method to customer
const attachPaymentMethod = async (paymentMethodId, customerId) => {
    try {
        const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
            customer: customerId
        });

        return {
            success: true,
            paymentMethod
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Set default payment method
const setDefaultPaymentMethod = async (customerId, paymentMethodId) => {
    try {
        const customer = await stripe.customers.update(customerId, {
            invoice_settings: {
                default_payment_method: paymentMethodId
            }
        });

        return {
            success: true,
            customer
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Create subscription
const createSubscription = async (customerId, priceId) => {
    try {
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            expand: ['latest_invoice.payment_intent']
        });

        return {
            success: true,
            subscription
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Cancel subscription
const cancelSubscription = async (subscriptionId) => {
    try {
        const subscription = await stripe.subscriptions.del(subscriptionId);

        return {
            success: true,
            subscription
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Verify webhook signature
const verifyWebhookSignature = (payload, signature) => {
    try {
        const event = stripe.webhooks.constructEvent(
            payload,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        return {
            success: true,
            event
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = {
    createPaymentIntent,
    createCustomer,
    createPaymentMethod,
    attachPaymentMethod,
    setDefaultPaymentMethod,
    createSubscription,
    cancelSubscription,
    verifyWebhookSignature
}; 