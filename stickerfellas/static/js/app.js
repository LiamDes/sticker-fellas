Vue.component('FooterModals', {
    template: `
        <div class="overlay">
            <section class="modal">
                Oh Wow.
                <button @click="">Got It!</button>
            </section>
        </div>`
})

Vue.component('CheckoutComplete', {
    template: `<div class="local-order">Sticker Fellas Reference Order #<strong>[[orderInfo.id]]</strong></div>`,
    data: () => {
        return {
            currentUser: {},
            orderInfo: {},
        }
    },
    delimiters: ['[[', ']]'],
    methods: {
        updateHistory() {
            axios.get('/api/current/')
            .then(res => {
                this.currentUser = res.data
                if (this.currentUser.username != '') {
                    // create an Order Object
                    axios.post('/api/orders/new/', {
                        "ordered_by": this.currentUser.id,
                    }, { headers: { 'X-CSRFToken': this.$parent.token } 
                    }).then(res => {
                        this.orderInfo = res.data
                        // assign each item + it's quantity in shopping cart to Purchase Object
                        this.$parent.shoppingCart.forEach(item => {
                            axios.post('/api/purchases/new/', {
                                "order": this.orderInfo.id,
                                "product": item.product.id,
                                "quantity": item.quantity
                            }, { headers: { 'X-CSRFToken': this.$parent.token }})
                        }) 
                    })
                }
            })
        }
    },
    async mounted() {
        const cartData = localStorage.getItem('cart');
        this.$parent.shoppingCart = cartData ? JSON.parse(cartData) : []
        await this.updateHistory()
        localStorage.clear()
    }
})

Vue.component('Replies', {
    template: 
        `<div class="replies-inner">
            <i class="fa-solid fa-reply" @click="replying = !replying" v-if="currentUser != 'Anonymous'" title="Reply to this review!"></i>
            <div v-if="replying" class="reply-create">
                <h5>Replying as [[currentUser.username]]</h5>
                <textarea v-model="replyText" @keyup="characterLimitCount"></textarea>
                <span :class="{counterror : countReplyError }">[[remainingReplyCount]]</span>
                <button @click="addReply">Send</button>
            </div>
            <div v-for="reply in replies" v-if="!reply.secondary_reply" class="reply-wrapper">
                <div class="reply">
                    <cite>[[reply.user]]
                        <span class="post-time">[[dateString(reply.posted)]]</span>
                    </cite> 
                    <p>[[reply.comment_text]]</p>
                    <i class="fa-solid fa-reply" @click="threadToggle(reply.id)" v-if="currentUser != 'Anonymous'" title="Reply to this comment!"></i>
                    <div v-if="replyTo === reply.id" class="reply-create">
                        <h5>Replying as [[currentUser.username]]</h5>
                        <textarea v-model="threadText" @keyup="characterLimitCount"></textarea>
                        <span :class="{counterror : countThreadError }">[[remainingThreadCount]]</span>
                        <button @click="addThreadReply(reply.id)">Send</button>
                    </div>
                </div>
                <div v-for="t in threaded" v-if="t.secondary_reply === reply.id" class="reply thread">
                    <cite>[[t.user]]
                        <span class="post-time">[[dateString(t.posted)]]</span>
                    </cite> 
                    <p>[[t.comment_text]]</p>
                </div>
            </div>
        </div>`,
    props: {
        review: Object
    },
    delimiters: ['[[', ']]'],
    data: () => {
        return {
            replies: [],
            threaded: [],
            currentUser: {},
            replying: false,
            replyTo: null,
            replyText: '',
            maxCount: 400,
            remainingReplyCount: 400,
            remainingThreadCount: 400,
            countReplyError: false,
            countThreadError: false,
            threadText: '',
        }
    },
    methods: {
        async getReplies() {
            this.threaded = []
            axios.get(`/api/${this.review.id}/replies/`).then(res => {
                this.replies = res.data
                this.replies.forEach(reply => {
                    if (reply.secondary_reply) this.threaded.push(reply)
                })
            })
        },
        addReply() {
            if (this.currentUser != "Anonymous" 
            && this.currentUser.username != ''
            && this.replyText != '') {
                axios.post('/api/replies/new/', {
                    "user": this.currentUser.id,
                    "reply_to": this.review.id,
                    "comment_text": this.replyText
                }, { headers: { 'X-CSRFToken': this.$root.token } 
                }).then(res => {
                    this.replying = false
                    this.replyText = ''
                    this.getReplies()
                })
            }
        },
        addThreadReply(parent) {
            if (this.currentUser != "Anonymous" 
            && this.currentUser.username != ''
            && this.threadText != '') {
                axios.post('/api/replies/new/', {
                    "user": this.currentUser.id,
                    "reply_to": this.review.id,
                    "comment_text": this.threadText,
                    "secondary_reply": parent
                }, { headers: { 'X-CSRFToken': this.$root.token } 
                }).then(res => {
                    this.replyTo = null
                    this.threadText = ''
                    this.getReplies()
                })
            }
        },
        characterLimitCount() {
            this.remainingReplyCount = this.maxCount - this.replyText.length
            this.remainingThreadCount = this.maxCount - this.threadText.length
            this.countReplyError = this.remainingReplyCount < 0
            this.countThreadError = this.remainingThreadCount < 0
        },
        authenticate() {
            axios.get('/api/current/').then(res => {
                this.currentUser = res.data
                if (this.currentUser.username === '') this.currentUser = 'Anonymous'
            })
        },
        dateString(date) {
            return new Date(date).toLocaleString()
        },
        threadToggle(replyId) {
            if (this.replyTo === replyId) return this.replyTo = null
            else return this.replyTo = replyId
        }
    },
    mounted() {
        this.authenticate()
        this.getReplies()
    },
    watch: { 
        review() {
          this.getReplies()
        }
    }
})

