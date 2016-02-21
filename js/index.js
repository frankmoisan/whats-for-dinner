'use strict';

// Easy access to React-Bootstrap's functions
var Accordion = ReactBootstrap.Accordion,
    Panel = ReactBootstrap.Panel;
var ListGroup = ReactBootstrap.ListGroup,
    ListGroupItem = ReactBootstrap.ListGroupItem;
var Input = ReactBootstrap.Input,
    Glyphicon = ReactBootstrap.Glyphicon;
var Button = ReactBootstrap.Button,
    Modal = ReactBootstrap.Modal;
var OverlayTrigger = ReactBootstrap.OverlayTrigger,
    Popover = ReactBootstrap.Popover;
var recipes,
    markdownHelp = "Heading\n=======\n\nSub-heading\n-----------\n\n### Another deeper heading\n\nParagraphs are separated\nby a blank line.\n\nLeave 2 spaces at the end of a line\nto do a line break.\n\nText attributes: *italic*, **bold**, \n`monospace`, ~~strikethrough~~ .\n\nBulletpoint list:\n  * apples\n  * oranges\n  * pears\n\nNumbered list:\n  1. apples\n  2. oranges\n  3. pears";

// Load existing recipes from LocalStorage, or set a default list
if (typeof localStorage['fm-recipebook'] != 'undefined') {
  recipes = JSON.parse(localStorage['fm-recipebook']);
} else {
  recipes = [{
    title: 'Chocolate Squares',
    ingredients: ['35% Cream', 'Graham Crackers', 'Chocolate Pudding'],
    preptime: '20 minutes',
    prep: '1. Make chocolate pudding. \n2. Make whipped cream. \n3. Line pan with row of crackers, pour pudding, add another row of crackers, pour more pudding, top with whipped cream.'
  }, {
    title: 'Banana Pudding',
    ingredients: ['Bananas', 'Condensed Milk', '35% Cream', 'Vanilla Pudding', 'Nilla Crackers'],
    preptime: '30 minutes',
    prep: '* Make vanilla pudding. \n* Make whipped cream. \n* Mix half of whipped cream with vanilla pudding and condensed milk. \n* Place row of crackers. \n* Pour one third of preparation. \n* Slice one and a half bananas. \n* Repeat two more times. \n* Top off with rest of whipped cream.'
  }, {
    title: 'Chinese Fondue Broth',
    ingredients: ['Beef Broth', 'Water', 'Onion Soup', 'Garlic', 'Worcestershire Sauce'],
    preptime: '5 minutes',
    prep: 'Bring 1 container of beef broth and 1 container of water to boil. \nAdd garlic, 3 drops of Worcestershire Sauce and onion soup. \nBoil for 5 minutes.'
  }, {
    title: 'Test Recipe',
    ingredients: ['Milk', 'Butter', 'Flour', 'Eggs', 'Vanilla Extract'],
    preptime: '5 minutes',
    prep: 'Throw everything together and hope for the best.'
  }];
}

var RecipeList = React.createClass({
  displayName: 'RecipeList',

  render: function render() {
    return React.createElement(
      'div',
      { className: 'well' },
      React.createElement(Recipe, { recipes: this.props.recipes, searchFilter: this.props.searchFilter, btnShowModal: this.props.btnShowModal })
    );
  }
});

