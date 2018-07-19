const bodyParser = require('body-parser');
// const urlencodeParser = bodyParser.urlencoded({ extended: false});


let data = [
  {
    name: 'Mohaimin Islam',
    age: 24
  }
]

module.exports = (app) => {
  app.get('/form', (req, res) => {

    res.render('form', {form: data});

    // get data from mongodb and pass it to the view
    // Todo.find({}, (err, data) => {
    //   if(err) throw err;
    //   res.render('todo', {todos: data});

    // })
  });

  // app.post('/', urlencodeParser, (req, res) => {
    
  //   // get data from the view and add it to mongodb
  //   let newTodo = Todo(req.body).save( (err, data) => {
  //     if (err) throw err;
  //     res.json(data);
  //   })
  // });

  // app.delete('/:item', (req, res) => {

  //   let deletedItem = req.params.item;
  //   deletedItem = deletedItem.substring(1);

  //   // delete the requested item from mongodb
  //   Todo.find({ item: deletedItem }).remove( (err, data) => {
  //     if (err) throw err;
  //     res.json(data);
  //   })
  // });
  

}