Vue.component('ProductReviews', {
    template: 
        `<div>
            <div v-for="review in reviews" class="review-contents">
                <h3>
                    [[review.title]] 
                    <span v-for="star in review.rating" class="review-stars">
                        <i class="fa-solid fa-star"></i>
                    </span><span v-for="star in (5 - review.rating)" class="review-nostar">
                    <i class="fa-solid fa-star"></i>
                    </span>
                </h3>
                <cite>by [[review.user]] 
                    <span class="post-time">[[dateString(review.posted)]]</span>
                </cite>
                <p v-if="review.description">[[review.description]]</p>

                <div class="replies-box">
                    <replies :review="review"></replies>
                </div>
            </div>
            <div v-if="reviews.length === 0" class="review-contents">
                No reviews for this product yet! Be the first to add one. ☺
            </div>
            <div class="review-contents">
                <fieldset>
                    <h3>Make a Review!</h3>
                    <div class="star-display">
                        <label for="review-rating"></label>
                        <div v-for="star in parseInt(newReviewRating)" :id="star" 
                        @click="newReviewRating = star" class="fullstar" @mouseleave="hovering = null">
                            <i class="fa-solid fa-star"></i>
                        </div>
                        <div v-for="empty in (5 - parseInt(newReviewRating))" 
                        :id="empty + parseInt(newReviewRating)" 
                        @click="newReviewRating = (empty + parseInt(newReviewRating))"
                        class="emptystar" :class="{fullstar: hovering >= empty + parseInt(newReviewRating)}"
                        @mouseover="hovering = empty + parseInt(newReviewRating)" @mouseleave="hovering = null">
                            <i class="fa-solid fa-star"></i>
                        </div>
                    </div>
                    <label for="review-title"></label>
                    <input type="text" v-model="newReviewTitle" placeholder="Review Title"/>
                    <textarea v-model="newReviewDescription" placeholder="Your Review" @keyup="characterLimitCount"></textarea>
                    <span :class="{counterror : countError }">[[remainingCount]]</span>
                    <button @click="submitReview" id="reviewbutton">SEND</button>
                    <p v-if="showError && errorlog.title" class="error">Title field must not be Null</p>
                    <label for="review-description"></label>
                </fieldset>
            </div>
        </div>`,
    props: {
        listing: Object,
        reviews: Array
    },
    delimiters: ['[[', ']]'],
    data: () => {
        return {
            hovering: null,
            newReviewTitle: null,
            newReviewDescription: null,
            maxCount: 1000,
            remainingCount: 1000,
            countError: false,
            newReviewRating: 0,
            currentUser: {},
            errorlog: {},
            showError: false,
        }
    },
    methods: {
        async submitReview() {
            await axios.get('/api/current/').then(res => {
                this.currentUser = res.data.username
                if (this.currentUser === '') this.currentUser = 'Anonymous'
            })

            axios.post(`/api/reviews/new/`, {
                "title": this.newReviewTitle,
                "description": this.newReviewDescription,
                "date": this.activeDate,
                "rating": parseInt(this.newReviewRating),
                "product": this.listing.id,
                "user": this.currentUser
            }, { headers: { 'X-CSRFToken': this.$parent.token } })
                .then(() => {
                    this.$parent.getReviews(this.listing.id)
                    this.newReviewTitle = null
                    this.newReviewDescription = null
                    this.newReviewRating = 0
                })
                .catch(err => {
                    this.errorlog = JSON.parse(err.request.response)
                    this.showError = true
                    setTimeout(() => {
                        this.showError = false
                    }, 3000)
                })
        },
        characterLimitCount() {
            this.remainingCount = this.maxCount - this.newReviewDescription.length
            this.countError = this.remainingCount < 0;
        },
        dateString(date) {
            return new Date(date).toLocaleString()
        }
    }
})

