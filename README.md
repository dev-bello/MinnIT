# MinnIT - Visitor Management System

A modern, secure visitor management system built with React, Supabase, and Tailwind CSS. MinnIT provides comprehensive visitor tracking, guard verification, and resident management for residential estates.

## 🚀 Features

### 🔐 Authentication & Security
- **Multi-role authentication** (Developer, Admin, Guard, Resident, Super Admin)
- **Password reset functionality** with email verification
- **User registration** with email confirmation
- **Secure session management** with Supabase Auth

### 👥 User Management
- **Role-based access control** with hierarchical permissions
- **Profile management** for all user types
- **Estate administration** for developers and admins
- **Guard and resident management** with detailed profiles

### 🏠 Estate Management
- **Multi-estate support** for property developers
- **Estate-specific configurations** and settings
- **Resident and guard assignment** to specific estates
- **Comprehensive estate analytics** and reporting

### 👤 Visitor Management
- **Visitor invitation system** for residents
- **OTP-based verification** for secure entry
- **Manual OTP entry** for guards (QR code scanning coming soon)
- **Visitor history tracking** and logs
- **Real-time notifications** for all parties

### 📱 Modern UI/UX
- **Responsive design** that works on all devices
- **Modern glass-morphism design** with smooth animations
- **Intuitive navigation** with role-based dashboards
- **Real-time updates** and notifications
- **Loading states** and error handling

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS, Radix UI components
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Icons**: Lucide React
- **State Management**: React Context API

## 📋 Prerequisites

- Node.js 16+ 
- npm or yarn
- Supabase account and project

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd minnit-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   - Run the SQL migrations in `supabase/migrations/`
   - Configure Row Level Security (RLS) policies
   - Set up authentication providers

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

The system uses the following main tables:

- **estates**: Top-level estate information
- **estate_admins**: Estate administrators and super admins
- **guards**: Security personnel assigned to estates
- **residents**: Estate residents with apartment details
- **visitor_invites**: Visitor invitation system
- **visitor_logs**: Entry/exit tracking
- **notifications**: System notifications
- **residency_requests**: Resident maintenance requests

## 👤 User Roles & Permissions

### 🏢 Developer
- Create and manage multiple estates
- View comprehensive analytics
- Manage estate administrators

### 👨‍💼 Estate Admin
- Manage guards and residents
- View visitor logs and reports
- Handle residency requests
- Estate-specific configurations

### 🛡️ Guard
- Verify visitor OTP codes
- View visitor history
- Submit shift reports
- Access guard-specific dashboard

### 🏠 Resident
- Invite visitors
- Manage visitor invitations
- View personal visitor history
- Submit maintenance requests

### 👑 Super Admin
- System-wide administration
- Create estates and admins
- Global analytics and reporting

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Run the migration files in order:
   - `20250702094415_green_frog.sql`
   - `20250702100138_fragrant_heart.sql`
   - `20250702100318_pink_grass.sql`
3. Configure authentication settings
4. Set up email templates for notifications

### Environment Variables
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Deploy to Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

## 🧪 Testing

The project includes comprehensive error handling and loading states. To add unit tests:

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

## 📱 Mobile Support

The application is fully responsive and optimized for:
- Desktop browsers
- Tablets
- Mobile phones
- Progressive Web App (PWA) ready

## 🔒 Security Features

- **Row Level Security (RLS)** on all database tables
- **Role-based access control** throughout the application
- **Input validation** and sanitization
- **Secure authentication** with Supabase Auth
- **HTTPS enforcement** in production

## 🐛 Error Handling

The application includes comprehensive error handling:
- **Error boundaries** for React component errors
- **Loading states** for all async operations
- **User-friendly error messages**
- **Automatic retry mechanisms**
- **Graceful degradation** for network issues

## 📈 Performance

- **Code splitting** with Vite
- **Optimized bundle size**
- **Lazy loading** for components
- **Caching strategies** for API calls
- **Image optimization** ready

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the code comments
- Review the Supabase documentation for backend setup

## 🔮 Roadmap

- [ ] QR code scanning for visitor verification
- [ ] Mobile app (React Native)
- [ ] Advanced analytics and reporting
- [ ] Integration with smart locks
- [ ] Multi-language support
- [ ] Advanced notification system
- [ ] API documentation
- [ ] Unit and integration tests

## 📊 Demo Accounts

For testing purposes, use these demo accounts:

- **Admin**: admin@example.com / admin123
- **Guard**: guard001@example.com / guard123
- **Resident**: resident001@example.com / resident123

---

Built with ❤️ for secure and efficient visitor management