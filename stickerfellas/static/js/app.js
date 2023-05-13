new Vue({
    el: '#app',
    delimiters: ['[[', ']]'],
    data: {
        token: '',
        showHome: true,
        showShop: false,
        shoppingCart: [],
        inventory: [],
    },
    methods: {
        goHome() {
            this.showHome = true
            this.showShop = false
        },
        openShop() {
            this.showHome = false
            this.showShop = true
            this.getProducts()
        },
        getProducts() {
            if (this.showShop) {
                axios.get('api/all/').then(res => this.inventory = res.data)
            }
        }
    },
    mounted() {
        this.goHome()
    }
})

Vue.component('ItemListings', {
    template: `
    <div class="inner-listing" @mouseover="hovering = true" @mouseleave="hovering = false">
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
        }
    }
})
