const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Usuario');
const Usuario = mongoose.model('usuarios');
const bcrypt = require('bcryptjs');
const passport = require('passport');

router.get('/registro', (req, res) => {
  res.render('usuarios/registro');
});

router.post('/registro', (req, res) => {
  var erros = [];

  let nome = req.body.nome;
  if (nome || typeof nome == undefined || nome == null) {
    erros.push({texto: 'Nome invalido'});
  }

  let email = req.body.email;
  if (email || typeof email == undefined || email == null) {
    erros.push({texto: 'Email invalido'});
  }

  let senha = req.body.senha;
  if (senha || typeof senha == undefined || senha == null) {
    erros.push({texto: 'Senha invalido'});
  }

  if (senha.length < 4) {
      erros.push({texto: 'Senha muito curta'});
   }

  if (senha != req.body.senha2) {
    erros.push({texto: 'As senhas sao diferentes, tente novamente'});
  }

  if (erros.length > 0) {
      res.render('usuarios/registro', {erros: erros});
  }else{
    Usuario.findOne({email: req.body.email}).lean().then((usuario) => {
      if (usuario) {
        req.flash('error_msg', 'Ja existe uma conta com este email');
        res.redirect('usuarios/registro');
      }else{

        const novoUsuario = new Usuario({
          nome: nome,
          email: email,
          senha: senha
        });
        
        bcrypt.genSalt(10,  (erro, salt) => {
          bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
            if (erro) {
              req.flash('error_msg', 'Houve um erro durante o salvamento do usuario');
              res.redirect('/');
            }
            novoUsuario.senha = hash;
            novoUsuario.save().then(() => {
              req.flash('success_msg', 'Usuario criado com sucesso');
              res.redirect('/');
            }).catch((err) => {
              req.flash('error_msg', 'Houve um erro ao criar o usuario, tente novamente');
              res.redirect('/usuarios/registro');
            })
          })
        })
      }
    }).catch((err) => {
      req.flash('error_msg', 'Houve um erro interno');
        res.redirect('/');
    })
  }
});

router.get('/login', (req, res) => {
  res.render('usuarios');
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/usuarios/login',
    failureFlash: true
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'Deslogando com sucesso');
  res.redirect('/');
});

module.exports = router;
