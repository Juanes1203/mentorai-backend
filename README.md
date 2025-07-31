# MentorAI Backend

Backend API server for MentorAI Virtual Teacher system.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation
```bash
npm install
```

### Environment Setup
Copy `.env.example` to `.env` and configure:

```env
PORT=5001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=mentorai_db
JWT_SECRET=your_jwt_secret
STRAICO_API_KEY=your_straico_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

### Database Setup
1. Create MySQL database:
```sql
CREATE DATABASE mentorai_db;
```

2. Run the schema:
```bash
mysql -u root -p mentorai_db < database/schema.sql
```

### Development
```bash
npm run dev
```

The API will be available at `http://localhost:5001`

### Production Build
```bash
npm run build
npm start
```

## 🔧 API Endpoints

### Classes
- `GET /api/classes` - Get all classes
- `GET /api/classes/:id` - Get class by ID
- `POST /api/classes` - Create new class
- `PUT /api/classes/:id` - Update class
- `PUT /api/classes/:id/analysis` - Update class analysis
- `DELETE /api/classes/:id` - Delete class

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### WhisperX
- `POST /api/whisperx/transcribe` - Transcribe audio

## 📁 Project Structure

```
src/
├── config/           # Configuration files
├── controllers/      # Route controllers
├── middleware/       # Express middleware
├── models/          # Data models
├── routes/          # API routes
├── services/        # Business logic
└── index.ts         # Entry point
```

## 🛠️ Technologies

- Node.js
- Express.js
- TypeScript
- MySQL
- JWT Authentication
- CORS
- Multer (file uploads)

## 📝 License

ISC 