//importando pacotes
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Produto = require('./app/models/product');

mongoose.connect('mongodb://localhost/dbMongoAula');

//configuração para a aplicação usar o body-parser
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//definir porta onde o servidor vai responder
var port = process.env.port || 3000;

//definindo as rotas
var router = express.Router(); //interceptaçao de todas as portas

//middleware
router.use(function(req,res,next){
    console.log("Interceptação pelo Middleware");
    next(); // continuação da api
});

router.get('/', function(req, res){
    res.json({'message':'OK, rota de teste funcionando'});
});

//Rota produtos com ID de paramêtro.
router.route('/produtos/:productId')
    //Procurar produto por Id de parmêtro.
    .get(function(req, res){
        const id = req.params.productId

        Produto.findById(id, function(err, produto){
            if(err){
                res.status(500).json({
                    message: "Erro ao encontrar produto, ID fora do padrão."
                });
            }else if(produto == null){
                res.status(400).json({
                    message: "Produto não encontrado!"
                });
            }else{
                res.status(200).json({
                    message: "Produto encontrado com sucesso!",
                    produto: produto
                });
            }
        });
    })

    //Atualizar produto atráves de algum ID passado por paramêtro
    .put(function(req, res){
        const id = req.params.productId;

        Produto.findById(id, function(err, produto){
            if(err){
                res.status(500).json({
                    message: "Erro ao encontrar produto, ID fora do padrão."
                });
            }else if(produto == null){
                res.status(400).json({
                    message: "Produto não encontrado!"
                });
            }else{
                produto.nome = req.body.nome;
                produto.preco = req.body.preco;
                produto.descricao = req.body.descricao;

                produto.save(function(erroSave){
                    if(erroSave){
                        res.send("Erro ao tentar atualizar o produto."+erroSave);
                    }
                });

                res.status(200).json({
                    message: "Tudo OK! Produto atualizado com sucesso!"
                });
            }
        });
    })

    //Arrow function
    .delete(function(req,res){
        Produto.findByIdAndRemove(req.params.productId, (err, produto) => {
            if(err)
                return res.status(500).send(err);

            const response = {
                message: "Produto removido com sucesso",
                id: produto.id
            };
            return res.status(200).send(response);
        });
    });

//Rota produtos
router.route('/produtos')
    //Criar produto através de Post
    .post(function(req,res){
        var produto = new Produto();
        produto.nome = req.body.nome;
        produto.preco = req.body.preco;
        produto.descricao = req.body.descricao;

        produto.save(function(error){
            if (error) {
                res.send("Erro ao salvar produto, tente novamente mais tarde.")          
            }
            res.status(201).json({message: 'Produto inserido com sucesso'})
        })
    })

    //Chamar todos os produtos
    .get(function(req,res){
        // Retrieving only certain fields
        // Produto.find({}, 'nome descricao', function(err, prods){
        Produto.find(function(err, prods){
            if(err)
                res.send(err);

            res.status(200).json({
                message:"Produtos buscados com sucesso",
                todosProdutos:prods
            });
        });
    });


//faz o vínculo da aplicação(app) com o motor de rotas
app.use('/api', router);

app.listen(port);
console.log("API Server funcionando:" + port);