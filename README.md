# Randomized Shipt Cart Test

This test adds random products to a cart on the Shipt website and verifies that those items were added correctly.

## Installation

Install Google Chrome or Chromium from their websites or your distros package manager.

Clone the repository and enter the directory:

```
git clone https://github.com/MarquessV/Randomized-Shipt-Cart-Test.git
cd Randomized-Shipt-Cart-Test
```

Install the dependencies:

```
npm install
```

Install and run selenium-standalone

```
npm run selenium_install
npm run selenium_start
```

Create a credentials.json file formatted like so and save it to the projects root directory:
```
{
  "email": YOUR_LOGIN_EMAIL,
  "password": YOUR_LOGIN_PASSWORD
}
```

Finally, run the test:
```
npm test
```

## Other Configuration

In the config.json file you can change the search term used from the default of 'Tofu'

## Shipt Q&A

### If you chose to use a tool or language other than the recommended, briefly explain why.
N/A

### How did you go about locating the elements for your tests?
I preferred an ID when possible, since IDs are usually short, clear, and unique. However, this wasn't avaialable on most elements. In the absence of an ID, I tried to use a selector that helped make it clear in the code what element I was choosing. For example, I use the selector 'div.filter-show-more' since it makes it clear that I am trying to interact with the 'show more' button. Finally, for working with the product and category lists, I used XPATH selectors. These were the most reliable since it is easy to find and get the XPATH of a specific element with Chrome's built in dev tools. When I had to use XPATH selectors, I assigned them to a variable so I could reuse them easier and still make my intent clear in the code. 

### If your test was running successfully on a regular basis, then suddenly began to fail, how would you find and correct the problem?
I tried to log a good amount of relevant information to the console. Not only does it allow me to get a better look at whats going on in terms of variables and their values but when a test failed I could generally tell where the code was when the problem occured. I would use the error in conjuction with this information to figure out what went wrong. For example, a common problem I ran into initially was when I was trying to click on elements that were not visible. Because I could see where my logging stopped in the test I could easily tell which click() caused the error and debug the issue. When other problems arose, I could usually tell what went wrong by looking at logged items in the console. For example, NaN would be parsed out of the total results sometimes because the value wasn't loaded yet. What was happening and where was very clear based on this observation.

### What is one additional validation step that you would add to the test, if any?
A couple things that I wanted to do but left out because of time constraints:
 * verifying that the login was successful,
 * verify that the given search term returns at least one result,
 * verify that the items added were in the cart even in the case that the cart wasn't empty (store a list of the items in cart before adding, add products, then verify using the stored list in case you added products that existed before).

### Did you spot any bugs within the application while creating the test? If so, report it here just as you would report it to the engineer responsible for fixing it.

Hey ${Engineer}, I noticed that on 'thin' resolutions the product listing doesn't display correctly. That is, only a single row of products appears and runs off the right of the page. This happened to me on Chrome, the window was half the width of
my laptop screen, about 683px wide, and I was looking at the search results for 'Tofu'.
