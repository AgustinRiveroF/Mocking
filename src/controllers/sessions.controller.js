import { Router } from 'express';
import passport from 'passport';
import sessionService from '../services/session.service.js';
import { usersManager } from '../dao/managers/users.dao.js';
import { transporter } from '../utils/nodemailer.js';
import { cartsModel } from '../dao/models/cart.models.js';
import currentDTO from '../dao/dto/current.dto.js';
import usersRepository from '../dao/repositories/users.repository.js';

const router = Router();

const sessionsController = {
  getUser: (req, res) => {
    const user = req.session.passport ? req.session.passport.user : null;
    if (user && user.email) {
      res.json({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name, 
        email: user.email,
        role: user.role,
        cartId: user.cartID, 
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  },
    
  signup: async (req, res) => {
    passport.authenticate('signup', async (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const createdCart = await cartsModel.create({ userId: user._id, products: [] });
      user.cartId = createdCart._id;
      await user.save();

      req.login(user, async (loginErr) => {
        if (loginErr) {
          return res.status(500).json({ error: loginErr.message });
        }

        const { first_name, last_name, email } = req.body;
        const mailOptions = {
          from: 'FastDelivery',
          to: email,
          subject: `Bienvenido ${first_name} ${last_name}`,
          html: `<h1>Bienvenido ${first_name}! a Fast Delivery</h1><h2>Tu aventura esta recien comenzando!</h2><h3>Ante todo, gracias por unirte a nosotros</h3><p>Vamos a estar facilitando la manera en la que haces tus compras</p><p>Ya sea<ul><li>Supermercados</li><li>Tiendas</li><li>Restaurantes</li></ul></p><h4>Te invitamos a seguir explorando nuestra app para disfrutar todas nuestras ofertas</h4>`,
        };
        await transporter.sendMail(mailOptions);

        return res.redirect('/views/login');
      });
    })(req, res);
  },

  login: async (req, res) => {
    let errorMessage = '';

    try {
      const { email, password } = req.body;

      const adminUser = sessionService.loginAdmin(email, password);
      if (adminUser) {
        req.session.passport.user = adminUser;
        res.render('admin');
      }

      const user = await sessionService.loginUser(email, password);

      if (!user) {
        return res.redirect('/views/signup');
      }

      req.session.passport.user = user;
      console.log('Redirigiendo desde sessions controller');
      res.redirect('/api/products');
    } catch (error) {
      console.error('Error en la ruta de login:', error);
      return res.status(500).json({ error });
    }
  },

  githubAuth: passport.authenticate('github', { scope: ['user:email'] }),


  githubCallback: passport.authenticate('github', {
    failureRedirect: '/views/login',
    successRedirect: '/api/products',
  }),

  getCurrentUser: (req, res) => {
    const user = req.session.passport.user;

    if (user) {
      const userDTO = new currentDTO(user);
      return res.json(userDTO);
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  },

};

export default sessionsController;
