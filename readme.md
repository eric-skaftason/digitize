# Digitize

Digitize is a web app that uses machine learning algorithms to recognise handwritten digits.



## Features:
- Interactive canvas: draw, clear, and test user-defined inputs with the digit prediction algorithms
- Two prediction algorithms:
    - Nearest Centroid - compares input to the centroids (i.e. average pixel value representations) of each digit from the training set
    - k-Nearest Neighbours - finds k closest images in the training set and selects the most commonly predicted digit
- Benchmarking suite: for testing algorithm accuracy -> results print to browser developer console
- Settings menu: settings to toggle visibility of menus to create a cleaner UI

## How to run:

### Option 1 - Use precomputed model data
1. Start a local server - required because the fetch API is used
2. Open the index.html file

### Option 2 - Recompute model data
1. Navigate to project's root directory
2. Install dependencies -> `npm install`
3. Compute model data -> `npm run init-models`
4. Start local server
5. Open index.html


## Screenshots & Demos:

### Main app
<img src="assets/demo/demo_app.png" width="600px">

### Settings menu
<img src="assets/demo/demo_settings.png" width="1000px">

### Video demo
<video src="assets/demo/working_demo.mp4" width="1000px" controls></video>