Vue.component('OrderHistory', {
    template: 
        `<div>
        <cite>[[customerTitle]]</cite>
        <section v-if="orders.length > 0">
            <h4>Your Order History:</h4>
            <details v-for="order in orders" class="order-histories">
                <summary>Order #[[order.id]]</summary>
                <ul v-for="o in order.product_ordered" class="history-info">
                <li>
                    [[o.product.name]]
                    <span v-if="o.product.type === 'S'">Sticker</span>
                    <span v-else-if="o.product.type === 'P'">Pin</span>
                    <span v-else>Hat</span>
                    x[[o.quantity]]
                </li>
                </ul>
            </details>
        </section>
        <section v-else>
            <h4>No order history. We look forward to you shopping with us!</h4>
        </section>
        </div>`,
    delimiters: ['[[', ']]'],
    data: () => {
        return {
            currentUser: {},
            orders: [],
            customerTitle: ''
        }
    },
    methods: {
        getOrderHistory() {
            axios.get('/api/current/')
            .then(res => {
                this.currentUser = res.data
                if (this.currentUser.username != '') {
                    // ensure not anonymous user got here
                    axios.get('/api/orders/').then(res => {
                        this.orders = res.data.reverse()
                        this.setTitle()
                    })
                }
            })
        },
        setTitle() {
            customerTitles = {
                0: 'New Kid',
                1: 'One-Time Order Wonder',
                2: 'Sticker Apprentice',
                3: 'Sticker Initiate',
                4: 'Our Favorite'
            }

            this.customerTitle = customerTitles[this.orders.length]
            if (!this.customerTitle) {
                return this.customerTitle = 'Sticker Champ'
            } else return this.customerTitle
        }
    },
    mounted() {
        this.getOrderHistory()
    }
})

Vue.component('ItemListings', {
    template: `
    <div class="inner-listing" @mouseover="hovering = true" @mouseleave="hovering = false"
    @click="openProduct(listing.id)" :class="{out: isOut}">
        <div v-if="isOut" class="stock-notice">SOLD OUT</div>
        <h3>[[listing.name]]</h3>
        <img :src="listing.image" class="itempreview" loading="lazy"/>
        <button v-if="hovering && !isOut" @click.stop="cartFromPreview">Add to Cart</button>
    </div>`,
    props: {
        listing: Object,
    },
    delimiters: ['[[', ']]'],
    data: () => {
        return {
            hovering: false
        }
    },
    methods: {
        cartFromPreview() {
            this.$parent.addingToCart = true
            setTimeout(() => {
                this.$parent.addingToCart = false
            }, 1000)

            this.listing.inventory --

            axios.patch(`/api/product/${this.listing.id}/`,
            { "inventory": this.listing.inventory },
            { headers: { 'X-CSRFToken': this.$parent.token } }
            ).then(res => { 
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
                this.$parent.saveCart(this.$parent.shoppingCart)
            })
        },
        openProduct(itemID) {
            axios.get(`/api/product/${itemID}`).then(res => {
                this.$parent.activeProduct = res.data
                this.$parent.getReviews(itemID)
            })
            this.$parent.showHome = false
            this.$parent.showShop = false
            this.$parent.showCart = false
            this.$parent.showProduct = true
            this.$parent.showProfile = false
        },
    },
    computed: {
        isOut() {
            if (this.listing.inventory === 0) return true
            else return false
        }
    }
})

