# Pokemon Team Builder

A React-based web application that allows users to build and customize their Pokemon team. Create your own trainer card with your favorite Pokemon and download it as an image!

## 🎮 Live Demo

[Add your deployed link here once you deploy the project]

## ✨ Features

- **Pokemon Selection**: Browse and search through all 1010 Pokemon from 9 generations
- **Generation Filtering**: Filter Pokemon by generation for easier selection
- **Search Functionality**: Search for Pokemon by name
- **Trainer Customization**: 
  - Edit trainer name
  - Upload custom trainer sprite
  - Build a team of up to 6 Pokemon
- **Dual Card Modes**:
  - **Trainer Card Mode**: 9:16 aspect ratio, perfect for mobile and social media
  - **Party Mode**: Interactive draggable layout with size controls
- **Advanced Customization**:
  - Custom background image upload
  - Color customization with gradient options
  - Z-index layering system for party mode
- **High-Quality Downloads**: 
  - Enhanced image quality for enlarged Pokemon
  - Professional PNG export
  - Clean layout without UI elements
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Technologies Used

- **React 18** with TypeScript
- **HTML2Canvas** for image generation
- **Lucide React** for icons
- **PokeAPI** for Pokemon data
- **CSS3** with modern gradients and animations

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pokemon-team-builder
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 📖 Usage

### Trainer Card Mode
1. **Select Pokemon**: Use the left panel to browse Pokemon by generation or search for specific Pokemon
2. **Add to Team**: Click on any Pokemon to add it to your team (maximum 6 Pokemon)
3. **Customize Trainer**: 
   - Click the edit button next to your name to change it
   - Click "Change Sprite" to upload a custom trainer image
4. **Customize Background**: Upload your own background image in the customization section
5. **Remove Pokemon**: Click the X button on any Pokemon in your team to remove it
6. **Download Card**: Click the "Download Card" button to save your trainer card as an image

### Party Mode
1. **Switch to Party Mode**: Use the layout toggle to switch to party mode
2. **Drag & Drop**: Click and drag Pokemon and trainer to position them
3. **Size Controls**: Click on any Pokemon or trainer to adjust their size
4. **Z-Index Management**: Click items to bring them to the front
5. **Download**: Save your party layout as an image

## 📁 Project Structure

```
src/
├── components/
│   ├── TrainerCard.tsx      # Trainer card component with dual modes
│   ├── TrainerCard.css      # Trainer card styles
│   ├── PokemonSelector.tsx  # Pokemon selection component
│   └── PokemonSelector.css  # Pokemon selector styles
├── types/
│   └── Pokemon.ts          # Pokemon type definitions
├── assets/                 # Trainer sprite images
├── App.tsx                 # Main application component
├── App.css                 # Main application styles
└── index.css              # Global styles
```

## 🔧 API Integration

The application uses the [PokeAPI](https://pokeapi.co/) to fetch Pokemon data including:
- Pokemon names and IDs
- Pokemon sprites (images)
- Generation information

## 🎨 Features in Detail

### Pokemon Selection
- Browse all 1010 Pokemon from 9 generations
- Search functionality with real-time filtering
- Generation-based filtering and organization
- Collapsible generation sections for better organization

### Trainer Card Mode
- Beautiful 9:16 aspect ratio design perfect for mobile
- Customizable gradient or solid color backgrounds
- Custom background image upload support
- Editable trainer name with inline editing
- Customizable trainer sprite with file upload
- 6 Pokemon slots with 2×3 grid layout
- High-quality image export

### Party Mode
- Interactive draggable Pokemon and trainer sprites
- Size adjustment controls for all elements
- Z-index layering system for depth management
- Selection bar for quick item selection
- Flexible layout with no fixed aspect ratio

### Image Generation
- High-quality PNG export using HTML2Canvas
- Enhanced image processing for enlarged sprites
- 4x scale for maximum quality
- Automatic filename generation based on trainer name
- Clean export without UI elements

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

Pokémon and trainer sprites used in this project are not owned by me; all rights belong to their respective owners.

- [PokeAPI](https://pokeapi.co/) for providing comprehensive Pokemon data
- [Lucide React](https://lucide.dev/) for beautiful icons
- [HTML2Canvas](https://html2canvas.hertzen.com/) for image generation capabilities
