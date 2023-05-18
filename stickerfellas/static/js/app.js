paypal.Buttons.driver("vue", window.Vue);

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
        <div v-for="item of itemCounts">
            <strong>[[item.name]]</strong> x[[item.count]]
        </div>
        <span> TOTAL: [[orderSum]] </span>
        <button @click="checkout">Checkout</button>
    </div>`,
    props: {
        cart: Array,
    }, 
    delimiters: ['[[', ']]'],
    data: () => {
        return {
            totalPrice: 0,
            itemCounts: {}
        }
    },
    methods: {
        checkout() {
            
        },
        formatCart() {
            let counter = Number()
            for ([index, product] of this.cart.entries()) {
                let matches = Object.keys(this.itemCounts)
                console.log(matches)
                if (!(matches.includes(product.id.toString()))) {
                    console.log(product.id.toString())
                    counter = 1
                } else {
                    counter++
                }
                this.itemCounts[product.id] = {name: product.name, price: product.price, count: counter}
            }
            console.log(this.itemCounts)
            return this.itemCounts
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
        },
        // formatCart() {
        //     let counter = Number()
        //     for ([index, product] of this.cart.entries()) { 
        //         let matches = Object.keys(this.itemCounts)
        //         if (!(product.id in matches)) {
        //             counter = 1
        //         } else {
        //             counter++
        //         }
        //         this.itemCounts[product.id] = {name: product.name, price: product.price, count: counter}
        //     }
        //     return this.itemCounts
        // }
    },
    updated() {
        this.formatCart()
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
        inventory: [],
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