Vue.component('ShoppingCart', {
    template: `
    <div>
        <div v-for="item in cart" class="cart-item">
            <h4 @click="toItem(item.product)">
                [[item.product.name]]
                <span v-if="item.product.type === 'S'"> Sticker</span>
                <span v-else-if="item.product.type === 'P'"> Pin</span>
                <span v-else> Hat</span>
            </h4>
            <i class="fa-solid fa-delete-left delete-item" @click="deleteFromCart(item)"></i>
            <p>[[item.price]] <em v-if="item.quantity > 1">at [[item.product.price]] each</em></p>
            <span class="edit-item">
                <i class="fa-solid fa-minus edit-button" @click="quantityDown(item)" v-if="item.quantity > 1"></i>
                <i class="fa-solid fa-minus edit-null" v-else></i>
                <span class="quantity-display">[[item.quantity]]</span>
                <i class="fa-solid fa-plus edit-button" @click="quantityUp(item)" v-if="item.product.inventory > 0"></i>
                <i class="fa-solid fa-plus edit-null" v-else></i>
            </span>
        </div>
        <h4> TOTAL: $[[orderSum]] </h4>
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
    },
    methods: {
        toItem(product) {
            axios.get(`/api/product/${product.id}`).then(res => this.$parent.activeProduct = res.data)
            this.$parent.showHome = false
            this.$parent.showShop = false
            this.$parent.showCart = false
            this.$parent.showProduct = true
            this.$parent.showProfile = false
        },
        quantityUp(product) {
            product.quantity ++
            product.product.inventory --

            axios.patch(`/api/product/${product.product.id}/`,
            { "inventory": product.product.inventory },
            { headers: { 'X-CSRFToken': this.$parent.token } }
            ).then(res => { 
                let newCost = product.product.price * product.quantity
                product.price = newCost.toFixed(2)
                this.$parent.saveCart(this.cart)
            })
        },
        quantityDown(product) {
            product.quantity --
            product.product.inventory ++

            axios.patch(`/api/product/${product.product.id}/`,
            { "inventory": product.product.inventory },
            { headers: { 'X-CSRFToken': this.$parent.token } }
            ).then(res => {
                let newCost = product.product.price * product.quantity
                product.price = newCost.toFixed(2)
                // order sum only recomputes when the outer price value changes, must prompt in +/-
                this.$parent.saveCart(this.cart)
            })
        },
        deleteFromCart(product) {
            let newStock = product.product.inventory + parseInt(product.quantity)

            axios.patch(`/api/product/${product.product.id}/`,
            { "inventory": newStock },
            { headers: { 'X-CSRFToken': this.$parent.token } }
            ).then(response => {
                this.activeProduct = response.data
                this.buyingNumber = 1
                this.newItem = true

                const index = this.cart.indexOf(product)
                if (index !== -1) {
                    this.cart.splice(index, 1)
                }
                if (this.cart.length === 0) {
                    this.totalPrice = 0
                // total price will not compute on empty cart; must be set manually.
                }
                this.$parent.saveCart(this.cart)
            })
        }
    }
})

Vue.component('AdminPanel', {
    template: `
    <section class="panel">
        <h3>Item Management</h3>
        <section class="inventory-wrapper">
        <div v-for="product in fullInventory" class="inventory-edit">
            <h5>[[product.name]] <i class="fa-solid fa-delete-left delete-item" @click="deleteProduct(product)"></i></h5>
            Current Stock: [[product.inventory]]
            <button class="fa-solid fa-wrench" @click="editToggle(product.id)"></button>
            <div v-if="edit === product.id">
                <label for="stockupdate">New Stock: </label>
                <input type="number" v-model="editStock" min=0>
                <button class="fa-solid fa-floppy-disk" @click="updateInventory(product)"></button>
            </div>
        </div>
        </section>
        <h3>Add New Product</h3>
        <div class="new-fields">
            <div id="add-name">
                <label for="name">Product Name: </label>
                <input type="text" name="name" v-model="newProductName" required>
                <div v-if="showError && errorlog.name" class="error">
                [[ errorlog.name[0] ]]
                </div>
            </div>
            <div id="add-description">
                <label for="description">Description: </label>
                <input type="text" name="description" v-model="newProductDesc" required>
                <div v-if="showError && errorlog.description" class="error">
                [[ errorlog.description[0] ]]
                </div>
            </div>
            <div id="add-type">
                <label for="type">Type: </label>
                <select name="type" v-model="newProductType" required>
                    <option value="S">Sticker</option>
                    <option value="P">Pin</option>
                    <option value="H">Hat</option>
                </select>
            </div>
            <div id="add-file">
                <label for="file">File: </label>
                <input type="file" name="file" ref="file" accept="image/*" @change="onFileChange" required>
                <div v-if="showError && errorlog.image" class="error">
                [[ errorlog.image[0] ]]
                </div>
            </div>
            <div id="add-price">
                <label for="price">Price: </label>
                <input type="text" name="price" v-model="newProductPrice" required>
                <div v-if="showError && errorlog.price" class="error">
                [[ errorlog.price[0] ]]
                </div>
            </div>
            <div id="add-stripe-price">
                <label for="stripe">Stripe Price ID: </label>
                <input type="text" name="stripe" v-model="newProductStripeCode" required>
                <div v-if="showError && errorlog.price_id" class="error">
                [[ errorlog.price_id[0] ]]
                </div>
            </div>
            <div id="add-inventory">
                <label for="inventory">Stock: </label>
                <input type="number" name="inventory" v-model="newProductStock" min=1 required>
                <div v-if="showError && errorlog.inventory" class="error">
                [[ errorlog.inventory[0] ]]
                </div>
            </div>
            <button @click="newProduct">Upload</button>
        </div>
    </section>`,
    delimiters: ['[[', ']]'],
    data: () => {
        return {
            fullInventory: [],
            edit: null,
            editStock: 0,
            newProductName: '',
            newProductDesc: '',
            newProductType: '',
            newProductPrice: '',
            newProductStripeCode: '',
            newProductStock: 50,
            newProductFile: '',
            newFile: '',
            errorlog: {},
            showError: false
        }
    },
    methods: {
        retrieveInventory() {
            axios.get('/api/all/').then(res => this.fullInventory = res.data)
        },
        deleteProduct(product) {
            if (confirm(`Do you really want to delete ${product.name}?`)) {
                axios.delete(`/api/inventory/delete/${product.id}/`,
                { headers: { 'X-CSRFToken': this.$parent.token } }
                ).then(res => this.retrieveInventory())
            }
        },
        editToggle(productId) {
            if (this.edit === productId) return this.edit = null
            else return this.edit = productId
        },
        updateInventory(product) {
            axios.patch(`/api/product/${product.id}/`,
            { "inventory": this.editStock },
            { headers: { 'X-CSRFToken': this.$parent.token } }
            ).then(res => {
                this.editStock = 0
                this.edit = null
                this.retrieveInventory()
            })
        },
        newProduct() {
            let fd = new FormData()
            fd.append('name', this.newProductName)
            fd.append('description', this.newProductDesc)
            fd.append('image', this.newFile)
            fd.append('price', this.newProductPrice)
            fd.append('type', this.newProductType)
            fd.append('price_id', this.newProductStripeCode)
            fd.append('inventory', this.newProductStock)

            axios.post("/api/inventory/new/", fd,
            { headers: { 'X-CSRFToken': this.$parent.token } })
            .then(res => {
                this.newProductName = ''
                this.newProductDesc = ''
                this.newProductType = ''
                this.newProductPrice = ''
                this.newProductStripeCode = ''
                this.newProductStock = 50
                this.newFile = ''
                this.retrieveInventory()
            })
            .catch(err => {
                this.errorlog = JSON.parse(err.request.response)
                this.showError = true
                setTimeout(() => {
                    this.showError = false
                }, 3000)
            })
        },
        onFileChange(e) {
            this.newFile = e.target.files[0]
        },
    },
    mounted() {
        this.retrieveInventory()
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
        showProfile: false,
        showAdmin: false,
        menuHover: false,
        modalUp: false,
        lastFilter: null,
        newItem: true,
        shoppingCart: [],
        buyingNumber: 1,
        addingToCart: false,
        copying: false,
        activeProduct: {},
        activeReviews: [],
        inventory: [],
        stripeKey: '',
        token: '',
        stripe: null,
        stockError: false,
    },
    methods: {
        goHome() {
            this.showHome = true
            this.showShop = false
            this.showCart = false
            this.showProduct = false
            this.showProfile = false
            this.showAdmin = false
        },
        openShop(type) {
            this.lastFilter = type
            this.showHome = false
            this.showShop = true
            this.showCart = false
            this.showProduct = false
            this.showProfile = false
            this.showAdmin = false
            this.getProducts(type)
        },
        openCart() {
            this.showHome = false
            this.showShop = false
            this.showCart = true
            this.showProduct = false
            this.showProfile = false
            this.showAdmin = false
        },
        openProfile() {
            this.showHome = false
            this.showShop = false
            this.showCart = false
            this.showProduct = false
            this.showProfile = true
            this.showAdmin = false
        },
        openAdmin() {
            this.showHome = false
            this.showShop = false
            this.showCart = false
            this.showProduct = false
            this.showProfile = false
            this.showAdmin = true
        },
        async copyLink(productId) {
            const base = new URL(window.location.href)
            const productLink = `${base.origin}/?product=${productId}`
            try {
                await navigator.clipboard.writeText(productLink)
                this.copying = true
                setTimeout(() => {this.copying = false}, 800)
            } catch(err) {
                alert('There was a problem copying the link- try again in a moment.')
            }
        },
        addToCart(quantity) {
            if (quantity <= this.activeProduct.inventory) {
                this.addingToCart = true
                setTimeout(() => {
                    this.addingToCart = false
                }, 1000)

                let newStock = this.activeProduct.inventory - parseInt(this.buyingNumber)
                axios.patch(`/api/product/${this.activeProduct.id}/`,
                    { "inventory": newStock },
                    { headers: { 'X-CSRFToken': this.token } }
                    ).then(response => {
                        this.activeProduct = response.data

                        this.shoppingCart.forEach(listing => {
                            if (listing.product.id === this.activeProduct.id) {this.newItem = false}
                        })
                        if (this.newItem) {
                            this.shoppingCart.push( {quantity: quantity, product: this.activeProduct, price: (quantity * this.activeProduct.price).toFixed(2)})
                        } else {
                            let match = this.shoppingCart.find(product => product.product.id === this.activeProduct.id)
                            match.quantity = parseInt(match.quantity) + parseInt(quantity)
                            match.price = (match.quantity * match.product.price).toFixed(2)
                            match.product.inventory = this.activeProduct.inventory
                        }

                        this.buyingNumber = 1
                        this.newItem = true
                        this.saveCart(this.shoppingCart)
                    })
            } else {
                this.stockError = true
                setTimeout(() => {
                    this.stockError = false
                }, 2000)
            }
        },
        getProducts(sort) {
            if (sort === null) {
                axios.get('/api/all/').then(res => this.inventory = res.data)
            } else if (sort === 'lowstock') {
                axios.get('/api/all/').then(res => this.inventory = res.data.filter(item => item.inventory < 15 && item.inventory > 0))
            }else {
                axios.get('/api/type/', {
                    params: { type: sort }
                }).then(res => this.inventory = res.data)
            }
        },
        getReviews(productId) {
            axios.get(`/api/reviews/${productId}`).then(res => this.activeReviews = res.data.reverse())
        },
        productFromLaunch(productId) {
            axios.get(`/api/product/${productId}`).then(res => {
                this.activeProduct = res.data
                this.getReviews(productId)
            })
            .catch (err => window.location.replace('http://127.0.0.1:8000/error/'))
            this.lastFilter = null
            this.showHome = false
            this.showProduct = true
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
                return this.stripe.redirectToCheckout({sessionId: res.data.sessionId})
            })
            .catch(err => console.error(err))
        },
        saveCart(userCart) {
            localStorage.setItem('cart', JSON.stringify(userCart));
        },
        averageRound(average) {
            if (average) {
                let av = new Number(average)
                return av.toFixed(2)
            }
        }
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
        },
    },
    mounted() {
        this.token = document.querySelector('input[name=csrfmiddlewaretoken]').value
        this.getStripeKey()
        const cartData = localStorage.getItem('cart');
        this.shoppingCart = cartData ? JSON.parse(cartData) : [];

        const url = new URL(window.location.href)
        if (url.searchParams.has('product')) {
            let params = window.location.href.split('?')
            let productMatch = params[1].match(/(?<=product=)\d+(?=&|)/)
            this.productFromLaunch(productMatch[0])
        }
    },
})
