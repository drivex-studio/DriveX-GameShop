# DriveX-GameShop

## Project Overview

This repository contains the frontend development for **DriveX-GameShop**, a platform designed for selling in-game items, with a current focus on **Mobile Legends: Bang Bang (MLBB)** items. The project is currently in its early development stages, primarily focusing on establishing a robust and modular frontend architecture.

## Current Development Status

The project is actively under development, with significant progress made on the frontend structure, component modularity, and asset management. The current focus is on building out the core UI components, utility functions, and integrating media handling. Backend integration and specific game item selling functionalities are planned for subsequent phases.

## Project Structure

The project follows a well-organized directory structure to ensure maintainability and scalability. Below is an outline of the current project layout:

```

```

### Key Directories and Their Purpose:

*   `index.html`: The main entry point for the web application.
*   `scripts/`: Contains utility scripts, such as `request-img-url.html` for image URL requests.
*   `src/`: The core source code directory.
    *   `assets/`: Static assets like CSS, fonts, and media files.
        *   `css/`: Stylesheets, including `main.css`.
        *   `fonts/`: Custom fonts used in the project.
        *   `medias/`: Components and utilities for handling various media types (images, videos) and integration with Sanity.io.
    *   `components/`: Reusable UI components, including navigation elements, forms, and preloaders. Many `init*` files suggest client-side initialization logic for these components.
    *   `data/`: Contains data structures and configurations for various sections and features of the application.
    *   `features/`: Larger, more complex feature modules, such as animated headlines, button groups, and ASCII art effects. This directory also includes general-purpose sections like `HeroParallax` and `CardsSectionClient`.
    *   `hooks/`: Custom React hooks for managing state, side effects, and integrating with various APIs (e.g., `useBreakpoint`, `usePageEnter`).
    *   `lib/`: Library-level utilities and helper functions, including those for ASCII effects, slotting, and managing page transition states.
    *   `utils/`: General utility functions and helpers, such as `ScrambleText` for text animations and `customCursor`.
*   `view_structure.py`: A script likely used to generate or visualize the project's directory structure.

## Installation and Setup

To get this project up and running locally, follow these steps:

### Prerequisites

*   Node.js (LTS version recommended)
*   npm or Yarn

### Steps

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd DriveX-GameShop
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or yarn install
    ```
3.  **Start the development server:**
    ```bash
    npm start
    # or npm run dev (if configured)
    ```
    This will typically launch the application on `http://localhost:3000` (or another specified port).

## Development Guidelines

*   **Component-Based Architecture:** Emphasize creating small, reusable components.
*   **Styling:** Utilize `src/assets/css/main.css` for global styles and consider component-scoped styling where appropriate.
*   **Media Handling:** Leverage the `src/assets/medias` utilities for consistent image and video integration, especially with Sanity.io.
*   **State Management:** Use React hooks (`src/hooks`) for local component state and consider a global state management solution if the project scales further.

## Contributing

We welcome contributions to the DriveX-GameShop project. Please adhere to the following guidelines:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Ensure your code follows the existing style and architectural patterns.
4.  Submit a pull request with a clear description of your changes.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

## Contact

For any questions or further information, please contact [https://github.com/drivex-studio].
