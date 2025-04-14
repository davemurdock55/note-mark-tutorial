# Proto-Note Desktop
Proto-Note is a simple notes app that allows syncing across different devices (taking an offline-first approach).

The syncing uses AWS lambdas to perform its work and stores the necessary data (e.g. auth info, notes info, etc.) in DynamoDB.

## Project Setup
Below are the steps to set up and test the project:

### Clone Repository
First, you will need to clone the repository using:
```bash
$ git clone https://github.com/davemurdock55/proto-note-desktop.git
```

### Install Dependencies
Next, install the dependencies needed to run the project:
```bash
$ yarn install
```

### Development
Lastly, you can run the development version of the app using:
```bash
$ yarn dev
```

### Build
To build the app for distribution across different desktop platforms, you would use the following commands:
```bash
# For windows
$ yarn build:win

# For macOS
$ yarn build:mac

# For Linux
$ yarn build:linux
```
