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
        goHome()
    }
})