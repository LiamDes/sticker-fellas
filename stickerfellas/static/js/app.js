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
            this.$parent.addingToCart = true
            setTimeout(() => {
                this.$parent.addingToCart = false
            }, 1000)

            this.$parent.shoppingCart.forEach(listing => {
                if (listing.product.id === this.listing.id) {this.$parent.newItem = false}
            })
            if (this.$parent.newItem) {
                this.$parent.shoppingCart.push({quantity: 1, product: this.listing, price: this.listing.price})
            } else {
                let match = this.$parent.shoppingCart.find(product => product.product.id === this.listing.id)
                match.quantity = parseInt(match.quantity) + 1
                match.price = (match.quantity * match.product.price).toFixed(2)
            }
            this.$parent.newItem = true
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
            <strong>[[item.product.name]]</strong> x[[item.quantity]] ([[item.price]])
        </div>
        <span> TOTAL: $[[orderSum]] </span>
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
        showHome: true,
        showShop: false,
        showCart: false,
        showProduct: false,
        type: null,
        newItem: true,
        shoppingCart: [],
        buyingNumber: 1,
        addingToCart: false,
        activeProduct: [],
        inventory: [],
        stripeKey: '',
        token: '',
        stripe: null,
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
            this.addingToCart = true
            setTimeout(() => {
                this.addingToCart = false
            }, 1000)

            this.shoppingCart.forEach(listing => {
                if (listing.product.id === this.activeProduct.id) {this.newItem = false}
            })
            if (this.newItem) {
                this.shoppingCart.push( {quantity: quantity, product: this.activeProduct, price: (quantity * this.activeProduct.price).toFixed(2)})
            } else {
                let match = this.shoppingCart.find(product => product.product.id === this.activeProduct.id)
                match.quantity = parseInt(match.quantity) + parseInt(quantity)
                match.price = (match.quantity * match.product.price).toFixed(2)
            }
            this.openShop(this.activeProduct.type)
            this.buyingNumber = 1
            this.newItem = true
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
        getStripeKey() {
            axios.get('/api/getkey/')
            .then(res => {this.stripeKey = res.data.pub_key, this.stripe = Stripe(res.data.pub_key)})
        },
        checkout(cart) {
            const data = {
                items: cart
            }
            axios.post('/api/stripe/checkoutsession/', data, { headers: { 'X-CSRFToken': this.token } })
            .then(res => {
                console.log(res.data)
                return this.stripe.redirectToCheckout({sessionId: res.data.sessionId})
            })
            .catch(err => console.error(err))
        },
    },
    computed: {
        cartQuantity() {
            if (this.shoppingCart.length > 0) {
                let quantity = Number()
                quantity = 0
                this.shoppingCart.forEach(item => {
                    quantity += parseInt(item.quantity)
                })
                return quantity
            } else {return ''}
        }
    },
    mounted() {
        this.token = document.querySelector('input[name=csrfmiddlewaretoken]').value
        this.getStripeKey()
        this.goHome()
    },
})
