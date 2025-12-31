# MAC_code

Application de bureau pour contrôler des dispositifs Arduinos connectés à une pompe via une interface web moderne.

## 🚀 Installation

### Prérequis
- Node.js 18+
- Python 3.8+
- Arduino IDE

### Setup

```bash
# Cloner et installer
git clone https://github.com/SebbyMcQueen/MAC_code.git
cd MAC_code/Web
npm install
```

## 🎮 Utilisation

### Lancer l'application

```bash
cd Web
npm run dev:all
```

Ouvre automatiquement :
- Interface web : http://localhost:3000
- Serveur Python (backend Arduino)

### Téléverser sur Arduino

1. Ouvrir Arduino IDE
2. Ouvrir le fichier dans `Arduino/`
3. Sélectionner la carte et le port
4. Cliquer sur Téléverser

## 📦 Créer un exécutable

```bash
cd Web
npm install --save-dev electron electron-builder
npm run electron:build
```

Exécutable généré dans `Web/dist/`

## 🛠️ Technologies

- **Frontend** : Next.js, React, TypeScript, Tailwind CSS
- **Backend** : Python
- **Hardware** : Arduino (C++)

## 🐛 Dépannage

**"Python was not found"** → Installer Python et ajouter au PATH

**Port série inaccessible** → Vérifier les permissions et pilotes USB

## 📄 Licence

Fork de [SilentPow/MAC_code](https://github.com/SilentPow/MAC_code)

---

**Par [@SebbyMcQueen](https://github.com/SebbyMcQueen)**
