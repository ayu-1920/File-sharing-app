# File Sharing Application

A complete full-stack file sharing application built with React, Node.js, Express, and MongoDB. Users can upload files, generate shareable links, and download files securely.

## Features

- **User Authentication**: Secure JWT-based login and registration system
- **File Upload**: Drag-and-drop or click-to-upload interface with file validation
- **File Sharing**: Generate unique shareable links for each uploaded file
- **File Download**: Download files via shareable links without authentication
- **File Management**: View, manage, and delete uploaded files
- **File Statistics**: Track total files, storage used, and download counts
- **Responsive Design**: Mobile-friendly interface
- **File Expiration**: Files automatically expire after 30 days
- **File Size Limits**: Configurable maximum file size (default: 10MB)
- **Security**: Rate limiting, file type validation, and secure file handling

## Tech Stack

### Frontend
- **React 18**: Modern React with hooks
- **React Router**: Client-side routing
- **Axios**: HTTP client for API requests
- **CSS3**: Custom styling with responsive design

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **Multer**: File upload handling
- **bcryptjs**: Password hashing
- **express-rate-limit**: Rate limiting

## Project Structure

```
file-sharing-app/
├── client/                 # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── Navbar.js
│   │   │   └── Navbar.css
│   │   ├── context/        # React context
│   │   │   └── AuthContext.js
│   │   ├── pages/          # Page components
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── FileUpload.js
│   │   │   ├── MyFiles.js
│   │   │   ├── SharedFile.js
│   │   │   └── Auth.css
│   │   ├── services/       # API services
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── package.json
│   └── .env
├── server/                 # Node.js backend
│   ├── middleware/         # Express middleware
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models/            # Mongoose models
│   │   ├── User.js
│   │   └── File.js
│   ├── routes/            # API routes
│   │   ├── auth.js
│   │   └── files.js
│   ├── uploads/           # File storage (created automatically)
│   ├── index.js
│   ├── package.json
│   └── .env
├── package.json            # Root package.json
├── .gitignore
└── README.md
```

## Installation and Setup

### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (running locally or MongoDB Atlas)
- **npm** or **yarn**

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd file-sharing-app

# Install all dependencies (root, server, and client)
npm run install-all
```

### Step 2: Environment Configuration

#### Backend Environment (server/.env)

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/file-sharing-app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

#### Frontend Environment (client/.env)

Create a `.env` file in the `client` directory:

```env
# React App Configuration
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 3: Start MongoDB

Make sure MongoDB is running on your system:

```bash
# For local MongoDB installation
mongod

# Or use MongoDB Atlas (update MONGODB_URI in server/.env)
```

### Step 4: Run the Application

#### Option 1: Run Both Frontend and Backend Together

```bash
# From the root directory
npm run dev
```

This will start both the backend server (port 5000) and frontend development server (port 3000) concurrently.

#### Option 2: Run Separately

```bash
# Start backend server
cd server
npm run dev

# In another terminal, start frontend
cd client
npm start
```

### Step 5: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **API Health Check**: http://localhost:5000/api/health

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Files

- `POST /api/files/upload` - Upload file (protected)
- `GET /api/files/my-files` - Get user's files (protected)
- `GET /api/files/share/:shareId` - Get file info by share ID (public)
- `GET /api/files/download/:shareId` - Download file by share ID (public)
- `DELETE /api/files/:fileId` - Delete file (protected)
- `GET /api/files/stats` - Get file statistics (protected)

## Usage

1. **Register Account**: Create a new account with username, email, and password
2. **Login**: Sign in with your credentials
3. **Upload Files**: Navigate to Upload page and drag-and-drop or select files
4. **Share Files**: Copy the generated share link to share with others
5. **Download Files**: Anyone with the share link can download the file
6. **Manage Files**: View all your files, track downloads, and delete if needed

## Configuration Options

### File Upload Settings

In `server/.env`:

- `MAX_FILE_SIZE`: Maximum file size in bytes (default: 10MB)
- `UPLOAD_PATH`: Directory to store uploaded files
- `ALLOWED_FILE_TYPES`: Configure allowed MIME types in `server/middleware/upload.js`

### JWT Settings

- `JWT_SECRET`: Secret key for token signing (change in production!)
- `JWT_EXPIRE`: Token expiration time

### Database Settings

- `MONGODB_URI`: MongoDB connection string
- Use MongoDB Atlas for cloud hosting

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents abuse with request rate limits
- **File Validation**: Validates file types and sizes
- **CORS Protection**: Configured CORS for secure cross-origin requests
- **Input Sanitization**: Prevents XSS and injection attacks

## Deployment

### Production Deployment

1. **Environment Variables**: Set production values in `.env` files
2. **Build Frontend**: `cd client && npm run build`
3. **Start Backend**: `cd server && npm start`
4. **Use Process Manager**: Use PM2 or similar for production
5. **Reverse Proxy**: Configure Nginx or Apache as reverse proxy
6. **HTTPS**: Enable SSL/TLS for secure connections

### Docker Deployment

```dockerfile
# Dockerfile example (to be created)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Ensure MongoDB is running
   - Check MONGODB_URI in server/.env
   - Verify network connectivity

2. **File Upload Issues**:
   - Check MAX_FILE_SIZE setting
   - Verify uploads directory permissions
   - Check file type restrictions

3. **CORS Errors**:
   - Verify FRONTEND_URL in server/.env
   - Check API URL in client/.env

4. **JWT Token Issues**:
   - Verify JWT_SECRET is set
   - Check token expiration time

### Getting Help

- Check the console logs for detailed error messages
- Verify all environment variables are set correctly
- Ensure all dependencies are installed
- Check network connectivity and firewall settings

## Future Enhancements

- [ ] File encryption for sensitive data
- [ ] Bulk file upload
- [ ] File preview functionality
- [ ] User profiles and avatars
- [ ] File organization with folders
- [ ] Advanced search and filtering
- [ ] Email notifications for file downloads
- [ ] Admin dashboard
- [ ] File versioning
- [ ] Integration with cloud storage providers
