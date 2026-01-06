import dotenv from 'dotenv';
dotenv.config();
console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
console.log('Key prefix:', process.env.STRIPE_SECRET_KEY?.substring(0, 10) + '...');
