import cv2
import numpy as np
from flask import Flask, request
from pymongo import MongoClient
from azure.storage.blob import BlobServiceClient
import os
import string, random
from flask_cors import CORS, cross_origin
import base64
import face_recognition

app = Flask(__name__)

CORS(app)
client = MongoClient("mongodb+srv://hoangph7298:Hoangtrang123@cluster0.lnrf9cy.mongodb.net/?retryWrites=true&w=majority")
# client = MongoClient('localhost', 27017)

app.config.from_pyfile('config.py')
db = client["note"]
users = db["users"]
notes = db["notes"]

account = app.config['ACCOUNT_NAME']   # Azure account name
key = app.config['ACCOUNT_KEY']      # Azure Storage account access key  
connection_string = app.config['CONNECTION_STRING']
container = app.config['CONTAINER'] # Container name

blob_service_client = BlobServiceClient.from_connection_string(connection_string)

def id_generator(size=16, chars=string.ascii_uppercase + string.digits):
  return ''.join(random.choice(chars) for _ in range(size))

def clearFolder(files):
  for i in range(len(files)):
    os.remove(files[i])

@app.route('/login', methods=["POST"])
@cross_origin()
def login():
  body = request.json
  username = body['username']
  image = body['image']

  #check if username already exists
  data = list(users.find({'username': username}))
  if len(data)==0:
    return({
      "status": 401, 
      "msg": "Username does not exist. Please register for an account."
    })

  imgstring = image[0]
  encoded_data = imgstring.split(',')[1]
  nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
  img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
  faces = face_recognition.face_encodings(img)
  if len(faces)==0:
    return({
      "status":401,
      "msg": "Image lacks facial features"
    })
  
  embedding = faces[0]
  sampleImages = data[0]['image_urls']
  for i in range(len(sampleImages)):
    blob  = blob_service_client.get_blob_client(container = container, blob = sampleImages[i])
    data = blob.download_blob().readall()
    arr = np.asarray(bytearray(data), dtype=np.uint8)
    sampleImage = cv2.imdecode(arr, cv2.IMREAD_UNCHANGED)
    faces_embedding = face_recognition.face_encodings(sampleImage)[0]
    compare = face_recognition.compare_faces([faces_embedding], embedding, 0.4)
    print(compare)
    if (compare[0] == True):
      return ({
        "status": 200, 
        "msg": "Login successfully"
      })

  return ({
    "status": 401, 
    "msg": "Authentication failed. Please double-check the username and image quality."
  })

@app.route('/newnotes', methods=["POST"]) 
@cross_origin()
def updateNote():
  body = request.json
  username = body['username']
  note = body['note']
  notes.update_one({'username':username},{'$set':{'notes':note}})
  return({
      "status": 200, 
      "msg": "Delete note successfully",
  }) 

@app.route('/notes',  methods=["POST", "GET"]) 
@cross_origin()
def note():
  if request.method == "POST":
    body = request.json
    username = body['username']
    note = body['note']
    data = list(notes.find({'username':username}))
    if len(data)==0:
      notes.insert_one({
        'username': username,
        'notes': [note]
      })
      noteResponse = [note]
    else:
      notes.update_one({'username':username},{'$push':{'notes':note}})
      noteResponse = data[0]['notes']
      noteResponse.append(note)
    return({
      "status": 200, 
      "msg": "Add note successfully",
      "notes": noteResponse
    })
  else:
    username = request.args.get('username')
    data = list(notes.find({'username':username}))
    if len(data)==0:
      noteResponse = []
    else:
      noteResponse = data[0]['notes']
    return({
      "status": 200, 
      "msg": "Get note successfully",
      "notes": noteResponse
    })

@app.route('/signup', methods=["POST"])
@cross_origin()
def signUp():
  body = request.json
  username = body['username']
  images = body['images']
  imageUrls = []
  azureFilename = []
  #check if username already exists
  data = list(users.find({'username': username}))
  if len(data)>0:
    return({
      "status": 401, 
      "msg": "Username already exists"
    })

  # convert base64 string to img.
  for i in range(len(images)):
    imgstring = images[i]

    encoded_data = imgstring.split(',')[1]
    nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    randomString = id_generator()
    filename = username + "_" +randomString+"_"+str(i+1)+".jpg"
    cv2.imwrite(filename, img)

    imageUrls.append(filename)

  # check if image has face. 
  for i in range(len(imageUrls)):
    image = cv2.imread(imageUrls[i])
    if len(image.shape)==2:
      image = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)
    faces = face_recognition.face_encodings(image)
    if len(faces)==0:
      clearFolder(imageUrls)
      return({
        "status":401,
        "msg": "File "+ str(i+1) + " lacks facial features"
      })

    # add to azure 
  for i in range(len(imageUrls)):
    filename = imageUrls[i] 
    blob_client = blob_service_client.get_blob_client(container = container, blob = filename)
    with open(filename, "rb") as data:
      try:
          blob_client.upload_blob(data, overwrite=True)
          azureFilename.append(filename)
      except:
          clearFolder(imageUrls)
          return({
            "status": 401,
            "msg": "System error, please try again later."
          })

  users.insert_one({
    'username': username,
    "image_urls": azureFilename
  })

  clearFolder(imageUrls)

  return({
    "status": 200,
    "msg": "Register successfully"
  })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)