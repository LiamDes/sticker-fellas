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
            this.shoppingCart.push(this.activeProduct)
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

Vue.component('ItemListings', {
    template: `
    <div class="inner-listing" @mouseover="hovering = true" @mouseleave="hovering = false"
    @click="openProduct(listing.id)">
        <h3>[[listing.name]]</h3>
        <img :src="listing.image" class="itempreview"/>
        <button v-if="hovering" @click="cartFromPreview">Add to Cart</button>
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
