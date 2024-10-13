from flask import Flask, request, jsonify, send_from_directory
import os
import cv2
import numpy as np
from werkzeug.utils import secure_filename


app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processed'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['PROCESSED_FOLDER'] = PROCESSED_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
if not os.path.exists(PROCESSED_FOLDER):
    os.makedirs(PROCESSED_FOLDER)

@app.route("/")
def index():
    return send_from_directory("static", "index.html")

@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    
    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)

        #Processing the image using OpenCV
        processed_filepath = process_image(filepath, filename)

        return jsonify({"status": "success", "data" : {"message": "File uploaded successfully", "image_url": f"/processed/{filename}"}})

@app.route('/processed/<filename>')
def get_processed_image(filename):
    return send_from_directory(app.config['PROCESSED_FOLDER'], filename)

def process_image(filepath, filename):
    #Read the image
    img = cv2.imread(filepath)

    #Convert the image to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Invert the grayscale image
    inverted = cv2.bitwise_not(gray)
    
    # Blur the inverted image
    blurred = cv2.GaussianBlur(inverted, (21, 21), 0)
    
    # Invert the blurred image
    inverted_blurred = cv2.bitwise_not(blurred)

    # Create the pencil sketch image
    sketch = cv2.divide(gray, inverted_blurred, scale=256.0)

    # Save the processed image
    processed_filepath = os.path.join(app.config['PROCESSED_FOLDER'], filename)
    cv2.imwrite(processed_filepath, sketch)

    return processed_filepath

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80)