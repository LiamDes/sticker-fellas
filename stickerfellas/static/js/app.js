Vue.component('ItemListings', {
    template: `
    <div class="inner-listing" @mouseover="hovering = true" @mouseleave="hovering = false"
    @click="openProduct(listing.id)">
        <h3>[[listing.name]]</h3>
        <img :src="listing.image" class="itempreview"/>
        <button v-if="hovering" @click.stop="cartFromPreview">Add to Cart</button>
    </div>`,
    props: {
        listing: Object,
    },
    delimiters: ['[[', ']]'],
    data: () => {
        return {
            hovering: false,
        }
    },
    methods: {
        cartFromPreview() {
            this.$parent.shoppingCart.push(this.listing)
        },
        openProduct(itemID) {
            axios.get(`/api/product/${itemID}`).then(res => this.$parent.activeProduct = res.data)
            this.$parent.showHome = false
            this.$parent.showShop = false
            this.$parent.showCart = false
            this.$parent.showProduct = true
        },
    }
})

const PayPalButton = paypal.Buttons.driver('vue', window.Vue)

Vue.component('PaypalCheckout', {
// The style prop for the PayPal button should be passed in as `style-object` or `styleObject` to avoid conflict with Vue's `style` reserved prop.
    template: `
        <paypal-buttons :on-approve="onApprove" :create-order="createOrder" :on-shipping-change="onShippingChange" :on-error="onError" :style-object="style" />
    `,
    components: {
        'paypal-buttons': PayPalButton,
    },
    computed: {
        createOrder: function () {
        return (data) => {
            // Order is created on the server and the order id is returned
            return fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
            // return fetch("/my-server/create-paypal-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization' : `Basic ${clientID}:${secretKey}`,
            },
            // use the "body" param to optionally pass additional order information
            // like product skus and quantities
            body: JSON.stringify({
                cart: this.$parent.shoppingCart // [
                    
                // {
                //     sku: "YOUR_PRODUCT_STOCK_KEEPING_UNIT",
                //     quantity: "YOUR_PRODUCT_QUANTITY",
                // },
                //],
            }),
            })
            .then((response) => response.json())
            .then((order) => order.id);
        }
        },
        onApprove: function () {
        return (data) => {
            // Order is captured on the server
            return fetch("/my-server/capture-paypal-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                orderID: data.orderID
            })
            })
            .then((response) => response.json());
        }
        },
        onShippingChange: function () {
        return (data, actions) => {
            if (data.shipping_address.country_code !== 'US') {
            return actions.reject()
            }
            return actions.resolve()
        }
        },
        onError: function () {
        return (err) => {
            console.error(err)
            window.location.href = '/error/'
        }
        },
        style: function () {
        return {
            shape: 'pill',
            color: 'gold',
            layout: 'horizontal',
            label: 'paypal',
            tagline: false,
        }
        },
    },
})

Vue.component('ShoppingCart', {
    template: `
    <div>
        <div v-for="item in cart">
            [[item.name]]
        </div>
        <span> TOTAL: [[orderSum]] </span>
    </div>`,
// removed checkout button temporarily
    props: {
        cart: Array,
    }, 
    delimiters: ['[[', ']]'],
    data: () => {
        return {
            totalPrice: 0,
        }
    },
    methods: {
        checkout() {
            let token
            let orderID
            axios({
                url: 'https://api-m.sandbox.paypal.com/v1/oauth2/token/',
                method: 'post',
                auth: {
                    username: clientID,
                    password: secretKey
                },
                data: 'grant_type=client_credentials',
                headers: {
                    'Content-Type' : 'application/x-www-form-urlencoded'
                }
            }).then(res => {
                token = res.data.access_token
                axios({
                    url: 'https://api-m.sandbox.paypal.com/v2/checkout/orders',
                    method: 'post',
                    headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type' : 'application/json',
                    },
                    data: {
                        "intent": "CAPTURE",
                        "purchase_units": [
                            {
                                "reference_id": "default",
                                "amount": {
                                    "currency_code": "USD",
                                    "value": `${this.totalPrice}`,
                                    "breakdown": {
                                        "item_total": {
                                            "currency_code": "USD",
                                            "value": `${this.totalPrice}`
                                        }
                                    }
                                },
                                "payee": {
                                    "email_address": "sb-uz1r525979770@business.example.com",
                                    "merchant_id": "279MS795DM8HJ"
                                },
                            }
                        ],
                    }
                }).then(res => {
                    orderID = res.data.id
                    window.open(res.data.links[1].href)
                    console.log('order created')
                    axios({
                        url: `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}/capture`,
                        method: 'post',
                        headers: {
                            'Authorization' : `Bearer ${token}`,
                            'Content-Type' : 'application/json',
                        },
                        data: {
                            "id": orderID,
                            "intent": "CAPTURE",
                        }
                    })
                    // need to capture order somehow despite going to a new page
                    // ORDER_NOT_APPROVED: Payer has not yet approved the order for 
                    // payment. Redirect the payer to the approve URL returned as 
                    // part of the HATEOAS links within the create order call.
                })})
        }
    },
    computed: {
        orderSum() {
            let sum = Number()
            this.cart.forEach((item) => {
                sum += Number(item.price)
                this.totalPrice = sum.toFixed(2)
            })
            return this.totalPrice
        }
    }
})

new Vue({
    el: '#app',
    delimiters: ['[[', ']]'],
    data: {
        token: '',
        showHome: true,
        showShop: false,
        showCart: false,
        showProduct: false,
        type: null,
        shoppingCart: [],
        buyingNumber: 1,
        activeProduct: [],
        inventory: []
    },
    methods: {
        goHome() {
            this.showHome = true
            this.showShop = false
            this.showCart = false
            this.showProduct = false
        },
        openShop(type) {
            this.showHome = false
            this.showShop = true
            this.showCart = false
            this.showProduct = false
            this.getProducts(type)
        },
        openCart() {
            this.showHome = false
            this.showShop = false
            this.showCart = true
            this.showProduct = false
        },
        addToCart(quantity) {
            while (quantity > 0) {
                quantity -= 1
                this.shoppingCart.push(this.activeProduct)
            }
            if (quantity === 0) {
                this.openShop(this.activeProduct.type)
            }
            this.buyingNumber = 1
        },
        getProducts(sort) {
            if (sort === null) {
                axios.get('/api/all/').then(res => this.inventory = res.data)
            } else {
                axios.get('/api/type/', {
                    params: { type: sort }
                }).then(res => this.inventory = res.data)
            }
        },

    },
    mounted() {
        this.goHome()
    },
})

