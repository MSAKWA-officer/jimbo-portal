const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Inahakikisha mtumiaji ame-login (ana token halali) kabla ya kufikia route
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Huna ruhusa. Tafadhali ingia (login) kwanza.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Akaunti hii haipo au imezimwa.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token si sahihi au imeisha muda wake.' });
  }
};

// Inazuia route kwa role fulani tu, mfano: authorize('admin')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Huna ruhusa ya kufanya kitendo hiki.' });
    }
    next();
  };
};

// Kama request ina token halali, huweka req.user (kama protect juu) - LAKINI
// haikatai request endapo token haipo au si sahihi (huendelea bila req.user).
// Hutumika kwenye routes zinazoruhusiwa kwa wageni (mfano: usajili wa
// hadhara wa /auth/register) lakini ambazo pia zinahitaji kutambua endapo
// mwombaji ni admin aliye-login, ili kumpa ruhusa za ziada asizonazo mgeni.
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
      });

      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch (error) {
    // Token batili au imeisha muda - request inaendelea kama mgeni (bila req.user)
  }

  next();
};

module.exports = { protect, authorize, optionalAuth };
