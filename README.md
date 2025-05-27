# Processimo - AI Automation SaaS Platform

Processimo is a full-stack SaaS platform where users can subscribe to AI agents and request workflows for their business needs.

## Features

- Authentication with email/username, Google, and GitHub
- Marketplace of AI agents and agent teams
- Subscription and billing management with Stripe
- Admin dashboard for managing agents and workflow requests
- User profile and settings management
- Custom workflow requests with priority levels
- Real-time dashboard statistics

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Stripe account for payment processing

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd processimo
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

   ```
   # Stripe API Keys (required for payment processing)
   STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
   VITE_STRIPE_PUBLIC_KEY=pk_test_YOUR_PUBLIC_KEY_HERE

   # Session Secret
   SESSION_SECRET=processimo-secure-session-key

   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/processimo

   # OAuth Credentials (for social login)
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   GITHUB_CLIENT_ID=your_github_client_id_here
   GITHUB_CLIENT_SECRET=your_github_client_secret_here
   ```

4. Initialize the database:
   ```
   npm run db:push
   ```

5. Start the development server:
   ```
   npm run dev
   ```

## Features in Detail

### Authentication
- Login with email or username
- Social login with Google and GitHub
- Secure password management
- Session-based authentication

### Workflow Requests
- Create custom workflow requests
- Set priority levels (1-10, 1 being highest)
- Specify complexity levels (Basic, Advanced, Enterprise)
- Request integrations with various services
- Track request status and progress

### Dashboard
- View active agents count
- Track automations run
- Monitor time saved
- Check subscription status
- Real-time statistics

## Stripe Integration

This application uses Stripe for payment processing. To set up Stripe integration:

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Go to the Developers > API keys section in the Stripe Dashboard
3. Copy your Publishable key and Secret key
4. Add them to your `.env` file:
   ```
   STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
   VITE_STRIPE_PUBLIC_KEY=pk_test_YOUR_PUBLIC_KEY_HERE
   ```

### Testing Payments

For testing, you can use Stripe's test card numbers:
- Card number: 4242 4242 4242 4242
- Expiration date: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

## Development

- Client code is in the `client` directory
- Server code is in the `server` directory
- Shared code is in the `shared` directory

### Project Structure
```
processimo/
├── client/           # Frontend React application
├── server/           # Backend Express server
├── shared/           # Shared types and utilities
├── package.json      # Project dependencies
└── README.md         # Project documentation
```

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm run check`: Type-check TypeScript
- `npm run db:push`: Push schema changes to database

## License

MIT 