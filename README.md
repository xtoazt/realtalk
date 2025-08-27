# real. - Modern Real-Time Chat Application

A production-ready, modern real-time chat application built with Next.js, TypeScript, and Tailwind CSS.

## ✨ Features

### 🎨 Modern UI/UX
- **Revamped Design System**: Complete overhaul with modern glass morphism effects
- **Improved Dark Mode**: Fixed dark mode implementation with proper color schemes
- **Smooth Animations**: Enhanced transitions and micro-interactions
- **Responsive Design**: Optimized for all device sizes
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support

### 🔔 Smart Notifications
- **Tab-Aware Notifications**: Only shows notifications when user is on different tabs
- **Global Notification System**: Works from any chat, not just the current one
- **Click Navigation**: Click notifications to navigate directly to the relevant chat
- **Permission Management**: Proper notification permission handling

### 🎯 Production Improvements
- **Performance Optimized**: Faster loading times and smoother interactions
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Type Safety**: Full TypeScript implementation
- **Build Optimization**: Successful production builds with no errors
- **SSR Compatible**: Works with server-side rendering

### 🚀 Enhanced Features
- **Modern Theme Toggle**: Smooth theme switching with server persistence
- **Improved Chat Experience**: Better message handling and real-time updates
- **Enhanced Navigation**: Intuitive navigation with visual feedback
- **Better User Experience**: Loading states, error messages, and success feedback

### 🤖 Smart AI Features
- **AI-Powered Chat Input**: Real-time sentiment analysis, content moderation, and smart suggestions
- **Smart Message Display**: AI insights, tone analysis, and conversation context
- **Smart AI Assistant**: Conversation analysis, summaries, and contextual help
- **Multiple AI Personas**: Choose from 5 different AI personalities (Assistant, Tutor, Creative, Coder, Wellness Guide)
- **Language Translation**: Real-time message translation in 10+ languages
- **Smart Settings**: Comprehensive AI preferences and feature management
- **Content Moderation**: Automatic detection of inappropriate content
- **Conversation Insights**: Analytics on conversation pace, participants, and activity
- **Smart Summaries**: AI-generated conversation summaries for long chats
- **Contextual Help**: Intelligent assistance based on current conversation context

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with custom styling
- **State Management**: React Context with custom hooks
- **Real-time**: Socket.IO for live messaging
- **Database**: SQLite with Neon serverless
- **Authentication**: Custom JWT-based auth system
- **AI Integration**: Google Gemini AI for smart features
- **AI Models**: Gemini 1.5 Flash & Pro for different capabilities

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd realtalk
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run database migrations**
   ```bash
   pnpm run migrate
   ```

5. **Start the development server**
   ```bash
   pnpm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🧪 Testing

### Automated Testing
Run the comprehensive test suite:
```bash
node test-site.js
```

This will test:
- ✅ Basic navigation and loading
- ✅ Authentication system
- ✅ Dashboard functionality
- ✅ Theme toggle and persistence
- ✅ Navigation menu
- ✅ Global chat functionality
- ✅ Settings page
- ✅ Responsive design
- ✅ Dark mode persistence
- ✅ Error handling
- ✅ Performance metrics

### Smart AI Features Testing
Test the AI-powered features:
```bash
node test-smart-features.js
```

This will test:
- ✅ Smart Chat Input with AI analysis
- ✅ Smart Message display with insights
- ✅ Smart AI Assistant functionality
- ✅ Smart Settings and AI preferences
- ✅ Translation features
- ✅ Smart suggestions
- ✅ Content moderation
- ✅ Conversation insights
- ✅ AI persona switching
- ✅ Performance and responsiveness
- ✅ Accessibility compliance
- ✅ Accessibility features

### Manual Testing Checklist

#### Core Functionality
- [ ] User registration and login
- [ ] Global chat messaging
- [ ] Direct messaging
- [ ] Group chat creation and management
- [ ] Friend requests and management
- [ ] Poll creation and voting
- [ ] Channel management
- [ ] Voice chat (if enabled)

#### UI/UX Features
- [ ] Dark/light mode toggle
- [ ] Color hue customization
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Smooth animations and transitions
- [ ] Loading states and error messages
- [ ] Accessibility features (keyboard navigation, screen readers)

#### Notifications
- [ ] Notification permission request
- [ ] Notifications only show when on different tabs
- [ ] Click notifications to navigate to relevant chats
- [ ] Notification content and formatting
- [ ] Notification auto-dismiss

#### Performance
- [ ] Fast page loading
- [ ] Smooth scrolling and interactions
- [ ] Real-time message updates
- [ ] Efficient resource usage

## 🎨 Design System

### Color Palette
- **Primary**: Modern grays with accent colors
- **Hue System**: Customizable accent colors (blue, purple, pink, red, orange, yellow, green, teal)
- **Dark Mode**: Proper contrast ratios and accessibility

### Components
- **Modern Buttons**: Multiple variants with hover effects
- **Glass Cards**: Backdrop blur effects with transparency
- **Enhanced Inputs**: Better focus states and validation
- **Responsive Layout**: Mobile-first design approach

### Animations
- **Fade In**: Smooth page transitions
- **Slide In**: Navigation animations
- **Scale In**: Interactive element feedback
- **Hover Effects**: Subtle lift and glow effects

## 🔧 Configuration

### Environment Variables
```env
# Database
DATABASE_URL=your_database_url

# Authentication
JWT_SECRET=your_jwt_secret

# External Services
GROQ_API_KEY=your_groq_api_key
FIREBASE_CONFIG=your_firebase_config
```

### Customization
- **Colors**: Modify `app/globals.css` for color scheme changes
- **Components**: Update UI components in `components/ui/`
- **Animations**: Adjust timing in CSS animations
- **Notifications**: Configure in `lib/notification-service.ts`

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ using modern web technologies**
