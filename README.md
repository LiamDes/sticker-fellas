# sticker-fellas
## Sticker Shop ☺️

## WEEK 1:

* Custom API of items
    * ListItem(model)
        * name: charfield, max_length=20
        * description: charfield, max_length=1000
        * image: imagefield [django docs](https://docs.djangoproject.com/en/4.2/ref/models/fields/#imagefield)
            * requires pillow library to be installed
        * price: decimalfield, max_digits=5,decimal_places=2
        * type: charfield, choices=PRODUCT_TYPESmax_length=1,default="s"
            * PRODUCT_TYPES=(('S','sticker'),('P','pin'),('H','hat'))
            * [docs choicefield](https://docs.djangoproject.com/en/4.2/ref/models/fields/#choices)
        * list_date: datefield, autofill to today (auto_now?)
        * artist: charfield -> choicefield of artist names
* Set up [Paypal Sandbox](https://developer.paypal.com/tools/sandbox/accounts/) for checkout
    * Note that paypal provides [test credit numbers](https://developer.paypal.com/tools/sandbox/card-testing/) so at no point does anyone need to put real card information here.
    * if there are difficulties setting up, use [local flavor](https://django-localflavor.readthedocs.io/en/latest/localflavor/us/) as a potential manual creation backup
* CustomUser model
    * shopping_cart = [ ]
    * checkout info saved here?
* I have to draw every listing oh no.

### MVP this week:
An authenticated user only may browse listings and "buy" items  
Listings have page viewings of "All" or "Sort by type"  
Checkout processes and displays success of payment or catches problem

### Nice to have extra: 
sort by price option, either ascending or descending


## WEEK 2:
* Adjust ListItem model to incorporate stock
    * stock: PositiveIntegerField, default=50
* guest accounts may use a vue data object ( shoppingCart: [ ] ), items won't be held in a cart like they would for an account holder
* Create new PATCH view allowing adding an item to cart to patch -1 to stock, removing from cart +1
* Create page where only staff accounts can upload new listings and update current listings. use decorator over view:

        django.contrib.admin.views.decorators.staff_member_required()

### MVP this week: 
Both guests and authenticated users can shop and deplete through item stock.  
Staff accounts only can access a page where they replenish stock or upload new items

### Extra:
Add nullable datetime added to cart
* if item in cart for x amount of days, remove?

## WEEK 3:
* Item reviews!
* create new model for ItemReview:
    * listing: ForeignKey to ListItem, cascade on delete
    * rating: research how best to field + validate this, star rating 1-5
    * comment: charfield, nullable if rating can be implemented
    * date: datefield, auto add today
    * user: ForeignKey to get_user_model() / CustomUser

### MVP this week:
Authenticated users can review products they feel some kind of emotion about! Uh oh!

### Extra:
Thread comments to be able to reply to reviews, likely a new model of Reply with a ForeignKey to what review it is a reply to.
Maybe a many to many foreign key to allow replies to replies?  

Automated email to original writer when someone replies to a review?

This is probably where I make a logo for the header.  

Add prompt on items that are out of stock to "notify when back in stock", maybe add list of item objects an account is waiting on restock for to CustomUser  

[A custom 404 page](https://levelup.gitconnected.com/django-customize-404-error-page-72c6b6277317) would be fun.

Save an account's card info?

### User view:
Overall landing page, top nav bar holds account info, link to cart, etc  
Header section  
nav bar to browse items. on mobile this bar should be on top, move later on  
Want an interactive browse navigation where subcategories extend from initial options, user may still click on base categories for broader browsing  
checkbox type display toggle for showing only items in stock or all  
Cart displays items and allows for proceeding to checkout  

### Other Planning Notes:
Generally, extra time can be allotted to asset creation
Start with minimum of 3 of each Product type. The maximum goal is Many. Should be mostly stickers. This is, after all, Sticker Fellas. If we wanted mostly hats we'd have to be hat fellas.