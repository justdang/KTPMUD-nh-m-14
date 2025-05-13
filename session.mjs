import session from 'express-session';

const Session = session({
  secret: 'your_secret_key',   // Bạn đổi secret này theo ý bạn
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60 * 60 * 1000 } // session tồn tại 1 giờ
});

export default Session;
