# Educational App Starter

A Local-First React Starter for an Educational App with Drag-and-Drop Table functionality.

## 🚀 Features

- **Local-First Architecture**: All data stored and managed locally
- **Drag-and-Drop Table**: Powered by mantine-react-table with row reordering
- **Modern Tech Stack**: React 18, TypeScript, Vite, Mantine v7
- **Mobile Ready**: Capacitor 5 setup for future mobile deployment
- **Type Safety**: Strict TypeScript configuration

## 🛠️ Tech Stack

- **Build Tool**: Vite
- **Framework**: React 18
- **Language**: TypeScript (strict mode)
- **UI Components**: Mantine v7
- **Table Library**: mantine-react-table v2
- **Mobile Wrapper**: Capacitor 5

## 📦 Getting Started

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```
Then edit `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key_here
```

3. **Start the development server:**
```bash
npm run dev
```

4. **Open your browser and navigate to `http://localhost:3000`**

## 📋 Available Scripts

- `npm run dev` - Start the Vite development server
- `npm run build` - Build the project for production
- `npm run lint` - Run ESLint for code linting
- `npm run preview` - Preview the production build
- `npm run android` - Build and sync with Android (requires Capacitor setup)

## 📁 Project Structure

```
src/
├── components/
│   └── DraggableTable.tsx    # Main drag-and-drop table component
├── data/
│   └── courses.json          # Local course data
├── pages/
│   └── CoursesPage.tsx       # Main courses page
├── types/
│   └── Course.ts             # TypeScript type definitions
├── App.tsx                   # Main app component
└── main.tsx                  # Entry point
```

## 🎯 Usage

The application displays a table of courses loaded from local JSON data. You can:

- View course information (ID, Title, Instructor)
- Drag and drop rows to reorder courses
- See real-time updates as you reorder items

## 🔮 Future Enhancements

This starter is designed for expansion with:
- Supabase backend integration
- Vercel deployment
- Additional educational features
- Enhanced mobile experience

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
