# Stash

**Stash**  is your personal digital workspace designed to streamline your job application process. It serves as a central hub to manage your reusable links, text snippets, and resume versions, allowing you to access and copy them instantly.

![Stash Banner](/public/banner-placeholder.png) 
*(Note: Replace with actual screenshot or banner)*

## 🚀 Features

### 🔗 Smart Link Management
*   **Centralized Storage**: Store your LinkedIn, GitHub, Portfolio, and other social profiles in one place.
*   **One-Click Copy**: Instantly copy URLs to your clipboard without opening new tabs.
*   **Smart Categorization**: Organize links by category for easy retrieval.

### 📝 Instant Snippets
*   ** reusable Text**: Save common text blocks like code snippets, cover letter intros, bio descriptions, and interview answers.
*   **Quick Search**: Find exactly what you need in seconds.
*   **Tagging System**: Tag your snippets for better organization.

### 📄 Resume Versions
*   **Multi-Version Support**: Upload and manage different versions of your resume (e.g., "Frontend", "Fullstack", "Manager").
*   **Secure Storage**: Resumes are securely stored in Supabase Storage.
*   **Preview & Download**: View or download specific versions on the fly.

## 🛠 Tech Stack

*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Database & Auth**: [Supabase](https://supabase.com/)
*   **Deployment**: [Vercel](https://vercel.com/)

## 🏁 Getting Started

### Prerequisites
*   Node.js 18+ installed
*   Git installed
*   A Supabase account

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/stash.git
    cd stash
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up Environment Variables:**
    Copy the example env file and fill in your Supabase credentials:
    ```bash
    cp .env.local.example .env.local
    ```
    Edit `.env.local` and add your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open the app:**
    Navigate to [http://localhost:3000](http://localhost:3000).

## 🚢 Deployment

We recommended deploying to **Vercel**.

For detailed step-by-step instructions on setting up Supabase (including database schema and auth) and deploying to Vercel, please read our **[Deployment Guide](DEPLOYMENT.md)**.

## 📂 Project Structure

```
stash/
├── app/                # Next.js App Router pages and layouts
├── components/         # Reusable UI components
├── lib/                # Utility functions and Supabase client
├── public/             # Static assets
├── supabase/           # SQL schemas and migrations
├── .env.local.example  # Environment variable template
├── next.config.ts      # Next.js configuration
└── package.json        # Dependencies and scripts
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
