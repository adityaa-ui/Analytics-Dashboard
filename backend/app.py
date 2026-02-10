from flask import Flask, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

API_KEY = os.getenv("YOUTUBE_API_KEY")
if not API_KEY:
    raise Exception("Missing API key")

@app.route("/api/video/<video_id>")
def video(video_id):
    url = "https://www.googleapis.com/youtube/v3/videos"
    params = {
        "part": "snippet,statistics",
        "id": video_id,
        "key": API_KEY
    }

    r = requests.get(url, params=params)
    data = r.json()

    if "items" not in data or len(data["items"]) == 0:
        return jsonify({"error": "Video not found"}), 404

    v = data["items"][0]

    return jsonify({
        "title": v["snippet"]["title"],
        "views": int(v["statistics"].get("viewCount", 0)),
        "likes": int(v["statistics"].get("likeCount", 0)),
        "comments": int(v["statistics"].get("commentCount", 0))
    })

if __name__ == "__main__":
    app.run(debug=True)
