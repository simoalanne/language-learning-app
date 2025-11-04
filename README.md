# 🌍 **Language Learning App**

App to practise and create words with up to 6 languages supported.

# 📌 Project Description

This app helps users expand their vocabulary across multiple languages. It's ideal for language learners who want customizable practise instead of being limited by what the app thinks they need to learn. Users can add new vocabulary seamlessly using AI for any topic they can think of.

## 📸 Screenshots

<div align="center"><br/>
    <img src="./screenshots/home-screen.png" alt="Home Page" width="600"/><br/>
    <em>Home Page</em>
</div><br/>

<div align="center"><br/>
    <img src="./screenshots/ai-vocabulary-generation.png" alt="Add Vocabulary with AI" width="600"/><br/>
    <em>Add Vocabulary with AI</em>
</div><br/>

<div align="center"><br/>
    <img src="./screenshots/matching-game.png" alt="Matching Game" width="600"/><br/>
    <em>Matching Game Mode</em>
</div><br/>

<div align="center"><br/>
    <img src="./screenshots/test-mode.png" alt="Test Mode" width="600"/><br/>
    <em>Test Mode</em>
</div><br/>

<div align="center"><br/>
    <img src="./screenshots/flashcards.png" alt="Flashcards Mode" width="600"/><br/>
    <em>Flashcards Mode</em>
</div><br/>

## 🌟 **Features**

- **AI-based vocabulary generation:** Users can create their own vocabulary to practise using an **LLM** or by themselves for full control.
- **Variety in learning modes:** From familiar **FlashCards** to **Matching Game** to just traditional **Test**, there is a mode that fits your way of learning the best.
- **Authentication**: Secure JWT token-based user authentication.
- **Responsive Design**: Optimized for desktop and mobile devices.

---

## 🎯 **Tech Stack**

### Frontend:

- **React**
- **Material UI**

### Backend:

- **Node.js**
- **Express**

### Database:

- **SQLite**

---

## 🛠️ **Installation & Setup**

1. **Clone repository**

   ```bash
   git clone https://github.com/simoalanne/language-learning-app/
   cd language-learning-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create .env file to backend directory**

   ```bash
   JWT_SECRET="your JWT secret"
   GEMINI_API_KEY="your Gemini API key"

   ```

4. **Run app locally with command**
   ```bash
   npm start
   ```

---

## 📦 **Deployment**

The app can also be easily run with docker. Here's how:

1. Build the container using `docker build -t language-learning-app .`
2. Start the container with `docker run -p 3000:3000 language-learning-app`

---

## 🌐 **Cloud**

Deployed project can be checked out here: https://language-learning-app.simoalanne.com