var Recipe = React.createClass({
  displayName: 'Recipe',
  getInitialState: function getInitialState() {
    return {
      modalDeleteShow: false,
      modalDeleteKey: null,
      modalDeleteTitle: ''
    };
  },

  modalDeleteOpen: function modalDeleteOpen(event) {
    this.setState({
      modalDeleteShow: true,
      modalDeleteKey: event.target.id,
      modalDeleteTitle: recipes[event.target.id].title
    });
  },
  modalDeleteClose: function modalDeleteClose() {
    this.setState({
      modalDeleteShow: false,
      modalDeleteKey: null,
      modalDeleteTitle: ''
    });
  },
  delete: function _delete(event) {
    this.setState({
      modalDeleteShow: false,
      modalDeleteKey: null,
      modalDeleteTitle: ''
    });
    recipes.splice(event.target.id, 1);
    updateStorage();
  },
  markup: function markup(instructions) {
    // Handles Markdown
    var markedInstructions = marked(instructions.toString(), { sanitize: true });
    return { __html: markedInstructions };
  },
  render: function render() {
    var recipeDetails = [];
    var prepTime = [];
    var ingredientsList = [];
    var key = 0;

    // Build the detailed view for each recipe. Ingredients, PrepTime and finally Instructions
    this.props.recipes.forEach(function (recipe) {
      // If the search filter doesn't match what's in storage, return nothing...
      if (recipe.title.toLowerCase().indexOf(this.props.searchFilter.toLowerCase()) === -1) {
        return;
      }
      // ...otherwise, load the list
      ingredientsList = recipe.ingredients.map(function (ingredient) {
        return React.createElement(
          ListGroupItem,
          null,
          ingredient
        );
      });
      recipeDetails.push(React.createElement(
        Panel,
        { header: recipe.title, eventKey: key, bsStyle: 'warning' },
        React.createElement(
          'h4',
          null,
          'Preparation Time'
        ),
        React.createElement(
          Panel,
          null,
          recipe.preptime
        ),
        React.createElement(
          'h4',
          null,
          'Ingredients'
        ),
        React.createElement(
          ListGroup,
          null,
          ingredientsList
        ),
        React.createElement(
          'h4',
          null,
          'Instructions'
        ),
        React.createElement(
          Panel,
          null,
          React.createElement('span', { dangerouslySetInnerHTML: this.markup(recipe.prep) })
        ),
        React.createElement('hr', null),
        React.createElement(
          Button,
          { bsStyle: 'danger', id: key, onClick: this.modalDeleteOpen },
          'Delete'
        ),
        ' ',
        ' ',
        React.createElement(
          Button,
          { bsStyle: 'info', id: key, onClick: this.props.btnShowModal.bind(this, 'Edit Recipe', key) },
          'Edit'
        )
      ));
      key++;
    }.bind(this));
    return React.createElement(
      'div',
      null,
      React.createElement(
        'div',
        null,
        React.createElement(
          Modal,
          { show: this.state.modalDeleteShow, bsStyle: 'small', onHide: this.close },
          React.createElement(
            Modal.Header,
            null,
            React.createElement(
              Modal.Title,
              null,
              'Delete "',
              this.state.modalDeleteTitle,
              '" recipe?'
            )
          ),
          React.createElement(
            Modal.Footer,
            null,
            React.createElement(
              Button,
              { onClick: this.modalDeleteClose },
              'Cancel'
            ),
            ' ',
            ' ',
            React.createElement(
              Button,
              { onClick: this.delete, id: this.state.modalDeleteKey, bsStyle: 'warning' },
              'CONFIRM'
            )
          )
        )
      ),
      React.createElement(
        'div',
        null,
        React.createElement(
          Accordion,
          null,
          recipeDetails
        )
      )
    );
  }
});

var SearchBar = React.createClass({
  displayName: 'SearchBar',

  // Clear search field on Escape
  checkESC: function checkESC(event) {
    if (event.keyCode == 27) {
      this.props.onUserInput('');
    }
  },
  handleChange: function handleChange(event) {
    this.props.onUserInput(event.target.value);
  },
  render: function render() {
    return React.createElement(Input, {
      type: 'text',
      onKeyDown: this.checkESC,
      onChange: this.handleChange,
      placeholder: 'Search recipes. Press ESC to clear.',
      value: this.props.searchFilter,
      defaultValue: '',
      addonBefore: React.createElement(Glyphicon, { glyph: 'search' }),
      buttonAfter: React.createElement(ButtonNew, { btnShowModal: this.props.btnShowModal })
    });
  }
});

// New Recipe
var ButtonNew = React.createClass({
  displayName: 'ButtonNew',

  render: function render() {
    return React.createElement(
      Button,
      { bsStyle: 'primary', onClick: this.props.btnShowModal.bind(this, 'Add Recipe', 'add') },
      'New Recipe'
    );
  }
});

