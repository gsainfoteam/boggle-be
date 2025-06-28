const jwt = require('jsonwebtoken');

const USER_UUID_FROM_DB = '8dc83a46-5e5a-45e7-86fd-bd40e599f7bd'; 

const JWT_SECRET = 'my_super_puper_mega_alpha_theta_gamma_secret_key'; 
const userPayload = {
    uuid: USER_UUID_FROM_DB,
    email: 'kkk@gmail.com', 
};

const token = jwt.sign(userPayload, JWT_SECRET, {
    expiresIn: '5h', 
});

console.log('Generated JWT:');
console.log(token);