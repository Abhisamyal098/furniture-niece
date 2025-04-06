# FurniCraft - E-commerce Platform for Furniture

FurniCraft is a full-stack e-commerce platform built with Node.js, Express, and MongoDB. It provides a complete solution for selling furniture online, including user authentication, product management, shopping cart, order processing, and payment integration.

## Features

- User authentication and authorization
- Product management with categories and subcategories
- Shopping cart functionality
- Order processing and management
- Payment integration with Stripe
- Coupon system
- Product reviews and ratings
- Email notifications
- File uploads
- API rate limiting
- Security features (XSS protection, CORS, etc.)

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT
- **Payment**: Stripe
- **Email**: Nodemailer
- **File Upload**: Multer
- **Security**: Helmet, XSS Clean, HPP, etc.

## Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/furnicraft.git
cd furnicraft
```

2. Install dependencies
```bash
npm install
```

3. Create a .env file in the root directory and add the following variables:
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/furnicraft
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_email_password
FROM_EMAIL=noreply@furnicraft.com
FROM_NAME=FurniCraft
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
FRONTEND_URL=http://localhost:3000
```

4. Start the development server
```bash
npm run dev
```

## API Documentation

The API documentation is available at `/api-docs` when running the server in development mode.

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/updatedetails` - Update user details
- `PUT /api/v1/auth/updatepassword` - Update password
- `POST /api/v1/auth/forgotpassword` - Forgot password
- `PUT /api/v1/auth/resetpassword` - Reset password

### Products

- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/:id` - Get single product
- `POST /api/v1/products` - Create product (admin only)
- `PUT /api/v1/products/:id` - Update product (admin only)
- `DELETE /api/v1/products/:id` - Delete product (admin only)

### Categories

- `GET /api/v1/categories` - Get all categories
- `GET /api/v1/categories/:id` - Get single category
- `POST /api/v1/categories` - Create category (admin only)
- `PUT /api/v1/categories/:id` - Update category (admin only)
- `DELETE /api/v1/categories/:id` - Delete category (admin only)

### Reviews

- `GET /api/v1/reviews` - Get all reviews
- `GET /api/v1/reviews/:id` - Get single review
- `POST /api/v1/reviews` - Create review
- `PUT /api/v1/reviews/:id` - Update review
- `DELETE /api/v1/reviews/:id` - Delete review

### Orders

- `GET /api/v1/orders` - Get all orders
- `GET /api/v1/orders/:id` - Get single order
- `POST /api/v1/orders` - Create order
- `PUT /api/v1/orders/:id/status` - Update order status (admin only)
- `PUT /api/v1/orders/:id/cancel` - Cancel order

### Cart

- `GET /api/v1/cart` - Get cart
- `POST /api/v1/cart/items` - Add item to cart
- `PUT /api/v1/cart/items/:id` - Update cart item
- `DELETE /api/v1/cart/items/:id` - Remove item from cart
- `DELETE /api/v1/cart` - Clear cart
- `POST /api/v1/cart/coupon` - Apply coupon
- `DELETE /api/v1/cart/coupon` - Remove coupon

### Coupons

- `GET /api/v1/coupons` - Get all coupons
- `GET /api/v1/coupons/:id` - Get single coupon
- `POST /api/v1/coupons` - Create coupon (admin only)
- `PUT /api/v1/coupons/:id` - Update coupon (admin only)
- `DELETE /api/v1/coupons/:id` - Delete coupon (admin only)
- `POST /api/v1/coupons/validate` - Validate coupon

## Testing

Run tests using:
```bash
npm test
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 