// Master Controller. Returns search results, manages add/edit modals and is an all-around swell component.
var App = React.createClass({
  displayName: 'App',
  getInitialState: function getInitialState() {
    return {
      searchFilter: '',
      showModal: false,
      modalRecipeName: '',
      modalPrepTime: '',
      modalIngredients: '',
      modalInstructions: '',
      key: '',
      recipeNameInput: ''
    };
  },

  close: function close() {
    // Fired when closing the modal
    this.setState({
      showModal: false,
      modalRecipeName: '',
      modalPrepTime: '',
      modalIngredients: '',
      modalInstructions: '',
      key: '',
      recipeNameInput: ''
    });
  },
  open: function open(command, key) {
    // Fired when opening the modal
    this.setState({
      showModal: true,
      command: command,
      key: key
    });
    // key 'add' is sent when adding a new recipe, otherwise the key is the id of the recipe being edited
    // If editing a recipe, load its information into the modal
    if (key !== 'add') {
      this.setState({
        modalRecipeName: recipes[key].title,
        modalPrepTime: recipes[key].preptime,
        modalIngredients: recipes[key].ingredients.join(', '),
        modalInstructions: recipes[key].prep,
        key: key
      });
    }
  },
  save: function save() {
    // Do a bit of checking to make sure the recipe name field is not empty
    if (this.refs.recipename.getValue().length < 1) {
      this.setState({ recipeNameInput: 'error' });
    } else {
      this.setState({ recipeNameInput: '' });
      var arrayIngredients = this.refs.ingredients.getValue();
      arrayIngredients = arrayIngredients.split(/,\s*/);
      var newRecipe = { title: this.refs.recipename.getValue(), ingredients: arrayIngredients, preptime: this.refs.preptime.getValue(), prep: this.refs.instructions.getValue() };

      if (this.state.key === 'add') {
        recipes.push(newRecipe);
      } else {
        recipes[this.state.key] = newRecipe;
      }

      this.close();
      updateStorage();
    }
  },
  handleUserInput: function handleUserInput(searchFilter) {
    // This function specifically handles the search filter for the Search Bar...
    this.setState({ searchFilter: searchFilter });
  },
  handleModalInput: function handleModalInput() {
    // ...while this one is part of the Recipe Name length-checking done earlier. Remove 'error' style when typing a character.
    if (this.refs.recipename.getValue().length > 0) {
      this.setState({ recipeNameInput: '' });
    }
  },
  render: function render() {
    return React.createElement(
      'div',
      null,
      React.createElement(
        'div',
        null,
        React.createElement(
          Modal,
          { show: this.state.showModal, onHide: this.close },
          React.createElement(
            Modal.Header,
            { closeButton: true },
            React.createElement(
              Modal.Title,
              null,
              this.state.command
            )
          ),
          React.createElement(
            Modal.Body,
            null,
            React.createElement(
              'h4',
              null,
              'Recipe Name'
            ),
            React.createElement(Input, { type: 'text', bsStyle: this.state.recipeNameInput, ref: 'recipename', placeholder: 'Recipe Name', defaultValue: this.state.modalRecipeName, onChange: this.handleModalInput, hasFeedback: true }),
            React.createElement(
              'h4',
              null,
              'Preparation Time'
            ),
            React.createElement(Input, { type: 'text', ref: 'preptime', placeholder: 'Preparation Time', defaultValue: this.state.modalPrepTime }),
            React.createElement(
              'h4',
              null,
              'Ingredients'
            ),
            React.createElement(Input, { type: 'textarea', ref: 'ingredients', placeholder: 'Ingredients list, separated by comma', defaultValue: this.state.modalIngredients }),
            React.createElement(
              'h4',
              null,
              'Instructions ',
              ' ',
              React.createElement(
                OverlayTrigger,
                { trigger: 'click', rootClose: true, placement: 'right', overlay: React.createElement(
                    Popover,
                    { title: 'Markdown Help' },
                    React.createElement(
                      'span',
                      { className: 'markdownHelp' },
                      markdownHelp
                    )
                  ) },
                React.createElement(Glyphicon, { className: 'help', glyph: 'question-sign' })
              )
            ),
            React.createElement(Input, { type: 'textarea', ref: 'instructions', rows: '10', placeholder: 'Supports Markdown - See hint for help', defaultValue: this.state.modalInstructions })
          ),
          React.createElement(
            Modal.Footer,
            null,
            React.createElement(
              Button,
              { onClick: this.close },
              'Cancel'
            ),
            ' ',
            ' ',
            React.createElement(
              Button,
              { bsStyle: 'success', onClick: this.save },
              'Save'
            )
          )
        )
      ),
      React.createElement(
        'div',
        null,
        React.createElement(SearchBar, { searchFilter: this.state.searchFilter, onUserInput: this.handleUserInput, btnShowModal: this.open }),
        React.createElement(RecipeList, { recipes: this.props.recipes, searchFilter: this.state.searchFilter, btnShowModal: this.open })
      )
    );
  }
});

var Header = React.createClass({
  displayName: 'Header',

  render: function render() {
    return React.createElement(
      'h1',
      null,
      'What\'s for dinner?'
    );
  }
});

var About = React.createClass({
  displayName: 'About',

  render: function render() {
    return React.createElement(
      'div',
      null,
      '2016-02-10 by Francis Moisan',
      React.createElement(
        'span',
        { className: 'pull-right' },
        React.createElement(
          'a',
          { href: 'http://codepen.io/frankmoisan/full/jbbErK/', target: '_blank' },
          'Portfolio'
        ),
        ' -',
        " ",
        React.createElement(
          'a',
          { href: 'http://github.com/frankmoisan', target: '_blank' },
          'Github'
        ),
        ' -',
        " ",
        React.createElement(
          'a',
          { href: 'mailto:frankmoisan@gmail.com', target: '_blank' },
          'Email'
        ),
        ' -',
        " ",
        React.createElement(
          'a',
          { href: 'https://ca.linkedin.com/in/francismoisan', target: '_blank' },
          'LinkedIn'
        )
      )
    );
  }
});

// Save recipes to localStorage and render app as needed
function updateStorage() {
  localStorage.setItem('fm-recipebook', JSON.stringify(recipes));
  ReactDOM.render(React.createElement(App, { recipes: recipes }), document.getElementById('content'));
}

updateStorage();
ReactDOM.render(React.createElement(Header, null), document.getElementById('header'));
ReactDOM.render(React.createElement(About, null), document.getElementById('about'));