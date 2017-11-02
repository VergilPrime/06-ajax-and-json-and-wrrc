'use strict';

function Article (rawDataObj) {
  this.author = rawDataObj.author;
  this.authorUrl = rawDataObj.authorUrl;
  this.title = rawDataObj.title;
  this.category = rawDataObj.category;
  this.body = rawDataObj.body;
  this.publishedOn = rawDataObj.publishedOn;
}

// REVIEWED: Instead of a global `articles = []` array, let's attach this list of all articles directly to the constructor function. Note: it is NOT on the prototype. In JavaScript, functions are themselves objects, which means we can add properties/values to them at any time. In this case, the array relates to ALL of the Article objects, so it does not belong on the prototype, as that would only be relevant to a single instantiated Article.
Article.all = [];

// COMMENTED: Why isn't this method written as an arrow function?
// Arrow functions are best suited for non method functions, any instantiations of the article constructor would not inherit prototypes from an arrow function.
Article.prototype.toHtml = function() {
  let template = Handlebars.compile($('#article-template').text());

  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);

  // COMMENTED: What is going on in the line below? What do the question mark and colon represent? How have we seen this same logic represented previously?
  // Not sure? Check the docs!
  // if publishedOn is truthy, then set publishStatus to a message including this.daysAgo, otherwise '(draft)'
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
  this.body = marked(this.body);

  return template(this);
};

// REVIEWED: There are some other functions that also relate to all articles across the board, rather than just single instances. Object-oriented programming would call these "class-level" functions, that are relevant to the entire "class" of objects that are Articles.

// REVIEWED: This function will take the rawData, how ever it is provided, and use it to instantiate all the articles. This code is moved from elsewhere, and encapsulated in a simply-named function for clarity.

// COMMENTED: Where is this function called? What does 'rawData' represent now? How is this different from previous labs?
// Article.loadAll is now called in the fetchAll function as apposed to the page load code.
Article.loadAll = rawData => {
  rawData.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)))

  rawData.forEach(articleObject => Article.all.push(new Article(articleObject)))
}

// REVIEWED: This function will retrieve the data from either a local or remote source, and process it, then hand off control to the View.
Article.fetchAll = () => {
  // REVIEWED: What is this 'if' statement checking for? Where was the rawData set to local storage?
  if (localStorage.rawData) {
    // REVIEWED: When rawData is already in localStorage we can load it with the .loadAll function above and then render the index page (using the proper method on the articleView object).

    //TODONE: This function takes in an argument. What do we pass in to loadAll()?
    Article.loadAll(JSON.parse(localStorage.rawData));

    // COMMENTED: How is this different from the way we rendered the index page previously? What the benefits of calling the method here?
    // This method gets data out of localStorage if available which reduces load time gathering data from a server every time.

  } else {
    // TODONE: When we don't already have the rawData:
    // - we need to retrieve the JSON file from the server with AJAX (which jQuery method is best for this?)
    $.getJSON('../data/hackerIpsum.json', function(data) {
      // - we need to cache it in localStorage so we can skip the server call next time
      localStorage.rawData = JSON.stringify(data)
      // - we then need to load all the data into Article.all with the .loadAll function above
      Article.loadAll(data);
    })

    // COMMENTED: Discuss the sequence of execution in this 'else' conditional. Why are these functions executed in this order?
    //They don't really have to based on how we structured it. Otherwise you would want to load the data into localStorage before trying to render it to the dom.
  }

  //TODONE: What method do we call to render the index page?
  articleView.initIndexPage(); //eslint-disable-line
}
