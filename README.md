# Calculator Alligator 🐊

A modern calculator application built with Angular frontend and Spring Boot backend.

## 🚀 Overview

Calculator Alligator is a full-stack web application that provides calculator functionality with a clean, modern interface. The project uses a modular architecture with separate frontend and backend components.

## 🛠️ Tech Stack

### Frontend
- **Angular 19.2.0**
- **TypeScript 5.7.2**
- **Tailwind CSS 4.1.8**
- **RxJS 7.8.0**

### Backend
- **Spring Boot 3.5.0**
- **Java 21**
- **Maven**

## 📁 Project Structure

```
calculator-alligator/
├── webapp/              # Angular frontend application
│   ├── src/            # Source code
│   ├── package.json    # Frontend dependencies
│   └── ...
├── app/                # Spring Boot application module
├── monolith/           # Monolithic architecture module
├── adapters/           # Adapters module
├── pom.xml            # Root Maven configuration
└── README.md          # This file
```

## 🚦 Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Java 21**
- **Maven** (v3.8 or higher)

## 📦 Installation

### Backend Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd calculator-alligator
```

2. Build the Spring Boot backend:
```bash
mvn clean install
```

3. Run the backend application:
```bash
mvn spring-boot:run -pl app
```

The backend will start on `http://localhost:8080` (default Spring Boot port).

### Frontend Setup

1. Navigate to the webapp directory:
```bash
cd webapp
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The Angular application will be available at `http://localhost:4200`.

## 🧑‍💻 Development

### Frontend Development

- **Development server**: `npm start` - Navigate to `http://localhost:4200`
- **Build**: `npm run build` - Build artifacts will be stored in the `dist/` directory
- **Watch mode**: `npm run watch` - Automatically rebuild on changes
- **Unit tests**: `npm test` - Execute unit tests via Karma

### Backend Development

- **Main class**: `com.jpozarycki.CalculatorApplication`
- **Build**: `mvn clean package`
- **Run tests**: `mvn test`

## 🏗️ Architecture

The project follows a hexagonal architecture (though there was no need for the domain layer):

- **app**: Main Spring Boot application module
- **monolith**: Core business logic in a monolithic structure
- **adapters**: Integration adapters for external services or different interfaces

## 🧪 Testing

### Frontend Tests
```bash
cd webapp
npm test
```

### Backend Tests
```bash
mvn test
```

## 📝 Building for Production

### Frontend Build
```bash
cd webapp
npm run build
```

### Backend Build
```bash
mvn clean package
```

This will create a JAR file in the `target/` directory of each module.
