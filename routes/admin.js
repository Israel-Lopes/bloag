const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Categoria');
const Categoria = mongoose.model('categorias');
require('../models/Postagem');
const Postagem = mongoose.model('postagens');
const {eAdmin} = require('../helpers/eAdmin');

router.get('/', eAdmin, (req, res) => {
  res.render('admin/index');
});

router.get('/posts', eAdmin, (req, res) => {
  res.send("Pagina de posts");
});

router.get('/categorias', eAdmin, (req, res) => {
  Categoria.find().sort({date: 'desc'}).then((categorias) => {
    res.render('admin/categorias', {categorias: categorias.map(categorias => categorias.toJSON())}); 
    }).catch((err) => {
      req.flash('error_msg', 'Houve um erro ao listar as categorias' + err);
      res.redirect('/admin');
  });
});

router.get('/categorias/add', (req, res) => {
  res.render('admin/addcategorias');
});

router.post('/categorias/nova', eAdmin, (req, res) => {
  
  //Validacao
  let erros = [];

  let nome = req.body.nome;
  if (!nome || typeof nome == undefined || nome == null) {
    erros.push({texto: 'Nome invalido'});
  }

  let slug = req.body.slug;
  if (!slug || typeof slug == undefined || slug == null) {
    erros.push({texto: 'Slug invalido'});
  }

  if (nome.length < 2) {
    erros.push({texto: 'Nome da categoria muito pequeno'});
    }else{

      const novaCategoria = {
      nome: req.body.nome,
      slug: req.body.slug
    }
    
    if (erros.length > 0) {
      res.render('admin/addcategorias', {erros: erros});
    }

    new Categoria(novaCategoria).save().then(() => {
      req.flash('success_msg', 'categoria criada com sucesso')
      res.redirect('/admin/categorias');
      }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao salvar a categoria');
        console.log(err);
        res.redirect('/admin');
    });   
  }

});

router.get('/categorias/edit/:id', eAdmin, (req, res) => {
  Categoria.findOne({_id:req.params.id}).lean().then((categoria) => {
      res.render('admin/editcategorias', {categoria: categoria});
      }).catch((err) => {
      req.flash('error_msg', 'Esta mensagem nao existe'); 
      console.log(err);
      res.redirect('/admin/categorias');
  });
}); 

router.post('/categorias/edit', eAdmin, (req, res) => {
  Categoria.findById({_id: req.body.id}).then((categoria) => {

    categoria.nome = req.body.nome;
    categoria.slug = req.body.slug;
      categoria.save().then(() => {
      req.flash('success_msg', 'categoria editada com successo');
      res.redirect('/admin/categorias');
      }).catch((err) => {
        console.log(err);
        req.flash('error_msg', 'Houve um erro interno ao salvar a edicao da categoria');
        res.redirect('/admin/categorias');
    })

  }).catch((err) => {
    console.log(err);
    req.flash('error_msg', 'Houve um erro ao editar a categoria');
    res.redirect('/admin/categorias');
  });

});

router.post('/categorias/deletar', eAdmin, (req, res) => {
  Categoria.deleteOne({_id: req.body.id}).then(() => {
    req.flash('success_msg', 'Categoria deletada com successo');
    res.redirect('/admin/categorias');
  }).catch((err) => {
      req.flash('error_msg', 'Houve um erro ao deletar a categoria');
      res.redirect('/admin/categorias');
  });
});

router.get('/postagens', eAdmin, (req, res) => {
Postagem.find().populate('categorias').sort({data: 'desc'}).lean().then((postagens) => {
  res.render('admin/postagens', {postagens: postagens});
}).catch((err) => {
    req.flash('error_msg', 'Houve um erro ao listar as postagens');
    res.redirect('/admin');
    console.log(err);
  });
});

router.get('/postagens/add', eAdmin, (req, res) => {
  Categoria.find().lean().then((categorias) => {
    res.render('admin/addpostagem', {categorias: categorias});
    }).catch((err) => {
      req.flash('error_msg', 'Houve um erro ao carregar o formulario');
      res.redirect('/admin');
  })
});

router.post('/postagens/nova', eAdmin, (req, res) => {
  var erros = [];

  if (req.body.categoria == '0') {
    erros.push({texto: 'Categoria invalida, registre uma categoria'});
}
  if (erros.length > 0) {
      res.render('admin/addpostagem', {erros: erros});
      } else {
    const novaPostagem = {
      titulo: req.body.titulo,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      categoria: req.body.categoria,
      slug: req.body.slug
    }
    
    new Postagem(novaPostagem).save().then(() => {
      req.flash('success_msg', 'Postagem criada com sucesso');
      res.redirect('/admin/postagens');
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro durante o salvamento da postagem');
        res.redirect('/admin/postagens');
    });
  }
});

router.get('/postagens/edit/:id', eAdmin, (req, res) => {
  Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {
    Categoria.find().lean().then((categorias) => {
      res.render('admin/editpostagens', {categorias: categorias, postagem: postagem});
    }).catch((err) => {
      req.flash('error_msg', 'Houve um erro ao listar as categorias');
      res.redirect('/admin/postagens');
    })
  }).catch((err) => {
    req.flash('error_msg', 'Houve um erro ao carregar o formulario de edicao');
    res.redirect('/admin/postagens');
  })
});

router.post('/postagem/edit', eAdmin, (req, res) => {
  Postagem.findOne({_id: req.body.id}).lean().then((postagem) => {

    postagem.titulo = req.body.titulo,
    postagem.slug = req.body.slug,
    postagem.descricao = req.body.descricao,
    postagem.conteudo = req.body.conteudo,
    postagem.categoria = req.body.categoria

    postagem.save().then(() => {
      req.flash('success_msg', 'Postagem editada com sucesso');
      res.redirect('/admin/postagens');
    }).catch((err) => {
      console.log(err);
      req.flash('error_msg', 'Erro interno');
      res.redirect('/admin/postagens');
    })

  }).catch((err) => {
    console.log(err);
    req.flash('error_msg', 'Houve um erro ao salvar a edicao');
    res.redirect('/admin/postagem');
  });
});

router.get('/postagens/deletar/:id', eAdmin, (req, res) => {
  Postagem.deleteOne({_id: req.params.id}).then(() => {
    req.flash('success_msg', 'Postagem deletada com sucesso');
    res.redirect('admin/postagens');
  }).catch((err) => {
    req.flash('error_msg', 'Houve um erro interno');
    res.redirect('/admin/postagens');
  });
});

module.exports = router
