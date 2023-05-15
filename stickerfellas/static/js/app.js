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

Vue.component('ShoppingCart', {
    template: `
    <div>
        <div v-for="item in cart">
            [[item.name]]
        </div>
        <span> TOTAL: [[orderSum]] </span>
        <button @click="checkout">Check Out!</button>
    </div>`,
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
                                    "value": "100.00",
                                    "breakdown": {
                                        "item_total": {
                                            "currency_code": "USD",
                                            "value": "100.00"
                                        }
                                    }
                                },
                                "payee": {
                                    "email_address": "sb-uz1r525979770@business.example.com",
                                    "merchant_id": "279MS795DM8HJ"
                                },
                                "items": [
                                    {
                                        "name": "T-Shirt",
                                        "unit_amount": {
                                            "currency_code": "USD",
                                            "value": "100.00"
                                        },
                                        "quantity": "1",
                                        "description": "Green XL"
                                    }
                                ]
                            }
                        ],
                    }
                }).then(res => {
                    window.open(`${res.data.links[1].href}`)
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
        shoppingCart: [],
        buyingNumber: 1,
        activeProduct: [],
        inventory: [],
        stickers: [],
        pins: [],
        hats: [],
    },
    methods: {
        goHome() {
            this.showHome = true
            this.showShop = false
            this.showCart = false
            this.showProduct = false
        },
        openShop() {
            this.showHome = false
            this.showShop = true
            this.showCart = false
            this.showProduct = false
            this.getProducts()
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
                this.openShop()
            }
        },
        getProducts() {
            if (this.showShop) {
                axios.get('/api/all/').then(res => this.inventory = res.data)
            }
        },

    },
    mounted() {
        this.goHome()
    },
})

