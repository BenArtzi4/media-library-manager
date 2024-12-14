
<img src="https://github.com/user-attachments/assets/8478acdc-0197-4051-864d-21ccd897bd38" alt="SongElite-icon" width="100" />

# SongElite

- **SongElite** is a Node.js web application that allows users to log in, select their **favorite music genres**, and enjoy a curated selection of songs.
- **It’s not just a music player** — it's a personal collection of the **best songs** discovered over the years.
- Users can manage their own selection of music by organizing MP3 files into genre-specific directories and optionally adding matching PNG images for visual flair.

## Features

- **Node.js & EJS**:  
  Built using Node.js as the backend and EJS for templating, providing a clean separation of logic and presentation.

- **Docker & Docker Compose**:  
  Easily run the entire project (app, MongoDB, Redis) in containers. Just use `docker-compose up --build` to start.

- **MongoDB Integration**:  
  Uses MongoDB to store user data (username, email, hashed passwords), supporting registration and login functionalities.

- **Redis Caching**:  
  Utilizes Redis for storing sessions and caching genre song lists to improve performance.

- **Authentication & Sessions**:  
  Users can register, log in, and have their sessions maintained by Redis-backed sessions. This ensures smooth scalability and reliable session management.

- **Password Reset (Forgot My Password)**:  
  Users can request a password reset link, sent to their email, allowing them to securely update their password.

## Project Structure
![image](https://github.com/user-attachments/assets/4838e132-d333-4915-86e6-266e34c439dd)


## How It Works

### Directory Structure for Music

Prepare a directory structure as follows:

```
C:\Temp\songElite\media
│ ├─ english-classics
  │ ├─ Artist 1  - Song 1.mp3
  │ ├─ Artist 1  - Song 1.png (optional)
  │ ├─ Artist 2  - Song 2.mp3
  │ ├─ Artist 2  - Song 2.png (optional)
  │ └─ ...

│ ├─ english-party
  │ └─ ...

│ ├─ israeli-classics
  │ └─ ...

│ └─ israeli-party
  │ └─ ...
```

**File Naming Convention:**
- MP3 files: `<artist> - <song_name>.mp3`
- Optional Images: `<artist> - <song_name>.png`  
  The image should have the same name as the MP3 file but with a `.png` extension.

When a user selects a genre, SongElite randomly picks one of the MP3 files from that genre and displays its matching PNG image if available.

### Login & Registration

- **Login**: Users can log in using their email and password.
- **Register**: Users can create an account by providing their username, email, and password.
- **Forgot Password**: If a user forgets their password, they can request a reset link, which is sent via email. Following the link leads them to a page where they can set a new password.

### Running the Project

#### Prerequisites
   - Docker & Docker Compose installed.
   - A `.env` file with the necessary environment variables (see [Configuration](#configuration)).
   - Properly structured `media` directories containing your MP3 and optional PNG files.

#### Configuration
Create a `.env` file in the root directory of the project with the following variables:

```env
PORT=3000
MONGODB_URI=mongodb://<admin_user_name>:<admin_password>@mongodb:27017/songelite?authSource=admin
MONGODB_INITDB_ROOT_USERNAME=<admin_user_name>
MONGODB_INITDB_ROOT_PASSWORD=<admin_password>
SESSION_SECRET=<generate_secret_token>
EMAIL_USER=<real_gmail_email>
EMAIL_PASS=<app password - read more about it>
```

#### **Environment Variables Explained:**
- ```PORT```: The port on which the application will run (default is 3000).
- ```MONGODB_URI```: The connection string for MongoDB. Replace <admin_user_name> and <admin_password> with your MongoDB admin credentials.
- ```MONGODB_INITDB_ROOT_USERNAME```: Your MongoDB root username.
- ```MONGODB_INITDB_ROOT_PASSWORD```: Your MongoDB root password.
- ```SESSION_SECRET```: A strong secret key for signing session cookies. Generate a secure random string.
- ```EMAIL_USER```: Your real Gmail email address used to send password reset emails.
- ```EMAIL_PASS```: An App Password generated from your Gmail account. [Learn how to create an App Password](https://support.google.com/accounts/answer/185833?hl=en).


#### Build & Run
##### 1. Clone the Repository:
```
git clone https://github.com/BenArtzi4/media-library-manager.git
cd media-library-manager
```

##### 2. Create the .env File:
Create a .env file in the root directory with the necessary environment variables as described above.

##### 3. Build & Start the Containers:

```
docker-compose up --build
```

This will start:

- The Node.js application
- MongoDB
 - Redis

##### 4. Access the App:

Open [http://localhost:3000](http://localhost:3000) in your browser.

##### 5. Usage:
- Register: Create a new account.
- Login: Access your account.
- Add Music: Add your MP3 and optional PNG files to the media directory under the appropriate genre.
- Select Genre: Choose a genre from the welcome page to play a curated song.

## Screenshots 
### Login Page

### Register Page

### Forgot Password Page

### Welcome Page

### Example Genre Page (e.g., English Classics)

Enjoy your personalized SongElite experience!


------
### Note:
All music and images are hosted locally. Users can customize their own collections and images.
Due to copyright restrictions, this repository will not provide the actual music files.
------

