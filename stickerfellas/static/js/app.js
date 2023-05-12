
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
    <div class="inner-listing">
        <h3>[[listing.name]]</h3>
        <img :src="listing.image" class="itempreview"/>
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
})