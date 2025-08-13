# JV HELP - Multilingual Philanthropic Website

A dynamic, multilingual website for Shri Jayveer Jeevdaya Group showcasing their philanthropic activities with support for English, Hindi, and Gujarati languages.

## 🌟 Features

- **Multilingual Support**: English, Hindi, and Gujarati
- **Dynamic Content**: Database-driven content management
- **Interactive Elements**: Animal friends world, language switcher
- **Responsive Design**: Works on all devices
- **Real-time Language Switching**: No page reload required

## 🚀 Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Animations**: Lottie, Three.js

## 📦 Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd jv-help-website
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Update `.env` with your Supabase credentials:
```env
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
```

5. Run the development server:
```bash
npm run dev
```

## 🗄️ Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration files in order:
   - `supabase/migrations/20250710074257_graceful_summit.sql`
   - `supabase/migrations/20250710074309_hidden_feather.sql`

## 🌐 Deployment on Vercel

### Method 1: GitHub Integration (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration

3. **Set Environment Variables**:
   - In Vercel dashboard, go to Project Settings → Environment Variables
   - Add:
     - `SUPABASE_URL`: Your Supabase project URL
     - `SUPABASE_ANON_KEY`: Your Supabase anonymous key
     - `NODE_ENV`: `production`

4. **Deploy**: Vercel will automatically deploy on every push to main branch

### Method 2: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

## 🔧 Configuration Files

- `vercel.json`: Vercel deployment configuration
- `package.json`: Dependencies and scripts
- `.env.example`: Environment variables template

## 🌍 API Endpoints

- `GET /api/hero-content?lang=hi` - Get hero content in specific language
- `GET /api/content/activities?lang=gu` - Get activities in specific language
- `GET /api/health` - Health check endpoint

## 📱 Language Support

The website supports three languages:
- **English** (`en`) - Default
- **Hindi** (`hi`) - हिंदी
- **Gujarati** (`gu`) - ગુજરાતી

Language switching is handled both on the frontend (static content) and backend (database content).

## 🎨 Customization

### Adding New Languages

1. **Database**: Add new columns like `title_fr`, `description_fr`
2. **Frontend**: Update translation objects in `public/js/app.js`
3. **Language Switcher**: Add new language option in HTML

### Adding New Content Tables

1. **Create Migration**: Follow the pattern in existing migrations
2. **API**: Use the generic `/api/content/:table` endpoint
3. **Frontend**: Use `loadMultilingualContent()` function

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, contact us at:
- WhatsApp: +91 7041046986
- Instagram: [@jv_help](https://www.instagram.com/jv_help)

---

Made with ❤️ for animal welfare by Shri Jayveer Jeevdaya Group