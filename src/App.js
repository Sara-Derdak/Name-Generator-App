import React, { useState, useEffect } from "react";
import "./App.css"; // Importer le fichier CSS

const App = () => {
  // Traductions pour différentes langues
  const translations = {
    fr: {
      header: "Générateur de Noms Aléatoires",
      selectCategory: "Sélectionner une catégorie",
      generateNameButton: "Générer un Nom",
      generatedNameLabel: "Nom Généré :",
      addToFavoritesButton: "Ajouter aux Favoris",
      favoritesHeader: "Favoris",
      noFavorites: "Aucun favori pour le moment.",
      removeFavoriteButton: "Supprimer",
      categories: {
        superhero: "Super-héros",
        animals: "Animaux",
        characters: "Personnages",
        colors: "Couleurs"
      },
      colors: [
        "Rouge", "Bleu", "Vert", "Jaune", "Noir", 
        "Blanc", "Rose", "Orange", "Violet", "Gris",
        "Marron", "Turquoise", "Indigo", "Cyan", "Lavande"
      ],
      animals: [
        "Chat", "Chien", "Lion", "Éléphant", "Tigre",
        "Ours", "Giraffe", "Kangourou", "Dauphin", "Cheval"
      ]
    },
    en: {
      header: "Random Name Generator",
      selectCategory: "Select a category",
      generateNameButton: "Generate Name",
      generatedNameLabel: "Generated Name:",
      addToFavoritesButton: "Add to Favorites",
      favoritesHeader: "Favorites",
      noFavorites: "No favorites yet.",
      removeFavoriteButton: "Remove",
      categories: {
        superhero: "Superheroes",
        animals: "Animals",
        characters: "Characters",
        colors: "Colors"
      },
      colors: [
        "Red", "Blue", "Green", "Yellow", "Black", 
        "White", "Pink", "Orange", "Purple", "Gray",
        "Brown", "Turquoise", "Indigo", "Cyan", "Lavender"
      ],
      animals: [
        "Cat", "Dog", "Lion", "Elephant", "Tiger",
        "Bear", "Giraffe", "Kangaroo", "Dolphin", "Horse"
      ]
    },
    ar: {
      header: "مولد الأسماء العشوائية",
      selectCategory: "اختار فئة",
      generateNameButton: "توليد اسم",
      generatedNameLabel: "الاسم المُولد:",
      addToFavoritesButton: "إضافة إلى المفضلة",
      favoritesHeader: "المفضلة",
      noFavorites: "لا توجد مفضلة حتى الآن.",
      removeFavoriteButton: "إزالة",
      categories: {
        superhero: "الأبطال الخارقين",
        animals: "الحيوانات",
        characters: "الشخصيات",
        colors: "الألوان"
      },
      colors: [
        "أحمر", "أزرق", "أخضر", "أصفر", "أسود", 
        "أبيض", "وردي", "برتقالي", "بنفسجي", "رمادي",
        "بني", "تركواز", "نيلي", "سماوي", "لافندر"
      ],
      animals: [
        "قط", "كلب", "أسد", "فيل", "نمر",
        "دب", "زرافة", "كنغر", "دلفين", "حصان"
      ]
    }
  };

  // Langue de l'application
  const [language, setLanguage] = useState("fr");

  // Données de noms
  const data = {
    superhero: [
      "Ironman", "Spiderman", "Batman", "Wonder Woman", "Superman", 
      "Captain America", "Thor", "Black Panther", "Hulk", "Black Widow"
    ],
    animals: translations[language].animals, // Utiliser la traduction des animaux
    characters: [
      "Frodo", "Harry Potter", "Sherlock Holmes", "Katniss", "Gollum", 
      "Hermione Granger", "Aragorn", "Legolas", "Dark Vador", "Luke Skywalker",
      "Iron Man", "Jack Sparrow", "Spider-Man", "Tony Stark", "Batman",
      "Le Joker", "Wolverine", "Thor", "Deadpool", "Professeur X",
      "Wonder Woman", "Superman", "Black Panther", "La Sorcière Rouge", "Docteur Strange",
      "Green Lantern", "Aquaman", "Ant-Man", "Flash", "Hawkeye", "Vision"
    ],
    colors: translations[language].colors // Utiliser les couleurs traduites pour la langue sélectionnée
  };

  // États
  const [category, setCategory] = useState("superhero");
  const [randomName, setRandomName] = useState("");
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(savedFavorites);
  }, []);

  // Générer un nom aléatoire
  const generateName = () => {
    const names = data[category];
    const randomIndex = Math.floor(Math.random() * names.length);
    setRandomName(names[randomIndex]);
  };

  // Ajouter aux favoris
  const addToFavorites = () => {
    if (!randomName || favorites.includes(randomName)) return;
    const updatedFavorites = [...favorites, randomName];
    setFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  // Supprimer un favori
  const removeFavorite = (name) => {
    const updatedFavorites = favorites.filter((fav) => fav !== name);
    setFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  return (
    <div className="container">
      <h1 className="header">{translations[language].header}</h1>

      {/* Sélection de langue */}
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="select"
      >
        <option value="fr">Français</option>
        <option value="en">English</option>
        <option value="ar">عربي</option>
      </select>

      {/* Sélection de catégorie */}
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="select"
      >
        <option value="superhero">{translations[language].categories.superhero}</option>
        <option value="animals">{translations[language].categories.animals}</option>
        <option value="characters">{translations[language].categories.characters}</option>
        <option value="colors">{translations[language].categories.colors}</option>
      </select>

      {/* Bouton pour générer un nom */}
      <div>
        <button onClick={generateName} className="generateButton">
          {translations[language].generateNameButton}
        </button>
      </div>

      {/* Affichage du nom généré */}
      {randomName && (
        <div className="generatedNameContainer">
          <h2 className="generatedName">{translations[language].generatedNameLabel} {randomName}</h2>
          <button onClick={addToFavorites} className="addFavoriteButton">
            {translations[language].addToFavoritesButton}
          </button>
        </div>
      )}

      {/* Liste des favoris */}
      <div className="favoritesContainer">
        <h2 className="favoritesHeader">{translations[language].favoritesHeader}</h2>
        {favorites.length === 0 ? (
          <p className="noFavorites">{translations[language].noFavorites}</p>
        ) : (
          <ul className="favoritesList">
            {favorites.map((name, index) => (
              <li key={index} className="favoriteItem">
                <span className="favoriteName">{name}</span>
                <button
                  onClick={() => removeFavorite(name)}
                  className="removeFavoriteButton"
                >
                  {translations[language].removeFavoriteButton}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default App;






// Traduction App simple

// import React, { useState } from "react";
// import "./App.css"; // Importer le fichier CSS

// const App = () => {
//   // Traductions pour chaque langue
//   const translations = {
//     en: {
//       hello: "Hello",
//       goodbye: "Goodbye",
//       thank_you: "Thank you",
//       please: "Please",
//       how_are_you: "How are you?",
//       welcome: "Welcome",
//       sorry: "Sorry",
//       good_morning: "Good morning",
//       good_night: "Good night",
//       yes: "Yes",
//       no: "No",
//     },
//     fr: {
//       hello: "Bonjour",
//       goodbye: "Au revoir",
//       thank_you: "Merci",
//       please: "S'il vous plaît",
//       how_are_you: "Comment ça va ?",
//       welcome: "Bienvenue",
//       sorry: "Désolé",
//       good_morning: "Bonjour",
//       good_night: "Bonne nuit",
//       yes: "Oui",
//       no: "Non",
//     },
//     es: {
//       hello: "Hola",
//       goodbye: "Adiós",
//       thank_you: "Gracias",
//       please: "Por favor",
//       how_are_you: "¿Cómo estás?",
//       welcome: "Bienvenido",
//       sorry: "Lo siento",
//       good_morning: "Buenos días",
//       good_night: "Buenas noches",
//       yes: "Sí",
//       no: "No",
//     },
//   };
  

//   // États
//   const [word, setWord] = useState("");
//   const [language, setLanguage] = useState("fr");
//   const [translatedWord, setTranslatedWord] = useState("");

//   // Fonction pour obtenir la traduction
//   const translateWord = () => {
//     if (translations[language][word.toLowerCase()]) {
//       setTranslatedWord(translations[language][word.toLowerCase()]);
//     } else {
//       setTranslatedWord("Mot non trouvé");
//     }
//   };

//   return (
//     <div className="container">
//       <h1 className="header">Application de Traduction</h1>

//       {/* Sélectionner la langue */}
//       <select
//         value={language}
//         onChange={(e) => setLanguage(e.target.value)}
//         className="select"
//       >
//         <option value="fr">Français</option>
//         <option value="en">English</option>
//         <option value="es">Español</option>
//       </select>

//       {/* Champ de saisie pour le mot */}
//       <input
//         type="text"
//         value={word}
//         onChange={(e) => setWord(e.target.value)}
//         className="input"
//         placeholder="Entrez un mot"
//       />

//       {/* Bouton pour traduire */}
//       <button onClick={translateWord} className="translateButton">
//         Traduire
//       </button>

//       {/* Affichage du mot traduit */}
//       {translatedWord && (
//         <div className="translatedWord">
//           <h2>{translatedWord}</h2>
//         </div>
//       )}
//     </div>
//   );
// };

// export default App;
