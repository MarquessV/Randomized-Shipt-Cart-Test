// We use two json files to store commonly needed information
// credentials.json contains the email and password for the test account.
// config.json contains URLs to commonly visited pages, such as the home page, and the desired search term.
const options = require('../../options');

const credentials = {
  email: options.credentials.email,
  password: options.credentials.password
};

const pages = options.config.pages;

const search_term = options.config.search_term;

// Various selectors we can use throughout the test
const cart = '[ng-click="cartClick()"]';

// We use an xpath form for product and category selectors to make selecting a random one easier
const base_product_xpath = '//*[@id="homeIonContent"]/div/div/div/div[1]/div[2]/div';
const product_xpath_name_suffix = '/ion-item/div[1]/p';
const product_xpath_add_suffix = '/ion-item/div[1]/div[2]/button[2]';

const category_xpath = '//*[@id="homeIonContent"]/div/div/div/div[1]/div[1]/filter-sort/div/div[3]/div[2]/div/ion-item';

// Selects a random product in the current view and adds to to the cart
// @returns string the name of the product that was added
function AddRandomProductToCart()
{
  // Get ready to add a random item to the cart
  var search_total_selector = 'span.count.ng-binding';
  browser.waitForVisible(base_product_xpath);
  browser.waitForVisible(search_total_selector);
  browser.pause(500); // This short pause reduces the chance that the search total hasn't loaded yet
  // Get the total number search results
  var search_total = parseInt(browser.getText(search_total_selector));
  // If search total didn't load yet, we resort to selecting the first product (since it is the only one guaranteed to exist).
  if(isNaN(search_total) || search_total == 0) { 
    console.log("Failed to generate a valid random number, selecting the first product instead.");
    search_total = 1;
    product_to_choose = "1"; 
  } else {  // Otherwise we generate a random number in the range [1, search_total]
    console.log("Search total = " + search_total);
    // Generate a random number within the range of search results to use as the index for the product
    var product_to_choose = (Math.floor(Math.random() * search_total) + 1).toString();
    console.log("Product number chosen = " + product_to_choose);
  }

  // Create the xpath selector for the randomly selected product
  var product_selector = base_product_xpath + '/div[' + product_to_choose + ']';
  // Note: Because the products will overflow horizontally, this test will fail on thin (< 683px width in my case) resolutions. 
  // You can use moveToObject with large offsets to mitigate this, but it still doesn't work everytime even on large resolutions.
  // Not to mention that its deprecated.
  // If the product item is further down the list, it probably isn't loaded yet so we scroll down the page until it is.
  browser.keys('End');  // Start at the bottom to preemptively load more items.
  var curr_item = 1;
  while(curr_item <= search_total && !browser.isExisting(product_selector + product_xpath_add_suffix)) {
    browser.scroll(product_selector + '/div[' + curr_item.toString() + ']');
    curr_item++;
  }
  // Once the item exists, scroll to it and wait for it to be visible
  browser.scroll(product_selector + product_xpath_add_suffix);
  browser.waitForVisible(product_selector + product_xpath_add_suffix);
  // then add the product to the cart and return the product name.
  browser.click(product_selector + product_xpath_add_suffix);
  return browser.getText(product_selector + product_xpath_name_suffix);
}

