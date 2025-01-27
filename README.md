# Ride-Sharing API

A RESTful API for a ride-sharing platform that manages users, drivers, and trips. Built with Node.js and Express.

## Features

- User Authentication (Register/Login)
- Driver Management
- Trip Booking and Management
- Real-time Driver Status
- OTP Verification for Rides
- Fare Calculation

## API Endpoints

### User Routes
```
POST /api/user/register - Register a new user
POST /api/user/login - User login
```

### Driver Routes
```
POST /api/driver/register - Register a new driver
POST /api/driver/login - Driver login
GET /api/driver/toggle-status - Toggle driver's online/offline status
GET /api/driver/pending-rides - Get list of pending ride requests
POST /api/driver/accept-ride/:uid - Accept a specific ride
POST /api/driver/verify-otp/:uid - Verify ride OTP
POST /api/driver/ride-completed/:uid - Mark ride as completed
POST /api/driver/ride-cancelled/:uid - Cancel a ride
```

### Trip Routes
```
POST /api/trip/get-fare - Calculate trip fare
POST /api/trip/book-ride - Initialize a new booking
GET /api/trip/requesting-ride/:uid - Request a specific ride
GET /api/trip/get-trip/:uid - Get trip details
```

## Authentication

The API uses token-based authentication. Protected routes require a valid authentication token to be included in the request header as `x-auth-token`.

## Response Format

All API responses follow a consistent format:

```javascript
// Success Response
{
    "code": 200,
    "data": {}, // Response data
    "message": "Success message"
}

// Error Response
{
    "code": 500, // or 400, 404, etc.
    "message": "Error message"
}
```

## Getting Started

1. Clone the repository
```bash
git clone <repository-url>
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
Create a `.env` file in the root directory and add:
```
API_KEY=your_api_key
# Add other required environment variables
```

4. Start the server
```bash
node .\index.js
```

## Dependencies

- express
- bcrypt - Password hashing
- joi - Request validation
- axios - HTTP client
- dotenv - Environment variable management

## Error Handling

The API implements comprehensive error handling with appropriate HTTP status codes and error messages:
- 200: Success
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
