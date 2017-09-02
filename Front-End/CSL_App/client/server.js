Router.route('/', function () {
    this.render('startup');
});

Router.route('/login', function () {
  this.render('login');
});

Router.route('/signin', function () {
  this.render('signin');
});

Router.route('/CSL', function () {
  this.render('CSL');
});

