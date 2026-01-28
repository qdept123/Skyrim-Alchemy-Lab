# Skyrim Alchemy Lab

A web-based simulator for crafting potions and poisons based on the alchemy mechanics of *The Elder Scrolls V: Skyrim*. This tool allows users to select ingredients, view matching effects, and calculate potion values and magnitudes based on player skill levels.

## 🚀 Features

* **Interactive Brewing Table**: Select up to 3 ingredients to discover potential recipes.
* **Real-time Calculations**: Magnitude and Septim value of potions scale dynamically based on your Alchemy Level and Perk ranks.
* **Dynamic UI**: The interface switches themes between "Parchment" (Potions) and "Dark/Red" (Poisons) based on the result.
* **Searchable Database**: Quickly find ingredients from a comprehensive list.
* **Rank Progression**: Visual indicators show your current alchemy rank from Novice to Master.

## 🛠️ Installation & Usage

1.  Clone the repository:
    ```bash
    git clone [https://github.com/qdept123/skyrim-alchemy-lab.git](https://github.com/qdept123/skyrim-alchemy-lab.git)
    ```
2.  Open `index.html` in any modern web browser.
    * *Note: Because this project fetches data from `data.json`, you may need to run it through a local server (like VS Code's Live Server) to avoid CORS issues.*

## 📂 Project Structure

* `index.html`: The core structure of the alchemy interface.
* `index.css`: Custom Skyrim-inspired styling and themes.
* `index.js`: Logic for ingredient matching, magnitude scaling, and UI updates.
* `data.json`: A database containing ingredient names, IDs, weights, values, and effects.

## 👤 Author

**qdept123**
* GitHub: [@qdept123](https://github.com/qdept123)

## 📜 License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details.