describe('Shipt Cart Test', function() {

  // Variables to hold the items we added to the cart
  var first_added_item, second_added_item;
  
  // Log the test names before every test for clearer logging.
  beforeEach(function() {
    console.log("\nStart Test: " + this.currentTest.title);
  });

  it('Access Homepage', function() {
    browser.url(pages.home);
    console.log("Page title: " + browser.getTitle())
    console.log("Page URL: " + browser.getUrl());
  });

  it('Login', function() {
    browser.waitForVisible('a.button-secondary.right');
    browser.click('a.button-secondary.right');

    browser.waitForVisible('input[type="email"]');
    browser.setValue('input[type="email"]', credentials.email);
    browser.setValue('input[type="password"]', credentials.password);

    browser.click('#start_shopping_login_button');
  });

  // We should empty the cart first, primarily because later on if we add a product to the cart, and the wrong product
  // was added but the correct one already existed in the cart, then the future test would pass even though there was
  // an error
  it('Empty cart', function() {
    browser.waitForVisible(cart); 
    browser.pause(2500);  // It can take a few seconds to load the subtotal
    if(browser.getText(cart) != "$0.00") {  // If the cart isn't empty:
      console.log("Cart was not empty");
      browser.click(cart);                  // Go to the cart
      browser.waitForVisible('[ng-click="clearCart(true)"]'); 
      browser.click('[ng-click="clearCart(true)"]');    // Click the clear cart button
      browser.waitForVisible('button:nth-child(2)[ng-repeat="button in buttons"]');
      browser.click('button:nth-child(2)[ng-repeat="button in buttons"]');  // Confirm by clicking "Yes" on the popup
      browser.url(pages.home);  // Return to the home page
    }
    expect(browser.getText(cart)).to.equal("$0.00", 'Cart should be empty');
  });

  // Next we search for the desired item and add a random one of the results to the cart.
  it("Add to cart using search", function() {
    // Perform a search using search_term
    browser.scroll('#search');
    browser.waitForVisible('#search');
    browser.setValue('#search', search_term);
    browser.scroll('button[type="submit"]');
    browser.waitForVisible('button[type="submit"]');
    browser.click('button[type="submit"]');

    // Add a random product to the cart and log it.
    first_product_added = AddRandomProductToCart();
    console.log("Name of product chosen: " + first_product_added);
  });

  // Similarly, we choose a random category and add a random product from the now filtered results. 
  it("Add to cart using category", function() {
    // Get ready to choose a random category
    browser.scroll(category_xpath);
    browser.waitForVisible(category_xpath);
    // The number of entries is found by looking at the number of entries for categories given by the JSON object
    // webriverio returns when looking at the selector.
    var total_categories = Object.entries(browser.elements(category_xpath))[1][1].length;
    // The range of categories we can choose from should start at 2, since the first option is "all categories".
    var random_category = (Math.floor(Math.random() * (total_categories-2)) + 2).toString();
    console.log("Total categories = " + total_categories);
    console.log("Category number chosen = " + random_category);
    // Create the selector for the chosen category
    var category_selector = category_xpath + '[' + random_category + ']';
    // Click the show more button until the chosen category is visible
    while(!browser.isVisible(category_selector)) {
      browser.scroll('div.filter-show-more');
      browser.waitForVisible('div.filter-show-more');
      browser.click('div.filter-show-more');
      browser.scroll(category_selector);
    }
    browser.click(category_selector);
    // Add a random product to the cart under the selected category and log it.
    second_product_added = AddRandomProductToCart();
    console.log("Name of product chosen: " + second_product_added);
  });

  it("Verify that the products added were correct", function() {
    browser.url(pages.cart);
    first_item_selector = 'div.cart-items-area>div>div:nth-child(2) ';
    // We expect at least the first item to exist, if it doesn't then the cart is empty
    expect(browser.isExisting(first_item_selector)).to.equal(true, 'Cart is empty');
    // A third item should not exist in the cart, if it does then we added to many items to the cart
    expect(browser.isExisting('div.cart-items-area>div>div:nth-child(4)')).to.equal(false, 'More than two items in the cart')
    // If the two products we added happened to be the same, then there will only be one entry and we expect...
    if(first_product_added == second_product_added) {
      console.log("Case: Both products were the same");
      cart_item = browser.getText(first_item_selector + 'p.product-name');
      console.log("Cart item: " + cart_item);
      expect(cart_item).to.equal(first_product_added, 'The product in the cart did not match');  // The product names to match and
      product_count = browser.getText(first_item_selector + 'span.button.button-price.ng-binding');
      console.log("Product count: " + product_count);
      expect(product_count).to.equal("2", 'Two of the same items were added, but exactly two are not in the cart'); // the total of that product in the cart to be 2
    }
    else {  // Otherwise, we can check that the two items are correct by...
      second_item_selector = 'div.cart-items-area>div>div:nth-child(3) ';
      console.log("Case: Products were distinct");
      expect(browser.isExisting(second_item_selector)).to.equal(true, 'Added two distinct products but only one item is in the cart');  // ensuring a second item exists in the cart...
      cart_items = browser.getText(first_item_selector + 'p.product-name');
      console.log("Cart item 1: " + cart_items);
      cart_items += browser.getText(second_item_selector + 'p.product-name'); // Concatenating the product names and
      console.log("Cart item 2: " + browser.getText(second_item_selector + 'p.product-name'));
      // checking if the match either permutation of the products we logged earlier.
      expect(cart_items === first_product_added + second_product_added || cart_items === second_product_added + first_product_added).to.equal(true, 'The products in the cart did not match');
    }

  });

});
